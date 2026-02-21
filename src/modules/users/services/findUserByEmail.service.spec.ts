import { Test, TestingModule } from "@nestjs/testing";
import { FindUserByEmail } from "./findUserByEmail.service";
import { REPOSITORY_TOKEN_USER } from "../utils/repositoriesTokens";
import { IUserRepository } from "../domain/repositories/Iuser.repository";
import { userMock } from "../utils/factory/userMock";

let service: FindUserByEmail;
let userRepository: jest.Mocked<IUserRepository>;

describe('FindUserByEmail', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserByEmail,
        {
          provide: REPOSITORY_TOKEN_USER,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FindUserByEmail>(FindUserByEmail);
    userRepository = module.get(REPOSITORY_TOKEN_USER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a user when found by email', async () => {
    userRepository.findByEmail.mockResolvedValue(userMock);

    const result = await service.execute('test@example.com');

    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(result).toEqual(userMock);
  });

  it('should return null when user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const result = await service.execute('notfound@example.com');

    expect(result).toBeNull();
  });

  it('should propagate error if repository throws', async () => {
    userRepository.findByEmail.mockRejectedValue(new Error('Database error'));

    await expect(service.execute('test@example.com')).rejects.toThrow('Database error');
  });
});
