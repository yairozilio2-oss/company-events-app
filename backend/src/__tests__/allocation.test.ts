import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Auto-Allocation API', () => {
  let eventId: number;
  let maleId: number;
  let femaleId: number;

  beforeAll(async () => {
    // Clean DB
    await prisma.preference.deleteMany();
    await prisma.registration.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();
    await prisma.event.deleteMany();

    // Create event
    const event = await prisma.event.create({
      data: { name: 'Auto Event', date: new Date(), location: 'Location' }
    });
    eventId = event.id;

    // Create rooms
    await prisma.room.create({ data: { capacity: 2, gender: 'M', eventId } });
    await prisma.room.create({ data: { capacity: 2, gender: 'F', eventId } });

    // Create users
    const maleUser = await prisma.user.create({
      data: { email: 'male@test.com', passwordHash: 'hash', name: 'Male User', gender: 'MALE' }
    });
    const femaleUser = await prisma.user.create({
      data: { email: 'female@test.com', passwordHash: 'hash', name: 'Female User', gender: 'FEMALE' }
    });
    maleId = maleUser.id;
    femaleId = femaleUser.id;

    // Register them
    await prisma.registration.create({ data: { userId: maleId, eventId } });
    await prisma.registration.create({ data: { userId: femaleId, eventId } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should run auto-allocation and assign rooms based on gender', async () => {
    const res = await request(app)
      .post('/api/allocate/auto')
      .send({ eventId })
      .expect(200);

    expect(res.body.success).toBe(true);

    // Verify rooms allocated
    const maleReg = await prisma.registration.findUnique({ where: { userId_eventId: { userId: maleId, eventId } } });
    const femaleReg = await prisma.registration.findUnique({ where: { userId_eventId: { userId: femaleId, eventId } } });

    expect(maleReg?.roomId).toBeDefined();
    expect(femaleReg?.roomId).toBeDefined();
    expect(maleReg?.roomId).not.toBe(femaleReg?.roomId);
  });

  it('should get occupancy reports', async () => {
    const res = await request(app)
      .get(`/api/reports/occupancy?eventId=${eventId}`)
      .expect(200);

    expect(res.body.rooms).toBeDefined();
    expect(res.body.unassigned).toBeDefined();
  });
});
