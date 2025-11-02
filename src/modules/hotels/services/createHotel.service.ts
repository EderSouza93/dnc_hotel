import { Inject, Injectable } from '@nestjs/common';
import { CreateHotelDto } from '../domain/dto/create-hotel.dto';
import type { IHotelRepository } from '../domain/repositories/Ihotel.repositories';
import { HOTEL_REPOSITORY_TOKEN } from '../utils/repositoriesTokens';

@Injectable()
export class CreateHotelsService {
  constructor(
    @Inject(HOTEL_REPOSITORY_TOKEN)
    private readonly hotelRepositories: IHotelRepository
  ) { }

  async execute(createHotelDto: CreateHotelDto) {
    return await this.hotelRepositories.createHotel(createHotelDto);
  }
}
