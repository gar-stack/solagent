import { describe, expect, it } from 'vitest';
import { parseWalletAllowlist, resolveRoleFromAllowlists } from '../walletRoles';

describe('wallet role mapping', () => {
  it('parses comma-separated allowlists safely', () => {
    const parsed = parseWalletAllowlist('  A ,B,, C  ');
    expect(parsed.has('A')).toBe(true);
    expect(parsed.has('B')).toBe(true);
    expect(parsed.has('C')).toBe(true);
    expect(parsed.size).toBe(3);
  });

  it('resolves disconnected wallet to viewer', () => {
    const role = resolveRoleFromAllowlists(null, new Set(['admin']), new Set(['operator']));
    expect(role).toBe('viewer');
  });

  it('resolves admin before operator when wallet appears in both lists', () => {
    const role = resolveRoleFromAllowlists('wallet-1', new Set(['wallet-1']), new Set(['wallet-1']));
    expect(role).toBe('admin');
  });

  it('resolves operator and viewer correctly', () => {
    const admin = new Set(['wallet-admin']);
    const operator = new Set(['wallet-operator']);
    expect(resolveRoleFromAllowlists('wallet-operator', admin, operator)).toBe('operator');
    expect(resolveRoleFromAllowlists('wallet-random', admin, operator)).toBe('viewer');
  });
});
