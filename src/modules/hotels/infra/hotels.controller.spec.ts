import { Test, TestingModule } from "@nestjs/testing";
import { HotelsController } from "./hotels.controller";
import { CreateHotelsService } from "../services/createHotel.service";
import { FindOneHotelsService } from "../services/findOneHotel.service";
import { FindAllHotelsService } from "../services/findAllHotel.service";
import { RemoveHotelsService } from "../services/removeHotel.service";
import { UpdateHotelsService } from "../services/updateHotel.service";
import { FindByOwnerHotelsService } from "../services/findByOwnerHotel.service";
import { FindByNameHotelsService } from "../services/findByNameHotel.service";
import { UploadImageHotelsService } from "../services/uploadImageHotel.service";
import { hotelMock } from "../utils/factory/hotelMock";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { RoleGuard } from "src/shared/guards/role.guard";
import { OwnerHotelGuard } from "src/shared/guards/ownerHotel.guard";

let controller: HotelsController;
let createService: { execute: jest.Mock };
let findOneService: { execute: jest.Mock };
let findAllService: { execute: jest.Mock };
let removeService: { execute: jest.Mock };
let updateService: { execute: jest.Mock };
let findByOwnerService: { execute: jest.Mock };
let findByNameService: { execute: jest.Mock };
let uploadImageService: { execute: jest.Mock };

const paginatedResult = {
  total: 1,
  page: 1,
  per_page: 10,
  data: [hotelMock],
};

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('HotelsController', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelsController],
      providers: [
        { provide: CreateHotelsService, useValue: { execute: jest.fn().mockResolvedValue(hotelMock) } },
        { provide: FindOneHotelsService, useValue: { execute: jest.fn().mockResolvedValue(hotelMock) } },
        { provide: FindAllHotelsService, useValue: { execute: jest.fn().mockResolvedValue(paginatedResult) } },
        { provide: RemoveHotelsService, useValue: { execute: jest.fn().mockResolvedValue(hotelMock) } },
        { provide: UpdateHotelsService, useValue: { execute: jest.fn().mockResolvedValue({ ...hotelMock, name: 'Updated' }) } },
        { provide: FindByOwnerHotelsService, useValue: { execute: jest.fn().mockResolvedValue([hotelMock]) } },
        { provide: FindByNameHotelsService, useValue: { execute: jest.fn().mockResolvedValue([hotelMock]) } },
        { provide: UploadImageHotelsService, useValue: { execute: jest.fn().mockResolvedValue({ ...hotelMock, image: 'new.jpg' }) } },
      ],
    })
      .overrideGuard(AuthGuard).useValue(mockGuard)
      .overrideGuard(RoleGuard).useValue(mockGuard)
      .overrideGuard(OwnerHotelGuard).useValue(mockGuard)
      .compile();

    controller = module.get<HotelsController>(HotelsController);
    createService = module.get(CreateHotelsService);
    findOneService = module.get(FindOneHotelsService);
    findAllService = module.get(FindAllHotelsService);
    removeService = module.get(RemoveHotelsService);
    updateService = module.get(UpdateHotelsService);
    findByOwnerService = module.get(FindByOwnerHotelsService);
    findByNameService = module.get(FindByNameHotelsService);
    uploadImageService = module.get(UploadImageHotelsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a hotel', async () => {
      const dto = { name: 'Hotel', description: 'Desc', price: 100, address: 'Addr', ownerId: 1 };

      const result = await controller.create(1, dto);

      expect(createService.execute).toHaveBeenCalledWith(dto, 1);
      expect(result).toEqual(hotelMock);
    });
  });

  describe('findAll', () => {
    it('should return paginated hotels', async () => {
      const result = await controller.findAll('1', '10');

      expect(findAllService.execute).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOwner', () => {
    it('should return hotels by owner', async () => {
      const result = await controller.findOwner(1);

      expect(findByOwnerService.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual([hotelMock]);
    });
  });

  describe('findName', () => {
    it('should return hotels by name', async () => {
      const result = await controller.findName('Test');

      expect(findByNameService.execute).toHaveBeenCalledWith('Test');
      expect(result).toEqual([hotelMock]);
    });
  });

  describe('findOne', () => {
    it('should return a single hotel', async () => {
      const result = await controller.findOne(1);

      expect(findOneService.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(hotelMock);
    });
  });

  describe('uploadImage', () => {
    it('should upload a hotel image', async () => {
      const mockFile = { filename: 'new.jpg' } as Express.Multer.File;

      const result = await controller.uploadImage('1', mockFile);

      expect(uploadImageService.execute).toHaveBeenCalledWith('1', 'new.jpg');
      expect(result.image).toBe('new.jpg');
    });
  });

  describe('update', () => {
    it('should update a hotel', async () => {
      const dto = { name: 'Updated' };

      const result = await controller.update(1, dto);

      expect(updateService.execute).toHaveBeenCalledWith(1, dto);
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should remove a hotel', async () => {
      const result = await controller.remove(1);

      expect(removeService.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(hotelMock);
    });
  });
});
