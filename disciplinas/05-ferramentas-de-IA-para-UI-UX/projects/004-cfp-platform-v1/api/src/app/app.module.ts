import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpeakerController } from './speaker.controller';
import { SpeakerService } from './speaker.service';
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  imports: [],
  controllers: [AppController, SpeakerController, EventController],
  providers: [AppService, SpeakerService, EventService],
})
export class AppModule {}
