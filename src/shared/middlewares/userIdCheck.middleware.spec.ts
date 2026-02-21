import { UserIdCheckMiddleware } from "./userIdCheck.middleware";
import { BadRequestException } from "@nestjs/common";
import { Request, Response } from "express";

let middleware: UserIdCheckMiddleware;

const createMockReq = (params: Record<string, any> = {}): Request => {
  return { params } as unknown as Request;
};

const mockRes = {} as Response;
const mockNext = jest.fn();

describe('UserIdCheckMiddleware', () => {
  beforeEach(() => {
    middleware = new UserIdCheckMiddleware();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call next when id is a valid number', () => {
    const req = createMockReq({ id: '1' });

    middleware.use(req, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw BadRequestException when id is missing', () => {
    const req = createMockReq({});

    expect(() => middleware.use(req, mockRes, mockNext)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException when id is not a number', () => {
    const req = createMockReq({ id: 'abc' });

    expect(() => middleware.use(req, mockRes, mockNext)).toThrow(BadRequestException);
  });
});
