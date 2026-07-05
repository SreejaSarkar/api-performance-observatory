import {
  IsInt,
  IsOptional,
  Min,
} from "class-validator";

import {
  Type,
} from "class-transformer";

import {
  ApiPropertyOptional,
} from "@nestjs/swagger";

export class QueryWindowDto {
  @ApiPropertyOptional({
    example: 72,
    description:
      "Time window in hours used for analytics calculations",
    minimum: 1,
    default: 72,
  })
  @IsOptional()

  @Type(() => Number)

  @IsInt()

  @Min(1)

  hours?: number = 72;
}