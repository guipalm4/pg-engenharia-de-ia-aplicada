import { Test, TestingModule } from '@nestjs/testing';
import { SpeakerController } from './speaker.controller';
import { SpeakerService } from './speaker.service';
import { CreateSpeakerDto } from './create-speaker.dto';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

describe('SpeakerController Validation', () => {
  let controller: SpeakerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpeakerController],
      providers: [SpeakerService],
    }).compile();

    controller = module.get<SpeakerController>(SpeakerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Payload validation', () => {
    it('should throw BadRequestException (400) for invalid payloads', async () => {
      const validationPipe = new ValidationPipe({ transform: true, whitelist: true });
      
      const invalidPayload = {
        name: '', // Empty name
        email: 'not-an-email', // Invalid email
        talkTitle: '', // Empty talk title
        isGDE: 'yes', // Invalid boolean
      };

      const metadata = { type: 'body' as const, metatype: CreateSpeakerDto, data: '' };

      await expect(validationPipe.transform(invalidPayload, metadata)).rejects.toThrow(BadRequestException);
    });

    it('should pass validation for a valid payload', async () => {
      const validationPipe = new ValidationPipe({ transform: true, whitelist: true });
      
      const validPayload = {
        name: 'John Doe',
        email: 'john@example.com',
        talkTitle: 'Testing with Jest',
        isGDE: true,
      };

      const metadata = { type: 'body' as const, metatype: CreateSpeakerDto, data: '' };

      const result = await validationPipe.transform(validPayload, metadata);
      expect(result).toBeInstanceOf(CreateSpeakerDto);
      expect(result.name).toEqual('John Doe');
    });
  });
});
