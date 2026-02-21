import { Test, TestingModule } from "@nestjs/testing";
import { FindByUserReservationsService } from "./findByUserReservations.service";
import { REPOSITORY_TOKEN_RESERVATION } from "../utils/repositoriesTokens";
import { IReservationRepository } from "../domain/repositories/Ireservation.repository";
import { reservationMock } from "../utils/factory/reservationMock";

let service: FindByUserReservationsService;
let reservationRepository: jest.Mocked<IReservationRepository>;

describe('FindByUserReservationsService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindByUserReservationsService,
        {
          provide: REPOSITORY_TOKEN_RESERVATION,
          useValue: {
            findByUser: jest.fn().mockResolvedValue([reservationMock]),
          },
        },
      ],
    }).compile();

    service = module.get<FindByUserReservationsService>(FindByUserReservationsService);
    reservationRepository = module.get(REPOSITORY_TOKEN_RESERVATION);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return reservations by user id', async () => {
    const result = await service.execute(1);

    expect(reservationRepository.findByUser).toHaveBeenCalledWith(1);
    expect(result).toEqual([reservationMock]);
  });

  it('should return an empty array when user has no reservations', async () => {
    reservationRepository.findByUser.mockResolvedValue([]);

    const result = await service.execute(999);

    expect(result).toEqual([]);
  });
});
