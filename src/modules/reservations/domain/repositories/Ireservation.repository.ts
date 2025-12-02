import { Reservation, ReservationStatus } from "@prisma/client";

export interface IReservationRepository {
    create(data: any): Promise<Reservation>;
    findById(id: number): Promise<Reservation | null>;
    findAll(): Promise<Reservation[]>;
    findByUser(userId: number): Promise<Reservation[]>;
    updateStatus(id: number, status: ReservationStatus): Promise<Reservation>
}