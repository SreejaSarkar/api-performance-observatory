import {
    IsUrl,
} from "class-validator";

import {
    ApiProperty,
} from "@nestjs/swagger";

export class CreateWebhookDto {
    @ApiProperty({
        example:
            "https://api.company.com/webhooks/alerts",
        description:
            "Webhook URL that will receive alert notifications",
    })
    @IsUrl()
    url!: string;
}