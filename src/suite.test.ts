// Demo: async race condition flakiness patterns for FLAKY-AGENT

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchUserData(): Promise<{ id: number; name: string }> {
  // Variable latency: 40–70ms
  const latency = 40 + Math.random() * 30;
  await delay(latency);
  return { id: 1, name: 'Alice' };
}

async function processQueue(items: number[]): Promise<number[]> {
  // Variable duration: 45–65ms
  const duration = 45 + Math.random() * 20;
  await delay(duration);
  return items.map(x => x * 2);
}

// BROKEN: webhook always takes 2000ms, deadline is 100ms
test('payment confirmation webhook arrives within 100ms', async () => {
  const webhook = new Promise<string>(resolve =>
    setTimeout(() => resolve('confirmed'), 2000)
  );
  const result = await Promise.race([
    webhook,
    delay(100).then(() => { throw new Error('webhook timeout after 100ms'); }),
  ]);
  expect(result).toBe('confirmed');
});

// FLAKY: fetchUserData takes 40–70ms, deadline is 55ms → fails ~50%
test('user data loads before 55ms timeout', async () => {
  const result = await Promise.race([
    fetchUserData(),
    delay(55).then(() => { throw new Error('timeout: user data took too long'); }),
  ]);
  expect(result).toEqual({ id: 1, name: 'Alice' });
});

// FLAKY: processQueue takes 45–65ms, deadline is 60ms → fails ~40%
test('queue processes 100 items before 60ms deadline', async () => {
  const items = Array.from({ length: 100 }, (_, i) => i);
  const result = await Promise.race([
    processQueue(items),
    delay(60).then(() => { throw new Error('timeout: queue processing too slow'); }),
  ]);
  expect(result).toHaveLength(100);
});

// STABLE
test('synchronous data transformation is correct', () => {
  const input = [1, 2, 3, 4, 5];
  expect(input.map(x => x * x)).toEqual([1, 4, 9, 16, 25]);
});

test('error handling returns null for invalid input', async () => {
  async function safeFetch(id: number): Promise<{ id: number } | null> {
    if (id < 0) return null;
    await delay(10);
    return { id };
  }
  expect(await safeFetch(-1)).toBeNull();
});
