import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertestRequest from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { CreateHotelDto } from 'src/modules/hotels/domain/dto/create-hotel.dto';

jest.mock('ioredis', () => {
  const mockRedis = jest.fn().mockImplementation(() => ({
    del: jest.fn().mockResolvedValue(1),
    get: jest.fn().mockResolvedValue(JSON.stringify([{ key: 'mock-value' }])),
    quit: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
  }));

  return {
    __esModule: true,
    default: mockRedis,
    Redis: mockRedis,
  };
});

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let redisClient: Redis;
  let hotelId: number;
  let adminUser: any;
  let normalUser: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    redisClient = new Redis();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    await prisma.$transaction([
      prisma.reservation.deleteMany(),
      prisma.hotel.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    adminUser = await prisma.user.create({
      data: {
        name: 'admin1234',
        email: 'admin@example.com',
        role: 'ADMIN',
        password: 'admin',
        avatar: null,
      },
    });

    normalUser = await prisma.user.create({
      data: {
        name: 'user',
        email: 'usertest@example.com',
        password: 'admin',
        avatar: null,
      },
    });

    adminToken = jwt.sign(
      { sub: adminUser.id, role: adminUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d', issuer: 'dnc_hotel', audience: 'users' },
    );

    userToken = jwt.sign(
      { sub: normalUser.id, role: normalUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d', issuer: 'dnc_hotel', audience: 'users' },
    );

  });



  it('/hotels (POST)', async () => {


    const data: CreateHotelDto = {
      name: 'Hotel Test E2E',
      description: 'A hotel created during e2e testing',
      address: '123 Test St, Test City',
      price: 150,
    };

    console.log('hotel payload', data);

    const response = await supertestRequest(app.getHttpServer())
      .post('/hotels')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(data)
      .expect(201);

    console.log('hotel created', response.body.id)
    hotelId = response.body.id;


    expect(response.body).toMatchObject(data);

  })

  it('/hotels (GET)', async () => {
    const response = await supertestRequest(app.getHttpServer())
      .get('/hotels')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data).toHaveLength(1);
  });


  it('/hotels/:id (GET)', async () => {
    const response = await supertestRequest(app.getHttpServer())
      .get(`/hotels/${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Object);
    expect(response.body.id).toBe(hotelId);
  });

  afterAll(async () => {
    await prisma.hotel.deleteMany();
    await prisma.user.deleteMany();
    await redisClient.quit();
    await app.close();
  });

  it('/hotels/:id (PATCH)', async () => {
    const hotelName = { name: 'Hotel E2E Modificado' };

    const response = await supertestRequest(app.getHttpServer())
      .patch(`/hotels/${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(hotelName)
      .expect(200);

    expect(response.body).toMatchObject(hotelName);
  })

  it('/hotels/image/:hotelId (PATCH)', async () => {
    await supertestRequest(app.getHttpServer())
      .patch(`/hotels/image/${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('image', Buffer.from('fake image content'), 'hotel-image.jpg')
      .expect(200);
  }, 10000)

  it('/hotels/:id (DELETE)', async () => {
    await supertestRequest(app.getHttpServer())
      .delete(`/hotels/${hotelId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});