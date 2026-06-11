import request from 'supertest';
import app from '../src/index';
import jwt from 'jsonwebtoken';

describe('GET /api/auth with token', () => {
  const secret = process.env.JWT_SECRET as string;

  it('should return userId for valid token', async () => {
    const token = jwt.sign({ userId: 123 }, secret, { expiresIn: '1h' });
    const res = await request(app).get('/api/auth').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('userId', 123);
  });

  it('should return 401 for invalid token', async () => {
    const res = await request(app).get('/api/auth').set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
