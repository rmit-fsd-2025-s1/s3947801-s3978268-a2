import { IsArray, ArrayNotEmpty, IsOptional, IsString } from "class-validator";

export class GetApplicationsDTO {
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true }) 
  courseIds?: string[];
}
