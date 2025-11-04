import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UploadedFile, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator, UseInterceptors } from '@nestjs/common';
import { CreateHotelsService } from '../services/createHotel.service';
import { CreateHotelDto } from '../domain/dto/create-hotel.dto';
import { UpdateHotelDto } from '../domain/dto/update-hotel.dto';
import { FindOneHotelsService } from '../services/findOneHotel.service';
import { FindAllHotelsService } from '../services/findAllHotel.service';
import { RemoveHotelsService } from '../services/removeHotel.service';
import { UpdateHotelsService } from '../services/updateHotel.service';
import { UploadImageHotelsService } from '../services/uploadImageHotel.service';
import { FindByOwnerHotelsService } from '../services/findByOwnerHotel.service';
import { FindByNameHotelsService } from '../services/findByNameHotel.service';
import { ParamId } from 'src/shared/decorators/paramId.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { RoleGuard } from 'src/shared/guards/role.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { OwnerHotelGuard } from 'src/shared/guards/ownerHotel.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationInterceptor } from 'src/shared/interceptors/fileValidation.interceptor';

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
    private readonly uploadImageHotelsService: UploadImageHotelsService
  ) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@User('id') id: number, @Body() createHotelDto: CreateHotelDto) {
    return this.createHotelsService.execute(createHotelDto, id);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get()
  findAll(@Query('page') page: string = "1", @Query('limit') limit: string = "10") {
    return this.findAllHotelsService.execute(Number(page), Number(limit));
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

  @UseInterceptors(FileInterceptor('image'), FileValidationInterceptor)
  @Roles(Role.ADMIN)
  @Patch('image/:hotelId')
  uploadImage(
    @Param('hotelId') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: "image/*",
            skipMagicNumbersValidation: true,
          }),
          new MaxFileSizeValidator({ maxSize: 900 * 1024 })
        ]
      })
    )
    image: Express.Multer.File,
  ) {
    return this.uploadImageHotelsService.execute(id, image.filename)
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
