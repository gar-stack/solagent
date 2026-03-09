import { describe, expect, it } from 'vitest';
import { InMemoryAuditSink, verifyAuditChain } from '../audit';

describe('audit sink', () => {
  it('creates verifiable append-only hash chain', async () => {
    const sink = new InMemoryAuditSink();

    await sink.write({
      category: 'execution',
      action: 'decision-generated',
      level: 'info',
      message: 'Decision generated for test',
    });
    await sink.write({
      category: 'policy',
      action: 'policy-applied',
      level: 'info',
      message: 'Policy applied for test',
    });

    const records = await sink.list();
    expect(records).toHaveLength(2);
    expect(verifyAuditChain(records)).toBe(true);

    const tampered = [...records];
    tampered[1] = { ...tampered[1], message: 'tampered' };
    expect(verifyAuditChain(tampered)).toBe(false);
  });
});
