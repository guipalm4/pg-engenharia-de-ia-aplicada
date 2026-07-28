import { IsNotEmpty, IsString, IsEmail, IsBoolean } from 'class-validator';
import { SpeakerDTO } from '@cfp-platform/shared-types';

export class CreateSpeakerDto implements Omit<SpeakerDTO, 'id'> {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  talkTitle!: string;

  @IsNotEmpty()
  @IsBoolean()
  isGDE!: boolean;
}
