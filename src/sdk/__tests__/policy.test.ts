import { describe, expect, it } from 'vitest';
import { evaluateDecisionPolicy, type ActionPolicy } from '../policy';
import type { AgentDecision } from '../AgenticWallet';

const baseDecision: AgentDecision = {
  action: 'transfer',
  params: {
    to: 'Recipient11111111111111111111111111111111',
    amount: 0.5,
    token: 'So11111111111111111111111111111111111111112',
  },
  confidence: 0.8,
  reason: 'test',
};

describe('evaluateDecisionPolicy', () => {
  it('allows a compliant decision', () => {
    const policy: ActionPolicy = {
      minConfidence: 0.6,
      allowedActions: ['transfer'],
      maxAmountByAction: { transfer: 1 },
    };

    const result = evaluateDecisionPolicy(baseDecision, policy);
    expect(result.allowed).toBe(true);
  });

  it('blocks decision by confidence', () => {
    const result = evaluateDecisionPolicy(
      { ...baseDecision, confidence: 0.2 },
      { minConfidence: 0.6 }
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('below minimum');
  });

  it('blocks decision by token and recipient policy', () => {
    const policy: ActionPolicy = {
      blockedTokens: ['So11111111111111111111111111111111111111112'],
      blockedRecipients: ['Recipient11111111111111111111111111111111'],
    };

    const result = evaluateDecisionPolicy(baseDecision, policy);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Token');
  });
});
