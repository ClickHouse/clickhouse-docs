---
slug: /use-cases/observability/clickstack/sdks/nestjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'NestJS SDK для ClickStack - стек наблюдаемости ClickHouse'
title: 'NestJS'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'логирование', 'интеграция', 'мониторинг приложений']
---

Интеграция ClickStack с NestJS позволяет создать логгер или использовать логгер
по умолчанию для отправки логов в ClickStack (на базе [nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme)).

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

_Чтобы отправлять метрики или APM/трейсы, вам также потребуется добавить соответствующую интеграцию для выбранного языка в ваше приложение._

## Начало работы

Импортируйте `HyperDXNestLoggerModule` в корневой `AppModule` и используйте метод `forRoot()` для его конфигурации.

```javascript
import { Module } from '@nestjs/common';
import { HyperDXNestLoggerModule } from '@hyperdx/node-logger';

@Module({
  imports: [
    HyperDXNestLoggerModule.forRoot({
      apiKey: ***ВАШ_КЛЮЧ_API_ИНГЕСТИИ***,
      maxLevel: 'info',
      service: 'my-app',
    }),
  ],
})
export class AppModule {}
```

После этого экземпляр логгера winston будет доступен для внедрения во всём проекте с использованием токена для внедрения `HDX_LOGGER_MODULE_PROVIDER`:

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


### Замена логгера Nest (также для начальной загрузки)

:::note Important
Делая это, вы отказываетесь от внедрения зависимостей, а значит, `forRoot` и `forRootAsync` больше не нужны и не должны использоваться. Удалите их из вашего основного модуля.
:::

Использование внедрения зависимостей имеет один небольшой недостаток. Nest сначала должен выполнить начальную загрузку приложения (создать экземпляры модулей и провайдеров, внедрить зависимости и т. д.), и в ходе этого процесса экземпляр `HyperDXNestLogger` ещё недоступен, что означает, что Nest использует внутренний логгер.

Одно из решений — создать логгер вне жизненного цикла приложения, используя
функцию `createLogger`, и передать его в `NestFactory.create`. Затем Nest
обернёт наш кастомный логгер (тот же экземпляр, возвращаемый методом `createLogger`)
в класс Logger, перенаправляя ему все вызовы:

Создайте логгер в файле `main.ts`

```javascript
import { HyperDXNestLoggerModule } from '@hyperdx/node-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: HyperDXNestLoggerModule.createLogger({
      apiKey: ***ВАШ_API_КЛЮЧ_ДЛЯ_ИНГЕСТИИ***,
      maxLevel: 'info',
      service: 'my-app',
    })
  });
  await app.listen(3000);
}
bootstrap();
```

Измените основной модуль, чтобы он предоставлял сервис Logger:

```javascript
import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [Logger],
})
export class AppModule {}
```

Затем просто внедрите логгер, указав его тип как `Logger` из `@nestjs/common`:

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
