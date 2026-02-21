import { Test, TestingModule } from "@nestjs/testing";
import { ReservationRepository } from "./reservations.repository";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { reservationMock } from "../utils/factory/reservationMock";
import { ReservationStatus } from "@prisma/client";

let repository: ReservationRepository;
let prisma: any;

describe('ReservationRepository', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationRepository,
        {
          provide: PrismaService,
          useValue: {
            reservation: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<ReservationRepository>(ReservationRepository);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      prisma.reservation.create.mockResolvedValue(reservationMock);

      const result = await repository.create(reservationMock);
      expect(prisma.reservation.create).toHaveBeenCalledWith({ data: reservationMock });
      expect(result).toEqual(reservationMock);
    });
  });

  describe('findById', () => {
    it('should return a reservation by id', async () => {
      prisma.reservation.findUnique.mockResolvedValue(reservationMock);

      const result = await repository.findById(1);
      expect(prisma.reservation.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(reservationMock);
    });

    it('should return null when not found', async () => {
      prisma.reservation.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all reservations', async () => {
      prisma.reservation.findMany.mockResolvedValue([reservationMock]);

      const result = await repository.findAll();
      expect(result).toEqual([reservationMock]);
    });
  });

  describe('findByUser', () => {
    it('should return reservations by user id', async () => {
      prisma.reservation.findMany.mockResolvedValue([reservationMock]);

      const result = await repository.findByUser(1);
      expect(prisma.reservation.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toEqual([reservationMock]);
    });
  });

  describe('updateStatus', () => {
    it('should update reservation status', async () => {
      const updated = { ...reservationMock, status: ReservationStatus.APPROVED };
      prisma.reservation.update.mockResolvedValue(updated);

      const result = await repository.updateStatus(1, ReservationStatus.APPROVED);
      expect(prisma.reservation.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: ReservationStatus.APPROVED },
      });
      expect(result.status).toBe(ReservationStatus.APPROVED);
    });
  });
});
