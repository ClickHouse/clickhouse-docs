---
'slug': '/use-cases/observability/clickstack/sdks/nodejs'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 5
'description': 'Node.js SDK для ClickStack - Стек наблюдаемости ClickHouse'
'title': 'Node.js'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack использует стандарт OpenTelemetry для сбора телеметрических данных (журналы, метрики, трассировки и исключения). Трассировки автоматически генерируются с помощью автоматического инструментирования, поэтому ручное инструментирование не требуется для получения ценности от трассировки.

Этот гид охватывает:

- **Журналы**
- **Метрики**
- **Трассировки**
- **Исключения**

## Начало работы {#getting-started}

### Установка пакета инструментирования HyperDX OpenTelemetry {#install-hyperdx-opentelemetry-instrumentation-package}

Используйте следующую команду для установки [пакета ClickStack OpenTelemetry](https://www.npmjs.com/package/@hyperdx/node-opentelemetry).

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

### Инициализация SDK {#initializin-the-sdk}

Чтобы инициализировать SDK, вам нужно вызвать функцию `init` в начале точки входа вашего приложения.

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

Это автоматически захватит трассировку, метрики и журналы вашего приложения на Node.js.

### Настройка сбора журналов {#setup-log-collection}

По умолчанию журналы `console.*` собираются автоматически. Если вы используете логгер
такой как `winston` или `pino`, вам нужно будет добавить транспорт к вашему логгеру, чтобы
отправить журналы в ClickStack. Если вы используете другой тип логгера,
[свяжитесь с нами](mailto:support@clickhouse.com) или изучите одно из наших интеграций
платформы, если это применимо (например, [Kubernetes](/use-cases/observability/clickstack/ingesting-data/kubernetes)).

<Tabs groupId="logging">
<TabItem value="Winston" label="Winston" default>

Если вы используете `winston` в качестве вашего логгера, вам нужно будет добавить следующий транспорт к вашему логгеру.

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

Если вы используете `pino` в качестве вашего логгера, вам нужно будет добавить следующий транспорт к вашему логгеру и указать `mixin` для корреляции журналов с трассировками.

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
По умолчанию методы `console.*` поддерживаются из коробки. Дополнительная конфигурация не требуется. 

Вы можете отключить это, установив переменную окружения `HDX_NODE_CONSOLE_CAPTURE` в 0 или передав `consoleCapture: false` в функцию `init`.

</TabItem>
</Tabs>

### Настройка сбора ошибок {#setup-error-collection}

SDK ClickStack может автоматически захватывать необработанные исключения и ошибки в вашем приложении с полным стек-трейсом и контекстом кода. 

Чтобы включить это, вам нужно добавить следующий код в конце вашего промежуточного программного обеспечения обработки ошибок приложения или вручную захватить исключения с помощью функции `recordException`.

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

## Устранение неполадок {#troubleshooting}

Если у вас возникли проблемы с SDK, вы можете включить подробное логирование, установив
переменную окружения `OTEL_LOG_LEVEL` в `debug`.

```shell
export OTEL_LOG_LEVEL=debug
```

## Расширенная конфигурация инструментирования {#advanced-instrumentation-configuration}

### Захват консольных журналов {#capture-console-logs}

По умолчанию SDK ClickStack будет захватывать консольные журналы. Вы можете отключить это, установив 
переменную окружения `HDX_NODE_CONSOLE_CAPTURE` в 0.

```sh copy
export HDX_NODE_CONSOLE_CAPTURE=0
```

### Присоединение информации о пользователе или метаданных {#attach-user-information-or-metadata}

Чтобы легко пометить все события, связанные с данным атрибутом или идентификатором (например, идентификатор пользователя или электронная почта), вы можете вызвать функцию `setTraceAttributes`, которая пометит каждый
журнал/спан, связанный с текущей трассировкой, после вызова с объявленными атрибутами. Рекомендуется вызывать эту функцию как можно раньше в пределах данного запроса/трассировки (например, как можно раньше в стеке промежуточного программного обеспечения Express).

Это удобный способ убедиться, что все журналы/спаны автоматически помечены
правильными идентификаторами для дальнейшего поиска, вместо того чтобы вручную
помечать и передавать идентификаторы самим.

`userId`, `userEmail`, `userName` и `teamName` будут заполнять интерфейс сессий
соответствующими значениями, но могут быть опущены. Любые другие дополнительные значения
могут быть указаны и использованы для поиска событий.

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

Убедитесь, что вы включили бета-режим, установив переменную окружения `HDX_NODE_BETA_MODE` в 1 или передав `betaMode: true` в функцию `init`, чтобы
включить атрибуты трассировки.

```shell
export HDX_NODE_BETA_MODE=1
```

### Google Cloud Run {#google-cloud-run}

Если вы запускаете свое приложение на Google Cloud Run, Cloud Trace
автоматически вставляет заголовки выборки в входящие запросы, в настоящее время
ограничивая трассировки до выборки 0.1 запроса в секунду для каждой инстанции.

Пакет `@hyperdx/node-opentelemetry` по умолчанию перезаписывает скорость выборки на 1.0.

Чтобы изменить это поведение или настроить другие установки OpenTelemetry, вы
можете вручную настроить переменные окружения
`OTEL_TRACES_SAMPLER=parentbased_always_on` и `OTEL_TRACES_SAMPLER_ARG=1`, чтобы
достигнуть того же результата.

Чтобы узнать больше и заставить трассировку конкретных запросов, пожалуйста, обратитесь к
[документации Google Cloud Run](https://cloud.google.com/run/docs/trace).

### Автоинструментированные библиотеки {#auto-instrumented-libraries}

Следующие библиотеки будут автоматически инструментированы (трассированы) SDK:

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

## Альтернативная установка {#alternative-installation}

### Запуск приложения с помощью ClickStack OpenTelemetry CLI {#run-the-application-with-cli}

В качестве альтернативы, вы можете автоинструментировать ваше приложение без каких-либо изменений в коде, используя CLI `opentelemetry-instrument` или используя
флаг Node.js `--require`. Установка CLI открывает более широкий спектр автоинструментированных библиотек и фреймворков.

<Tabs groupId="cli">
<TabItem value="npx" label="Используя NPX" default>

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' npx opentelemetry-instrument index.js
```

</TabItem>
<TabItem value="custom" label="Пользовательская точка входа (например, Nodemon, ts-node и т.д.)">

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' ts-node -r '@hyperdx/node-opentelemetry/build/src/tracing' index.js
```

</TabItem>

<TabItem value="code_import" label="Импорт кода">

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

_Переменная окружения `OTEL_SERVICE_NAME` используется для идентификации вашего сервиса в приложении HyperDX, это может быть любое имя, которое вы хотите._

### Включение захвата исключений {#enabling-exception-capturing}

Чтобы включить захват необработанных исключений, вам нужно установить переменную окружения `HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE` в 1.

```shell
HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE=1
```

После этого, чтобы автоматически захватывать исключения из Express, Koa или вручную ловить исключения, следуйте инструкциям в разделе [Настройка сбора ошибок](#setup-error-collection) выше.

### Автоинструментированные библиотеки {#auto-instrumented-libraries-2}

Следующие библиотеки будут автоматически инструментированы (трассированы) с помощью вышеуказанных методов установки:

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
