export interface TelemetryEvent {
  name: string;
  at: string;
  level: 'info' | 'warn' | 'error';
  tags?: Record<string, string | number | boolean>;
  fields?: Record<string, number>;
}

export interface TelemetryCounter {
  name: string;
  value: number;
}

export interface TelemetryHistogramPoint {
  name: string;
  value: number;
}

class InMemoryTelemetry {
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  increment(name: string, amount: number = 1): void {
    const current = this.counters.get(name) ?? 0;
    this.counters.set(name, current + amount);
  }

  observe(name: string, value: number): void {
    const series = this.histograms.get(name) ?? [];
    series.push(value);
    if (series.length > 1000) {
      series.shift();
    }
    this.histograms.set(name, series);
  }

  event(entry: TelemetryEvent): void {
    const log = JSON.stringify({ type: 'telemetry.event', ...entry });
    if (entry.level === 'error') {
      console.error(log);
      return;
    }
    console.log(log);
  }

  getCounters(): TelemetryCounter[] {
    return Array.from(this.counters.entries()).map(([name, value]) => ({ name, value }));
  }

  getHistogramSummary(): Array<{ name: string; count: number; p50: number; p95: number }> {
    return Array.from(this.histograms.entries()).map(([name, values]) => {
      const sorted = [...values].sort((a, b) => a - b);
      const p50 = sorted[Math.floor((sorted.length - 1) * 0.5)] ?? 0;
      const p95 = sorted[Math.floor((sorted.length - 1) * 0.95)] ?? 0;
      return {
        name,
        count: values.length,
        p50,
        p95,
      };
    });
  }
}

export const telemetry = new InMemoryTelemetry();
