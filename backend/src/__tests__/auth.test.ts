import request from 'supertest';
import app from '../../src/index';

describe('POST /api/auth unauthorized', () => {
  it('should return 401 when no credentials are provided', async () => {
    const response = await request(app).post('/api/auth').send({});
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
});
