import request from 'supertest';
import app from '../../src/index';

describe('Accommodation API', () => {
  let createdId: number;

  it('should create an accommodation', async () => {
    const res = await request(app)
      .post('/api/accommodations')
      .send({
        title: 'Test Cottage',
        description: 'A test cottage',
        price: 100,
        capacity: 2,
        address: '123 Test St',
        photos: ['photo1.jpg'],
        amenities: ['wifi']
      })
      .expect(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('Test Cottage');
    createdId = res.body.id;
  });

  it('should retrieve the created accommodation', async () => {
    const res = await request(app)
      .get(`/api/accommodations/${createdId}`)
      .expect(200);
    expect(res.body.id).toBe(createdId);
    expect(res.body.title).toBe('Test Cottage');
  });

  it('should update the accommodation', async () => {
    const res = await request(app)
      .put(`/api/accommodations/${createdId}`)
      .send({ price: 120 })
      .expect(200);
    expect(res.body.price).toBe(120);
  });

  it('should delete the accommodation', async () => {
    await request(app)
      .delete(`/api/accommodations/${createdId}`)
      .expect(204);
    // Verify deletion
    await request(app)
      .get(`/api/accommodations/${createdId}`)
      .expect(404);
  });
});
