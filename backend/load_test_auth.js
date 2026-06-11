// Load test for /api/auth endpoint (POST) without credentials
// Measures response time and validates 401 status
const supertest = require('supertest');
const request = supertest('http://localhost:3002');

async function runTest(iterations = 100) {
  let totalTime = 0;
  let successCount = 0;
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    const response = await request.post('/api/auth').send({});
    const duration = Date.now() - start;
    totalTime += duration;
    if (response.status === 401) {
      successCount++;
    } else {
      console.error(`Unexpected status ${response.status} on iteration ${i}`);
    }
  }
  const avg = totalTime / iterations;
  console.log('--- Load Test Results ---');
  console.log(`Iterations: ${iterations}`);
  console.log(`401 responses: ${successCount}`);
  console.log(`Average response time: ${avg.toFixed(2)} ms`);
}

runTest().then(() => process.exit(0)).catch(err => {
  console.error('Error during load test:', err);
  process.exit(1);
});
