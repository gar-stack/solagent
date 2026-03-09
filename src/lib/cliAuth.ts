import nacl from 'tweetnacl';
import bs58 from 'bs58';

export interface CliAuthPayload {
  ver: number;
  kind: 'cli-auth';
  wallet: string;
  network: string;
  iat: number;
  exp: number;
}

function toBase64(input: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(input, 'utf-8').toString('base64');
  }
  return btoa(input);
}

function fromBase64(input: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(input, 'base64').toString('utf-8');
  }
  return atob(input);
}

export function toBase64Url(input: string): string {
  return toBase64(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function fromBase64Url(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const normalized = base64 + (pad ? '='.repeat(4 - pad) : '');
  return fromBase64(normalized);
}

export function createCliAuthCode(privateKeyBase58: string, payload: CliAuthPayload): string {
  const payloadB64 = toBase64Url(JSON.stringify(payload));
  const signature = nacl.sign.detached(new TextEncoder().encode(payloadB64), bs58.decode(privateKeyBase58));
  const signatureB58 = bs58.encode(signature);
  return `${payloadB64}.${signatureB58}`;
}

export function verifyCliAuthCode(code: string, expectedNetwork: string = 'devnet', nowSec: number = Math.floor(Date.now() / 1000)): CliAuthPayload {
  const [payloadB64, signatureB58] = code.trim().split('.');
  if (!payloadB64 || !signatureB58) {
    throw new Error('Invalid code format');
  }

  const payload = JSON.parse(fromBase64Url(payloadB64)) as CliAuthPayload;

  if (payload.kind !== 'cli-auth' || payload.ver !== 1) {
    throw new Error('Unsupported code type');
  }

  if (payload.network !== expectedNetwork) {
    throw new Error(`Code network mismatch: expected ${expectedNetwork}, got ${payload.network}`);
  }

  if (payload.exp <= nowSec) {
    throw new Error('Code expired');
  }

  const isValid = nacl.sign.detached.verify(
    new TextEncoder().encode(payloadB64),
    bs58.decode(signatureB58),
    bs58.decode(payload.wallet)
  );

  if (!isValid) {
    throw new Error('Signature verification failed');
  }

  return payload;
}
