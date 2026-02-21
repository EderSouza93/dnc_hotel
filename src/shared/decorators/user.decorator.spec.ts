import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import { User } from "./user.decorator";
import { ExecutionContext, NotFoundException } from "@nestjs/common";

const createMockContext = (user?: any): ExecutionContext => {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
};

describe('User Decorator', () => {
  const getFactory = (filter?: string) => {
    class TestClass {
      test(@User(filter) user: any) {}
    }

    const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestClass, 'test');
    const key = Object.keys(metadata)[0];
    return metadata[key].factory;
  };

  it('should return the full user when no filter is provided', () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const context = createMockContext(mockUser);

    const factory = getFactory(undefined);
    const result = factory(undefined, context);

    expect(result).toEqual(mockUser);
  });

  it('should return a specific user field when filter is provided', () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const context = createMockContext(mockUser);

    const factory = getFactory('id');
    const result = factory('id', context);

    expect(result).toBe(1);
  });

  it('should throw NotFoundException when user is not found', () => {
    const context = createMockContext(undefined);

    const factory = getFactory(undefined);

    expect(() => factory(undefined, context)).toThrow(NotFoundException);
  });

  it('should throw NotFoundException when filtered field does not exist', () => {
    const mockUser = { id: 1, name: 'Test User' };
    const context = createMockContext(mockUser);

    const factory = getFactory('nonexistent');

    expect(() => factory('nonexistent', context)).toThrow(NotFoundException);
  });
});
