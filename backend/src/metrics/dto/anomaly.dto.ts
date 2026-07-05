import { ApiProperty } from '@nestjs/swagger';

export class AnomalyDto {
  @ApiProperty({
    example: 'LATENCY_SPIKE',
    description: 'Type of anomaly detected',
    enum: ['LATENCY_SPIKE', 'ERROR_SPIKE', 'TRAFFIC_SPIKE'],
  })
  type!: string;

  @ApiProperty({
    example: '/api/payments',
    description: 'Endpoint where the anomaly was detected',
  })
  endpoint!: string;

  @ApiProperty({
    example: 1450,
    description: 'Observed metric value that triggered the anomaly',
  })
  value!: number;

  @ApiProperty({
    example: 500,
    description: 'Expected threshold or anomaly detection limit',
  })
  threshold!: number;
}
