import { Injectable } from '@nestjs/common';
import { EventDTO } from '@cfp-platform/shared-types';
import { CreateEventDto } from './create-event.dto';

@Injectable()
export class EventService {
  private readonly events: EventDTO[] = [];

  create(createEventDto: CreateEventDto): EventDTO {
    const newEvent: EventDTO = {
      id: Math.random().toString(36).substring(2, 9),
      ...createEventDto,
    };
    this.events.push(newEvent);
    return newEvent;
  }

  findAll(): EventDTO[] {
    return this.events;
  }
}
