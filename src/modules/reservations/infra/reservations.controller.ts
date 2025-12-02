import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CreateReservationsService } from '../services/createReservations.service';
import { CreateReservationDto } from '../domain/dto/create-reservation.dto';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { FindAllReservationsService } from '../services/findAllReservations.service';
import { ParamId } from 'src/shared/decorators/paramId.decorator';
import { FindByIdReservationsService } from '../services/findByIdReservations.service';
import { ReservationStatus, Role } from '@prisma/client';
import { UpdateStatusReservationsService } from '../services/updateStatusReservations.service';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';


@UseGuards(AuthGuard, RoleGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly createReservationsService: CreateReservationsService,
    private readonly findAllReservationsService: FindAllReservationsService,
    private readonly findByIdReservationsService: FindByIdReservationsService,
    private readonly updateStatusService: UpdateStatusReservationsService
  ) {}

  @Roles(Role.USER)
  @Post()
  create(@User('id') id: number, @Body() body: CreateReservationDto) {
    return this.createReservationsService.create(id,body);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.findAllReservationsService.execute();
  }

  @Roles(Role.ADMIN)
  @Get('user')
  findbyUser(@User('id') id: number,) {
    return this.findByIdReservationsService.execute(id);
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@ParamId() id: number) {
    return this.findByIdReservationsService.execute(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  updateStatus(
    @ParamId() id: number, 
    @Body('status') status: ReservationStatus,
  ) {
    return this.updateStatusService.execute(id, status);
  }
}
