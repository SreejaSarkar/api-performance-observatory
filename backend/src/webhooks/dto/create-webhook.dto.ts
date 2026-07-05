import { IsString, IsUrl } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateWebhookDto {
    @ApiProperty({ example: "https://hooks.slack.com/services/xxx" })
    @IsString()
    @IsUrl({ require_tld: false })
    url!: string;
}