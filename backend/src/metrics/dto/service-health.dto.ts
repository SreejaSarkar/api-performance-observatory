import {
  ApiProperty,
} from "@nestjs/swagger";

export class ServiceHealthDto {
  @ApiProperty({
    example: 92,
    description:
      "Overall service health score calculated from latency, error rate, and traffic metrics",
  })
  healthScore!: number;

  @ApiProperty({
    example: "HEALTHY",
    description:
      "Current service health status",
    enum: [
      "HEALTHY",
      "DEGRADED",
      "CRITICAL",
    ],
  })
  status!: string;

  @ApiProperty({
    example: 88,
    description:
      "Latency component score (higher is better)",
  })
  latencyScore!: number;

  @ApiProperty({
    example: 97,
    description:
      "Error-rate component score (higher is better)",
  })
  errorScore!: number;

  @ApiProperty({
    example: 90,
    description:
      "Traffic component score (higher is better)",
  })
  trafficScore!: number;
}