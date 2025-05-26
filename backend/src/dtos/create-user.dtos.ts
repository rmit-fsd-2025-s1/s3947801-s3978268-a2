import { IsNotEmpty, IsString, Length, IsIn } from "class-validator";

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 255)  
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["lecturer", "tutor"])
  accountType: "lecturer" | "tutor";
}