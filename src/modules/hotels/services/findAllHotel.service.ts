import { Inject, Injectable } from '@nestjs/common';
import { HOTEL_REPOSITORY_TOKEN } from '../utils/repositoriesTokens';
import type { IHotelRepository } from '../domain/repositories/Ihotel.repositories';


@Injectable()
export class FindAllHotelsService {
  constructor(
    @Inject(HOTEL_REPOSITORY_TOKEN)
    private readonly hotelRepositories: IHotelRepository,
  ) { }
  
  async execute() {
    return await this.hotelRepositories.findHotels();
  }
}
