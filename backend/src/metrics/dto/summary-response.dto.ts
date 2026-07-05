import {
  ApiProperty,
} from "@nestjs/swagger";

export class SummaryResponseDto {
  @ApiProperty({
    example: 185,
    description:
      "Average response latency in milliseconds",
  })
  avgLatency!: number;

  @ApiProperty({
    example: 420,
    description:
      "95th percentile latency in milliseconds",
  })
  p95Latency!: number;

  @ApiProperty({
    example: 780,
    description:
      "99th percentile latency in milliseconds",
  })
  p99Latency!: number;

  @ApiProperty({
    example: 125430,
    description:
      "Total requests processed during the selected time window",
  })
  requests!: number;

  @ApiProperty({
    example: 1.82,
    description:
      "Percentage of requests that resulted in errors (4xx/5xx)",
  })
  errorRate!: number;
}