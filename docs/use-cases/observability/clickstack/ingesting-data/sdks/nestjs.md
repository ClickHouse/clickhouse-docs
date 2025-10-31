---
slug: /use-cases/observability/clickstack/sdks/nestjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'NestJS SDK for ClickStack - The ClickHouse Observability Stack'
title: 'NestJS'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

The ClickStack NestJS integration allows you to create a logger or use the default
logger to send logs to ClickStack (powered by [nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme)).

**This guide integrates:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Logs</td>
      <td className="pe-2">✖️ Metrics</td>
      <td className="pe-2">✖️ Traces</td>
    </tr>
  </tbody>
</table>

_To send over metrics or APM/traces, you'll need to add the corresponding language
integration to your application as well._

## Getting started {#getting-started}

Import `HyperDXNestLoggerModule` into the root `AppModule` and use the `forRoot()`
method to configure it.

```javascript
import { Module } from '@nestjs/common';
import { HyperDXNestLoggerModule } from '@hyperdx/node-logger';

@Module({
  imports: [
    HyperDXNestLoggerModule.forRoot({
      apiKey: ***YOUR_INGESTION_API_KEY***,
      maxLevel: 'info',
      service: 'my-app',
    }),
  ],
})
export class AppModule {}
```

Afterward, the winston instance will be available to inject across the entire
project using the `HDX_LOGGER_MODULE_PROVIDER` injection token:

```javascript
import { Controller, Inject } from '@nestjs/common';
import { HyperDXNestLoggerModule, HyperDXNestLogger } from '@hyperdx/node-logger';

@Controller('cats')
export class CatsController {
  constructor(
    @Inject(HyperDXNestLoggerModule.HDX_LOGGER_MODULE_PROVIDER)
    private readonly logger: HyperDXNestLogger,
  ) { }

  meow() {
    this.logger.info({ message: '🐱' });
  }
}
```

### Replacing the Nest logger (also for bootstrapping) {#replacing-the-nest-logger}

:::note Important
By doing this, you give up the dependency injection, meaning that `forRoot` and `forRootAsync` are not needed and shouldn't be used. Remove them from your main module.
:::

Using the dependency injection has one minor drawback. Nest has to bootstrap the
application first (instantiating modules and providers, injecting dependencies,
etc.) and during this process the instance of `HyperDXNestLogger` is not yet
available, which means that Nest falls back to the internal logger.

One solution is to create the logger outside of the application lifecycle, using
the `createLogger` function, and pass it to `NestFactory.create`. Nest will then
wrap our custom logger (the same instance returned by the `createLogger` method)
into the Logger class, forwarding all calls to it:

Create the logger in the `main.ts` file

```javascript
import { HyperDXNestLoggerModule } from '@hyperdx/node-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: HyperDXNestLoggerModule.createLogger({
      apiKey: ***YOUR_INGESTION_API_KEY***,
      maxLevel: 'info',
      service: 'my-app',
    })
  });
  await app.listen(3000);
}
bootstrap();
```

Change your main module to provide the Logger service:

```javascript
import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [Logger],
})
export class AppModule {}
```

Then inject the logger simply by type hinting it with the Logger from `@nestjs/common`:

```javascript
import { Controller, Logger } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  constructor(private readonly logger: Logger) {}

  meow() {
    this.logger.log({ message: '🐱' });
  }
}
```
