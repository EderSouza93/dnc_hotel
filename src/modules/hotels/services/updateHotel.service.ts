import { Inject, Injectable } from '@nestjs/common';
import { UpdateHotelDto } from '../domain/dto/update-hotel.dto';
import { REPOSITORY_TOKEN_HOTEL } from '../utils/repositoriesTokens';
import type { IHotelRepository } from '../domain/repositories/Ihotel.repositories';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { REDIS_HOTEL_KEY } from '../utils/redisKey';

@Injectable()
export class UpdateHotelsService {
    constructor(
      @Inject(REPOSITORY_TOKEN_HOTEL)
      private readonly hotelRepositories: IHotelRepository,
      @InjectRedis() private readonly redis: Redis
    ) { }

  async execute(id: number, updateHotelDto: UpdateHotelDto) {
    await this.redis.del(REDIS_HOTEL_KEY)
    return await this.hotelRepositories.updateHotel(id, updateHotelDto);
  }

}
