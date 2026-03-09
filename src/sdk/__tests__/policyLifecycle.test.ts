import { describe, expect, it } from 'vitest';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { PolicyRegistry, signPolicyDocument, verifySignedPolicyDocument } from '../policyLifecycle';

describe('policy lifecycle', () => {
  it('signs and verifies policy documents', () => {
    const signer = Keypair.generate();
    const signed = signPolicyDocument(
      {
        version: 1,
        createdAt: new Date().toISOString(),
        policy: { minConfidence: 0.7, allowedActions: ['transfer', 'hold'] },
      },
      bs58.encode(signer.secretKey)
    );

    const verified = verifySignedPolicyDocument(signed);
    expect(verified.version).toBe(1);
    expect(verified.policy.allowedActions).toEqual(['transfer', 'hold']);
  }, 15000);

  it('supports monotonic versioning and rollback', () => {
    const signer = Keypair.generate();
    const privateKey = bs58.encode(signer.secretKey);
    const registry = new PolicyRegistry();

    registry.apply(
      signPolicyDocument(
        {
          version: 1,
          createdAt: new Date().toISOString(),
          policy: { minConfidence: 0.65 },
        },
        privateKey
      )
    );
    registry.apply(
      signPolicyDocument(
        {
          version: 2,
          previousVersion: 1,
          createdAt: new Date().toISOString(),
          policy: { minConfidence: 0.9, allowedActions: ['hold'] },
        },
        privateKey
      )
    );

    expect(registry.getActiveEntry()?.document.version).toBe(2);
    registry.rollback(1);
    expect(registry.getActiveEntry()?.document.version).toBe(1);
  });
});
