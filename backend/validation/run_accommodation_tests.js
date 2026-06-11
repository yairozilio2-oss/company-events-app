// Validation script for accommodation management API endpoints
// Run with: node backend/validation/run_accommodation_tests.js
// Using built-in fetch (Node >=18)
const baseUrl = 'http://localhost:3001';

async function measure(fn) {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  return { result, duration };
}

async function testHealth() {
  const { result, duration } = await measure(() => fetch(`${baseUrl}/api/health`));
  const status = result.status;
  const json = await result.json();
  return { name: 'Health Check', passed: status === 200 && json.status === 'ok', status, json, duration };
}

async function testAuthInvalid() {
  const { result, duration } = await measure(() => fetch(`${baseUrl}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nonexistent@example.com', password: 'wrong' })
  }));
  return { name: 'Auth Invalid Credentials', passed: result.status === 401, status: result.status, duration };
}

async function testPreferencesUnauth() {
  const { result, duration } = await measure(() => fetch(`${baseUrl}/api/preferences`));
  return { name: 'Preferences Unauthenticated', passed: result.status === 401, status: result.status, duration };
}

async function runTests() {
  const results = [];
  results.push(await testHealth());
  results.push(await testAuthInvalid());
  results.push(await testPreferencesUnauth());
  // New accommodation tests without auth
  results.push(await testAccommodationNoAuthCreate());
  results.push(await testAccommodationNoAuthGet());
  results.push(await testAccommodationNoAuthUpdate());
  results.push(await testAccommodationNoAuthDelete());
  // Summary
  const passedAll = results.every(r => r.passed);
  const reportLines = results.map(r => `- ${r.name}: ${r.passed ? 'PASS' : 'FAIL'} (status ${r.status}, ${r.duration}ms)`);
  const summary = `# Accommodation API Validation Report\n\nAll tests passed: ${passedAll}\n\n## Details\n${reportLines.join('\n')}\n`;
  const fs = require('fs');
  fs.writeFileSync('c:/Users/yairo/OneDrive/Desktop/new-project/API_M3_CHALLENGER.md', summary);
  console.log('Report written to API_M3_CHALLENGER.md');
}

runTests().catch(err => {
  console.error('Error during tests:', err);
});
