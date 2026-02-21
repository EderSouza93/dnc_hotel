import { Test, TestingModule } from "@nestjs/testing";
import { CreateUserService } from "./createUser.service";
import { REPOSITORY_TOKEN_USER } from "../utils/repositoriesTokens";
import { IUserRepository } from "../domain/repositories/Iuser.repository";
import { userMock } from "../utils/factory/userMock";
import { BadRequestException } from "@nestjs/common";
import { Role } from "@prisma/client";

let service: CreateUserService;
let userRepository: jest.Mocked<IUserRepository>;

describe('CreateUserService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserService,
        {
          provide: REPOSITORY_TOKEN_USER,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn().mockResolvedValue(userMock),
          },
        },
      ],
    }).compile();

    service = module.get<CreateUserService>(CreateUserService);
    userRepository = module.get(REPOSITORY_TOKEN_USER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user successfully', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const createUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: Role.USER,
    };

    const result = await service.execute(createUserDto);

    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(userRepository.create).toHaveBeenCalled();
    expect(result).toEqual(userMock);
  });

  it('should throw BadRequestException when user already exists', async () => {
    userRepository.findByEmail.mockResolvedValue(userMock);

    const createUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: Role.USER,
    };

    await expect(service.execute(createUserDto)).rejects.toThrow(BadRequestException);
  });

  it('should hash the password before creating user', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const createUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: Role.USER,
    };

    await service.execute(createUserDto);

    const callArg = userRepository.create.mock.calls[0][0];
    expect(callArg.password).not.toBe('password123');
  });
});
