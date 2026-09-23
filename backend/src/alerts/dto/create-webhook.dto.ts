import {
    IsIn,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
} from 'class-validator';

import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    DEFAULT_WEBHOOK_PROVIDER,
    WEBHOOK_PROVIDERS,
} from '../../webhooks/webhook.constants';

export class CreateWebhookDto {
    @ApiPropertyOptional({
        example: 'Primary Teams channel',
        description: 'Human-friendly destination label shown in the UI and notifications',
    })
    @IsOptional()
    @IsString()
    @MaxLength(80)
    name?: string;

    @ApiProperty({
        example: 'MICROSOFT_TEAMS',
        enum: WEBHOOK_PROVIDERS,
        default: DEFAULT_WEBHOOK_PROVIDER,
        description: 'Notification provider for formatting alert deliveries',
    })
    @IsOptional()
    @IsString()
    @IsIn(WEBHOOK_PROVIDERS)
    provider?: string;

    @ApiProperty({
        example: 'https://api.company.com/webhooks/alerts',
        description: 'Webhook URL that will receive alert notifications',
    })
    @IsUrl({ require_tld: false })
    url!: string;
}