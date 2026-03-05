import { EventEmitter } from "events";

// Singleton event bus for agent lifecycle events.
// Standard events:
//   - balance_checked  { agentId, address, balance }
//   - transfer_executed { agentId, from, to, amount }
//   - cycle_completed  { agentId, capability }
export const agentBus = new EventEmitter();
