import request from 'supertest';
import app from '../src/index';

describe('POST /api/login', () => {
  it('should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'nonexistent@example.com', password: 'wrong' })
      .set('Accept', 'application/json');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 when no credentials are provided', async () => {
    const res = await request(app).post('/api/login').send({});
    expect(res.status).toBe(400);
  });
});
