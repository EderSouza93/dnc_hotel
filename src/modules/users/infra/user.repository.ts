import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { IUserRepository } from "../domain/repositories/Iuser.repository";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { User } from "@prisma/client";
import { userSelectFields } from "src/modules/prisma/utils/userSelectFields";
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from "../domain/dto/updateUser.dto";

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    async isIdExists(id: number): Promise<User> {
        if (!id || isNaN(id)) {
            throw new BadRequestException('Id inválido');
        }
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: userSelectFields
        });

        if (!user) {
            throw new NotFoundException('User not found')
        }

        return user
    }
    create(data: User): Promise<User> {
        return this.prisma.user.create({ data })
    }
    list(): Promise<User[]> {
        return this.prisma.user.findMany({
            select: userSelectFields
        });
    }
    show(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } })
    }
    update(id: number, body: UpdateUserDto): Promise<User> {
        return this.prisma.user.update({ 
            where: { id }, 
            data: body,
            select: userSelectFields
        })
    }
    delete(id: number): Promise<User> {
        return this.prisma.user.delete({ 
            where: { id },
            select: userSelectFields
        })
    }
    findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ 
            where: { email } 
        })
    }
    uploadAvatar(id: number, avatarFilename: string): Promise<User> {
        return this.prisma.user.update({ where: { id }, data: { avatar: avatarFilename } })
    }
}