import * as fs from 'fs';
import * as path from 'path';
import { PolicyRegistry, signPolicyDocument, type PolicyDocument, type SignedPolicyDocument } from '../sdk/policyLifecycle';
import type { ActionPolicy } from '../sdk/policy';

interface PolicyStoreState {
  activeVersion: number | null;
  history: ReturnType<PolicyRegistry['exportState']>['history'];
}

const DEFAULT_POLICY_FILE = path.join(process.cwd(), '.solagent.policies.json');

export class FilePolicyRegistry {
  private readonly registry: PolicyRegistry;

  constructor(
    private readonly filePath: string = DEFAULT_POLICY_FILE,
    trustedSigners?: string[]
  ) {
    this.registry = new PolicyRegistry(trustedSigners);
    this.load();
  }

  applySignedPolicy(signed: SignedPolicyDocument): void {
    this.registry.apply(signed);
    this.persist();
  }

  createAndApplyPolicy(document: PolicyDocument, privateKeyBase58: string): SignedPolicyDocument {
    const signed = signPolicyDocument(document, privateKeyBase58);
    this.applySignedPolicy(signed);
    return signed;
  }

  rollback(version: number): void {
    this.registry.rollback(version);
    this.persist();
  }

  getActivePolicy(): ActionPolicy | null {
    return this.registry.getActivePolicy();
  }

  getActiveVersion(): number | null {
    return this.registry.getActiveEntry()?.document.version ?? null;
  }

  getHistory(): PolicyStoreState['history'] {
    return this.registry.getHistory();
  }

  private load(): void {
    if (!fs.existsSync(this.filePath)) return;
    const state = JSON.parse(fs.readFileSync(this.filePath, 'utf-8')) as PolicyStoreState;
    this.registry.importState({
      activeVersion: state.activeVersion,
      history: state.history,
    });
  }

  private persist(): void {
    const state = this.registry.exportState();
    fs.writeFileSync(this.filePath, JSON.stringify(state, null, 2));
  }
}

export function getPolicyFilePath(): string {
  return DEFAULT_POLICY_FILE;
}
