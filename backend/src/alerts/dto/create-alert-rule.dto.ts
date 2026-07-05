import {
  IsIn,
  IsNumber,
  IsString,
} from "class-validator";

import {
  ApiProperty,
} from "@nestjs/swagger";

export class CreateAlertRuleDto {
  @ApiProperty({
    example:
      "High Payment Latency",
    description:
      "Human-readable alert rule name",
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example:
      "LATENCY",
    description:
      "Metric to monitor",
    enum: [
      "LATENCY",
      "ERROR_RATE",
      "HEALTH_SCORE",
    ],
  })
  @IsString()
  metric!: string;

  @ApiProperty({
    example: 500,
    description:
      "Threshold that triggers the alert",
  })
  @IsNumber()
  threshold!: number;

  @ApiProperty({
    example:
      "CRITICAL",
    description:
      "Alert severity level",
    enum: [
      "LOW",
      "MEDIUM",
      "HIGH",
      "CRITICAL",
    ],
  })
  @IsIn([
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
  ])
  severity!: string;
}