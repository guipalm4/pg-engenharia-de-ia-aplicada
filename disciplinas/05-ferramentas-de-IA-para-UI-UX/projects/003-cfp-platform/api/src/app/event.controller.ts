import { Controller, Post, Body, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './create-event.dto';
import { EventDTO } from '@cfp-platform/shared-types';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createEventDto: CreateEventDto): EventDTO {
    return this.eventService.create(createEventDto);
  }

  @Get()
  findAll(): EventDTO[] {
    return this.eventService.findAll();
  }
}
