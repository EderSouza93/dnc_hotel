import { Inject, Injectable } from "@nestjs/common";
import type { IUserRepository } from "../domain/repositories/Iuser.repository";
import { UpdateUserDto } from "../domain/dto/updateUser.dto";
import { REPOSITORY_TOKEN_USER } from "../utils/repositoriesTokens";

@Injectable()
export class UpdateUserService {
    constructor(
        @Inject(REPOSITORY_TOKEN_USER)
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(id: number, body: UpdateUserDto) {
        await this.userRepository.isIdExists(id);

        if (body.password) {
            body.password = await this.userRepository.hashPassword(body.password)
        }
        return await this.userRepository.update(id, body);
    }
}