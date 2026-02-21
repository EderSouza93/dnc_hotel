import { Test, TestingModule } from "@nestjs/testing";
import { DeleteUserService } from "./deleteUser.service";
import { REPOSITORY_TOKEN_USER } from "../utils/repositoriesTokens";
import { IUserRepository } from "../domain/repositories/Iuser.repository";
import { userMock } from "../utils/factory/userMock";

let service: DeleteUserService;
let userRepository: jest.Mocked<IUserRepository>;

describe('DeleteUserService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserService,
        {
          provide: REPOSITORY_TOKEN_USER,
          useValue: {
            isIdExists: jest.fn().mockResolvedValue(userMock),
            delete: jest.fn().mockResolvedValue(userMock),
          },
        },
      ],
    }).compile();

    service = module.get<DeleteUserService>(DeleteUserService);
    userRepository = module.get(REPOSITORY_TOKEN_USER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delete a user successfully', async () => {
    const result = await service.execute(1);

    expect(userRepository.isIdExists).toHaveBeenCalledWith(1);
    expect(userRepository.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual(userMock);
  });

  it('should propagate error if user not found', async () => {
    const error = new Error('User not found');
    userRepository.isIdExists.mockRejectedValue(error);

    await expect(service.execute(999)).rejects.toThrow('User not found');
  });
});
