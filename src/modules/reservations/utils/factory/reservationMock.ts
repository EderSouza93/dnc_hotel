import { Reservation, ReservationStatus } from "@prisma/client";

export const reservationMock: Reservation = {
  id: 1,
  hotelId: 1,
  userId: 1,
  checkIn: new Date('2026-03-01'),
  checkOut: new Date('2026-03-05'),
  total: 400,
  status: ReservationStatus.PENDING,
  createdAt: new Date(),
  updatedAt: new Date(),
}
