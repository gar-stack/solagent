import { describe, expect, it } from 'vitest';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { createCliAuthCode, verifyCliAuthCode } from '../cliAuth';

describe('cliAuth', () => {
  it('creates and verifies signed auth code', () => {
    const keypair = Keypair.generate();
    const privateKey = bs58.encode(keypair.secretKey);

    const code = createCliAuthCode(privateKey, {
      ver: 1,
      kind: 'cli-auth',
      wallet: keypair.publicKey.toBase58(),
      network: 'devnet',
      iat: 100,
      exp: 1000,
    });

    const payload = verifyCliAuthCode(code, 'devnet', 200);

    expect(payload.wallet).toBe(keypair.publicKey.toBase58());
    expect(payload.network).toBe('devnet');
  });

  it('rejects expired codes', () => {
    const keypair = Keypair.generate();
    const privateKey = bs58.encode(keypair.secretKey);

    const code = createCliAuthCode(privateKey, {
      ver: 1,
      kind: 'cli-auth',
      wallet: keypair.publicKey.toBase58(),
      network: 'devnet',
      iat: 100,
      exp: 120,
    });

    expect(() => verifyCliAuthCode(code, 'devnet', 121)).toThrow('Code expired');
  });
});
