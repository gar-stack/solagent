import nacl from 'tweetnacl';
import bs58 from 'bs58';
import type { ActionPolicy } from './policy';

export interface PolicyDocument {
  version: number;
  createdAt: string;
  previousVersion?: number;
  description?: string;
  policy: ActionPolicy;
}

export interface SignedPolicyDocument {
  payload: string;
  signature: string;
  signer: string;
}

export interface PolicyHistoryEntry {
  signer: string;
  document: PolicyDocument;
  signature: string;
  appliedAt: string;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const objectValue = value as Record<string, unknown>;
  const keys = Object.keys(objectValue).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`).join(',')}}`;
}

function toBase64Url(utf8Input: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(utf8Input, 'utf-8').toString('base64url');
  }

  const encoded = btoa(utf8Input);
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(base64UrlInput: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64UrlInput, 'base64url').toString('utf-8');
  }

  const base64 = base64UrlInput.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const normalized = base64 + (pad ? '='.repeat(4 - pad) : '');
  return atob(normalized);
}

function encodePolicyDocument(document: PolicyDocument): string {
  return toBase64Url(stableStringify(document));
}

function decodePolicyDocument(payload: string): PolicyDocument {
  return JSON.parse(fromBase64Url(payload)) as PolicyDocument;
}

export function signPolicyDocument(document: PolicyDocument, privateKeyBase58: string): SignedPolicyDocument {
  const payload = encodePolicyDocument(document);
  const signatureBytes = nacl.sign.detached(new TextEncoder().encode(payload), bs58.decode(privateKeyBase58));
  const signer = bs58.encode(bs58.decode(privateKeyBase58).slice(32));
  return {
    payload,
    signature: bs58.encode(signatureBytes),
    signer,
  };
}

export function verifySignedPolicyDocument(document: SignedPolicyDocument): PolicyDocument {
  const isValid = nacl.sign.detached.verify(
    new TextEncoder().encode(document.payload),
    bs58.decode(document.signature),
    bs58.decode(document.signer)
  );

  if (!isValid) {
    throw new Error('Invalid policy signature');
  }

  return decodePolicyDocument(document.payload);
}

export class PolicyRegistry {
  private readonly allowedSigners?: Set<string>;
  private readonly history: PolicyHistoryEntry[] = [];
  private activeVersion: number | null = null;

  constructor(allowedSigners?: string[]) {
    this.allowedSigners = allowedSigners && allowedSigners.length > 0 ? new Set(allowedSigners) : undefined;
  }

  apply(signedDocument: SignedPolicyDocument): PolicyHistoryEntry {
    const document = verifySignedPolicyDocument(signedDocument);

    if (this.allowedSigners && !this.allowedSigners.has(signedDocument.signer)) {
      throw new Error(`Signer ${signedDocument.signer} is not trusted`);
    }

    if (this.history.some((entry) => entry.document.version === document.version)) {
      throw new Error(`Policy version ${document.version} already exists`);
    }

    const latestVersion = this.history.at(-1)?.document.version;
    if (typeof latestVersion === 'number' && document.version <= latestVersion) {
      throw new Error(`Policy version must increase. Latest: ${latestVersion}, received: ${document.version}`);
    }

    if (typeof latestVersion === 'number' && document.previousVersion !== latestVersion) {
      throw new Error(`Policy previousVersion mismatch. Expected ${latestVersion}, got ${document.previousVersion ?? 'none'}`);
    }

    const entry: PolicyHistoryEntry = {
      signer: signedDocument.signer,
      signature: signedDocument.signature,
      document,
      appliedAt: new Date().toISOString(),
    };

    this.history.push(entry);
    this.activeVersion = document.version;
    return entry;
  }

  rollback(version: number): PolicyHistoryEntry {
    const target = this.history.find((entry) => entry.document.version === version);
    if (!target) {
      throw new Error(`Policy version ${version} does not exist`);
    }
    this.activeVersion = target.document.version;
    return target;
  }

  getActivePolicy(): ActionPolicy | null {
    const active = this.getActiveEntry();
    return active ? active.document.policy : null;
  }

  getActiveEntry(): PolicyHistoryEntry | null {
    if (this.activeVersion === null) return null;
    return this.history.find((entry) => entry.document.version === this.activeVersion) || null;
  }

  getHistory(): PolicyHistoryEntry[] {
    return [...this.history];
  }

  exportState(): { activeVersion: number | null; history: PolicyHistoryEntry[] } {
    return {
      activeVersion: this.activeVersion,
      history: [...this.history],
    };
  }

  importState(state: { activeVersion: number | null; history: PolicyHistoryEntry[] }): void {
    this.history.length = 0;
    this.history.push(...state.history);
    this.activeVersion = state.activeVersion;
  }
}
