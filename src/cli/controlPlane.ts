import * as fs from 'fs';
import * as path from 'path';
import type { ExecutionGuard, ExecutionGuardState } from '../sdk/control';

export interface ControlPlaneState extends ExecutionGuardState {
  source: 'cli';
}

const DEFAULT_CONTROL_FILE = path.join(process.cwd(), '.solagent.control.json');

export class FileExecutionGuard implements ExecutionGuard {
  constructor(private readonly filePath: string = DEFAULT_CONTROL_FILE) {}

  pause(reason?: string): ControlPlaneState {
    const state: ControlPlaneState = {
      paused: true,
      reason: reason || 'Emergency pause enabled by operator',
      updatedAt: new Date().toISOString(),
      source: 'cli',
    };
    this.writeState(state);
    return state;
  }

  resume(): ControlPlaneState {
    const state: ControlPlaneState = {
      paused: false,
      updatedAt: new Date().toISOString(),
      source: 'cli',
    };
    this.writeState(state);
    return state;
  }

  assertAllowed(context: string): void {
    const state = this.getState();
    if (!state.paused) return;
    throw new Error(`Execution paused (${context}): ${state.reason || 'no reason provided'}`);
  }

  getState(): ControlPlaneState {
    if (!fs.existsSync(this.filePath)) {
      return {
        paused: false,
        updatedAt: new Date().toISOString(),
        source: 'cli',
      };
    }

    const parsed = JSON.parse(fs.readFileSync(this.filePath, 'utf-8')) as ControlPlaneState;
    return {
      paused: parsed.paused,
      reason: parsed.reason,
      updatedAt: parsed.updatedAt,
      source: 'cli',
    };
  }

  private writeState(state: ControlPlaneState): void {
    fs.writeFileSync(this.filePath, JSON.stringify(state, null, 2));
  }
}

export function getControlPlanePath(): string {
  return DEFAULT_CONTROL_FILE;
}
