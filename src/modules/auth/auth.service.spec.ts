import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { CreateUserService } from "../users/services/createUser.service";
import { UpdateUserService } from "../users/services/updateUser.service";
import { FindUserByEmail } from "../users/services/findUserByEmail.service";
import { MailerService } from "@nestjs-modules/mailer";
import { UnauthorizedException } from "@nestjs/common";
import { userMock } from "../users/utils/factory/userMock";
import * as bcrypt from 'bcrypt';
import { Role } from "@prisma/client";

jest.mock('bcrypt');

let service: AuthService;
let jwtService: JwtService;
let createUserService: CreateUserService;
let updateUserService: UpdateUserService;
let findUserByEmailService: FindUserByEmail;
let mailerService: MailerService;

const tokenMock = { access_token: 'mocked-jwt-token' };

describe('AuthService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: CreateUserService,
          useValue: {
            execute: jest.fn().mockResolvedValue(userMock),
          },
        },
        {
          provide: UpdateUserService,
          useValue: {
            execute: jest.fn().mockResolvedValue(userMock),
          },
        },
        {
          provide: FindUserByEmail,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    createUserService = module.get<CreateUserService>(CreateUserService);
    updateUserService = module.get<UpdateUserService>(UpdateUserService);
    findUserByEmailService = module.get<FindUserByEmail>(FindUserByEmail);
    mailerService = module.get<MailerService>(MailerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateJwtToken', () => {
    it('should generate a JWT token with default expiration', async () => {
      const result = await service.generateJwtToken(userMock);

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: userMock.id, name: userMock.name },
        expect.objectContaining({
          expiresIn: 86400,
          issuer: 'dnc_hotel',
          audience: 'users',
        }),
      );
      expect(result).toEqual(tokenMock);
    });

    it('should generate a JWT token with custom expiration', async () => {
      await service.generateJwtToken(userMock, '30m');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: userMock.id, name: userMock.name },
        expect.objectContaining({
          issuer: 'dnc_hotel',
          audience: 'users',
        }),
      );
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      (findUserByEmailService.execute as jest.Mock).mockResolvedValue(userMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(findUserByEmailService.execute).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual(tokenMock);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      (findUserByEmailService.execute as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      (findUserByEmailService.execute as jest.Mock).mockResolvedValue(userMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      const registerDto = {
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
      };

      const result = await service.register(registerDto);

      expect(createUserService.execute).toHaveBeenCalledWith({
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
        role: Role.USER,
      });
      expect(result).toEqual(tokenMock);
    });

    it('should register with a custom role', async () => {
      const registerDto = {
        email: 'admin@example.com',
        name: 'Admin User',
        password: 'password123',
        role: Role.ADMIN,
      };

      await service.register(registerDto);

      expect(createUserService.execute).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.ADMIN }),
      );
    });

    it('should throw UnauthorizedException when required fields are missing', async () => {
      await expect(
        service.register({ email: '', name: '', password: '' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('reset', () => {
    it('should reset password and return a new token', async () => {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
        sub: '1',
        name: 'Test User',
      });

      const result = await service.reset({
        token: 'valid-jwt-token',
        password: 'newpassword123',
      });

      expect(updateUserService.execute).toHaveBeenCalledWith(1, {
        password: 'newpassword123',
      });
      expect(result).toEqual(tokenMock);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('invalid token'),
      );

      await expect(
        service.reset({ token: 'invalid-token', password: 'newpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgot', () => {
    it('should send a password reset email', async () => {
      (findUserByEmailService.execute as jest.Mock).mockResolvedValue(userMock);

      const result = await service.forgot('test@example.com');

      expect(findUserByEmailService.execute).toHaveBeenCalledWith('test@example.com');
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Reset Password - DNC Hotel',
        }),
      );
      expect(result).toContain('test@example.com');
    });

    it('should throw UnauthorizedException when email is not found', async () => {
      (findUserByEmailService.execute as jest.Mock).mockResolvedValue(null);

      await expect(service.forgot('wrong@example.com')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateToken', () => {
    it('should return valid: true for a valid token', async () => {
      const decoded = { sub: '1', name: 'Test User' };
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(decoded);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual({ valid: true, decoded });
    });

    it('should return valid: false for an invalid token', async () => {
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error('jwt expired'),
      );

      const result = await service.validateToken('expired-token');

      expect(result).toEqual({ valid: false, message: 'jwt expired' });
    });
  });
});
