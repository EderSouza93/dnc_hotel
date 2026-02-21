import { UserMatchGuard } from "./userMatch.guard";
import { ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";

let guard: UserMatchGuard;

const createMockContext = (params: Record<string, any> = {}, user?: any): ExecutionContext => {
  const request = { params, user };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

describe('UserMatchGuard', () => {
  beforeEach(() => {
    guard = new UserMatchGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when no user in request', () => {
    const context = createMockContext({ id: '1' }, undefined);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when user has no id', () => {
    const context = createMockContext({ id: '1' }, { name: 'Test' });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException when user id does not match param id', () => {
    const context = createMockContext({ id: '2' }, { id: 1 });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should return true when user id matches param id', () => {
    const context = createMockContext({ id: '1' }, { id: 1 });

    const result = guard.canActivate(context);
    expect(result).toBe(true);
  });
});
