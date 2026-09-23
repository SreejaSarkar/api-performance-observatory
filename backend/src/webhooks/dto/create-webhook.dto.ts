import {
    IsIn,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    DEFAULT_WEBHOOK_PROVIDER,
    WEBHOOK_PROVIDERS,
} from '../webhook.constants';

export class CreateWebhookDto {
    @ApiPropertyOptional({
        example: 'Production incident room',
        description: 'Human-friendly destination label shown in the UI and alert cards',
    })
    @IsOptional()
    @IsString()
    @MaxLength(80)
    name?: string;

    @ApiProperty({
        example: 'MICROSOFT_TEAMS',
        enum: WEBHOOK_PROVIDERS,
        default: DEFAULT_WEBHOOK_PROVIDER,
    })
    @IsOptional()
    @IsString()
    @IsIn(WEBHOOK_PROVIDERS)
    provider?: string;

    @ApiProperty({ example: 'https://hooks.slack.com/services/xxx' })
    @IsString()
    @IsUrl({ require_tld: false })
    url!: string;
}