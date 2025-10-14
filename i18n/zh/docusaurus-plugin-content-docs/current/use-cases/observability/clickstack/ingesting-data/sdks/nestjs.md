---
'slug': '/use-cases/observability/clickstack/sdks/nestjs'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 4
'description': 'NestJS SDK 用于 ClickStack - ClickHouse 可观察性栈'
'title': 'NestJS'
'doc_type': 'guide'
---

The ClickStack NestJS integration allows you to create a logger or use the default logger to send logs to ClickStack (powered by [nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme)).

**本指南集成了：**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 日志</td>
      <td className="pe-2">✖️ 指标</td>
      <td className="pe-2">✖️ 跟踪</td>
    </tr>
  </tbody>
</table>

_要发送指标或 APM/跟踪，您还需要将相应的语言集成添加到您的应用程序中。_

## 开始 {#getting-started}

将 `HyperDXNestLoggerModule` 导入根 `AppModule`，并使用 `forRoot()` 方法进行配置。

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

之后，winston 实例将可用于通过 `HDX_LOGGER_MODULE_PROVIDER` 注入令牌在整个项目中进行注入：

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

### 替换 Nest 日志记录器（引导时也适用） {#replacing-the-nest-logger}

:::note 重要
这样做后，您放弃了依赖注入，这意味着不需要使用 `forRoot` 和 `forRootAsync`，并且不应该使用它们。将它们从您的主要模块中删除。
:::

使用依赖注入有一个小缺点。Nest 必须首先引导应用程序（实例化模块和提供者，注入依赖关系等），在此过程中 `HyperDXNestLogger` 的实例尚不可用，这意味着 Nest 会回退到内部日志记录器。

一种解决方案是在应用程序生命周期之外创建日志记录器，使用 `createLogger` 函数，并将其传递给 `NestFactory.create`。Nest 将包裹我们自定义日志记录器（`createLogger` 方法返回的相同实例）到 Logger 类中，转发所有调用给它：

在 `main.ts` 文件中创建日志记录器

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

将您的主模块更改为提供 Logger 服务：

```javascript
import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [Logger],
})
export class AppModule {}
```

然后只需通过类型提示将日志记录器注入，使用 `@nestjs/common` 中的 Logger：

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
