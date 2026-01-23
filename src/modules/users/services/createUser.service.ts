import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { IUserRepository } from "../domain/repositories/Iuser.repository";
import { CreateUserDTO } from "../domain/dto/createUser.dto";
import * as bcrypt from 'bcrypt';
import { REPOSITORY_TOKEN_USER } from "../utils/repositoriesTokens";

@Injectable()
export class CreateUserService {
    constructor(
        @Inject(REPOSITORY_TOKEN_USER)
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(data: CreateUserDTO) {
        const user = await this.userRepository.findByEmail(data.email);
        if (user) {
            throw new BadRequestException('User already exists')
        }
        data.password = await this.hashPassword(data.password);
        return await this.userRepository.create(data);
    }
    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

}