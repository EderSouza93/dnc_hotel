import { Test, TestingModule } from "@nestjs/testing";
import { IHotelRepository } from "../domain/repositories/Ihotel.repositories";
import { FindAllHotelsService } from "./findAllHotel.service";
import { REPOSITORY_TOKEN_HOTEL } from "../utils/repositoriesTokens";
import { Hotel } from "@prisma/client";
import { REDIS_HOTEL_KEY } from "../utils/redisKey";

let service: FindAllHotelsService;
let hotelRepository: IHotelRepository;
let redis: { get: jest.Mock; set: jest.Mock }

const hotelMock: Hotel = {
  id: 1,
  name: 'Test Hotel',
  description: 'A test hotel description',
  image: 'test-image.jpg',
  price: 100,
  address: '123 Test St',
  ownerId: 1,
  createdAt: new Date('2026-01-23T10:41:18.753Z'),
  updatedAt: new Date('2026-01-23T10:41:18.753Z'),
}

describe('FindAllHotelsService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllHotelsService,
        {
          provide: REPOSITORY_TOKEN_HOTEL,
          useValue: {
            findHotels: jest.fn().mockResolvedValue([hotelMock]),
            countHotels: jest.fn().mockResolvedValue(1),
          },
        },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: {
            get: jest.fn(),
            set: jest.fn()
          },
        },
      ],
    }).compile()

    service = module.get<FindAllHotelsService>(FindAllHotelsService);
    hotelRepository = module.get<IHotelRepository>(REPOSITORY_TOKEN_HOTEL);
    redis = module.get('default_IORedisModuleConnectionToken');
  });

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should return hotels from Redis if available', async () => {
    const hotelFromRedis = [hotelMock];
    redis.get.mockResolvedValue(JSON.stringify(hotelFromRedis))

    const result = await service.execute()

    result.data.forEach((hotel) => {
      hotel.createdAt = new Date(hotel.createdAt);
      hotel.updatedAt = new Date(hotel.updatedAt);;
    });

    expect(redis.get).toHaveBeenCalledWith(REDIS_HOTEL_KEY);
  })

  it('should fetch hotels from repository if not in Redis and cache them', async () => {
    redis.get.mockResolvedValue(null);
    const result = await service.execute();

    expect(redis.get).toHaveBeenCalledWith(REDIS_HOTEL_KEY);
    expect(hotelRepository.findHotels).toHaveBeenCalledWith(0, 10);
    expect(hotelRepository.countHotels).toHaveBeenCalled();
    expect(redis.set).toHaveBeenCalledWith(REDIS_HOTEL_KEY, JSON.stringify([hotelMock]));
    expect(result.data).toEqual([hotelMock]);
    expect(result.total).toEqual(1);
    expect(result).toEqual({
      total: 1,
      page: 1,
      per_page: 10,
      data: [hotelMock],
    })
  })

  it('should return the correct pagination metadata', async () => {
    redis.get.mockResolvedValue(null);

    const page = 2;
    const limit = 5;
    const result = await service.execute(page, limit);

    expect(hotelRepository.findHotels).toHaveBeenCalledWith(5, 5);
    expect(result.page).toEqual(page);
    expect(result.per_page).toEqual(limit);
  });

  it('should format hotel images URLs correctly', async () => {
    process.env.APP_API_URL = 'http://localhost:3000';

    const hotelWithImage = {...hotelMock, image: 'test-image.jpg' };
    redis.get.mockResolvedValue(null);
    
    (hotelRepository.findHotels as jest.Mock).mockResolvedValue([
      hotelWithImage,
    ]);

    const result = await service.execute();

    expect(result.data[0].image).toEqual(
      `${process.env.APP_API_URL}/hotel-image/test-image.jpg`,
    );
  });
}); 