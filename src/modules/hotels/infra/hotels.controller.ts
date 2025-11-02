import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CreateHotelsService } from '../services/createHotel.service';
import { CreateHotelDto } from '../domain/dto/create-hotel.dto';
import { UpdateHotelDto } from '../domain/dto/update-hotel.dto';
import { FindOneHotelsService } from '../services/findOneHotel.service';
import { FindAllHotelsService } from '../services/findAllHotel.service';
import { RemoveHotelsService } from '../services/removeHotel.service';
import { UpdateHotelsService } from '../services/updateHotel.service';
import { ParamId } from 'src/shared/decorators/paramId.decorator';
import { FindByOwnerHotelsService } from '../services/findByOwnerHotel.service';
import { FindByNameHotelsService } from '../services/findByNameHotel.service';

@Controller('hotels')
export class HotelsController {
  constructor(
    private readonly createHotelsService: CreateHotelsService,
    private readonly findOneHotelsService: FindOneHotelsService,
    private readonly findAllHotelsService: FindAllHotelsService,
    private readonly removeHotelsService: RemoveHotelsService,
    private readonly updateHotelsService: UpdateHotelsService,
    private readonly findHotelByOwnerService: FindByOwnerHotelsService,
    private readonly findHotelByNameService: FindByNameHotelsService,
  ) {}

  @Post()
  create(@Body() createHotelDto: CreateHotelDto) {
    return this.createHotelsService.execute(createHotelDto);
  }

  @Get()
  findAll() {
    return this.findAllHotelsService.execute();
  }

  @Get(':ownerId')
  findOwner(@ParamId() id: number) {
    return this.findHotelByOwnerService.execute(id);
  }

  @Get('name')
  findName(@Query('name') name: string) {
    return this.findHotelByNameService.execute(name);
  }

  @Get(':id')
  findOne(@ParamId() id: number) {
    return this.findOneHotelsService.execute(id);
  }

  @Patch(':id')
  update(@ParamId() id: number, @Body() updateHotelDto: UpdateHotelDto) {
    return this.updateHotelsService.execute(id, updateHotelDto);
  }

  @Delete(':id')
  remove(@ParamId() id: number) {
    return this.removeHotelsService.execute(id);
  }
}
