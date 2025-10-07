---
'slug': '/use-cases/observability/clickstack/sdks/nestjs'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 4
'description': 'NestJS SDK для ClickStack - Стек мониторинга ClickHouse'
'title': 'NestJS'
'doc_type': 'guide'
---
Интеграция ClickStack с NestJS позволяет вам создать логгер или использовать стандартный логгер для отправки логов в ClickStack (на базе [nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme)).

**Это руководство интегрирует:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Логи</td>
      <td className="pe-2">✖️ Метрики</td>
      <td className="pe-2">✖️ Трейсы</td>
    </tr>
  </tbody>
</table>

_Чтобы отправить метрики или APM/трейсы, вам нужно добавить соответствующую интеграцию языка в ваше приложение._

## Начало работы {#getting-started}

Импортируйте `HyperDXNestLoggerModule` в корневой `AppModule` и используйте метод `forRoot()`, чтобы настроить его.

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

После этого экземпляр winston будет доступен для внедрения по всему проекту с использованием токена внедрения `HDX_LOGGER_MODULE_PROVIDER`:

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

### Замена логгера Nest (также для начальной загрузки) {#replacing-the-nest-logger}

:::note Важно
Делая это, вы отказываетесь от внедрения зависимостей, что означает, что `forRoot` и `forRootAsync` не нужны и не должны использоваться. Удалите их из вашего главного модуля.
:::

Использование внедрения зависимостей имеет один небольшой недостаток. Nest сначала должен загрузить приложение (создание модулей и провайдеров, внедрение зависимостей и т.д.), и на этом этапе экземпляр `HyperDXNestLogger` еще не доступен, что означает, что Nest возвращается к внутреннему логгеру.

Одно из решений — создать логгер вне жизненного цикла приложения, используя функцию `createLogger`, и передать его в `NestFactory.create`. Nest затем обернет наш кастомный логгер (тот же экземпляр, возвращаемый методом `createLogger`) в класс Logger, переправляя все вызовы к нему:

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

Измените ваш главный модуль, чтобы предоставить сервис Logger:

```javascript
import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [Logger],
})
export class AppModule {}
```

Затем просто внедрите логгер, указав его тип как Logger из `@nestjs/common`:

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