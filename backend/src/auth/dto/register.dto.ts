import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @ApiProperty({
    example: "sreej@example.com",
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: "Sreej",
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: "super-secure-password",
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}