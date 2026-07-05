import {
  ApiProperty,
} from "@nestjs/swagger";

export class TrafficResponseDto {
  @ApiProperty({
    example: "10:30 AM",
    description:
      "Time bucket for the traffic measurement",
  })
  time!: string;

  @ApiProperty({
    example: 1250,
    description:
      "Number of requests received during this time period",
  })
  requests!: number;
}