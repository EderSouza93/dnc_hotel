import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKEN_HOTEL } from '../utils/repositoriesTokens';
import type { IHotelRepository } from '../domain/repositories/Ihotel.repositories';
import { join, resolve } from 'path';
import { stat, unlink } from 'fs/promises';
import Redis from 'ioredis/built/Redis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { REDIS_HOTEL_KEY } from '../utils/redisKey';

@Injectable()
export class UploadImageHotelsService {
    constructor(
      @Inject(REPOSITORY_TOKEN_HOTEL)
      private readonly hotelRepositories: IHotelRepository,
      @InjectRedis() private readonly redis: Redis
    ) { }

  async execute(id: string, imageFileName: string) {
    const hotel = await this.hotelRepositories.findHotelById(Number(id));
    const directory = resolve(__dirname, '..','..','..','..','uploads-hotel');

    if (!hotel) {
      throw new NotFoundException('Hotel not found.');
    }

    if (hotel.image) {
      const imageHotelFilePath = join(directory, hotel.image);
      const imageHotelFileExists = await stat(imageHotelFilePath);

      if (imageHotelFileExists) {
        await unlink(imageHotelFilePath);
      }
    }
    await this.redis.del(REDIS_HOTEL_KEY)
    return await this.hotelRepositories.updateHotel(Number(id), {
      image: imageFileName,
    });
  }

}
