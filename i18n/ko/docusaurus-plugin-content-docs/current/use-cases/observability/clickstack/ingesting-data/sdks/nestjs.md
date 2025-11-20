---
'slug': '/use-cases/observability/clickstack/sdks/nestjs'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 4
'description': 'NestJS SDK for ClickStack - ClickHouse 관찰 가능성 스택'
'title': 'NestJS'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'sdk'
- 'logging'
- 'integration'
- 'application monitoring'
---

The ClickStack NestJS 통합은 로거를 생성하거나 기본 로거를 사용하여 ClickStack에 로그를 전송할 수 있게 해줍니다 (powered by [nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme)).

**이 가이드 통합:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 로그</td>
      <td className="pe-2">✖️ 메트릭</td>
      <td className="pe-2">✖️ 추적</td>
    </tr>
  </tbody>
</table>

_메트릭 또는 APM/추적을 전송하려면 응용 프로그램에 해당 언어 통합을 추가해야 합니다._

## 시작하기 {#getting-started}

`HyperDXNestLoggerModule`을 루트 `AppModule`에 가져오고 `forRoot()` 메서드를 사용하여 구성하십시오.

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

이후 winston 인스턴스는 `HDX_LOGGER_MODULE_PROVIDER` 주입 토큰을 사용하여 전체 프로젝트에서 주입할 수 있습니다:

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

### Nest 로거 교체 (부트스트랩에도 적용) {#replacing-the-nest-logger}

:::note 중요
이렇게 하면 의존성 주입을 포기하게 되므로 `forRoot` 및 `forRootAsync`는 필요하지 않으며 사용해서는 안 됩니다. 이들을 주 모듈에서 제거하십시오.
:::

의존성 주입을 사용하는 것은 한 가지 작은 단점이 있습니다. Nest는 우선 애플리케이션을 부트스트랩해야 하며 (모듈 및 제공자 인스턴스화, 의존성 주입 등), 이 과정에서 `HyperDXNestLogger` 인스턴스는 아직 사용할 수 없으므로 Nest는 내부 로거로 되돌아갑니다.

한 가지 해결 방법은 애플리케이션 생명주기 밖에서 `createLogger` 함수를 사용하여 로거를 생성하고 이를 `NestFactory.create`에 전달하는 것입니다. 그러면 Nest는 사용자 지정 로거( `createLogger` 메서드에 의해 반환된 동일한 인스턴스)를 Logger 클래스에 감싸고 모든 호출을 해당 로거로 전달합니다:

`main.ts` 파일에서 로거를 생성하십시오

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

주 모듈을 변경하여 Logger 서비스를 제공하십시오:

```javascript
import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [Logger],
})
export class AppModule {}
```

그런 다음 `@nestjs/common`의 Logger로 타입 힌트를 주어 간단히 로거를 주입하십시오:

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
