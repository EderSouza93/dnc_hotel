import { Test, TestingModule } from '@nestjs/testing';
import { FindByNameHotelsService } from './findByNameHotel.service';
import { IHotelRepository } from '../domain/repositories/Ihotel.repositories';
import { REPOSITORY_TOKEN_HOTEL } from '../utils/repositoriesTokens';
import { hotelMock } from '../utils/factory/hotelMock';


describe('FindByNameHotelsService', () => {
  let service: FindByNameHotelsService;
  let hotelRepository: jest.Mocked<IHotelRepository>;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindByNameHotelsService,
        {
          provide: REPOSITORY_TOKEN_HOTEL,
          useValue: {
            findHotelByName: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FindByNameHotelsService>(FindByNameHotelsService);
    hotelRepository = module.get(REPOSITORY_TOKEN_HOTEL);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should call the repository with the exact term and return the hotels found.', async () => {
      const searchTerm = 'Test';

      hotelRepository.findHotelByName.mockResolvedValue([hotelMock, { ...hotelMock, id: 2, name: 'Another Beach Hotel' }]);

      const result = await service.execute(searchTerm);

      expect(hotelRepository.findHotelByName).toHaveBeenCalledTimes(1);
      expect(hotelRepository.findHotelByName).toHaveBeenCalledWith('Test');
      expect(result?.length).toBe(2);
    });

    it('should return an empty array when nothing is found', async () => {
      hotelRepository.findHotelByName.mockResolvedValue([]);

      const result = await service.execute('non-existentword');

      expect(result).toEqual([]);
      expect(hotelRepository.findHotelByName).toHaveBeenCalledWith('non-existentword');
    });

    it('should return null when the repository returns null', async () => {
      hotelRepository.findHotelByName.mockResolvedValue(null);

      const result = await service.execute('something');

      expect(result).toBeNull();
      expect(hotelRepository.findHotelByName).toHaveBeenCalledWith('something');
    });

    it('should accept the empty term and pass it on to the repository', async () => {
      hotelRepository.findHotelByName.mockResolvedValue([]);

      await service.execute('');

      expect(hotelRepository.findHotelByName).toHaveBeenCalledWith('');
    });

    it('should propagate an error if the repository throws an exception', async () => {
      const erroFake = new Error('Connection to database failed');
      hotelRepository.findHotelByName.mockRejectedValue(erroFake);

      await expect(service.execute('iracema')).rejects.toThrow('Connection to database failed');
    });
  });
});