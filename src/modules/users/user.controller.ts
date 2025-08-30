import { Body, Controller, Delete, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDTO } from "./domain/dto/createUser.dto";
import { UpdateUserDto } from "./domain/dto/updateUser.dto";
import { ParamId } from "src/shared/decorators/paramId.decorator";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { User } from "src/shared/decorators/user.decorator";
import type { User as UserType } from '@prisma/client'

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
@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}

    @Get()
    list(@User() user: UserType) {
        console.log(user)
        return this.userService.list();
    }

    @Get(':id')
    show(@ParamId() id: number) {
        return this.userService.show(id);
    }

    @Post()
     createUser(@Body() body: CreateUserDTO) {
        return this.userService.create(body);  
    }

    @Patch(':id')
    updateUser(@ParamId() id: number, @Body() body: UpdateUserDto) {
        return this.userService.update(id, body);
    }

    @Delete(':id')
    deleteUser(@ParamId() id: number)  {
        return this.userService.delete(id);
    }
}