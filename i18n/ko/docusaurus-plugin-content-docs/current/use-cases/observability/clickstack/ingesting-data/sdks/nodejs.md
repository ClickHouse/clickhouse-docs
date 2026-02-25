---
slug: /use-cases/observability/clickstack/sdks/nodejs
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'ClickStack용 Node.js SDK - ClickHouse 관측성 스택'
title: 'Node.js'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', '로깅', '통합', '애플리케이션 모니터링']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack는 텔레메트리 데이터(로그, 메트릭, 트레이스, 예외)를 수집하는 데 OpenTelemetry 표준을 사용합니다. 트레이스는 자동 계측(automatic instrumentation)을 통해 자동으로 생성되므로, 트레이싱을 활용하기 위해 별도의 수동 계측이 필요하지 않습니다.

이 가이드에서는 다음을 통합합니다.

* **로그**
* **메트릭**
* **트레이스**
* **예외**


## 시작하기 \{#getting-started\}

### HyperDX OpenTelemetry 계측 패키지 설치 \{#install-hyperdx-opentelemetry-instrumentation-package\}

다음 명령으로 [ClickStack OpenTelemetry 패키지](https://www.npmjs.com/package/@hyperdx/node-opentelemetry)를 설치하십시오.

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

### SDK 초기화 \{#initializin-the-sdk\}

SDK를 초기화하려면 애플리케이션의 엔트리 포인트 최상단에서 `init` 함수를 호출해야 합니다.

<Tabs groupId="initialize">
<TabItem value="require" label="require" default>

```javascript
const HyperDX = require('@hyperdx/node-opentelemetry');

HyperDX.init({
    url: 'http://your-otel-collector:4318',
    apiKey: 'YOUR_INGESTION_API_KEY', // Managed ClickStack의 경우 생략
    service: 'my-service'
});
```

</TabItem>
<TabItem value="import" label="import">

```javascript
import * as HyperDX from '@hyperdx/node-opentelemetry';

HyperDX.init({
    url: 'http://your-otel-collector:4318',
    apiKey: 'YOUR_INGESTION_API_KEY', // Managed ClickStack의 경우 생략
    service: 'my-service'
});
```

</TabItem>
</Tabs>

이렇게 하면 Node.js 애플리케이션에서 트레이스, 메트릭, 로그가 자동으로 수집됩니다.

### 로그 수집 설정 \{#setup-log-collection\}

기본적으로 `console.*` 로그는 자동으로 수집됩니다. `winston` 또는 `pino`와 같은 로거를 사용하는 경우, 로그를 ClickStack으로 전송하기 위해 로거에 transport를 추가해야 합니다. 다른 유형의 로거를 사용하는 경우,
[지원팀에 문의](mailto:support@clickhouse.com)하거나, (예: [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes))와 같은 관련 플랫폼 통합 기능을 확인하십시오.

<Tabs groupId="logging">
<TabItem value="Winston" label="Winston" default>

로거로 `winston`을 사용하는 경우, 아래 transport를 로거에 추가해야 합니다.

```typescript
    import winston from 'winston';
    import * as HyperDX from '@hyperdx/node-opentelemetry';

    const logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console(),
        HyperDX.getWinstonTransport('info', { // info 이상의 로그를 전송
          detectResources: true,
        }),
      ],
    });

    export default logger;
```

</TabItem>
<TabItem value="Pino" label="Pino">

로거로 `pino`를 사용하는 경우, 아래 transport를 로거에 추가하고, 로그를 트레이스와 연관시키기 위해 `mixin`을 지정해야 합니다.

```typescript
import pino from 'pino';
import * as HyperDX from '@hyperdx/node-opentelemetry';

const logger = pino(
    pino.transport({
    mixin: HyperDX.getPinoMixinFunction,
    targets: [
        HyperDX.getPinoTransport('info', { // info 이상의 로그를 전송
        detectResources: true,
        }),
    ],
    }),
);

export default logger;
```

</TabItem>

<TabItem value="console.log" label="console.log">
기본적으로 `console.*` 메서드는 별도 설정 없이 바로 지원됩니다. 추가적인 구성은 필요하지 않습니다. 

이 기능을 비활성화하려면 `HDX_NODE_CONSOLE_CAPTURE` 환경 변수를 0으로 설정하거나, `init` 함수에 `consoleCapture: false`를 전달하면 됩니다.

</TabItem>
</Tabs>

### 오류 수집 설정 \{#setup-error-collection\}

ClickStack SDK는 애플리케이션에서 처리되지 않은 예외와 오류를 전체 스택 트레이스와 코드 컨텍스트 정보와 함께 자동으로 캡처합니다. 

이를 활성화하려면 애플리케이션의 오류 처리 미들웨어 마지막에 다음 코드를 추가하거나, `recordException` 함수를 사용하여 예외를 수동으로 캡처하면 됩니다.

<Tabs groupId="setup">
<TabItem value="Express" label="Express" default>

```javascript 
const HyperDX = require('@hyperdx/node-opentelemetry');
HyperDX.init({
    url: 'http://your-otel-collector:4318',
    apiKey: 'YOUR_INGESTION_API_KEY', // Managed ClickStack를 사용하는 경우 생략합니다
    service: 'my-service'
});
const app = express();

// 라우트 등을 추가합니다.

// 모든 라우트 이후에 추가하되,
// 다른 오류 처리 미들웨어가 정의되기 전에 추가합니다
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
    url: 'http://your-otel-collector:4318',
    apiKey: 'YOUR_INGESTION_API_KEY', // Managed ClickStack를 사용하는 경우 생략합니다
    service: 'my-service'
});

const router = new Router();
const app = new Koa();

HyperDX.setupKoaErrorHandler(app);

// 라우트 등을 추가합니다.

app.listen(3030);
```

</TabItem>
<TabItem value="Manual" label="Manual">

```javascript
const HyperDX = require('@hyperdx/node-opentelemetry');

function myErrorHandler(error, req, res, next) {
    // 애플리케이션 어디에서나 사용할 수 있습니다
    HyperDX.recordException(error);
}
```

</TabItem>
</Tabs>

## 문제 해결 \{#troubleshooting\}

SDK 사용 중 문제가 발생하면 `OTEL_LOG_LEVEL` 환경 변수를 `debug`로 설정하여 상세 로그 출력을 활성화할 수 있습니다.

```shell
export OTEL_LOG_LEVEL=debug
```


## 고급 계측 설정 \{#advanced-instrumentation-configuration\}

### 콘솔 로그 캡처 \{#capture-console-logs\}

기본 설정으로 ClickStack SDK는 콘솔 로그를 캡처합니다. 이를 비활성화하려면
`HDX_NODE_CONSOLE_CAPTURE` 환경 변수를 0으로 설정하십시오.

```sh copy
export HDX_NODE_CONSOLE_CAPTURE=0
```


### 사용자 정보 또는 메타데이터 연결하기 \{#attach-user-information-or-metadata\}

특정 속성이나 식별자(예: user id 또는 email)와 관련된 모든 이벤트에 쉽게 태그를 추가하기 위해 `setTraceAttributes` 함수를 호출할 수 있습니다. 이 함수를 호출하면, 이후 현재 trace와 연결된 모든 log/span에 지정한 attributes가 태그로 추가됩니다. 이 함수는 특정 요청/trace 안에서 가능한 한 이른 시점(예: Express middleware stack에서 가능한 한 앞단)에서 호출하는 것이 좋습니다.

이 방법을 사용하면, 식별자를 직접 태그하고 전파할 필요 없이 나중에 검색에 사용할 적절한 식별자로 모든 log/span이 자동으로 태그되도록 보장할 수 있습니다.

`userId`, `userEmail`, `userName`, `teamName` 값은 세션 UI에 해당 값으로 표시되지만, 반드시 포함할 필요는 없습니다. 그 외 다른 추가 값도 지정할 수 있으며, 이벤트를 검색하는 데 사용할 수 있습니다.

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

`HDX_NODE_BETA_MODE` 환경 변수를 1로 설정하거나 `init` 함수에 `betaMode: true`를 전달하여 베타 모드를 활성화해 trace 속성을 사용할 수 있도록 합니다.

```shell
export HDX_NODE_BETA_MODE=1
```


### Google Cloud Run \{#google-cloud-run\}

애플리케이션을 Google Cloud Run에서 실행하는 경우 Cloud Trace는
각 인스턴스당 초당 0.1개의 요청만 샘플링되도록 추적을 제한하면서
들어오는 요청에 샘플링 헤더를 자동으로 주입합니다.

`@hyperdx/node-opentelemetry` 패키지는 기본적으로 샘플링 비율을 1.0으로
덮어씁니다.

이 동작을 변경하거나 다른 OpenTelemetry 설치를 구성하려면
`OTEL_TRACES_SAMPLER=parentbased_always_on` 및 `OTEL_TRACES_SAMPLER_ARG=1`
환경 변수를 수동으로 설정하여 동일한 결과를 얻을 수 있습니다.

자세한 내용과 특정 요청에 대해 강제로 트레이싱을 수행하는 방법은
[Google Cloud Run 문서](https://cloud.google.com/run/docs/trace)를 참조하십시오.

### 자동 계측 라이브러리 \{#auto-instrumented-libraries\}

다음 라이브러리는 SDK에서 자동으로 계측(트레이싱)합니다.

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

## 대체 설치 방법 \{#alternative-installation\}

### ClickStack OpenTelemetry CLI로 애플리케이션 실행하기 \{#run-the-application-with-cli\}

또는 `opentelemetry-instrument` CLI를 사용하거나 Node.js `--require` 플래그를 사용하여 코드 변경 없이 애플리케이션을 자동 계측할 수 있습니다. CLI를 사용하면 더 다양한 자동 계측 라이브러리와 프레임워크를 활용할 수 있습니다.

<Tabs groupId="cli">
<TabItem value="npx" label="NPX 사용" default>

:::note Managed ClickStack
Managed ClickStack에서는 `HYPERDX_API_KEY`를 생략할 수 있습니다.
:::

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' npx opentelemetry-instrument index.js
```

</TabItem>
<TabItem value="custom" label="사용자 정의 엔트리 포인트(예: Nodemon, ts-node 등)">

:::note Managed ClickStack
Managed ClickStack에서는 `HYPERDX_API_KEY`를 생략할 수 있습니다.
:::

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' ts-node -r '@hyperdx/node-opentelemetry/build/src/tracing' index.js
```

</TabItem>

<TabItem value="code_import" label="코드 임포트">

```javascript 
// 애플리케이션에서 가장 먼저 로드되는 첫 번째 파일의 최상단에 이 코드를 임포트합니다.
// `HYPERDX_API_KEY` 환경 변수를 통해 계속 API 키를 지정합니다.
import { initSDK } from '@hyperdx/node-opentelemetry';

initSDK({
    consoleCapture: true, // 선택 사항, 기본값: true
    additionalInstrumentations: [], // 선택 사항, 기본값: []
});
```

</TabItem>

</Tabs>

_`OTEL_SERVICE_NAME` 환경 변수는 HyperDX 앱에서 서비스를 식별하는 데 사용되며, 원하는 이름을 자유롭게 사용할 수 있습니다._

### 예외 캡처 활성화 \{#enabling-exception-capturing\}

처리되지 않은 예외를 캡처하도록 설정하려면 `HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE` 환경 변수 값을 1로 설정합니다.

```shell
HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE=1
```

그 후에는 Express, Koa에서 예외를 자동으로 수집하거나 예외를 수동으로 처리하려면 위의 [오류 수집 설정](#setup-error-collection) 섹션의 지침을 따르십시오.


### 자동 계측 라이브러리 \{#auto-instrumented-libraries-2\}

다음 라이브러리는 위의 방법으로 설치하면 자동으로 계측(트레이스 수집)이 수행됩니다.

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