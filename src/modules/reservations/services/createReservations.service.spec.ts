import { Test, TestingModule } from "@nestjs/testing";
import { CreateReservationsService } from "./createReservations.service";
import { REPOSITORY_TOKEN_RESERVATION } from "../utils/repositoriesTokens";
import { REPOSITORY_TOKEN_HOTEL } from "../../hotels/utils/repositoriesTokens";
import { IReservationRepository } from "../domain/repositories/Ireservation.repository";
import { IHotelRepository } from "../../hotels/domain/repositories/Ihotel.repositories";
import { reservationMock } from "../utils/factory/reservationMock";
import { hotelMock } from "../../hotels/utils/factory/hotelMock";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ReservationStatus } from "@prisma/client";

let service: CreateReservationsService;
let reservationRepository: jest.Mocked<IReservationRepository>;
let hotelRepository: jest.Mocked<IHotelRepository>;

describe('CreateReservationsService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReservationsService,
        {
          provide: REPOSITORY_TOKEN_RESERVATION,
          useValue: {
            create: jest.fn().mockResolvedValue(reservationMock),
          },
        },
        {
          provide: REPOSITORY_TOKEN_HOTEL,
          useValue: {
            findHotelById: jest.fn().mockResolvedValue(hotelMock),
          },
        },
      ],
    }).compile();

    service = module.get<CreateReservationsService>(CreateReservationsService);
    reservationRepository = module.get(REPOSITORY_TOKEN_RESERVATION);
    hotelRepository = module.get(REPOSITORY_TOKEN_HOTEL);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a reservation successfully', async () => {
    const createDto = {
      hotelId: 1,
      checkIn: '2026-03-01',
      checkOut: '2026-03-05',
      status: ReservationStatus.PENDING,
    };

    const result = await service.create(1, createDto);

    expect(hotelRepository.findHotelById).toHaveBeenCalledWith(1);
    expect(reservationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        hotelId: 1,
        userId: 1,
        status: ReservationStatus.PENDING,
      }),
    );
    expect(result).toEqual(reservationMock);
  });

  it('should throw BadRequestException when checkIn >= checkOut', async () => {
    const createDto = {
      hotelId: 1,
      checkIn: '2026-03-05',
      checkOut: '2026-03-01',
      status: ReservationStatus.PENDING,
    };

    await expect(service.create(1, createDto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when checkIn equals checkOut', async () => {
    const createDto = {
      hotelId: 1,
      checkIn: '2026-03-01',
      checkOut: '2026-03-01',
      status: ReservationStatus.PENDING,
    };

    await expect(service.create(1, createDto)).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when hotel is not found', async () => {
    hotelRepository.findHotelById.mockResolvedValue(null);

    const createDto = {
      hotelId: 999,
      checkIn: '2026-03-01',
      checkOut: '2026-03-05',
      status: ReservationStatus.PENDING,
    };

    await expect(service.create(1, createDto)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when hotel price is invalid', async () => {
    hotelRepository.findHotelById.mockResolvedValue({ ...hotelMock, price: 0 });

    const createDto = {
      hotelId: 1,
      checkIn: '2026-03-01',
      checkOut: '2026-03-05',
      status: ReservationStatus.PENDING,
    };

    await expect(service.create(1, createDto)).rejects.toThrow(BadRequestException);
  });
});
