import nacl from 'tweetnacl';
import bs58 from 'bs58';

export type AuditEventLevel = 'info' | 'warn' | 'error';

export interface AuditEvent {
  category: 'policy' | 'execution' | 'wallet' | 'auth' | 'control-plane';
  action: string;
  level: AuditEventLevel;
  actor?: string;
  target?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  category: AuditEvent['category'];
  action: string;
  level: AuditEventLevel;
  actor?: string;
  target?: string;
  message: string;
  metadata?: Record<string, unknown>;
  previousHash: string;
  hash: string;
}

export interface AuditSink {
  write(event: AuditEvent): Promise<AuditRecord>;
  list(limit?: number): Promise<AuditRecord[]>;
}

const GENESIS_HASH = 'GENESIS';

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

function hashRecordPayload(payload: unknown): string {
  const encoded = new TextEncoder().encode(stableStringify(payload));
  return bs58.encode(nacl.hash(encoded));
}

export function buildAuditRecord(event: AuditEvent, previousHash: string, id: string, timestamp: string): AuditRecord {
  const hash = hashRecordPayload({
    id,
    timestamp,
    category: event.category,
    action: event.action,
    level: event.level,
    actor: event.actor,
    target: event.target,
    message: event.message,
    metadata: event.metadata,
    previousHash,
  });

  return {
    id,
    timestamp,
    category: event.category,
    action: event.action,
    level: event.level,
    actor: event.actor,
    target: event.target,
    message: event.message,
    metadata: event.metadata,
    previousHash,
    hash,
  };
}

export function verifyAuditChain(records: AuditRecord[]): boolean {
  let previousHash = GENESIS_HASH;
  for (const record of records) {
    if (record.previousHash !== previousHash) {
      return false;
    }

    const expectedHash = hashRecordPayload({
      id: record.id,
      timestamp: record.timestamp,
      category: record.category,
      action: record.action,
      level: record.level,
      actor: record.actor,
      target: record.target,
      message: record.message,
      metadata: record.metadata,
      previousHash: record.previousHash,
    });

    if (record.hash !== expectedHash) {
      return false;
    }

    previousHash = record.hash;
  }

  return true;
}

export class InMemoryAuditSink implements AuditSink {
  private readonly records: AuditRecord[] = [];

  async write(event: AuditEvent): Promise<AuditRecord> {
    const previousHash = this.records[this.records.length - 1]?.hash ?? GENESIS_HASH;
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const record = buildAuditRecord(event, previousHash, id, timestamp);

    this.records.push(record);
    return record;
  }

  async list(limit?: number): Promise<AuditRecord[]> {
    if (!limit || limit <= 0) {
      return [...this.records];
    }
    return this.records.slice(Math.max(0, this.records.length - limit));
  }
}
