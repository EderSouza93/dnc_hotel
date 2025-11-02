import { Injectable } from '@nestjs/common';

@Injectable()
export class RemoveHotelsService {
  execute(id: number) {
    return `This action removes a #${id} hotel`;
  }
}
