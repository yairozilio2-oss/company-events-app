import request from 'supertest';
import app from '../backend/src/index';

describe('Accommodation API', () => {
  let createdId: number;
  const payload = {
    title: 'Test Cottage',
    description: 'A cozy place',
    price: 150.0,
    capacity: 3,
    address: '123 Test St',
    photos: '[]',
    amenities: '[]'
  };

  it('should create an accommodation', async () => {
    const res = await request(app).post('/api/accommodations').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(payload);
    createdId = res.body.id;
  });

  it('should retrieve the accommodation', async () => {
    const res = await request(app).get(`/api/accommodations/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
  });

  it('should update the accommodation', async () => {
    const update = { ...payload, price: 200.0 };
    const res = await request(app).put(`/api/accommodations/${createdId}`).send(update);
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(200.0);
  });

  it('should delete the accommodation', async () => {
    const res = await request(app).delete(`/api/accommodations/${createdId}`);
    expect(res.status).toBe(204);
  });
});
