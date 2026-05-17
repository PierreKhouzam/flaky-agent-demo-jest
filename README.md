# flaky-agent-demo-jest

Demo repository for [FLAKY-AGENT](https://github.com/PierreKhouzam/FLAKY-AGENT) showcasing **async race condition** flakiness patterns with Jest.

## Test suite

| Test | Type | Pattern |
|------|------|---------|
| payment confirmation webhook arrives within 100ms | Broken | Always times out (2000ms > 100ms deadline) |
| user data loads before 55ms timeout | Flaky | Latency 40–70ms vs 55ms deadline |
| queue processes 100 items before 60ms deadline | Flaky | Duration 45–65ms vs 60ms deadline |
| synchronous data transformation is correct | Stable | Pure computation |
| error handling returns null for invalid input | Stable | Deterministic error path |

## Run

```bash
npm install
npm test
# Produces reports/test-results.json
```
