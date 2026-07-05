import {
  ApiProperty,
} from "@nestjs/swagger";

export class SlowEndpointDto {
  @ApiProperty({
    example:
      "/api/payments",
    description:
      "API endpoint with high average latency",
  })
  endpoint!: string;

  @ApiProperty({
    example: 1250,
    description:
      "Average response latency in milliseconds",
  })
  avgLatency!: number;

  @ApiProperty({
    example: 15420,
    description:
      "Total requests received by the endpoint",
  })
  requests!: number;
}