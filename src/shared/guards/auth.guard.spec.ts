import { Test, TestingModule } from "@nestjs/testing";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "src/modules/auth/auth.service";
import { ShowUserService } from "src/modules/users/services/showUser.service";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { userMock } from "src/modules/users/utils/factory/userMock";

let guard: AuthGuard;
let authService: { validateToken: jest.Mock };
let showUserService: { execute: jest.Mock };

const createMockContext = (headers: Record<string, string> = {}): ExecutionContext => {
  const request = { headers, user: undefined };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

describe('AuthGuard', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: {
            validateToken: jest.fn(),
          },
        },
        {
          provide: ShowUserService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    authService = module.get(AuthService);
    showUserService = module.get(ShowUserService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when no authorization header', async () => {
    const context = createMockContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when authorization does not start with Bearer', async () => {
    const context = createMockContext({ authorization: 'Basic token123' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    authService.validateToken.mockResolvedValue({ valid: false, message: 'invalid' });
    const context = createMockContext({ authorization: 'Bearer invalid-token' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should return false when user is not found', async () => {
    authService.validateToken.mockResolvedValue({
      valid: true,
      decoded: { sub: '999', name: 'Test' },
    });
    showUserService.execute.mockResolvedValue(null);

    const context = createMockContext({ authorization: 'Bearer valid-token' });

    const result = await guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should return true and attach user to request when token is valid', async () => {
    authService.validateToken.mockResolvedValue({
      valid: true,
      decoded: { sub: '1', name: 'Test User' },
    });
    showUserService.execute.mockResolvedValue(userMock);

    const context = createMockContext({ authorization: 'Bearer valid-token' });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual(userMock);
  });
});
