import { Test, TestingModule } from "@nestjs/testing";
import { FindByIdReservationsService } from "./findByIdReservations.service";
import { REPOSITORY_TOKEN_RESERVATION } from "../utils/repositoriesTokens";
import { IReservationRepository } from "../domain/repositories/Ireservation.repository";
import { reservationMock } from "../utils/factory/reservationMock";

let service: FindByIdReservationsService;
let reservationRepository: jest.Mocked<IReservationRepository>;

describe('FindByIdReservationsService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindByIdReservationsService,
        {
          provide: REPOSITORY_TOKEN_RESERVATION,
          useValue: {
            findById: jest.fn().mockResolvedValue(reservationMock),
          },
        },
      ],
    }).compile();

    service = module.get<FindByIdReservationsService>(FindByIdReservationsService);
    reservationRepository = module.get(REPOSITORY_TOKEN_RESERVATION);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a reservation by id', async () => {
    const result = await service.execute(1);

    expect(reservationRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(reservationMock);
  });

  it('should return null when reservation is not found', async () => {
    reservationRepository.findById.mockResolvedValue(null);

    const result = await service.execute(999);

    expect(result).toBeNull();
  });
});
