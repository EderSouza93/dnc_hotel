import { Test, TestingModule } from "@nestjs/testing";
import { UploadAvatarService } from "./uploadAvatar.service";
import { REPOSITORY_TOKEN_USER } from "../utils/repositoriesTokens";
import { IUserRepository } from "../domain/repositories/Iuser.repository";
import { userMock } from "../utils/factory/userMock";
import { stat, unlink } from "fs/promises";

jest.mock('fs/promises', () => ({
  stat: jest.fn(),
  unlink: jest.fn(),
}));

let service: UploadAvatarService;
let userRepository: jest.Mocked<IUserRepository>;

const userWithAvatar = { ...userMock, avatar: 'old-avatar.jpg' };

describe('UploadAvatarService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadAvatarService,
        {
          provide: REPOSITORY_TOKEN_USER,
          useValue: {
            isIdExists: jest.fn().mockResolvedValue(userMock),
            update: jest.fn().mockResolvedValue({ ...userMock, avatar: 'new-avatar.jpg' }),
          },
        },
      ],
    }).compile();

    service = module.get<UploadAvatarService>(UploadAvatarService);
    userRepository = module.get(REPOSITORY_TOKEN_USER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload avatar for user without existing avatar', async () => {
    const result = await service.execute(1, 'new-avatar.jpg');

    expect(userRepository.isIdExists).toHaveBeenCalledWith(1);
    expect(stat).not.toHaveBeenCalled();
    expect(userRepository.update).toHaveBeenCalledWith(1, { avatar: 'new-avatar.jpg' });
    expect(result.avatar).toBe('new-avatar.jpg');
  });

  it('should delete old avatar before uploading new one', async () => {
    userRepository.isIdExists.mockResolvedValue(userWithAvatar);
    (stat as jest.Mock).mockResolvedValue(true);

    await service.execute(1, 'new-avatar.jpg');

    expect(stat).toHaveBeenCalled();
    expect(unlink).toHaveBeenCalled();
    expect(userRepository.update).toHaveBeenCalledWith(1, { avatar: 'new-avatar.jpg' });
  });

  it('should propagate error if user not found', async () => {
    const error = new Error('User not found');
    userRepository.isIdExists.mockRejectedValue(error);

    await expect(service.execute(999, 'avatar.jpg')).rejects.toThrow('User not found');
  });
});
