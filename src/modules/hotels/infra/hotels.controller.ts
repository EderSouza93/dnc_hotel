import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
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
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { OwnerHotelGuard } from 'src/shared/guards/ownerHotel.guard';
import { User } from 'src/shared/decorators/user.decorator';

@UseGuards(AuthGuard, RoleGuard)
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

  @Roles(Role.ADMIN)
  @Post()
  create(@User('id') id: number, @Body() createHotelDto: CreateHotelDto) {
    return this.createHotelsService.execute(createHotelDto, id);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get()
  findAll() {
    return this.findAllHotelsService.execute();
  }

  @Roles(Role.ADMIN)
  @Get('owner')
  findOwner(@User('id') id: number) {
    return this.findHotelByOwnerService.execute(id);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get('name')
  findName(@Query('name') name: string) {
    return this.findHotelByNameService.execute(name);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get(':id')
  findOne(@ParamId() id: number) {
    return this.findOneHotelsService.execute(id);
  }

  @UseGuards(OwnerHotelGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@ParamId() id: number, @Body() updateHotelDto: UpdateHotelDto) {
    return this.updateHotelsService.execute(id, updateHotelDto);
  }

  @UseGuards(OwnerHotelGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@ParamId() id: number) {
    return this.removeHotelsService.execute(id);
  }
}
