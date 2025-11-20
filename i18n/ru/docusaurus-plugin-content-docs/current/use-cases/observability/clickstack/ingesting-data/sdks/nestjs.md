---
slug: /use-cases/observability/clickstack/sdks/nestjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'SDK NestJS для ClickStack — стека наблюдаемости ClickHouse'
title: 'NestJS'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

Интеграция ClickStack с NestJS позволяет создать собственный логгер или использовать логгер по умолчанию
для отправки логов в ClickStack (на базе [nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme)).

**В этом руководстве интегрируются:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Логи</td>
      <td className="pe-2">✖️ Метрики</td>
      <td className="pe-2">✖️ Трейсы</td>
    </tr>
  </tbody>
</table>

_Чтобы отправлять метрики или APM/трейсы, вам также нужно добавить в приложение соответствующую языковую интеграцию._



## Начало работы {#getting-started}

Импортируйте `HyperDXNestLoggerModule` в корневой модуль `AppModule` и используйте метод `forRoot()` для его настройки.

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

После этого экземпляр winston станет доступен для внедрения во всём проекте с помощью токена внедрения `HDX_LOGGER_MODULE_PROVIDER`:

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

### Замена логгера Nest (в том числе для инициализации) {#replacing-the-nest-logger}

:::note Важно
При таком подходе вы отказываетесь от внедрения зависимостей, что означает, что методы `forRoot` и `forRootAsync` не требуются и не должны использоваться. Удалите их из главного модуля.
:::

Использование внедрения зависимостей имеет один небольшой недостаток. Nest должен сначала инициализировать приложение (создать экземпляры модулей и провайдеров, внедрить зависимости и т. д.), и в процессе этого экземпляр `HyperDXNestLogger` ещё недоступен, что означает, что Nest использует встроенный логгер.

Одно из решений — создать логгер вне жизненного цикла приложения с помощью функции `createLogger` и передать его в `NestFactory.create`. Nest обернёт наш пользовательский логгер (тот же экземпляр, возвращаемый методом `createLogger`) в класс Logger, перенаправляя все вызовы к нему:

Создайте логгер в файле `main.ts`

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

Измените главный модуль, чтобы предоставить сервис Logger:

```javascript
import { Logger, Module } from "@nestjs/common"

@Module({
  providers: [Logger]
})
export class AppModule {}
```

Затем внедрите логгер, просто указав его тип Logger из `@nestjs/common`:

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
