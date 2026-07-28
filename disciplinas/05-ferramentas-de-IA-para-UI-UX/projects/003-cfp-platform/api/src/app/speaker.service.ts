import { Injectable } from '@nestjs/common';
import { SpeakerDTO } from '@cfp-platform/shared-types';
import { CreateSpeakerDto } from './create-speaker.dto';

@Injectable()
export class SpeakerService {
  private readonly speakers: SpeakerDTO[] = [];

  create(createSpeakerDto: CreateSpeakerDto): SpeakerDTO {
    const newSpeaker: SpeakerDTO = {
      id: Math.random().toString(36).substring(2, 9),
      ...createSpeakerDto,
    };
    this.speakers.push(newSpeaker);
    return newSpeaker;
  }

  findAll(): SpeakerDTO[] {
    return this.speakers;
  }
}
