import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKEN_HOTEL } from '../utils/repositoriesTokens';
import type { IHotelRepository } from '../domain/repositories/Ihotel.repositories';

@Injectable()
export class FindOneHotelsService {
  constructor(
    @Inject(REPOSITORY_TOKEN_HOTEL)
    private readonly hotelRepository: IHotelRepository
  ) { }

  async execute(id: number) {
    const hotel = await this.hotelRepository.findHotelById(id);
    if (hotel && hotel.image) {
      hotel.image = `${process.env.APP_API_URL}/hotel-image/${hotel.image}`
    }
    return hotel;

  }
}
