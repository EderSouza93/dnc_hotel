import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Role } from "@prisma/client";

let controller: AuthController;
let authService: jest.Mocked<Partial<AuthService>>;

const tokenMock = { access_token: 'mocked-jwt-token' };

describe('AuthController', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(tokenMock),
            register: jest.fn().mockResolvedValue(tokenMock),
            reset: jest.fn().mockResolvedValue(tokenMock),
            forgot: jest.fn().mockResolvedValue('Email sent'),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return token', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(tokenMock);
    });
  });

  describe('register', () => {
    it('should call authService.register and return token', async () => {
      const dto = { email: 'new@example.com', name: 'New User', password: 'password123' };

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(tokenMock);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.reset and return token', async () => {
      const dto = { token: 'jwt-token', password: 'newpassword' };

      const result = await controller.resetPassword(dto);

      expect(authService.reset).toHaveBeenCalledWith(dto);
      expect(result).toEqual(tokenMock);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgot and return message', async () => {
      const dto = { email: 'test@example.com' };

      const result = await controller.forgotPassword(dto);

      expect(authService.forgot).toHaveBeenCalledWith('test@example.com');
      expect(result).toBe('Email sent');
    });
  });
});
