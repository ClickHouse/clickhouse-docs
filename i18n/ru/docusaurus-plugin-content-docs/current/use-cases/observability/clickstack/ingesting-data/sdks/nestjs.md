---
slug: /use-cases/observability/clickstack/sdks/nestjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'NestJS SDK для ClickStack — стек наблюдаемости ClickHouse'
title: 'NestJS'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'логирование', 'интеграция', 'мониторинг приложений']
---

Интеграция NestJS с ClickStack позволяет создать логгер или использовать логгер по умолчанию для отправки логов в ClickStack (на базе [nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme)).

**В этом руководстве настраивается интеграция для:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Логи</td>
      <td className="pe-2">✖️ Метрики</td>
      <td className="pe-2">✖️ Трейсы</td>
    </tr>
  </tbody>
</table>

_Чтобы также отправлять метрики или APM/трейсы, вам нужно добавить в приложение соответствующую языковую интеграцию._



## Начало работы

Импортируйте `HyperDXNestLoggerModule` в корневой `AppModule` и используйте метод `forRoot()`
для его конфигурации.

```javascript
import { Module } from '@nestjs/common';
import { HyperDXNestLoggerModule } from '@hyperdx/node-logger';

@Module({
  imports: [
    HyperDXNestLoggerModule.forRoot({
      apiKey: ***ВАШ_API_КЛЮЧ_ИНГЕСТИИ***,
      maxLevel: 'info',
      service: 'my-app',
    }),
  ],
})
export class AppModule {}
```

После этого экземпляр winston будет доступен для внедрения во всём проекте с использованием токена внедрения `HDX_LOGGER_MODULE_PROVIDER`:

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

### Замена логгера Nest (также для bootstrap-процесса)

:::note Важно
При таком подходе вы отказываетесь от механизма внедрения зависимостей (dependency injection), что означает, что `forRoot` и `forRootAsync` не нужны и не должны использоваться. Удалите их из вашего основного модуля.
:::

Использование dependency injection имеет один небольшой недостаток. Nest должен сначала выполнить bootstrap-процесс приложения (создать экземпляры модулей и провайдеров, внедрить зависимости и т. д.), и в ходе этого процесса экземпляр `HyperDXNestLogger` ещё недоступен, что означает, что Nest возвращается к использованию внутреннего логгера.

Одно из решений — создать логгер за пределами жизненного цикла приложения с помощью функции `createLogger` и передать его в `NestFactory.create`. Затем Nest обернёт наш кастомный логгер (тот же самый экземпляр, возвращённый методом `createLogger`) в класс Logger, перенаправляя ему все вызовы:

Создайте логгер в файле `main.ts`

```javascript
import { HyperDXNestLoggerModule } from '@hyperdx/node-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: HyperDXNestLoggerModule.createLogger({
      apiKey: ***ВАШ_API_КЛЮЧ_ИНГЕСТИИ***,
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

Затем просто внедрите логгер, указав тип Logger из `@nestjs/common` в объявлении параметра:

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
