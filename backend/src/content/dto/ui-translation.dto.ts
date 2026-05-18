import { IsIn, IsString, Length } from "class-validator";
import { SUPPORTED_LANGS, type Lang } from "../content.types";

export class UpsertUiTranslationDto {
  // Key validation done in service for clearer message;
  // here we just enforce string + length.
  @IsString()
  @Length(1, 200)
  key!: string;

  @IsIn(SUPPORTED_LANGS as unknown as string[])
  lang!: Lang;

  // value can be the empty string (explicitly clear) but not absent.
  @IsString()
  @Length(0, 10000)
  value!: string;
}
