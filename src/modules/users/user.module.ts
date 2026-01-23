import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { UserController } from "./infra/user.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { UserIdCheckMiddleware } from "src/shared/middlewares/userIdCheck.middleware";
import { AuthModule } from "../auth/auth.module";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import { CreateUserService } from "./services/createUser.service";
import { UserRepository } from "./infra/user.repository";
import { REPOSITORY_TOKEN_USER } from "./utils/repositoriesTokens";
import { ListUserService } from "./services/listUser.service";
import { ShowUserService } from "./services/showUser.service";
import { UpdateUserService } from "./services/updateUser.service";
import { FindUserByEmail } from "./services/findUserByEmail.service";
import { DeleteUserService } from "./services/deleteUser.service";
import { UploadAvatarService } from "./services/uploadAvatar.service";
import { UserMatchGuard } from "src/shared/guards/userMatch.guard";

@Module({
    imports: [
        PrismaModule, 
        forwardRef(() => AuthModule), 
        MulterModule.register({
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const filename = `${uuidv4()}${file.originalname}`;
                    return cb(null, filename);
                },
            }),
        })
    ],
    controllers: [UserController],
    providers: [
        ListUserService,
        ShowUserService,
        UpdateUserService,
        FindUserByEmail,
        DeleteUserService,
        UploadAvatarService,
        CreateUserService,
        UserMatchGuard, 
        {
            provide: REPOSITORY_TOKEN_USER,
            useClass: UserRepository,
        }
        
    ],
    exports: [
        CreateUserService,
        ShowUserService,
        FindUserByEmail,
        UpdateUserService,
        {
            provide: REPOSITORY_TOKEN_USER,
            useClass: UserRepository,
        }
    ],
})
export class UserModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(UserIdCheckMiddleware)
            .forRoutes(
                { path: 'users/:id', method: RequestMethod.GET },
                { path: 'users/:id', method: RequestMethod.PATCH },
                { path: 'users/:id', method: RequestMethod.DELETE },
            );
    }
}