import { Injectable } from '@nestjs/common';
import { CreateReservationDto } from '../domain/dto/create-reservation.dto';

@Injectable()
export class CreateReservationsService {
  create(data: CreateReservationDto) {
    return 'This action adds a new reservation';
  }
}
