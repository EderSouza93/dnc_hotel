import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }

    async generateJwtToken(user: User) {
        const payload = { sub: user.id, name: user.name };
        const options = { 
            expiresIn: '1d',
            issuer: 'dnc_hotel',
            audience: 'users',
        };

        return {access_token: this.jwtService.sign(payload, options)}
    }
}