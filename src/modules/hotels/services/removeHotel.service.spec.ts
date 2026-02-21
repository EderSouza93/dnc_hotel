import { Test, TestingModule } from "@nestjs/testing";
import { RemoveHotelsService } from "./removeHotel.service";
import { REPOSITORY_TOKEN_HOTEL } from "../utils/repositoriesTokens";
import { IHotelRepository } from "../domain/repositories/Ihotel.repositories";
import { hotelMock } from "../utils/factory/hotelMock";
import { REDIS_HOTEL_KEY } from "../utils/redisKey";

let service: RemoveHotelsService;
let hotelRepository: IHotelRepository;
let redis: { del: jest.Mock };

describe('RemoveHotelsService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveHotelsService,
        {
          provide: REPOSITORY_TOKEN_HOTEL,
          useValue: {
            deleteHotel: jest.fn().mockResolvedValue(hotelMock),
          },
        },
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: {
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RemoveHotelsService>(RemoveHotelsService);
    hotelRepository = module.get<IHotelRepository>(REPOSITORY_TOKEN_HOTEL);
    redis = module.get('default_IORedisModuleConnectionToken');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete the redis key before removing', async () => {
    const redisDelSpy = jest.spyOn(redis, 'del').mockResolvedValue(1);

    await service.execute(1);

    expect(redisDelSpy).toHaveBeenCalledWith(REDIS_HOTEL_KEY);
  });

  it('should remove a hotel', async () => {
    const result = await service.execute(1);

    expect(hotelRepository.deleteHotel).toHaveBeenCalledWith(1);
    expect(result).toEqual(hotelMock);
  });
});
