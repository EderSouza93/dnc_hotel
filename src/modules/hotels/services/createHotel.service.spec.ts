import { Test, TestingModule } from "@nestjs/testing"
import { CreateHotelsService } from "./createHotel.service"
import { REPOSITORY_TOKEN_HOTEL } from "../utils/repositoriesTokens"
import { IHotelRepository } from "../domain/repositories/Ihotel.repositories"
import { hotelMock } from "../utils/factory/hotelMock"
import { REDIS_HOTEL_KEY } from "../utils/redisKey";

let service: CreateHotelsService;
let hotelRepository: IHotelRepository;
let redis: { del: jest.Mock }

const userIdMock = 1 

describe('CreateHotelsService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateHotelsService,
        {
          provide: REPOSITORY_TOKEN_HOTEL,
          useValue: {
            createHotel: jest.fn().mockResolvedValue(hotelMock),
          },
        },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: {
            del: jest.fn()
          },
        },
      ],
    }).compile();

    service = module.get<CreateHotelsService>(CreateHotelsService);
    hotelRepository = module.get<IHotelRepository>(REPOSITORY_TOKEN_HOTEL);
    redis = module.get('default_IORedisModuleConnectionToken');
  });

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should delete the redis key', async () => {
    const redisDelSpy = jest.spyOn(redis, 'del').mockResolvedValue(1);

    await service.execute(hotelMock, userIdMock)

    expect(redisDelSpy).toHaveBeenCalledWith(REDIS_HOTEL_KEY)
  })

  it('should create a hotel', async () => {
    // const createHotelSpy = jest
    //   .spyOn(hotelRepository, 'createHotel')
    //   .mockResolvedValue(createHotelMock);

    const result = await service.execute(hotelMock, userIdMock);

    expect(hotelRepository.createHotel).toHaveBeenCalledWith(
      hotelMock, 
      userIdMock
    )
    expect(result).toEqual(hotelMock)

  })
})