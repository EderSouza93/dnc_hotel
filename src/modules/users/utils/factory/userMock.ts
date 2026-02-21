import { Role, User } from "@prisma/client";

export const userMock: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: '$2b$10$hashedpassword',
  role: Role.USER,
  avatar: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const adminUserMock: User = {
  id: 2,
  name: 'Admin User',
  email: 'admin@example.com',
  password: '$2b$10$hashedpassword',
  role: Role.ADMIN,
  avatar: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}
