import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Roommates API', () => {
  let eventId: number;
  let user1Id: number;
  let user2Id: number;
  let user3Id: number;
  let user4Id: number; // Different gender

  beforeAll(async () => {
    // Clean DB
    await prisma.preference.deleteMany();
    await prisma.registration.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();
    await prisma.event.deleteMany();

    const event = await prisma.event.create({
      data: { name: 'Test Event', date: new Date(), location: 'Test Loc' }
    });
    eventId = event.id;

    // Create a room of capacity 2
    await prisma.room.create({
      data: { capacity: 2, gender: 'M', eventId }
    });

    const user1 = await prisma.user.create({ data: { email: 'u1@test.com', passwordHash: 'hash', name: 'U1', gender: 'MALE' } });
    const user2 = await prisma.user.create({ data: { email: 'u2@test.com', passwordHash: 'hash', name: 'U2', gender: 'MALE' } });
    const user3 = await prisma.user.create({ data: { email: 'u3@test.com', passwordHash: 'hash', name: 'U3', gender: 'MALE' } });
    const user4 = await prisma.user.create({ data: { email: 'u4@test.com', passwordHash: 'hash', name: 'U4', gender: 'FEMALE' } });

    user1Id = user1.id;
    user2Id = user2.id;
    user3Id = user3.id;
    user4Id = user4.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should reject inviting a user of a different gender', async () => {
    const res = await request(app)
      .post('/api/roommates')
      .send({
        userId: user1Id,
        eventId,
        preferences: ['u4@test.com']
      })
      .expect(200);

    expect(res.body.results[0].status).toBe('error');
    expect(res.body.results[0].message).toBe('Gender mismatch');
  });

  it('should allow inviting a user of the same gender', async () => {
    const res = await request(app)
      .post('/api/roommates')
      .send({
        userId: user1Id,
        eventId,
        preferences: ['u2@test.com']
      })
      .expect(200);

    expect(res.body.results[0].status).toBe('pending');
  });

  it('should automatically approve if the invited user also invites the requester, and lock a room if capacity is reached', async () => {
    const res = await request(app)
      .post('/api/roommates')
      .send({
        userId: user2Id,
        eventId,
        preferences: ['u1@test.com']
      })
      .expect(200);

    expect(res.body.results[0].status).toBe('approved');
    expect(res.body.lockedRoomId).toBeDefined();

    // Verify room assignment
    const reg1 = await prisma.registration.findUnique({ where: { userId_eventId: { userId: user1Id, eventId } }});
    const reg2 = await prisma.registration.findUnique({ where: { userId_eventId: { userId: user2Id, eventId } }});
    
    expect(reg1?.roomId).toBe(res.body.lockedRoomId);
    expect(reg2?.roomId).toBe(res.body.lockedRoomId);
  });
});
