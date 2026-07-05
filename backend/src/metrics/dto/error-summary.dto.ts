import {
  ApiProperty,
} from "@nestjs/swagger";

export class ErrorSummaryDto {
  @ApiProperty({
    example: 12450,
    description:
      "Total successful requests (HTTP status < 400)",
  })
  success!: number;

  @ApiProperty({
    example: 320,
    description:
      "Total client errors (HTTP 4xx)",
  })
  "4xx"!: number;

  @ApiProperty({
    example: 45,
    description:
      "Total server errors (HTTP 5xx)",
  })
  "5xx"!: number;

  @ApiProperty({
    example: 2.87,
    description:
      "Overall error rate percentage",
  })
  errorRate!: number;
}