import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Role, User } from "@prisma/client";
import { AuthLoginDTO } from "./domain/dto/authLogin.dto";
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from "../users/domain/dto/createUser.dto";
import { AuthRegisterDTO } from "./domain/dto/authRegisterUser.dto";
import { AuthResetPasswordDTO } from "./domain/dto/authResetPassword.dto";
import { ValidateTokenDTO } from "./domain/dto/validateToken.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { templateHTML } from "./utils/templateHTML";
import { CreateUserService } from "../users/services/createUser.service";
import { UpdateUserService } from "../users/services/updateUser.service";
import { FindUserByEmail } from "../users/services/findUserByEmail.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService, 
        private readonly createUserService: CreateUserService,
        private readonly updateUserService: UpdateUserService,
        private readonly findUserByEmailService: FindUserByEmail,
        private readonly mailerService: MailerService
    ) { }

    async generateJwtToken(user: User, expiresIn: string = '1d') {
        const payload = { sub: user.id, name: user.name };
        const expiresInSeconds = expiresIn === '1d' ? 86400 : parseInt(expiresIn) || 86400;
        const options = { 
            expiresIn: expiresInSeconds,
            issuer: 'dnc_hotel',
            audience: 'users',
        };

        return {access_token: this.jwtService.sign(payload, options)}
    }

    async login({ email, password }: AuthLoginDTO) {
        const user = await this.findUserByEmailService.execute(email);

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

        const user = await this.createUserService.execute(newUser);

        return await this.generateJwtToken(user)
    }

    async reset({token, password}: AuthResetPasswordDTO) {
        const { valid, decoded } = await this.validateToken(token);

        if (!valid || !decoded) throw new UnauthorizedException('Invalid token');

        const user: User = await this.updateUserService.execute(Number(decoded.sub), { 
            password,
        });

        return await this.generateJwtToken(user);
    }

    async forgot(email: string) {
        const user = await this.findUserByEmailService.execute(email);

        if (!user) {
            throw new UnauthorizedException('Email is incorrect');
        }

        const token = await this.generateJwtToken(user, '30m');

        await this.mailerService.sendMail({
            to: email,
            subject: 'Reset Password - DNC Hotel',
            html: templateHTML(user.name, token.access_token)
        });
        return `A verification code has been sent to ${email}`;
    }

    async validateToken(token: string): Promise<ValidateTokenDTO> {
        try {
            const decoded = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
                issuer: 'dnc_hotel',
                audience: 'users',
            });

            return { valid: true, decoded };
        } catch (error) {
            return {valid: false, message: error.message };
        }
    }
}