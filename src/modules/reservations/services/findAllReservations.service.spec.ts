import { Test, TestingModule } from "@nestjs/testing";
import { FindAllReservationsService } from "./findAllReservations.service";
import { REPOSITORY_TOKEN_RESERVATION } from "../utils/repositoriesTokens";
import { IReservationRepository } from "../domain/repositories/Ireservation.repository";
import { reservationMock } from "../utils/factory/reservationMock";

let service: FindAllReservationsService;
let reservationRepository: jest.Mocked<IReservationRepository>;

describe('FindAllReservationsService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllReservationsService,
        {
          provide: REPOSITORY_TOKEN_RESERVATION,
          useValue: {
            findAll: jest.fn().mockResolvedValue([reservationMock]),
          },
        },
      ],
    }).compile();

    service = module.get<FindAllReservationsService>(FindAllReservationsService);
    reservationRepository = module.get(REPOSITORY_TOKEN_RESERVATION);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all reservations', async () => {
    const result = await service.execute();

    expect(reservationRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual([reservationMock]);
  });

  it('should return an empty array when no reservations exist', async () => {
    reservationRepository.findAll.mockResolvedValue([]);

    const result = await service.execute();

    expect(result).toEqual([]);
  });
});
