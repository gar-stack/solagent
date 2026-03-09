import type { AgentDecision } from './AgenticWallet';

export interface ActionPolicy {
  minConfidence?: number;
  allowedActions?: AgentDecision['action'][];
  maxAmountByAction?: Partial<Record<AgentDecision['action'], number>>;
  blockedTokens?: string[];
  allowedTokens?: string[];
  blockedRecipients?: string[];
  allowedRecipients?: string[];
}

export interface PolicyResult {
  allowed: boolean;
  reason?: string;
}

export function evaluateDecisionPolicy(decision: AgentDecision, policy: ActionPolicy): PolicyResult {
  const minConfidence = policy.minConfidence ?? 0.6;
  if (decision.confidence < minConfidence) {
    return { allowed: false, reason: `Confidence ${decision.confidence} below minimum ${minConfidence}` };
  }

  if (policy.allowedActions && !policy.allowedActions.includes(decision.action)) {
    return { allowed: false, reason: `Action ${decision.action} is not allowed` };
  }

  const amount = typeof decision.params.amount === 'number' ? decision.params.amount : undefined;
  const maxAmount = policy.maxAmountByAction?.[decision.action];
  if (typeof amount === 'number' && typeof maxAmount === 'number' && amount > maxAmount) {
    return { allowed: false, reason: `Amount ${amount} exceeds max ${maxAmount} for ${decision.action}` };
  }

  const token = typeof decision.params.token === 'string' ? decision.params.token : undefined;
  if (token && policy.blockedTokens?.includes(token)) {
    return { allowed: false, reason: `Token ${token} is blocked` };
  }

  if (token && policy.allowedTokens && !policy.allowedTokens.includes(token)) {
    return { allowed: false, reason: `Token ${token} is not allowlisted` };
  }

  const recipient = typeof decision.params.to === 'string' ? decision.params.to : undefined;
  if (recipient && policy.blockedRecipients?.includes(recipient)) {
    return { allowed: false, reason: `Recipient ${recipient} is blocked` };
  }

  if (recipient && policy.allowedRecipients && !policy.allowedRecipients.includes(recipient)) {
    return { allowed: false, reason: `Recipient ${recipient} is not allowlisted` };
  }

  return { allowed: true };
}
