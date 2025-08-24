import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}
    @Get()
    getUsers() {
        return this.userService.getUsers();
    }

    @Post()
     async createUser(@Body() body: any) {
        return await this.userService.createUser(body);  
    }
}