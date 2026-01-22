import { Injectable } from "@nestjs/common";
import { IReservationsRepository } from "../domain/repositories/reservatons.repository";
import { CreateReservationDto } from "../domain/dto/create-reservation.dto";
import { Reservation } from "@prisma/client";

@Injectable()
export class ReservationsRepository implements IReservationsRepository {
    create(data: CreateReservationDto): Promise<Reservation> {
        throw new Error("Method not implemented.");
    }
}