// Stress test for /api/health endpoint
// Run with: node backend/validation/stress_accommodation_tests.js
// Using built‑in fetch (Node >=18)
const fetch = global.fetch; // Node's built‑in fetch
const fs = require('fs');
const baseUrl = 'http://localhost:3001';

async function healthRequest() {
  const start = Date.now();
  const response = await fetch(`${baseUrl}/api/health`);
  const duration = Date.now() - start;
  return { status: response.status, duration };
}

async function runStressTest() {
  const requestCount = 100;
  const promises = [];
  for (let i = 0; i < requestCount; i++) {
    promises.push(healthRequest());
  }
  const results = await Promise.all(promises);
  const durations = results.map(r => r.duration);
  const avg = durations.reduce((a, b) => a + b, 0) / requestCount;
  const min = Math.min(...durations);
  const max = Math.max(...durations);
  const failures = results.filter(r => r.status !== 200).length;
  const summary = `\n# Stress Test Report\n\nRequests: ${requestCount}\nAverage latency: ${avg.toFixed(2)}ms\nMin latency: ${min}ms\nMax latency: ${max}ms\nFailures (non‑200): ${failures}\n`;
  fs.appendFileSync('c:/Users/yairo/OneDrive/Desktop/new-project/API_M3_CHALLENGER.md', summary);
  console.log('Stress test completed, report appended to API_M3_CHALLENGER.md');
}

runStressTest().catch(err => {
  console.error('Error during stress test:', err);
});
