---
slug: /use-cases/observability/clickstack/sdks/nodejs
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'Node.js SDK для ClickStack — стека наблюдаемости ClickHouse'
title: 'Node.js'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack использует стандарт OpenTelemetry для сбора телеметрических данных (логов, метрик,
трейсов и исключений). Трейсы автоматически создаются с помощью автоматической инструментации, поэтому ручная
инструментация не требуется, чтобы извлечь пользу из трассировки.

В это руководство входят:

* **Логи**
* **Метрики**
* **Трейсы**
* **Исключения**


## Начало работы {#getting-started}

### Установка пакета инструментирования HyperDX OpenTelemetry {#install-hyperdx-opentelemetry-instrumentation-package}

Используйте следующую команду, чтобы установить [пакет ClickStack OpenTelemetry](https://www.npmjs.com/package/@hyperdx/node-opentelemetry).

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

Чтобы инициализировать SDK, необходимо вызвать функцию `init` в начале файла — точки входа вашего приложения.

<Tabs groupId="initialize">
<TabItem value="require" label="require" default>

```javascript
const HyperDX = require("@hyperdx/node-opentelemetry")

HyperDX.init({
  apiKey: "YOUR_INGESTION_API_KEY",
  service: "my-service"
})
```

</TabItem>
<TabItem value="import" label="import">

```javascript
import * as HyperDX from "@hyperdx/node-opentelemetry"

HyperDX.init({
  apiKey: "YOUR_INGESTION_API_KEY",
  service: "my-service"
})
```

</TabItem>
</Tabs>

Это позволит автоматически собирать трассировки, метрики и логи из вашего Node.js‑приложения.

### Настройка сбора логов {#setup-log-collection}

По умолчанию логи `console.*` собираются автоматически. Если вы используете логгер
вроде `winston` или `pino`, необходимо добавить в логгер транспорт,
чтобы отправлять логи в ClickStack. Если вы используете другой тип логгера,
[свяжитесь с нами](mailto:support@clickhouse.com) или изучите одну из наших платформенных
интеграций, если это применимо (например, [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes)).

<Tabs groupId="logging">
<TabItem value="Winston" label="Winston" default>

Если вы используете `winston` в качестве логгера, вам нужно добавить в него следующий транспорт.

```typescript
import winston from "winston"
import * as HyperDX from "@hyperdx/node-opentelemetry"

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    HyperDX.getWinstonTransport("info", {
      // Send logs info and above
      detectResources: true
    })
  ]
})

export default logger
```

</TabItem>
<TabItem value="Pino" label="Pino">

Если вы используете `pino` в качестве логгера, вам нужно добавить в него следующий транспорт и указать `mixin`, чтобы связывать логи с трассировками.

```typescript
import pino from "pino"
import * as HyperDX from "@hyperdx/node-opentelemetry"

const logger = pino(
  pino.transport({
    mixin: HyperDX.getPinoMixinFunction,
    targets: [
      HyperDX.getPinoTransport("info", {
        // Send logs info and above
        detectResources: true
      })
    ]
  })
)

export default logger
```

</TabItem>

<TabItem value="console.log" label="console.log">
По умолчанию методы `console.*` поддерживаются «из коробки». Дополнительная настройка не требуется.

Вы можете отключить это, установив переменную окружения `HDX_NODE_CONSOLE_CAPTURE` в значение 0 или передав `consoleCapture: false` в функцию `init`.

</TabItem>
</Tabs>

### Настройка сбора ошибок {#setup-error-collection}

SDK ClickStack может автоматически собирать необработанные исключения и ошибки в вашем приложении с полным стеком вызовов и контекстом кода.

Чтобы включить эту возможность, необходимо добавить следующий код в конец middleware обработки ошибок вашего приложения или вручную перехватывать исключения с помощью функции `recordException`.

<Tabs groupId="setup">
<TabItem value="Express" label="Express" default>

```javascript
const HyperDX = require("@hyperdx/node-opentelemetry")
HyperDX.init({
  apiKey: "YOUR_INGESTION_API_KEY",
  service: "my-service"
})
const app = express()

// Добавьте ваши маршруты и т. п.

// Добавьте это после всех маршрутов,
// но до определения любых других middleware для обработки ошибок
HyperDX.setupExpressErrorHandler(app)

app.listen(3000)
```


</TabItem>
<TabItem value="Koa" label="Koa">

```javascript
const Koa = require("koa")
const Router = require("@koa/router")
const HyperDX = require("@hyperdx/node-opentelemetry")
HyperDX.init({
  apiKey: "ВАШ_API_КЛЮЧ_ДЛЯ_ПРИЕМА_ДАННЫХ",
  service: "my-service"
})

const router = new Router()
const app = new Koa()

HyperDX.setupKoaErrorHandler(app)

// Добавьте свои маршруты и т. д.

app.listen(3030)
```

</TabItem>
<TabItem value="Manual" label="Вручную">

```javascript
const HyperDX = require("@hyperdx/node-opentelemetry")

function myErrorHandler(error, req, res, next) {
  // Можно использовать в любом месте приложения
  HyperDX.recordException(error)
}
```

</TabItem>
</Tabs>


## Устранение неполадок {#troubleshooting}

Если у вас возникли проблемы с SDK, можно включить подробное логирование, установив
переменную окружения `OTEL_LOG_LEVEL` в значение `debug`.

```shell
export OTEL_LOG_LEVEL=debug
```


## Расширенная конфигурация инструментирования {#advanced-instrumentation-configuration}

### Захват логов консоли {#capture-console-logs}

По умолчанию ClickStack SDK захватывает логи консоли. Вы можете отключить эту функцию,
установив переменную окружения `HDX_NODE_CONSOLE_CAPTURE` в значение 0.

```sh copy
export HDX_NODE_CONSOLE_CAPTURE=0
```

### Добавление информации о пользователе или метаданных {#attach-user-information-or-metadata}

Чтобы легко пометить все события, связанные с определенным атрибутом или идентификатором (например, ID пользователя
или email), вы можете вызвать функцию `setTraceAttributes`, которая пометит каждый
лог/span, связанный с текущей трассировкой после вызова, объявленными
атрибутами. Рекомендуется вызывать эту функцию как можно раньше в рамках
данного запроса/трассировки (например, как можно раньше в стеке middleware Express).

Это удобный способ гарантировать, что все логи/span автоматически помечаются
правильными идентификаторами для последующего поиска, вместо необходимости вручную
помечать и распространять идентификаторы самостоятельно.

`userId`, `userEmail`, `userName` и `teamName` заполнят интерфейс сессий
соответствующими значениями, но могут быть опущены. Любые другие дополнительные значения
могут быть указаны и использованы для поиска событий.

```typescript
import * as HyperDX from "@hyperdx/node-opentelemetry"

app.use((req, res, next) => {
  // Получение информации о пользователе из запроса...

  // Добавление информации о пользователе к текущей трассировке
  HyperDX.setTraceAttributes({
    userId,
    userEmail
  })

  next()
})
```

Убедитесь, что включен бета-режим, установив переменную окружения `HDX_NODE_BETA_MODE`
в значение 1 или передав `betaMode: true` в функцию `init` для
включения атрибутов трассировки.

```shell
export HDX_NODE_BETA_MODE=1
```

### Google Cloud Run {#google-cloud-run}

Если вы запускаете приложение на Google Cloud Run, Cloud Trace
автоматически внедряет заголовки выборки во входящие запросы, в настоящее время
ограничивая выборку трассировок до 0,1 запроса в секунду для каждого экземпляра.

Пакет `@hyperdx/node-opentelemetry` переопределяет частоту выборки на 1.0 по
умолчанию.

Чтобы изменить это поведение или настроить другие установки OpenTelemetry, вы
можете вручную настроить переменные окружения
`OTEL_TRACES_SAMPLER=parentbased_always_on` и `OTEL_TRACES_SAMPLER_ARG=1` для
достижения того же результата.

Для получения дополнительной информации и принудительной трассировки конкретных запросов обратитесь к
[документации Google Cloud Run](https://cloud.google.com/run/docs/trace).

### Автоматически инструментируемые библиотеки {#auto-instrumented-libraries}

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

Также можно автоматически инструментировать приложение без изменения кода, используя CLI `opentelemetry-instrument` или флаг `--require` Node.js. Установка через CLI обеспечивает доступ к более широкому набору автоматически инструментируемых библиотек и фреймворков.

<Tabs groupId="cli">
<TabItem value="npx" label="Использование NPX" default>

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' npx opentelemetry-instrument index.js
```

</TabItem>
<TabItem value="custom" label="Пользовательская точка входа (например, Nodemon, ts-node и т. д.)">

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' ts-node -r '@hyperdx/node-opentelemetry/build/src/tracing' index.js
```

</TabItem>

<TabItem value="code_import" label="Импорт в коде">

```javascript
// Импортируйте это в самом начале первого файла, загружаемого в приложении
// API-ключ по-прежнему указывается через переменную окружения `HYPERDX_API_KEY`
import { initSDK } from "@hyperdx/node-opentelemetry"

initSDK({
  consoleCapture: true, // опционально, по умолчанию: true
  additionalInstrumentations: [] // опционально, по умолчанию: []
})
```

</TabItem>

</Tabs>

_Переменная окружения `OTEL_SERVICE_NAME` используется для идентификации сервиса в приложении HyperDX; можно указать любое имя._

### Включение захвата исключений {#enabling-exception-capturing}

Чтобы включить захват необработанных исключений, установите переменную окружения `HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE` в значение 1.

```shell
HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE=1
```

После этого для автоматического захвата исключений из Express, Koa или для ручного перехвата исключений следуйте инструкциям в разделе [Настройка сбора ошибок](#setup-error-collection) выше.

### Автоматически инструментируемые библиотеки {#auto-instrumented-libraries-2}

Следующие библиотеки будут автоматически инструментированы (трассированы) при использовании указанных выше методов установки:


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
