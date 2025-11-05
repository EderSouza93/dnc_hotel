import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKEN_HOTEL } from '../utils/repositoriesTokens';
import type { IHotelRepository } from '../domain/repositories/Ihotel.repositories';

@Injectable()
export class FindByOwnerHotelsService {
  constructor(
    @Inject(REPOSITORY_TOKEN_HOTEL)
    private readonly hotelRepository: IHotelRepository
  ) {}

  async execute(ownerId: number) {
    return await this.hotelRepository.findHotelByOwner(ownerId);
  }
}
