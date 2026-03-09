import { describe, expect, it } from 'vitest';
import { telemetry } from '../telemetry';

describe('telemetry', () => {
  it('tracks counters and latency summaries', () => {
    telemetry.increment('test.counter');
    telemetry.increment('test.counter', 2);
    telemetry.observe('test.latency', 10);
    telemetry.observe('test.latency', 50);

    const counters = telemetry.getCounters();
    const counter = counters.find((entry) => entry.name === 'test.counter');
    expect(counter?.value).toBe(3);

    const hist = telemetry.getHistogramSummary();
    const latency = hist.find((entry) => entry.name === 'test.latency');
    expect(latency?.count).toBeGreaterThanOrEqual(2);
    expect((latency?.p95 ?? 0)).toBeGreaterThanOrEqual(10);
  });
});
