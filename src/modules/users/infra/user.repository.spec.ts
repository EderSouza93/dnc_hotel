import { Test, TestingModule } from "@nestjs/testing";
import { UserRepository } from "./user.repository";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { userMock } from "../utils/factory/userMock";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Role } from "@prisma/client";

let repository: UserRepository;
let prisma: any;

describe('UserRepository', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const hashed = await repository.hashPassword('password123');

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe('password123');
    });
  });

  describe('isIdExists', () => {
    it('should return user when found', async () => {
      prisma.user.findUnique.mockResolvedValue(userMock);

      const result = await repository.isIdExists(1);
      expect(result).toEqual(userMock);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(repository.isIdExists(NaN)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(repository.isIdExists(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      prisma.user.create.mockResolvedValue(userMock);

      const result = await repository.create(userMock);
      expect(prisma.user.create).toHaveBeenCalledWith({ data: userMock });
      expect(result).toEqual(userMock);
    });
  });

  describe('list', () => {
    it('should return list of users', async () => {
      prisma.user.findMany.mockResolvedValue([userMock]);

      const result = await repository.list();
      expect(result).toEqual([userMock]);
    });
  });

  describe('show', () => {
    it('should return a user by id', async () => {
      prisma.user.findUnique.mockResolvedValue(userMock);

      const result = await repository.show(1);
      expect(result).toEqual(userMock);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updated = { ...userMock, name: 'Updated' };
      prisma.user.update.mockResolvedValue(updated);

      const result = await repository.update(1, { name: 'Updated' });
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 1 },
        data: { name: 'Updated' },
      }));
      expect(result.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      prisma.user.delete.mockResolvedValue(userMock);

      const result = await repository.delete(1);
      expect(prisma.user.delete).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 1 },
      }));
      expect(result).toEqual(userMock);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      prisma.user.findUnique.mockResolvedValue(userMock);

      const result = await repository.findByEmail('test@example.com');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toEqual(userMock);
    });

    it('should return null when email not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('uploadAvatar', () => {
    it('should update user avatar', async () => {
      const updated = { ...userMock, avatar: 'avatar.jpg' };
      prisma.user.update.mockResolvedValue(updated);

      const result = await repository.uploadAvatar(1, 'avatar.jpg');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { avatar: 'avatar.jpg' },
      });
      expect(result.avatar).toBe('avatar.jpg');
    });
  });
});
