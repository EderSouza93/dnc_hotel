import { Test, TestingModule } from "@nestjs/testing";
import { FindByOwnerHotelsService } from "./findByOwnerHotel.service";
import { REPOSITORY_TOKEN_HOTEL } from "../utils/repositoriesTokens";
import { IHotelRepository } from "../domain/repositories/Ihotel.repositories";
import { hotelMock } from "../utils/factory/hotelMock";

let service: FindByOwnerHotelsService;
let hotelRepository: jest.Mocked<IHotelRepository>;

describe('FindByOwnerHotelsService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindByOwnerHotelsService,
        {
          provide: REPOSITORY_TOKEN_HOTEL,
          useValue: {
            findHotelByOwner: jest.fn().mockResolvedValue([hotelMock]),
          },
        },
      ],
    }).compile();

    service = module.get<FindByOwnerHotelsService>(FindByOwnerHotelsService);
    hotelRepository = module.get(REPOSITORY_TOKEN_HOTEL);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return hotels by owner id', async () => {
    const result = await service.execute(1);

    expect(hotelRepository.findHotelByOwner).toHaveBeenCalledWith(1);
    expect(result).toEqual([hotelMock]);
  });

  it('should return an empty array when owner has no hotels', async () => {
    hotelRepository.findHotelByOwner.mockResolvedValue([]);

    const result = await service.execute(999);

    expect(result).toEqual([]);
  });

  it('should propagate error if repository throws', async () => {
    hotelRepository.findHotelByOwner.mockRejectedValue(new Error('Database error'));

    await expect(service.execute(1)).rejects.toThrow('Database error');
  });
});
