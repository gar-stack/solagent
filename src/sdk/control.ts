export interface ExecutionGuardState {
  paused: boolean;
  reason?: string;
  updatedAt: string;
}

export interface ExecutionGuard {
  assertAllowed(context: string): void;
  getState(): ExecutionGuardState;
}

export class InMemoryExecutionGuard implements ExecutionGuard {
  private state: ExecutionGuardState = {
    paused: false,
    updatedAt: new Date().toISOString(),
  };

  pause(reason?: string): void {
    this.state = {
      paused: true,
      reason: reason || 'Emergency pause enabled',
      updatedAt: new Date().toISOString(),
    };
  }

  resume(): void {
    this.state = {
      paused: false,
      updatedAt: new Date().toISOString(),
    };
  }

  assertAllowed(context: string): void {
    if (!this.state.paused) return;
    throw new Error(`Execution paused (${context}): ${this.state.reason || 'no reason provided'}`);
  }

  getState(): ExecutionGuardState {
    return { ...this.state };
  }
}
