import { Inject, Injectable } from '@nestjs/common';
import { CreateReservationDto } from '../domain/dto/create-reservation.dto';
import { REPOSITORY_TOKEN_RESERVATION } from '../utils/repositoriesTokens';
import type { IReservationsRepository } from '../domain/repositories/reservatons.repository';


@Injectable()
export class CreateReservationsService {
  constructor(
    @Inject(REPOSITORY_TOKEN_RESERVATION)
    private readonly reservationsRepository: IReservationsRepository
  ) {}
  create(data: CreateReservationDto) {
    return 'This action adds a new reservation';
  }
}
