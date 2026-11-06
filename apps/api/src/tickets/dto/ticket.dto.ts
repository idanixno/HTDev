import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { TicketStatus } from "@zharfa/database";

export class TicketAttachmentInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  fileName!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  contentType!: string;

  /** Base64 (optionally data-URL) payload — max enforced in service. */
  @IsString()
  @MinLength(1)
  dataBase64!: string;
}

export class CreateTicketDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(10_000)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  courseSlug?: string;

  /** Optional supplementary Telegram handle/ref — not a primary channel. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  telegramRef?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => TicketAttachmentInputDto)
  attachments?: TicketAttachmentInputDto[];
}

export class ReplyTicketDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10_000)
  body!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => TicketAttachmentInputDto)
  attachments?: TicketAttachmentInputDto[];
}

export class TransitionTicketDto {
  @IsEnum(TicketStatus)
  status!: TicketStatus;
}
