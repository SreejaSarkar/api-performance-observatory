import {
  ApiProperty,
} from "@nestjs/swagger";

export class SlaDto {
  @ApiProperty({
    example: 99.95,
    description:
      "Calculated service availability percentage",
  })
  availability!: number;

  @ApiProperty({
    example: 99.9,
    description:
      "Target SLA percentage",
  })
  target!: number;

  @ApiProperty({
    example: false,
    description:
      "Whether the SLA target has been breached",
  })
  breached!: boolean;

  @ApiProperty({
    example: 125430,
    description:
      "Number of successful requests (HTTP status < 400)",
  })
  successfulRequests!: number;

  @ApiProperty({
    example: 63,
    description:
      "Number of failed requests (HTTP status >= 400)",
  })
  failedRequests!: number;
}