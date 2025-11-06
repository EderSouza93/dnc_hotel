import { Module } from '@nestjs/common';
import { CreateReservationsService } from './services/createReservations.service';
import { ReservationsController } from './infra/reservations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../users/user.module';
import { HotelsModule } from '../hotels/hotels.module';
import { REPOSITORY_TOKEN_RESERVATION } from './utils/repositoriesTokens';
import { ReservationRepository } from './infra/reservations.repository';
import { REPOSITORY_TOKEN_HOTEL } from '../hotels/utils/repositoriesTokens';
import { HotelsRepositories } from '../hotels/infra/hotels.repository';
import { FindAllReservationsService } from './services/findAllReservations.service';
import { FindByIdReservationsService } from './services/findByIdReservations.service';
import { FindByUserReservationsService } from './services/findByUserReservations.service';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, HotelsModule],
  controllers: [ReservationsController],
  providers: [
    CreateReservationsService, 
    FindAllReservationsService,
    FindByIdReservationsService,
    FindByUserReservationsService,
    {
      provide: REPOSITORY_TOKEN_RESERVATION,
      useClass: ReservationRepository,
    },
    {
      provide: REPOSITORY_TOKEN_HOTEL,
      useClass: HotelsRepositories
    }
  ],
})
export class ReservationsModule {}
