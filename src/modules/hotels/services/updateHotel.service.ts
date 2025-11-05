import { Inject, Injectable } from '@nestjs/common';
import { UpdateHotelDto } from '../domain/dto/update-hotel.dto';
import { REPOSITORY_TOKEN_HOTEL } from '../utils/repositoriesTokens';
import type { IHotelRepository } from '../domain/repositories/Ihotel.repositories';

@Injectable()
export class UpdateHotelsService {
    constructor(
      @Inject(REPOSITORY_TOKEN_HOTEL)
      private readonly hotelRepositories: IHotelRepository,
    ) { }

  async execute(id: number, updateHotelDto: UpdateHotelDto) {
    return await this.hotelRepositories.updateHotel(id, updateHotelDto);
  }

}
