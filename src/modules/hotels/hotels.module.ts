import { Module } from '@nestjs/common';
import { HotelsController } from './infra/hotels.controller';
import { CreateHotelsService } from './services/createHotel.service';
import { FindAllHotelsService } from './services/findAllHotel.service';
import { FindOneHotelsService } from './services/findOneHotel.service';
import { UpdateHotelsService } from './services/updateHotel.service';
import { RemoveHotelsService } from './services/removeHotel.service';
import { HotelsRepositories } from './infra/hotels.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { HOTEL_REPOSITORY_TOKEN } from './utils/repositoriesTokens';

@Module({
  imports: [PrismaModule],
  controllers: [HotelsController],
  providers: 
  [
    CreateHotelsService, 
    FindAllHotelsService, 
    FindOneHotelsService, 
    UpdateHotelsService, 
    RemoveHotelsService,
    {
      provide: HOTEL_REPOSITORY_TOKEN,
      useClass: HotelsRepositories,
    }
  ],
})
export class HotelsModule {}
