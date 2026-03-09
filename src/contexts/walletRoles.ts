export function parseWalletAllowlist(value: string | undefined): Set<string> {
  if (!value) return new Set();
  return new Set(
    value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  );
}

export function resolveRoleFromAllowlists(
  address: string | null,
  adminAllowlist: Set<string>,
  operatorAllowlist: Set<string>
): 'viewer' | 'operator' | 'admin' {
  if (!address) return 'viewer';
  if (adminAllowlist.has(address)) return 'admin';
  if (operatorAllowlist.has(address)) return 'operator';
  return 'viewer';
}
