import { Controller, Post, Body, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { SpeakerService } from './speaker.service';
import { CreateSpeakerDto } from './create-speaker.dto';
import { SpeakerDTO } from '@cfp-platform/shared-types';

@Controller('speakers')
export class SpeakerController {
  constructor(private readonly speakerService: SpeakerService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createSpeakerDto: CreateSpeakerDto): SpeakerDTO {
    return this.speakerService.create(createSpeakerDto);
  }

  @Get()
  findAll(): SpeakerDTO[] {
    return this.speakerService.findAll();
  }
}
