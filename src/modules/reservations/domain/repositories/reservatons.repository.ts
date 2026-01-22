import { Reservation } from "@prisma/client";
import { CreateReservationDto } from "../dto/create-reservation.dto";

export interface IReservationsRepository {
    create(data: CreateReservationDto): Promise<Reservation>;
}