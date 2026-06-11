// Load test for accommodation management endpoints
// Performs a sequence of POST, GET, PUT, DELETE and measures response times
const supertest = require('supertest');
const request = supertest('http://localhost:3002');

async function runTest() {
  // Create accommodation
  let start = Date.now();
  const createResp = await request.post('/api/accommodations').send({
    hostId: 1,
    title: 'Test Place',
    description: 'A place for testing',
    price: 100,
    capacity: 2,
    address: '123 Test St',
    photos: [],
    amenities: []
  });
  let createTime = Date.now() - start;
  if (createResp.status !== 201) {
    console.error('Create failed', createResp.status, createResp.body);
    return;
  }
  const id = createResp.body.id;

  // Get accommodation
  start = Date.now();
  const getResp = await request.get(`/api/accommodations/${id}`).send();
  const getTime = Date.now() - start;

  // Update accommodation
  start = Date.now();
  const updateResp = await request.put(`/api/accommodations/${id}`).send({ price: 120 });
  const updateTime = Date.now() - start;

  // Delete accommodation
  start = Date.now();
  const deleteResp = await request.delete(`/api/accommodations/${id}`).send();
  const deleteTime = Date.now() - start;

  console.log('--- Accommodation Load Test Results ---');
  console.log(`Create: ${createTime} ms, status ${createResp.status}`);
  console.log(`Get: ${getTime} ms, status ${getResp.status}`);
  console.log(`Update: ${updateTime} ms, status ${updateResp.status}`);
  console.log(`Delete: ${deleteTime} ms, status ${deleteResp.status}`);
}

runTest().then(() => process.exit(0)).catch(err => {
  console.error('Error during accommodation load test:', err);
  process.exit(1);
});
