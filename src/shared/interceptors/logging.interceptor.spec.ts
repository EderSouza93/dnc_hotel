import { loggingInterceptor } from "./logging.interceptor";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { of } from "rxjs";

let interceptor: loggingInterceptor;

const createMockContext = (url: string = '/test'): ExecutionContext => {
  const request = { url };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

describe('LoggingInterceptor', () => {
  beforeEach(() => {
    interceptor = new loggingInterceptor();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log the request URL and execution time', (done) => {
    const context = createMockContext('/api/hotels');
    const next: CallHandler = {
      handle: () => of({ data: 'test' }),
    };

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(console.log).toHaveBeenCalledWith('Url: /api/hotels');
        expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/^After\.\.\. \d+ms$/));
        done();
      },
    });
  });
});
