import {
  ApiProperty,
} from "@nestjs/swagger";

export class EndpointSummaryDto {
  @ApiProperty({
    example:
      "/api/payments",
    description:
      "API endpoint being analyzed",
  })
  endpoint!: string;

  @ApiProperty({
    example: 245,
    description:
      "Average response latency in milliseconds",
  })
  avgLatency!: number;

  @ApiProperty({
    example: 12500,
    description:
      "Total requests received by the endpoint",
  })
  requests!: number;

  @ApiProperty({
    example: 1.75,
    description:
      "Percentage of requests resulting in errors (4xx/5xx)",
  })
  errorRate!: number;
}