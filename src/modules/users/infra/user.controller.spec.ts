import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { CreateUserService } from "../services/createUser.service";
import { ListUserService } from "../services/listUser.service";
import { ShowUserService } from "../services/showUser.service";
import { UpdateUserService } from "../services/updateUser.service";
import { UploadAvatarService } from "../services/uploadAvatar.service";
import { DeleteUserService } from "../services/deleteUser.service";
import { userMock } from "../utils/factory/userMock";
import { Role } from "@prisma/client";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { RoleGuard } from "src/shared/guards/role.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import { UserMatchGuard } from "src/shared/guards/userMatch.guard";

let controller: UserController;
let createUserService: { execute: jest.Mock };
let listUserService: { execute: jest.Mock };
let showUserService: { execute: jest.Mock };
let updateUserService: { execute: jest.Mock };
let uploadAvatarService: { execute: jest.Mock };
let deleteUserService: { execute: jest.Mock };

const mockGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('UserController', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: CreateUserService, useValue: { execute: jest.fn().mockResolvedValue(userMock) } },
        { provide: ListUserService, useValue: { execute: jest.fn().mockResolvedValue([userMock]) } },
        { provide: ShowUserService, useValue: { execute: jest.fn().mockResolvedValue(userMock) } },
        { provide: UpdateUserService, useValue: { execute: jest.fn().mockResolvedValue({ ...userMock, name: 'Updated' }) } },
        { provide: UploadAvatarService, useValue: { execute: jest.fn().mockResolvedValue({ ...userMock, avatar: 'avatar.jpg' }) } },
        { provide: DeleteUserService, useValue: { execute: jest.fn().mockResolvedValue(userMock) } },
      ],
    })
      .overrideGuard(AuthGuard).useValue(mockGuard)
      .overrideGuard(RoleGuard).useValue(mockGuard)
      .overrideGuard(ThrottlerGuard).useValue(mockGuard)
      .overrideGuard(UserMatchGuard).useValue(mockGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    createUserService = module.get(CreateUserService);
    listUserService = module.get(ListUserService);
    showUserService = module.get(ShowUserService);
    updateUserService = module.get(UpdateUserService);
    uploadAvatarService = module.get(UploadAvatarService);
    deleteUserService = module.get(DeleteUserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should return a list of users', async () => {
      const result = await controller.list(userMock);

      expect(listUserService.execute).toHaveBeenCalled();
      expect(result).toEqual([userMock]);
    });
  });

  describe('show', () => {
    it('should return a user by id', async () => {
      const result = await controller.show(1);

      expect(showUserService.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(userMock);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const dto = { name: 'Test', email: 'test@example.com', password: 'pass', role: Role.USER };

      const result = await controller.createUser(dto);

      expect(createUserService.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(userMock);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const dto = { name: 'Updated' };

      const result = await controller.updateUser(1, dto);

      expect(updateUserService.execute).toHaveBeenCalledWith(1, dto);
      expect(result.name).toBe('Updated');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const result = await controller.deleteUser(1, {} as any);

      expect(deleteUserService.execute).toHaveBeenCalledWith(1);
      expect(result).toEqual(userMock);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar', async () => {
      const mockFile = { filename: 'avatar.jpg' } as Express.Multer.File;

      const result = await controller.uploadAvatar(1, mockFile);

      expect(uploadAvatarService.execute).toHaveBeenCalledWith(1, 'avatar.jpg');
      expect(result.avatar).toBe('avatar.jpg');
    });
  });
});
