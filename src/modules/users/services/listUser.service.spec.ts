import { Test, TestingModule } from "@nestjs/testing";
import { ListUserService } from "./listUser.service";
import { REPOSITORY_TOKEN_USER } from "../utils/repositoriesTokens";
import { IUserRepository } from "../domain/repositories/Iuser.repository";
import { userMock } from "../utils/factory/userMock";

let service: ListUserService;
let userRepository: jest.Mocked<IUserRepository>;

describe('ListUserService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUserService,
        {
          provide: REPOSITORY_TOKEN_USER,
          useValue: {
            list: jest.fn().mockResolvedValue([userMock]),
          },
        },
      ],
    }).compile();

    service = module.get<ListUserService>(ListUserService);
    userRepository = module.get(REPOSITORY_TOKEN_USER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a list of users', async () => {
    const result = await service.execute();

    expect(userRepository.list).toHaveBeenCalled();
    expect(result).toEqual([userMock]);
  });

  it('should return an empty array when no users exist', async () => {
    userRepository.list.mockResolvedValue([]);

    const result = await service.execute();

    expect(result).toEqual([]);
  });
});
