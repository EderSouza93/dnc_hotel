import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKEN_HOTEL } from '../utils/repositoriesTokens';
import type { IHotelRepository } from '../domain/repositories/Ihotel.repositories';
import Redis from 'ioredis/built/Redis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { REDIS_HOTEL_KEY } from '../utils/redisKey';
import { Hotel } from '@prisma/client';


@Injectable()
export class FindAllHotelsService {
  constructor(
    @Inject(REPOSITORY_TOKEN_HOTEL)
    private readonly hotelRepositories: IHotelRepository,
    @InjectRedis() private readonly redis: Redis
  ) { }

  async execute(page: number = 1, limit: number = 10) {
    const offSet = (page - 1) * limit

    const dataRedis = await this.redis.get(REDIS_HOTEL_KEY)

    let data = JSON.parse(dataRedis || 'null')

    if (!data) {
      data = await this.hotelRepositories.findHotels(offSet, limit);
      data = data.map((hotel: Hotel) => {
        if (hotel.image) {
          hotel.image = `${process.env.APP_API_URL}/hotel-image/${hotel.image}`;
        }
        return hotel;
      })
      await this.redis.set(REDIS_HOTEL_KEY, JSON.stringify(data))
    }
    const total = await this.hotelRepositories.countHotels();
    return {
      total,
      page,
      per_page: limit,
      data,
    }
  }
}
