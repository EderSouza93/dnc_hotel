import { Inject, Injectable } from "@nestjs/common";
import type { IUserRepository } from "../domain/repositories/Iuser.repository";
import { join, resolve } from "path/win32";
import { stat, unlink } from "fs/promises";
import { REPOSITORY_TOKEN_USER } from "../utils/repositoriesTokens";

@Injectable()
export class UploadAvatarService {
    constructor(
        @Inject(REPOSITORY_TOKEN_USER)
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(id: number, avatarFilename: string) {
        const user = await this.userRepository.isIdExists(id);
        const directory = resolve(__dirname, '..', '..','..','uploads');

        if (user.avatar) {
            const userAvatarFilePath = join(directory, user.avatar);
            const userAvatarFileExists = await stat(userAvatarFilePath);

            if (userAvatarFileExists) {
                await unlink(userAvatarFilePath);
            }
        }

        const userUpdated = await this.userRepository.update(id, { avatar: avatarFilename });

        return userUpdated;
    }
}