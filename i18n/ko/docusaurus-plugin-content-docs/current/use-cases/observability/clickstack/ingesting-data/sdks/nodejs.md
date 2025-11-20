---
'slug': '/use-cases/observability/clickstack/sdks/nodejs'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 5
'description': 'Node.js SDK for ClickStack - ClickHouse 관측 스택'
'title': 'Node.js'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'sdk'
- 'logging'
- 'integration'
- 'application monitoring'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack은 텔레메트리 데이터(로그, 메트릭, 트레이스 및 예외)를 수집하기 위해 OpenTelemetry 표준을 사용합니다. 트레이스는 자동 기구화와 함께 자동으로 생성되므로, 트레이싱에서 가치를 얻기 위해 수동 기구화가 필요하지 않습니다.

이 가이드는 다음을 통합합니다:

- **로그**
- **메트릭**
- **트레이스**
- **예외**

## 시작하기 {#getting-started}

### HyperDX OpenTelemetry 기구화 패키지 설치 {#install-hyperdx-opentelemetry-instrumentation-package}

다음 명령을 사용하여 [ClickStack OpenTelemetry 패키지](https://www.npmjs.com/package/@hyperdx/node-opentelemetry)를 설치합니다.

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

### SDK 초기화 {#initializin-the-sdk}

SDK를 초기화하려면, 애플리케이션의 진입점 상단에서 `init` 함수를 호출해야 합니다.

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

이것은 Node.js 애플리케이션에서 트레이싱, 메트릭 및 로그를 자동으로 캡처합니다.

### 로그 수집 설정 {#setup-log-collection}

기본적으로 `console.*` 로그가 기본적으로 수집됩니다. `winston`이나 `pino`와 같은 로거를 사용하는 경우, ClickStack으로 로그를 보내기 위해 로거에 전송 수단을 추가해야 합니다. 다른 유형의 로거를 사용하는 경우, [문의](mailto:support@clickhouse.com)하거나 해당하는 플랫폼 통합을 탐색하세요(예: [Kubernetes](/use-cases/observability/clickstack/ingesting-data/kubernetes)).

<Tabs groupId="logging">
<TabItem value="Winston" label="Winston" default>

`winston`을 로거로 사용하는 경우, 다음 전송 수단을 로거에 추가해야 합니다.

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

`pino`를 로거로 사용하는 경우, 다음 전송 수단을 로거에 추가하고 로그와 트레이스를 연관시키기 위해 `mixin`을 지정해야 합니다.

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
기본적으로 `console.*` 메서드는 기본적으로 지원됩니다. 추가 구성이 필요하지 않습니다.

이를 비활성화하려면 `HDX_NODE_CONSOLE_CAPTURE` 환경 변수를 0으로 설정하거나 `init` 함수에 `consoleCapture: false`를 전달하세요.

</TabItem>
</Tabs>

### 오류 수집 설정 {#setup-error-collection}

ClickStack SDK는 애플리케이션에서 발생한 미처리 예외와 오류를 전체 스택 트레이스 및 코드 컨텍스트와 함께 자동으로 캡처할 수 있습니다.

이를 활성화하려면 애플리케이션의 오류 처리 미들웨어 끝에 다음 코드를 추가하거나 `recordException` 함수를 사용하여 수동으로 예외를 캡처해야 합니다.

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

## 문제 해결 {#troubleshooting}

SDK에 문제가 발생하는 경우, `OTEL_LOG_LEVEL` 환경 변수를 `debug`로 설정하여 자세한 로깅을 활성화할 수 있습니다.

```shell
export OTEL_LOG_LEVEL=debug
```

## 고급 기구화 구성 {#advanced-instrumentation-configuration}

### 콘솔 로그 캡처 {#capture-console-logs}

기본적으로 ClickStack SDK는 콘솔 로그를 캡처합니다. 이를 비활성화하려면 `HDX_NODE_CONSOLE_CAPTURE` 환경 변수를 0으로 설정하세요.

```sh copy
export HDX_NODE_CONSOLE_CAPTURE=0
```

### 사용자 정보 또는 메타데이터 첨부 {#attach-user-information-or-metadata}

주어진 속성 또는 식별자(예: 사용자 ID 또는 이메일)와 관련된 모든 이벤트를 쉽게 태그하기 위해 `setTraceAttributes` 함수를 호출할 수 있습니다. 이 함수는 호출 후 현재 트레이스와 관련된 모든 로그/span에 선언된 속성으로 태그를 추가합니다. 요청/트레이스 내에서 가능한 한 빨리 이 함수를 호출하는 것이 좋습니다(예: Express 미들웨어 스택에서 가능한 한 빨리).

이 방법은 모든 로그/span이 수동으로 식별자를 태그하고 전파하는 대신, 나중에 검색할 수 있도록 올바른 식별자로 자동으로 태그되는 것을 보장하는 편리한 방법입니다.

`userId`, `userEmail`, `userName`, 및 `teamName`은 해당 값으로 세션 UI를 채우지만 생략할 수 있습니다. 추가 값은 명시하여 이벤트 검색에 사용될 수 있습니다.

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

트레이스 속성을 활성화하려면 `HDX_NODE_BETA_MODE` 환경 변수를 1로 설정하거나 `init` 함수에 `betaMode: true`를 전달해야 합니다.

```shell
export HDX_NODE_BETA_MODE=1
```

### Google Cloud Run {#google-cloud-run}

Google Cloud Run에서 애플리케이션을 실행하는 경우, Cloud Trace는 수신 요청에 샘플링 헤더를 자동으로 주입하며, 현재 각 인스턴스마다 초당 0.1 요청으로 추적을 제한합니다.

기본적으로 `@hyperdx/node-opentelemetry` 패키지는 샘플링 비율을 1.0으로 덮어씁니다.

이 동작을 변경하거나 다른 OpenTelemetry 설치를 구성하려면, 환경 변수를 수동으로 설정할 수 있습니다.
`OTEL_TRACES_SAMPLER=parentbased_always_on` 및 `OTEL_TRACES_SAMPLER_ARG=1`로 동일한 결과를 얻을 수 있습니다.

자세한 내용을 알아보거나 특정 요청을 강제로 추적하려면 [Google Cloud Run 문서](https://cloud.google.com/run/docs/trace)를 참조하세요.

### 자동 기구화된 라이브러리 {#auto-instrumented-libraries}

다음 라이브러리는 SDK에 의해 자동으로 기구화(추적)됩니다:

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

## 대체 설치 {#alternative-installation}

### ClickStack OpenTelemetry CLI로 애플리케이션 실행 {#run-the-application-with-cli}

대안으로, `opentelemetry-instrument` CLI를 사용하거나 Node.js `--require` 플래그를 사용하여 코드 변경 없이 애플리케이션을 자동으로 기구화할 수 있습니다. CLI 설치는 더 광범위한 자동 기구화된 라이브러리 및 프레임워크를 노출합니다.

<Tabs groupId="cli">
<TabItem value="npx" label="NPX 사용" default>

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' npx opentelemetry-instrument index.js
```

</TabItem>
<TabItem value="custom" label="커스텀 진입점 (예: Nodemon, ts-node 등)"> 

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' ts-node -r '@hyperdx/node-opentelemetry/build/src/tracing' index.js
```

</TabItem>

<TabItem value="code_import" label="코드 가져오기">

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

_`OTEL_SERVICE_NAME` 환경 변수는 HyperDX 앱에서 서비스 식별에 사용되며, 원하시는 이름으로 설정할 수 있습니다._

### 예외 캡처 활성화 {#enabling-exception-capturing}

미처리 예외 캡처를 활성화하려면, `HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE` 환경 변수를 1로 설정해야 합니다.

```shell
HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE=1
```

그 후, Express, Koa에서 자동으로 예외를 캡처하거나 수동으로 예외를 포착하려면 위의 [오류 수집 설정](#setup-error-collection) 섹션의 지침을 따르세요.

### 자동 기구화된 라이브러리 {#auto-instrumented-libraries-2}

다음 라이브러리는 위의 설치 방법을 통해 자동으로 기구화(추적)됩니다:

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
