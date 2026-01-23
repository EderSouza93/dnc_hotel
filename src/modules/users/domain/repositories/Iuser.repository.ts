import { User } from "@prisma/client";

export interface IUserRepository {
    hashPassword(password: string): Promise<string>;
    isIdExists(id: number): Promise<User>;
    create(data: any): Promise<User>;
    list(): Promise<User[]>;
    show(id: number): Promise<User | null>;
    update(id: number, data: any): Promise<User>;
    delete(id: number): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    uploadAvatar(id: number, avatarFilename: string): Promise<User>;
}