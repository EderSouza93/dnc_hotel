import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    createUser(body: any): Promise<User> {
        return this.prisma.user.create({data: body});
    }
    getUsers() {
        return 'All users';
    }
}