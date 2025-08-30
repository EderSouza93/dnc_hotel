import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthController } from "./auth.controller";

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
        }),
        PrismaModule, // to access DB vefiry if user exists and make hash password
    ],
    providers: [AuthService],
    controllers: [AuthController],
    exports: [AuthService]
})

export class AuthModule {}