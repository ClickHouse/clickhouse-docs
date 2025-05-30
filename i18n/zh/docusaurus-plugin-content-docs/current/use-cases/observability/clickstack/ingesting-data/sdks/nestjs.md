---
'slug': '/use-cases/observability/clickstack/sdks/nestjs'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 4
'description': 'NestJS SDK 用于 ClickStack - ClickHouse 可观测性堆栈'
'title': 'NestJS'
---

The ClickStack NestJS 集成允许您创建一个日志记录器或使用默认日志记录器将日志发送到 ClickStack（由 [nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme) 提供支持）。

**本指南集成：**

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

## 开始使用 {#getting-started}

将 `HyperDXNestLoggerModule` 导入根 `AppModule` 并使用 `forRoot()` 方法进行配置。

```js
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

之后，winston 实例将可以通过 `HDX_LOGGER_MODULE_PROVIDER` 注入令牌在整个项目中注入：

```js
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

### 替换 Nest 日志记录器（也用于引导） {#replacing-the-nest-logger}

:::note 重要
这样做会放弃依赖注入，这意味着不再需要使用 `forRoot` 和 `forRootAsync`。请将它们从您的主模块中移除。
:::

使用依赖注入有一个小缺点。Nest 必须首先引导应用程序（实例化模块和提供者，注入依赖项等），在此过程中 `HyperDXNestLogger` 的实例尚不可用，这意味着 Nest 会退回到内部日志记录器。

解决方案是使用 `createLogger` 函数在应用程序生命周期之外创建日志记录器，并将其传递给 `NestFactory.create`。然后 Nest 会将我们的自定义日志记录器（`createLogger` 方法返回的相同实例）包装到 Logger 类中，并将所有调用转发给它：

在 `main.ts` 文件中创建日志记录器

```js
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

修改您的主模块以提供 Logger 服务：

```js
import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [Logger],
})
export class AppModule {}
```

然后通过使用 `@nestjs/common` 中的 Logger 进行类型提示，简单地注入日志记录器：

```js
import { Controller, Logger } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  constructor(private readonly logger: Logger) {}

  meow() {
    this.logger.log({ message: '🐱' });
  }
}
```
