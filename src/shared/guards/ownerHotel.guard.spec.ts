import { Test, TestingModule } from "@nestjs/testing";
import { OwnerHotelGuard } from "./ownerHotel.guard";
import { AuthService } from "src/modules/auth/auth.service";
import { FindOneHotelsService } from "src/modules/hotels/services/findOneHotel.service";
import { ExecutionContext } from "@nestjs/common";
import { hotelMock } from "src/modules/hotels/utils/factory/hotelMock";

let guard: OwnerHotelGuard;
let hotelService: { execute: jest.Mock };

const createMockContext = (params: Record<string, any> = {}, user?: any): ExecutionContext => {
  const request = { params, user };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

describe('OwnerHotelGuard', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnerHotelGuard,
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: FindOneHotelsService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<OwnerHotelGuard>(OwnerHotelGuard);
    hotelService = module.get(FindOneHotelsService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return false when no user in request', async () => {
    const context = createMockContext({ id: '1' }, undefined);

    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should return false when hotel is not found', async () => {
    hotelService.execute.mockResolvedValue(null);
    const context = createMockContext({ id: '999' }, { id: 1 });

    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should return false when user is not the hotel owner', async () => {
    hotelService.execute.mockResolvedValue({ ...hotelMock, ownerId: 2 });
    const context = createMockContext({ id: '1' }, { id: 1 });

    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should return true when user is the hotel owner', async () => {
    hotelService.execute.mockResolvedValue({ ...hotelMock, ownerId: 1 });
    const context = createMockContext({ id: '1' }, { id: 1 });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
