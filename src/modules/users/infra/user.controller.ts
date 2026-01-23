import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { CreateUserService } from "../services/createUser.service";
import { CreateUserDTO } from "../domain/dto/createUser.dto";
import { UpdateUserDto } from "../domain/dto/updateUser.dto";
import { ParamId } from "src/shared/decorators/paramId.decorator";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { User } from "src/shared/decorators/user.decorator";
import { Role, type User as UserType } from '@prisma/client'
import { Roles } from "src/shared/decorators/roles.decorator";
import { RoleGuard } from "src/shared/guards/role.guard";
import { UserMatchGuard } from "src/shared/guards/userMatch.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileValidationInterceptor } from "src/shared/interceptors/fileValidation.interceptor";
import { ListUserService } from "../services/listUser.service";
import { ShowUserService } from "../services/showUser.service";
import { UpdateUserService } from "../services/updateUser.service";
import { UploadAvatarService } from "../services/uploadAvatar.service";
import { DeleteUserService } from "../services/deleteUser.service";
import type { Request } from "express";

// Comentário para fixação.

/* Interceptors são como middlewares porém ele pode interceptar uma request ou uma response,
    ele pode ser usado no controlle seguindo esse exemplo abaixo:
    @UseInteceptor(loggingInterceptor)
    em cima da rota para interceptar uma rota especifica ou em cima do @Controller para interceptar 
    todas as rotas desse controller.

    No caso desse projeto ele está no main.ts como:
    app.useGlobalInterceptors(new loggingInterceptor) interceptando todas as rotas do projeto.
    
    O loggingInterceptor intecepta rotas e mostra a url e o tempo da requisição em log.

    É importado dessa forma:
    import { loggingInterceptor } from "src/shared/interceptors/logging.interceptor";
*/
@UseGuards(AuthGuard, RoleGuard, ThrottlerGuard)
@Controller('users')
export class UserController {
    constructor(
        private readonly createUserService: CreateUserService,
        private readonly listUserService: ListUserService,
        private readonly showUserService: ShowUserService,
        private readonly updateUserService: UpdateUserService,
        private readonly uploadAvatarService: UploadAvatarService,
        private readonly deleteUserService: DeleteUserService
    ) { }

    @Roles(Role.ADMIN, Role.USER)
    @Get()
    list(@User() user: UserType) {
        console.log(user)
        return this.listUserService.execute();
    }

    @Roles(Role.USER, Role.ADMIN)
    @Get(':id')
    show(@ParamId() id: number) {
        return this.showUserService.execute(id);
    }

    @Roles(Role.ADMIN)
    @Post()
    createUser(@Body() body: CreateUserDTO) {
        return this.createUserService.execute(body);
    }

    @UseGuards(UserMatchGuard)
    @Roles(Role.ADMIN, Role.USER)
    @Patch(':id')
    updateUser(@ParamId() id: number, @Body() body: UpdateUserDto) {
        return this.updateUserService.execute(id, body);
    }

    @UseGuards(UserMatchGuard)
    @Roles(Role.ADMIN, Role.USER)
    @Delete(':id')
    deleteUser(
        @ParamId() id: number,
        @Req()request: Request
    ) {
        return this.deleteUserService.execute(id);
    }

    @UseInterceptors(FileInterceptor('avatar'), FileValidationInterceptor)
    @Roles(Role.ADMIN, Role.USER)
    @Post('avatar')
    uploadAvatar(
        @User('id') id: number,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({
                        fileType: 'image/*',
                        skipMagicNumbersValidation: true,
                    }),
                    new MaxFileSizeValidator({
                        maxSize: 900 * 1024 // 900KB
                    }),
                ]
            }),
        )
        avatar: Express.Multer.File,
    ) {
        return this.uploadAvatarService.execute(id, avatar.filename)
    }
}