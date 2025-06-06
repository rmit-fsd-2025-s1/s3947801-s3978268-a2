import { IsNotEmpty, IsString, IsEmail, Length, IsIn, IsArray, ArrayNotEmpty, IsOptional, IsNumber } from "class-validator";

export class CreateUserDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 255)  
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["lecturer", "candidate"])
  accountType: "lecturer" | "candidate";

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  courses?: number[]; // Array of course IDs
}