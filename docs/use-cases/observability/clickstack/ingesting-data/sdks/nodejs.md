---
slug: /use-cases/observability/clickstack/sdks/nodejs
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'Node.js SDK for ClickStack - The ClickHouse Observability Stack'
title: 'Node.js'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack uses the OpenTelemetry standard for collecting telemetry data (logs, metrics,
traces and exceptions). Traces are auto-generated with automatic instrumentation, so manual
instrumentation isn't required to get value out of tracing.

This guide integrates:

- **Logs**
- **Metrics**
- **Traces**
- **Exceptions**

## Getting started {#getting-started}

### Install HyperDX OpenTelemetry instrumentation package {#install-hyperdx-opentelemetry-instrumentation-package}

Use the following command to install the [ClickStack OpenTelemetry package](https://www.npmjs.com/package/@hyperdx/node-opentelemetry).

<Tabs groupId="install">
<TabItem value="npm" label="NPM" default>

```shell 
npm install @hyperdx/node-opentelemetry 
```

</TabItem>
<TabItem value="yarn" label="Yarn" default>

```shell  
yarn add @hyperdx/node-opentelemetry 
```

</TabItem>
</Tabs>

### Initializing the SDK {#initializin-the-sdk}

To initialize the SDK, you'll need to call the `init` function at the top of the entry point of your application.

<Tabs groupId="initialize">
<TabItem value="require" label="require" default>

```javascript
const HyperDX = require('@hyperdx/node-opentelemetry');

HyperDX.init({
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-service'
});
```

</TabItem>
<TabItem value="import" label="import">

```javascript
import * as HyperDX from '@hyperdx/node-opentelemetry';

HyperDX.init({
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-service'
});
```

</TabItem>
</Tabs>

This will automatically capture tracing, metrics, and logs from your Node.js application.

### Setup log collection {#setup-log-collection}

By default, `console.*` logs are collected by default. If you're using a logger
such as `winston` or `pino`, you'll need to add a transport to your logger to
send logs to ClickStack.  If you're using another type of logger,
[reach out](mailto:support@clickhouse.com) or explore one of our platform
integrations if applicable (such as [Kubernetes](/use-cases/observability/clickstack/ingesting-data/kubernetes)).

<Tabs groupId="logging">
<TabItem value="Winston" label="Winston" default>

If you're using `winston` as your logger, you'll need to add the following transport to your logger.

```typescript
    import winston from 'winston';
    import * as HyperDX from '@hyperdx/node-opentelemetry';

    const logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console(),
        HyperDX.getWinstonTransport('info', { // Send logs info and above
          detectResources: true,
        }),
      ],
    });

    export default logger;
```

</TabItem>
<TabItem value="Pino" label="Pino">

If you're using `pino` as your logger, you'll need to add the following transport to your logger and specify a `mixin` to correlate logs with traces.

```typescript
import pino from 'pino';
import * as HyperDX from '@hyperdx/node-opentelemetry';

const logger = pino(
    pino.transport({
    mixin: HyperDX.getPinoMixinFunction,
    targets: [
        HyperDX.getPinoTransport('info', { // Send logs info and above
        detectResources: true,
        }),
    ],
    }),
);

export default logger;
```

</TabItem>

<TabItem value="console.log" label="console.log">
By default, `console.*` methods are supported out of the box. No additional configuration is required. 

You can disable this by setting the `HDX_NODE_CONSOLE_CAPTURE` environment variable to 0 or by passing `consoleCapture: false` to the `init` function.

</TabItem>
</Tabs>

### Setup error collection {#setup-error-collection}

The ClickStack SDK can automatically capture uncaught exceptions and errors in your application with full stack trace and code context. 

To enable this, you'll need to add the following code to the end of your application's error handling middleware, or manually capture exceptions using the `recordException` function.

<Tabs groupId="setup">
<TabItem value="Express" label="Express" default>

```javascript 
const HyperDX = require('@hyperdx/node-opentelemetry');
HyperDX.init({
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-service'
});
const app = express();

// Add your routes, etc.

// Add this after all routes,
// but before any and other error-handling middlewares are defined
HyperDX.setupExpressErrorHandler(app);

app.listen(3000);
```

</TabItem>
<TabItem value="Koa" label="Koa">

```javascript 
const Koa = require("koa");
const Router = require("@koa/router");
const HyperDX = require('@hyperdx/node-opentelemetry');
HyperDX.init({
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-service'
});

const router = new Router();
const app = new Koa();

HyperDX.setupKoaErrorHandler(app);

// Add your routes, etc.

app.listen(3030);
```

</TabItem>
<TabItem value="Manual" label="Manual">

```javascript
const HyperDX = require('@hyperdx/node-opentelemetry');

function myErrorHandler(error, req, res, next) {
    // This can be used anywhere in your application
    HyperDX.recordException(error);
}
```

</TabItem>
</Tabs>

## Troubleshooting {#troubleshooting}

If you're having trouble with the SDK, you can enable verbose logging by setting
the `OTEL_LOG_LEVEL` environment variable to `debug`.

```shell
export OTEL_LOG_LEVEL=debug
```

## Advanced instrumentation configuration {#advanced-instrumentation-configuration}

### Capture console logs {#capture-console-logs}

By default, the ClickStack SDK will capture console logs. You can disable it by
setting `HDX_NODE_CONSOLE_CAPTURE` environment variable to 0.

```sh copy
export HDX_NODE_CONSOLE_CAPTURE=0
```

### Attach user information or metadata {#attach-user-information-or-metadata}

To easily tag all events related to a given attribute or identifier (ex. user id
or email), you can call the `setTraceAttributes` function which will tag every
log/span associated with the current trace after the call with the declared
attributes. It's recommended to call this function as early as possible within a
given request/trace (ex. as early in an Express middleware stack as possible).

This is a convenient way to ensure all logs/spans are automatically tagged with
the right identifiers to be searched on later, instead of needing to manually
tag and propagate identifiers yourself.

`userId`, `userEmail`, `userName`, and `teamName` will populate the sessions UI
with the corresponding values, but can be omitted. Any other additional values
can be specified and used to search for events.

```typescript
import * as HyperDX from '@hyperdx/node-opentelemetry';

app.use((req, res, next) => {
  // Get user information from the request...

  // Attach user information to the current trace
  HyperDX.setTraceAttributes({
    userId,
    userEmail,
  });

  next();
});
```

Make sure to enable beta mode by setting `HDX_NODE_BETA_MODE` environment
variable to 1 or by passing `betaMode: true` to the `init` function to
enable trace attributes.

```shell
export HDX_NODE_BETA_MODE=1
```

### Google Cloud Run {#google-cloud-run}

If you're running your application on Google Cloud Run, Cloud Trace
automatically injects sampling headers into incoming requests, currently
restricting traces to be sampled at 0.1 requests per second for each instance.

The `@hyperdx/node-opentelemetry` package overwrites the sample rate to 1.0 by
default.

To change this behavior, or to configure other OpenTelemetry installations, you
can manually configure the environment variables
`OTEL_TRACES_SAMPLER=parentbased_always_on` and `OTEL_TRACES_SAMPLER_ARG=1` to
achieve the same result.

To learn more, and to force tracing of specific requests, please refer to the
[Google Cloud Run documentation](https://cloud.google.com/run/docs/trace).

### Auto-instrumented libraries {#auto-instrumented-libraries}

The following libraries will be automatically instrumented (traced) by the SDK:

- [`dns`](https://nodejs.org/dist/latest/docs/api/dns.html)
- [`express`](https://www.npmjs.com/package/express)
- [`graphql`](https://www.npmjs.com/package/graphql)
- [`hapi`](https://www.npmjs.com/package/@hapi/hapi)
- [`http`](https://nodejs.org/dist/latest/docs/api/http.html)
- [`ioredis`](https://www.npmjs.com/package/ioredis)
- [`knex`](https://www.npmjs.com/package/knex)
- [`koa`](https://www.npmjs.com/package/koa)
- [`mongodb`](https://www.npmjs.com/package/mongodb)
- [`mongoose`](https://www.npmjs.com/package/mongoose)
- [`mysql`](https://www.npmjs.com/package/mysql)
- [`mysql2`](https://www.npmjs.com/package/mysql2)
- [`net`](https://nodejs.org/dist/latest/docs/api/net.html)
- [`pg`](https://www.npmjs.com/package/pg)
- [`pino`](https://www.npmjs.com/package/pino)
- [`redis`](https://www.npmjs.com/package/redis)
- [`winston`](https://www.npmjs.com/package/winston)

## Alternative installation {#alternative-installation}

### Run the Application with ClickStack OpenTelemetry CLI {#run-the-application-with-cli}

Alternatively, you can auto-instrument your application without any code changes by using the `opentelemetry-instrument` CLI or using the
Node.js `--require` flag. The CLI installation exposes a wider range of auto-instrumented libraries and frameworks.

<Tabs groupId="cli">
<TabItem value="npx" label="Using NPX" default>

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' npx opentelemetry-instrument index.js
```

</TabItem>
<TabItem value="custom" label="Custom Entry Point (ex. Nodemon, ts-node, etc.)">

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' ts-node -r '@hyperdx/node-opentelemetry/build/src/tracing' index.js
```

</TabItem>

<TabItem value="code_import" label="Code Import">

```javascript 
// Import this at the very top of the first file loaded in your application
// You'll still specify your API key via the `HYPERDX_API_KEY` environment variable
import { initSDK } from '@hyperdx/node-opentelemetry';

initSDK({
    consoleCapture: true, // optional, default: true
    additionalInstrumentations: [], // optional, default: []
});
```

</TabItem>

</Tabs>

_The `OTEL_SERVICE_NAME` environment variable is used to identify your service in the HyperDX app, it can be any name you want._

### Enabling exception capturing {#enabling-exception-capturing}

To enable uncaught exception capturing, you'll need to set the `HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE` environment variable to 1.

```shell
HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE=1
```

Afterwards, to automatically capture exceptions from Express, Koa, or to manually catch exceptions, follow the instructions in the [Setup Error Collection](#setup-error-collection) section above.

### Auto-instrumented libraries {#auto-instrumented-libraries-2}

The following libraries will be automatically instrumented (traced) via the above installation methods:

- [`amqplib`](https://www.npmjs.com/package/amqplib)
- [`AWS Lambda Functions`](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html)
- [`aws-sdk`](https://www.npmjs.com/package/aws-sdk)
- [`bunyan`](https://www.npmjs.com/package/bunyan)
- [`cassandra-driver`](https://www.npmjs.com/package/cassandra-driver)
- [`connect`](https://www.npmjs.com/package/connect)
- [`cucumber`](https://www.npmjs.com/package/@cucumber/cucumber)
- [`dataloader`](https://www.npmjs.com/package/dataloader)
- [`dns`](https://nodejs.org/dist/latest/docs/api/dns.html)
- [`express`](https://www.npmjs.com/package/express)
- [`fastify`](https://www.npmjs.com/package/fastify)
- [`generic-pool`](https://www.npmjs.com/package/generic-pool)
- [`graphql`](https://www.npmjs.com/package/graphql)
- [`grpc`](https://www.npmjs.com/package/@grpc/grpc-js)
- [`hapi`](https://www.npmjs.com/package/@hapi/hapi)
- [`http`](https://nodejs.org/dist/latest/docs/api/http.html)
- [`ioredis`](https://www.npmjs.com/package/ioredis)
- [`knex`](https://www.npmjs.com/package/knex)
- [`koa`](https://www.npmjs.com/package/koa)
- [`lru-memoizer`](https://www.npmjs.com/package/lru-memoizer)
- [`memcached`](https://www.npmjs.com/package/memcached)
- [`mongodb`](https://www.npmjs.com/package/mongodb)
- [`mongoose`](https://www.npmjs.com/package/mongoose)
- [`mysql`](https://www.npmjs.com/package/mysql)
- [`mysql2`](https://www.npmjs.com/package/mysql2)
- [`nestjs-core`](https://www.npmjs.com/package/@nestjs/core)
- [`net`](https://nodejs.org/dist/latest/docs/api/net.html)
- [`pg`](https://www.npmjs.com/package/pg)
- [`pino`](https://www.npmjs.com/package/pino)
- [`redis`](https://www.npmjs.com/package/redis)
- [`restify`](https://www.npmjs.com/package/restify)
- [`socket.io`](https://www.npmjs.com/package/socket.io)
- [`winston`](https://www.npmjs.com/package/winston)
