import { Test, TestingModule } from "@nestjs/testing";
import { UpdateUserService } from "./updateUser.service";
import { REPOSITORY_TOKEN_USER } from "../utils/repositoriesTokens";
import { IUserRepository } from "../domain/repositories/Iuser.repository";
import { userMock } from "../utils/factory/userMock";

let service: UpdateUserService;
let userRepository: jest.Mocked<IUserRepository>;

describe('UpdateUserService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserService,
        {
          provide: REPOSITORY_TOKEN_USER,
          useValue: {
            isIdExists: jest.fn().mockResolvedValue(userMock),
            hashPassword: jest.fn().mockResolvedValue('hashed-new-password'),
            update: jest.fn().mockResolvedValue({ ...userMock, name: 'Updated User' }),
          },
        },
      ],
    }).compile();

    service = module.get<UpdateUserService>(UpdateUserService);
    userRepository = module.get(REPOSITORY_TOKEN_USER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update a user without password change', async () => {
    const updateDto = { name: 'Updated User' };

    const result = await service.execute(1, updateDto);

    expect(userRepository.isIdExists).toHaveBeenCalledWith(1);
    expect(userRepository.hashPassword).not.toHaveBeenCalled();
    expect(userRepository.update).toHaveBeenCalledWith(1, updateDto);
    expect(result.name).toBe('Updated User');
  });

  it('should hash password when password is provided', async () => {
    const updateDto = { password: 'newpassword123' };

    await service.execute(1, updateDto);

    expect(userRepository.hashPassword).toHaveBeenCalledWith('newpassword123');
    expect(userRepository.update).toHaveBeenCalledWith(1, {
      password: 'hashed-new-password',
    });
  });

  it('should propagate error if user not found', async () => {
    const error = new Error('User not found');
    userRepository.isIdExists.mockRejectedValue(error);

    await expect(service.execute(999, { name: 'Test' })).rejects.toThrow('User not found');
  });
});
