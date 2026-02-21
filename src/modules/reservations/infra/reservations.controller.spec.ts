import { Test, TestingModule } from "@nestjs/testing";
import { ReservationsController } from "./reservations.controller";
import { CreateReservationsService } from "../services/createReservations.service";
import { FindAllReservationsService } from "../services/findAllReservations.service";
import { FindByIdReservationsService } from "../services/findByIdReservations.service";
import { UpdateStatusReservationsService } from "../services/updateStatusReservations.service";
import { reservationMock } from "../utils/factory/reservationMock";
import { ReservationStatus } from "@prisma/client";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { RoleGuard } from "src/shared/guards/role.guard";

let controller: ReservationsController;
let createService: { create: jest.Mock };
let findAllService: { execute: jest.Mock };
let findByIdService: { execute: jest.Mock };
let updateStatusService: { execute: jest.Mock };

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('ReservationsController', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        { provide: CreateReservationsService, useValue: { create: jest.fn().mockResolvedValue(reservationMock) } },
        { provide: FindAllReservationsService, useValue: { execute: jest.fn().mockResolvedValue([reservationMock]) } },
        { provide: FindByIdReservationsService, useValue: { execute: jest.fn().mockResolvedValue(reservationMock) } },
        { provide: UpdateStatusReservationsService, useValue: { execute: jest.fn().mockResolvedValue({ ...reservationMock, status: ReservationStatus.APPROVED }) } },
      ],
    })
      .overrideGuard(AuthGuard).useValue(mockGuard)
      .overrideGuard(RoleGuard).useValue(mockGuard)
      .compile();

    controller = module.get<ReservationsController>(ReservationsController);
    createService = module.get(CreateReservationsService);
    findAllService = module.get(FindAllReservationsService);
    findByIdService = module.get(FindByIdReservationsService);
    updateStatusService = module.get(UpdateStatusReservationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a reservation', async () => {
      const dto = {
        hotelId: 1,
        checkIn: '2026-03-01',
        checkOut: '2026-03-05',
        status: ReservationStatus.PENDING,
      };

      const result = await controller.create(1, dto);

      expect(createService.create).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(reservationMock);
    });
  });

  describe('findAll', () => {
    it('should return all reservations', async () => {
      const result = await controller.findAll();

      expect(findAllService.execute).toHaveBeenCalled();
      expect(result).toEqual([reservationMock]);
    });
  });

  describe('findbyUser', () => {
    it('should return reservations by user', async () => {
      const result = await controller.findbyUser(1);

      expect(findByIdService.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(reservationMock);
    });
  });

  describe('findOne', () => {
    it('should return a reservation by id', async () => {
      const result = await controller.findOne(1);

      expect(findByIdService.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(reservationMock);
    });
  });

  describe('updateStatus', () => {
    it('should update reservation status', async () => {
      const result = await controller.updateStatus(1, ReservationStatus.APPROVED);

      expect(updateStatusService.execute).toHaveBeenCalledWith(1, ReservationStatus.APPROVED);
      expect(result.status).toBe(ReservationStatus.APPROVED);
    });
  });
});
