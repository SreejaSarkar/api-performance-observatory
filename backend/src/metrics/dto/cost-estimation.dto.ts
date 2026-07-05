import {
  ApiProperty,
} from "@nestjs/swagger";

export class CostEstimationDto {
  @ApiProperty({
    example: 1250000,
    description:
      "Projected monthly request volume based on the selected time window",
  })
  estimatedMonthlyRequests!: number;

  @ApiProperty({
    example: 62.5,
    description:
      "Estimated monthly infrastructure cost before cache savings",
  })
  estimatedInfraCost!: number;

  @ApiProperty({
    example: 15.63,
    description:
      "Estimated savings from caching layer (e.g. Redis)",
  })
  estimatedCacheSavings!: number;

  @ApiProperty({
    example: 46.87,
    description:
      "Final projected monthly cost after cache savings",
  })
  projectedCost!: number;
}