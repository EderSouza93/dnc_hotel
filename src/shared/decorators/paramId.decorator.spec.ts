import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import { ParamId } from "./paramId.decorator";
import { ExecutionContext } from "@nestjs/common";

describe('ParamId Decorator', () => {
  it('should extract and convert param id to number', () => {
    const request = { params: { id: '42' } };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    // Get the factory function from the decorator metadata
    class TestClass {
      test(@ParamId() id: number) {}
    }

    const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestClass, 'test');
    const key = Object.keys(metadata)[0];
    const factory = metadata[key].factory;

    const result = factory(null, context);
    expect(result).toBe(42);
  });

  it('should return NaN when id is not a valid number', () => {
    const request = { params: { id: 'abc' } };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    class TestClass {
      test(@ParamId() id: number) {}
    }

    const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestClass, 'test');
    const key = Object.keys(metadata)[0];
    const factory = metadata[key].factory;

    const result = factory(null, context);
    expect(result).toBeNaN();
  });
});
