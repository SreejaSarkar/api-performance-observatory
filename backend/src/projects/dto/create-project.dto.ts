import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
} from "class-validator";

export class CreateProjectDto {
  @ApiProperty({
    example: "Payments Service",
    description:
      "Name of the project being monitored",
  })
  @IsString()
  @IsNotEmpty()
  name!: string;
}