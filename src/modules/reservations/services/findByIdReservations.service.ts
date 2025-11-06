import { Inject, Injectable } from "@nestjs/common";
import { REPOSITORY_TOKEN_RESERVATION } from "../utils/repositoriesTokens";
import type { IReservationRepository } from "../domain/repositories/Ireservation.repository";

@Injectable()
export class FindByIdReservationsService {
    constructor(
        @Inject(REPOSITORY_TOKEN_RESERVATION)
        private readonly reservationRepository: IReservationRepository,
    ) { }

    async execute(id: number) {
        return await this.reservationRepository.findById(id);
    }
}
