import { Test, TestingModule } from "@nestjs/testing";
import { UpdateStatusReservationsService } from "./updateStatusReservations.service";
import { REPOSITORY_TOKEN_RESERVATION } from "../utils/repositoriesTokens";
import { IReservationRepository } from "../domain/repositories/Ireservation.repository";
import { reservationMock } from "../utils/factory/reservationMock";
import { ReservationStatus } from "@prisma/client";

let service: UpdateStatusReservationsService;
let reservationRepository: jest.Mocked<IReservationRepository>;

const approvedReservation = { ...reservationMock, status: ReservationStatus.APPROVED };

describe('UpdateStatusReservationsService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateStatusReservationsService,
        {
          provide: REPOSITORY_TOKEN_RESERVATION,
          useValue: {
            updateStatus: jest.fn().mockResolvedValue(approvedReservation),
          },
        },
      ],
    }).compile();

    service = module.get<UpdateStatusReservationsService>(UpdateStatusReservationsService);
    reservationRepository = module.get(REPOSITORY_TOKEN_RESERVATION);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update reservation status', async () => {
    const result = await service.execute(1, ReservationStatus.APPROVED);

    expect(reservationRepository.updateStatus).toHaveBeenCalledWith(1, ReservationStatus.APPROVED);
    expect(result.status).toBe(ReservationStatus.APPROVED);
  });

  it('should propagate error if repository throws', async () => {
    reservationRepository.updateStatus.mockRejectedValue(new Error('Database error'));

    await expect(
      service.execute(999, ReservationStatus.CANCELLED),
    ).rejects.toThrow('Database error');
  });
});
