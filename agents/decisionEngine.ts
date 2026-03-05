import { Perception } from "./perception";
import { askLLM } from "./llmClient";
import { StateGraph, Annotation, END, START } from "@langchain/langgraph";

// --- Types & Schema ---

export interface AgentAction {
    type: "transfer" | "check_balance" | "hold" | "request_airdrop" | "simulate_swap";
    params: Record<string, any>;
}

// Define the state for our LangGraph brain
const AgentState = Annotation.Root({
    prompt: Annotation<string>,
    llmResponse: Annotation<string | null>,
    error: Annotation<string | null>,
    action: Annotation<AgentAction | null>,
    iterations: Annotation<number>
});

// --- Fallback Mechanism ---

function deterministicFallback(perception: Perception, targetAddress: string): AgentAction {
    const { balance, memory } = perception;
    if (balance === 0) return { type: "request_airdrop", params: {} };
    if (balance > 1000000000 && Math.random() < 0.3) return { type: "simulate_swap", params: {} };
    if (balance > 500000000 && memory.cycleCount > 0) {
        return { type: "transfer", params: { to: targetAddress, amount: 10000000 } };
    }
    if (balance > 0 && Math.random() < 0.5) return { type: "check_balance", params: {} };
    return { type: "hold", params: {} };
}

// --- Graph Nodes ---

// Node 1: Call the LLM with the current prompt (+ error context if retry)
async function callAgent(state: typeof AgentState.State) {
    const fullPrompt = state.error
        ? `${state.prompt}\n\nCRITICAL ERROR FROM PREVIOUS ATTEMPT: ${state.error}\nPlease fix your JSON format. Output ONLY raw JSON.`
        : state.prompt;

    const response = await askLLM(fullPrompt);
    return { llmResponse: response, iterations: state.iterations + 1 };
}

// Node 2: Validate the JSON and map to structured action
async function validateAction(state: typeof AgentState.State) {
    if (!state.llmResponse) return { error: "No response from LLM" };

    try {
        const parsed = JSON.parse(state.llmResponse) as AgentAction;
        if (["transfer", "check_balance", "hold", "request_airdrop", "simulate_swap"].includes(parsed.type)) {
            return { action: parsed, error: null };
        }
        return { error: `Invalid action type: ${parsed.type}` };
    } catch (e: any) {
        return { error: `JSON Parse failed: ${e.message}` };
    }
}

// --- Graph Router ---

function shouldContinue(state: typeof AgentState.State) {
    if (state.action) return END; // Success!
    if (state.iterations >= 3) return END; // Failed after 3 tries
    return "agent"; // Retry
}

// --- Assemble the Graph ---

const workflow = new StateGraph(AgentState)
    .addNode("agent", callAgent)
    .addNode("validate", validateAction)
    .addEdge(START, "agent")
    .addEdge("agent", "validate")
    .addConditionalEdges("validate", shouldContinue);

const brain = workflow.compile();

// --- Main Interface ---

export async function decide(perception: Perception, targetAddress: string): Promise<AgentAction> {
    const { balance, memory } = perception;

    const initialPrompt = `
You are an autonomous AI Agent managing a Solana wallet.
Current Balance: ${(balance / 1e9).toFixed(5)} SOL
Token Accounts: ${perception.tokenAccountCount}
Cycle Count: ${memory.cycleCount}
Target Agent Address: ${targetAddress}

Objective: Maintain a healthy balance and transfer funds occasionally.

Available Actions:
- "request_airdrop": Use if balance is 0.
- "simulate_swap": Use if balance > 0.1 SOL (burns 0.05 SOL).
- "transfer": Send 0.01 SOL to target.
- "check_balance": Query blockchain.
- "hold": Do nothing.

Please note: You can see that you have ${perception.tokenAccountCount} token accounts in your wallet.

Output ONLY valid raw JSON:
{"type": "action_name", "params": {"to": "address", "amount": 10000000}}
`;

    try {
        const result = await brain.invoke({
            prompt: initialPrompt,
            iterations: 0,
            error: null,
            action: null,
            llmResponse: null
        });

        if (result.action) {
            console.log(`  [Brain] Decision: ${result.action.type} (via LangGraph loop)`);
            return result.action;
        }
    } catch (e) {
        console.error(`  [Brain] Graph execution failed. Falling back.`);
    }

    const fallback = deterministicFallback(perception, targetAddress);
    console.log(`  [Brain] Decision: ${fallback.type} (via Deterministic Fallback)`);
    return fallback;
}

