---
slug: /use-cases/observability/clickstack/sdks/nestjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack용 NestJS SDK - ClickHouse 관측성 스택'
title: 'NestJS'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

ClickStack NestJS 통합을 사용하면 새로운 로거를 생성하거나 기본 로거를 사용하여
로그를 ClickStack으로 전송할 수 있습니다([nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme) 기반).

**이 가이드에서 설정하는 항목:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 로그</td>
      <td className="pe-2">✖️ 메트릭</td>
      <td className="pe-2">✖️ 트레이스</td>
    </tr>
  </tbody>
</table>

*메트릭이나 APM/트레이스를 전송하려면, 애플리케이션에 해당 언어용 통합을 추가해야 합니다.*

## 시작하기 \{#getting-started\}

루트 `AppModule`에 `HyperDXNestLoggerModule`을 import한 뒤 `forRoot()`
메서드를 사용해 구성합니다.

```javascript
import { Module } from '@nestjs/common';
import { HyperDXNestLoggerModule } from '@hyperdx/node-logger';

@Module({
  imports: [
    HyperDXNestLoggerModule.forRoot({
      url: 'http://your-otel-collector:4318',
      apiKey: ***YOUR_INGESTION_API_KEY***, // Not need for Managed ClickStack
      maxLevel: 'info',
      service: 'my-app',
    }),
  ],
})
export class AppModule {}
```

이후에는 `HDX_LOGGER_MODULE_PROVIDER` 주입 토큰을 통해 프로젝트 전반에서 주입하여 사용할 수 있는 winston 인스턴스를 사용할 수 있습니다:

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

### Nest 로거 교체하기 (부트스트랩 시 사용) \{#replacing-the-nest-logger\}

:::note Important
이렇게 하면 의존성 주입 기능을 사용할 수 없게 되므로 `forRoot` 및 `forRootAsync` 가 더 이상 필요하지 않으며 사용해서는 안 됩니다. 메인 모듈에서 제거하십시오.
:::

의존성 주입을 사용하면 사소한 단점이 하나 있습니다. Nest는 먼저 애플리케이션을 부트스트랩해야 합니다(모듈과 프로바이더를 인스턴스화하고, 의존성을 주입하는 등). 이 과정에서 `HyperDXNestLogger` 인스턴스는 아직
사용할 수 없으므로 Nest는 내부 로거로 되돌아가게 됩니다.

한 가지 해결책은 애플리케이션 라이프사이클 바깥에서 `createLogger` 함수를 사용해 로거를 생성하고,
이를 `NestFactory.create` 에 전달하는 것입니다. 그러면 Nest는 Logger 클래스로 해당 커스텀 로거
(`createLogger` 메서드가 반환한 동일한 인스턴스)를 감싸 모든 호출을 그 로거로 전달합니다:

`main.ts` 파일에서 로거를 생성하십시오

```javascript
import { HyperDXNestLoggerModule } from '@hyperdx/node-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: HyperDXNestLoggerModule.createLogger({
      url: 'http://your-otel-collector:4318',
      apiKey: ***YOUR_INGESTION_API_KEY***, // Not needed for Managed ClickStack
      maxLevel: 'info',
      service: 'my-app',
    })
  });
  await app.listen(3000);
}
bootstrap();
```

메인 모듈을 수정하여 Logger 서비스를 제공하게 합니다:

```javascript
import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [Logger],
})
export class AppModule {}
```

그런 다음 `@nestjs/common`의 Logger를 타입 힌트로 지정하여 로거를 간단히 주입합니다.

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
