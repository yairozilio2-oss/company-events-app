import request from 'supertest';
import app from '../src/index';

describe('GET /api/auth', () => {
  it('should return 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/auth');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
