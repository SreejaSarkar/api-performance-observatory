import {
  ApiProperty,
} from "@nestjs/swagger";

export class TrendResponseDto {
  @ApiProperty({
    example: "10:30 AM",
    description:
      "Time bucket for the latency measurement",
  })
  time!: string;

  @ApiProperty({
    example: 245,
    description:
      "Average latency in milliseconds at that point in time",
  })
  latency!: number;
}