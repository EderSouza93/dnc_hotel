import { Test, TestingModule } from "@nestjs/testing";
import { FindOneHotelsService } from "./findOneHotel.service";
import { REPOSITORY_TOKEN_HOTEL } from "../utils/repositoriesTokens";
import { IHotelRepository } from "../domain/repositories/Ihotel.repositories";
import { hotelMock } from "../utils/factory/hotelMock";

let service: FindOneHotelsService;
let hotelRepository: jest.Mocked<IHotelRepository>;

describe('FindOneHotelsService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneHotelsService,
        {
          provide: REPOSITORY_TOKEN_HOTEL,
          useValue: {
            findHotelById: jest.fn().mockResolvedValue({ ...hotelMock }),
          },
        },
      ],
    }).compile();

    service = module.get<FindOneHotelsService>(FindOneHotelsService);
    hotelRepository = module.get(REPOSITORY_TOKEN_HOTEL);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a hotel by id', async () => {
    const result = await service.execute(1);

    expect(hotelRepository.findHotelById).toHaveBeenCalledWith(1);
    expect(result).toBeDefined();
    expect(result.name).toBe(hotelMock.name);
  });

  it('should format hotel image URL when image exists', async () => {
    process.env.APP_API_URL = 'http://localhost:3000';

    const result = await service.execute(1);

    expect(result.image).toBe('http://localhost:3000/hotel-image/test-image.jpg');
  });

  it('should return null when hotel is not found', async () => {
    hotelRepository.findHotelById.mockResolvedValue(null);

    const result = await service.execute(999);

    expect(result).toBeNull();
  });

  it('should not format image URL when hotel has no image', async () => {
    hotelRepository.findHotelById.mockResolvedValue({ ...hotelMock, image: null });

    const result = await service.execute(1);

    expect(result.image).toBeNull();
  });
});
