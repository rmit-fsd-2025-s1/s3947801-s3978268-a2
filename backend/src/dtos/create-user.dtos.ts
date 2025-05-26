import { IsNotEmpty, IsString, IsEmail, Length, IsIn } from "class-validator";

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
  @IsIn(["lecturer", "tutor"])
  accountType: "lecturer" | "tutor";
}
