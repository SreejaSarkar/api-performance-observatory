# API Observatory SDK

## Installation

```bash
npm install @api-observatory/sdk
```

## Usage

```ts
import { trackMetric }
from "@api-observatory/sdk";

await trackMetric({
    apiKey: "project-api-key",
    serverUrl: "http://localhost:3001",
    endpoint: "/users",
    method: "GET",
    latency: 250,
    statusCode: 200,
});
```