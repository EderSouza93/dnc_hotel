import { Inject, Injectable } from "@nestjs/common";
import type { IUserRepository } from "../domain/repositories/Iuser.repository";
import { REPOSITORY_TOKEN_USER } from "../utils/repositoriesTokens";

@Injectable()
export class DeleteUserService {
    constructor(
        @Inject(REPOSITORY_TOKEN_USER)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(id: number) {
        await this.userRepository.isIdExists(id);
        
        return this.userRepository.delete(id)
    }
}