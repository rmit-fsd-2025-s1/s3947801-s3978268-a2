import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateLecturerSelectionDTO {
  @IsInt()
  applicationId!: number;

  @IsInt()
  lecturerId!: number;

  @IsString()
  rank!: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
