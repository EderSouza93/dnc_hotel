import { Inject, Injectable } from "@nestjs/common";
import { REPOSITORY_TOKEN_USER } from "../utils/repositoriesTokens";
import type { IUserRepository } from "../domain/repositories/Iuser.repository";

@Injectable()
export class ShowUserService {
    constructor(
        @Inject(REPOSITORY_TOKEN_USER)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(id: number) {
        const user = await this.userRepository.isIdExists(id);
        return user;
    }
}