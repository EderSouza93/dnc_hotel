import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Role, User } from "@prisma/client";
import { AuthLoginDTO } from "./domain/dto/authLogin.dto";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from 'bcrypt';
import { UserService } from "../users/user.service";
import { CreateUserDTO } from "../users/domain/dto/createUser.dto";
import { AuthRegisterDTO } from "./domain/dto/authRegisterUser.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService, 
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
    ) { }

    async generateJwtToken(user: User) {
        const payload = { sub: user.id, name: user.name };
        const options = { 
            expiresIn: '1d',
            issuer: 'dnc_hotel',
            audience: 'users',
        };

        return {access_token: this.jwtService.sign(payload, options)}
    }

    async login({ email, password }: AuthLoginDTO) {
        const user = await this.userService.findByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Email or password is incorrect');
        }

        return await this.generateJwtToken(user)
    }

    async register(body: AuthRegisterDTO) {
        if (!body.email || !body.name || !body.password) {
            throw new UnauthorizedException('Missing required registration fields');
        }

        const newUser: CreateUserDTO = {
            email: body.email,
            name: body.name,
            password: body.password,
            role: body.role ?? Role.USER,
        };

        const user = await this.userService.create(newUser) 

        return await this.generateJwtToken(user)
    }
}