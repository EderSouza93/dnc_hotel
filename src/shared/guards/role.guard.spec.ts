import { RoleGuard } from "./role.guard";
import { Reflector } from "@nestjs/core";
import { ExecutionContext } from "@nestjs/common";
import { Role } from "@prisma/client";

let guard: RoleGuard;
let reflector: Reflector;

const createMockContext = (user?: any): ExecutionContext => {
  const request = { user };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as unknown as ExecutionContext;
};

describe('RoleGuard', () => {
  beforeEach(() => {
    reflector = new Reflector();
    guard = new RoleGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return false when no roles are defined', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const context = createMockContext({ id: 1, role: Role.USER });
    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('should return false when no user is in the request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    const context = createMockContext(undefined);
    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('should return true when user role matches required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN, Role.USER]);

    const context = createMockContext({ id: 1, role: Role.USER });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return false when user role does not match required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    const context = createMockContext({ id: 1, role: Role.USER });
    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });
});
