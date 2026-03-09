import { describe, expect, it } from 'vitest';
import { InMemoryExecutionGuard } from '../control';

describe('execution guard', () => {
  it('blocks execution while paused', () => {
    const guard = new InMemoryExecutionGuard();
    guard.pause('incident response');
    expect(() => guard.assertAllowed('wallet.transferSol')).toThrow(/Execution paused/);
  });

  it('allows execution after resume', () => {
    const guard = new InMemoryExecutionGuard();
    guard.pause('incident response');
    guard.resume();
    expect(() => guard.assertAllowed('wallet.transferSol')).not.toThrow();
  });
});
