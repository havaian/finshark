import { IsString, Length } from 'class-validator';

export class CreatePaperDto {
  @IsString()
  @Length(1, 16)
  code!: string;

  @IsString()
  @Length(1, 200)
  name!: string;
}

export class UpdatePaperDto {
  @IsString()
  @Length(1, 16)
  code?: string;

  @IsString()
  @Length(1, 200)
  name?: string;
}
