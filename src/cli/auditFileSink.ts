import * as fs from 'fs';
import * as path from 'path';
import { buildAuditRecord, type AuditEvent, type AuditRecord, type AuditSink, verifyAuditChain } from '../sdk/audit';

const DEFAULT_AUDIT_FILE = path.join(process.cwd(), '.solagent.audit.ndjson');
const GENESIS_HASH = 'GENESIS';

export class FileAuditSink implements AuditSink {
  private readonly records: AuditRecord[];

  constructor(private readonly filePath: string = DEFAULT_AUDIT_FILE) {
    this.records = this.readRecords();
    if (this.records.length > 0 && !verifyAuditChain(this.records)) {
      throw new Error(`Audit chain verification failed for ${this.filePath}`);
    }
  }

  async write(event: AuditEvent): Promise<AuditRecord> {
    const previousHash = this.records[this.records.length - 1]?.hash ?? GENESIS_HASH;
    const record = buildAuditRecord(event, previousHash, crypto.randomUUID(), new Date().toISOString());
    this.records.push(record);
    fs.appendFileSync(this.filePath, `${JSON.stringify(record)}\n`);
    return record;
  }

  async list(limit?: number): Promise<AuditRecord[]> {
    if (!limit || limit <= 0) {
      return [...this.records];
    }
    return this.records.slice(Math.max(0, this.records.length - limit));
  }

  private readRecords(): AuditRecord[] {
    if (!fs.existsSync(this.filePath)) return [];
    const content = fs.readFileSync(this.filePath, 'utf-8');
    if (!content.trim()) return [];
    return content
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line) as AuditRecord);
  }
}

export function getAuditFilePath(): string {
  return DEFAULT_AUDIT_FILE;
}
