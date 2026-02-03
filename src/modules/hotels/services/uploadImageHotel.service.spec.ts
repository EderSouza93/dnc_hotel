import { Test, TestingModule } from '@nestjs/testing';
import { IHotelRepository } from '../domain/repositories/Ihotel.repositories';
import { UploadImageHotelsService } from './uploadImageHotel.service';
import { REPOSITORY_TOKEN_HOTEL } from '../utils/repositoriesTokens';
import { NotFoundException } from '@nestjs/common';
import { stat, unlink } from 'fs/promises';
import { join, resolve } from 'path';
import { REDIS_HOTEL_KEY } from '../utils/redisKey';
import { hotelMock } from '../utils/factory/hotelMock';

let service: UploadImageHotelsService;
let hotelRepository: IHotelRepository;
let redis: { del: jest.Mock };

const imageHotel = {
  id: '1',
  imageFileName: 'image.jpg'
}

const updateImageHotel = {
  id: '1',
  newImageFileName: 'new-image.jpg'
}
jest.mock('fs/promises', () => ({
  stat: jest.fn(),
  unlink: jest.fn(),
}));

describe('UploadImageHotelService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadImageHotelsService,
        {
          provide: REPOSITORY_TOKEN_HOTEL,
          useValue: {
            findHotelById: jest.fn().mockResolvedValue(hotelMock),
            updateHotel: jest.fn().mockResolvedValue(hotelMock),
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

    service = module.get<UploadImageHotelsService>(UploadImageHotelsService);
    hotelRepository = module.get<IHotelRepository>(REPOSITORY_TOKEN_HOTEL);
    redis = module.get('default_IORedisModuleConnectionToken');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException if hotel does not exist', async () => {
    (hotelRepository.findHotelById as jest.Mock).mockResolvedValue(null);

    const result = service.execute(imageHotel.id, imageHotel.imageFileName);

    await expect(result).rejects.toThrow(NotFoundException);
  });

  it('should delete existing image if it exists', async () => {
    (stat as jest.Mock).mockResolvedValue(true);

    await service.execute(imageHotel.id, imageHotel.imageFileName);

    const directory = resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'uploads-hotel',
    );

    const imageHotelFilePath = join(directory, hotelMock.image);

    expect(stat).toHaveBeenCalledWith(imageHotelFilePath);
    expect(unlink).toHaveBeenCalledWith(imageHotelFilePath);
  });

  it('should not throw if existing image does not exist', async () => {
    (stat as jest.Mock).mockResolvedValue(null);

    await expect(service.execute(updateImageHotel.id, updateImageHotel.newImageFileName)).resolves.not.toThrow();
  });

  it('should update the hotel with the new image', async () => {
    (stat as jest.Mock).mockResolvedValue(true);

    await service.execute(updateImageHotel.id, updateImageHotel.newImageFileName);

    expect(hotelRepository.updateHotel).toHaveBeenCalledWith(1, {
      image: updateImageHotel.newImageFileName,
    });
  });

  it('should delete the Redis cache key', async () => {
    await service.execute(updateImageHotel.id, updateImageHotel.newImageFileName);
    expect(redis.del).toHaveBeenCalledWith(REDIS_HOTEL_KEY);
  });
});