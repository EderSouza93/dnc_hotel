import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { UserModule } from "../users/user.module";
import { AuthGuard } from "src/shared/guards/auth.guard";

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1d' },
        }),
        PrismaModule,
        forwardRef(() => UserModule),
    ],
    providers: [
        AuthService,
        AuthGuard
    ],
    controllers: [AuthController],
    exports: [
        AuthService,
        AuthGuard,
        JwtModule
    ]
})

export class AuthModule {}