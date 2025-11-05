import { Injectable } from "@nestjs/common";
import { IReservationRepository } from "../domain/repositories/Ireservation.repository";
import { Reservation } from "@prisma/client";
import { CreateReservationDto } from "../domain/dto/create-reservation.dto";

@Injectable()
export class ReservationRepository implements IReservationRepository {
    create(data: CreateReservationDto): Promise<Reservation> {
        throw new Error("Method not implemented.");
    }

}