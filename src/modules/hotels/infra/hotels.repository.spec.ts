import { Test, TestingModule } from "@nestjs/testing";
import { HotelsRepositories } from "./hotels.repository";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { hotelMock } from "../utils/factory/hotelMock";

let repository: HotelsRepositories;
let prisma: any;

describe('HotelsRepositories', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotelsRepositories,
        {
          provide: PrismaService,
          useValue: {
            hotel: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<HotelsRepositories>(HotelsRepositories);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createHotel', () => {
    it('should create a hotel with ownerId', async () => {
      prisma.hotel.create.mockResolvedValue(hotelMock);

      const dto = { name: 'Hotel', description: 'Desc', price: 100, address: 'Addr', ownerId: undefined as any };
      const result = await repository.createHotel(dto, 1);

      expect(dto.ownerId).toBe(1);
      expect(prisma.hotel.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(hotelMock);
    });
  });

  describe('findHotelById', () => {
    it('should find a hotel by id', async () => {
      prisma.hotel.findUnique.mockResolvedValue(hotelMock);

      const result = await repository.findHotelById(1);
      expect(prisma.hotel.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(hotelMock);
    });

    it('should return null when hotel not found', async () => {
      prisma.hotel.findUnique.mockResolvedValue(null);

      const result = await repository.findHotelById(999);
      expect(result).toBeNull();
    });
  });

  describe('findHotelByName', () => {
    it('should find hotels by name (case insensitive)', async () => {
      prisma.hotel.findMany.mockResolvedValue([hotelMock]);

      const result = await repository.findHotelByName('test');
      expect(prisma.hotel.findMany).toHaveBeenCalledWith({
        where: { name: { contains: 'test', mode: 'insensitive' } },
      });
      expect(result).toEqual([hotelMock]);
    });
  });

  describe('findHotels', () => {
    it('should return paginated hotels', async () => {
      prisma.hotel.findMany.mockResolvedValue([hotelMock]);

      const result = await repository.findHotels(0, 10);
      expect(prisma.hotel.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        include: { owner: true },
      });
      expect(result).toEqual([hotelMock]);
    });
  });

  describe('countHotels', () => {
    it('should return the total count of hotels', async () => {
      prisma.hotel.count.mockResolvedValue(5);

      const result = await repository.countHotels();
      expect(result).toBe(5);
    });
  });

  describe('findHotelByOwner', () => {
    it('should return hotels by owner id', async () => {
      prisma.hotel.findMany.mockResolvedValue([hotelMock]);

      const result = await repository.findHotelByOwner(1);
      expect(prisma.hotel.findMany).toHaveBeenCalledWith({ where: { ownerId: 1 } });
      expect(result).toEqual([hotelMock]);
    });
  });

  describe('updateHotel', () => {
    it('should update a hotel', async () => {
      const updated = { ...hotelMock, name: 'Updated' };
      prisma.hotel.update.mockResolvedValue(updated);

      const result = await repository.updateHotel(1, { name: 'Updated' });
      expect(prisma.hotel.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { name: 'Updated' } });
      expect(result.name).toBe('Updated');
    });
  });

  describe('deleteHotel', () => {
    it('should delete a hotel', async () => {
      prisma.hotel.delete.mockResolvedValue(hotelMock);

      const result = await repository.deleteHotel(1);
      expect(prisma.hotel.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(hotelMock);
    });
  });
});
