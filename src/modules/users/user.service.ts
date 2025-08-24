import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}
    
    list() {
        return this.prisma.user.findMany();
    }
    show(id: string) {
        return this.prisma.user.findUnique({ where: { id: Number(id)  }});
    }
    create(body: any): Promise<User> {
        return this.prisma.user.create({data: body});
    }
    update(id: string, body: any) {
        return this.prisma.user.update({ where: { id: Number(id) }, data: body });
    }
    delete(id: string) {
        return this.prisma.user.delete({ where: { id: Number(id) }});
    }
}