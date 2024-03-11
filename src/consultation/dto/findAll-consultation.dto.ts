import { IsOptional } from 'class-validator';

export class FindAllConsultationDto {
  @IsOptional()
  username?: string;

  @IsOptional()
  counselorName?: string;
}
