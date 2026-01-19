---
slug: /use-cases/observability/clickstack/sdks/nestjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack 的 NestJS SDK - ClickHouse 可观测性栈'
title: 'NestJS'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

ClickStack 的 NestJS 集成允许你创建一个 logger，或使用默认的 logger，将日志发送到 ClickStack（由 [nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme) 驱动）。

**本指南集成：**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 日志</td>
      <td className="pe-2">✖️ 指标</td>
      <td className="pe-2">✖️ 链路追踪（Traces）</td>
    </tr>
  </tbody>
</table>

*若要发送指标或 APM/链路追踪（traces），你还需要为应用程序添加对应语言的集成。*

## 入门 \{#getting-started\}

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

之后，winston 实例即可在整个项目中通过注入令牌 `HDX_LOGGER_MODULE_PROVIDER` 进行注入使用：

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

### 替换 Nest 日志记录器（也适用于启动阶段） \{#replacing-the-nest-logger\}

:::note 重要
这样做会放弃使用依赖注入机制，这意味着 `forRoot` 和 `forRootAsync` 不再需要，也不应被使用。请将它们从主模块中移除。
:::

使用依赖注入有一个小小的缺点。Nest 必须先启动应用程序（实例化模块和提供者、注入依赖等），在此过程中 `HyperDXNestLogger` 实例尚不可用，这意味着 Nest 会回退到其内部日志记录器。

一种解决方案是在应用程序生命周期之外，使用 `createLogger` 函数创建日志记录器，并将其传递给 `NestFactory.create`。Nest 随后会将我们的自定义日志记录器（由 `createLogger` 方法返回的同一实例）包装进 Logger 类中，并将所有调用转发给它：

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

将主模块修改为提供 Logger 服务：

```javascript
import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [Logger],
})
export class AppModule {}
```

然后，只需通过将其类型注解为 `@nestjs/common` 提供的 Logger 来注入该 logger：

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
