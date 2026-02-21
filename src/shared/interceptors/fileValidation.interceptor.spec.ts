import { FileValidationInterceptor } from "./fileValidation.interceptor";
import { BadRequestException, CallHandler, ExecutionContext } from "@nestjs/common";
import { of, throwError } from "rxjs";
import { unlink } from "fs";

jest.mock('fs', () => ({
  unlink: jest.fn((path, cb) => cb(null)),
}));

let interceptor: FileValidationInterceptor;

const createMockContext = (file?: any): ExecutionContext => {
  const request = { file };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

describe('FileValidationInterceptor', () => {
  beforeEach(() => {
    interceptor = new FileValidationInterceptor();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should pass through when no error occurs', (done) => {
    const context = createMockContext();
    const next: CallHandler = {
      handle: () => of({ success: true }),
    };

    interceptor.intercept(context, next).subscribe({
      next: (value) => {
        expect(value).toEqual({ success: true });
      },
      complete: () => done(),
    });
  });

  it('should delete file when BadRequestException occurs', (done) => {
    const mockFile = { path: '/tmp/test-file.jpg' };
    const context = createMockContext(mockFile);
    const next: CallHandler = {
      handle: () => throwError(() => new BadRequestException('Invalid file')),
    };

    interceptor.intercept(context, next).subscribe({
      error: (err) => {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(unlink).toHaveBeenCalledWith(mockFile.path, expect.any(Function));
        done();
      },
    });
  });

  it('should not delete file when non-BadRequestException occurs', (done) => {
    const mockFile = { path: '/tmp/test-file.jpg' };
    const context = createMockContext(mockFile);
    const next: CallHandler = {
      handle: () => throwError(() => new Error('Some other error')),
    };

    interceptor.intercept(context, next).subscribe({
      error: (err) => {
        expect(err).toBeInstanceOf(Error);
        expect(unlink).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should not fail when no file is present and BadRequestException occurs', (done) => {
    const context = createMockContext(undefined);
    const next: CallHandler = {
      handle: () => throwError(() => new BadRequestException('No file')),
    };

    interceptor.intercept(context, next).subscribe({
      error: (err) => {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(unlink).not.toHaveBeenCalled();
        done();
      },
    });
  });
});
