---
slug: /use-cases/observability/clickstack/sdks/nestjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: '用于 ClickStack 的 NestJS SDK - ClickHouse 可观测性技术栈'
title: 'NestJS'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

ClickStack 的 NestJS 集成允许创建一个日志记录器，或使用默认日志记录器将日志发送到 ClickStack（由 [nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme) 提供支持）。

**本指南集成：**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 日志</td>
      <td className="pe-2">✖️ 指标</td>
      <td className="pe-2">✖️ 追踪</td>
    </tr>
  </tbody>
</table>

_若要发送指标或 APM/追踪，还需要在应用程序中添加相应的语言集成。_



## 入门指南 {#getting-started}

将 `HyperDXNestLoggerModule` 导入根 `AppModule` 并使用 `forRoot()` 方法进行配置。

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

之后,可以使用 `HDX_LOGGER_MODULE_PROVIDER` 注入令牌在整个项目中注入 winston 实例:

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

### 替换 Nest 日志记录器(也适用于启动过程) {#replacing-the-nest-logger}

:::note 重要提示
这样做将放弃依赖注入,这意味着不需要也不应使用 `forRoot` 和 `forRootAsync`。请从主模块中移除它们。
:::

使用依赖注入有一个小缺点。Nest 必须先启动应用程序(实例化模块和提供者、注入依赖项等),而在此过程中 `HyperDXNestLogger` 实例尚不可用,这意味着 Nest 会回退到内部日志记录器。

一种解决方案是使用 `createLogger` 函数在应用程序生命周期之外创建日志记录器,并将其传递给 `NestFactory.create`。然后 Nest 会将我们的自定义日志记录器(即 `createLogger` 方法返回的实例)包装到 Logger 类中,并将所有调用转发给它:

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

修改主模块以提供 Logger 服务:

```javascript
import { Logger, Module } from "@nestjs/common"

@Module({
  providers: [Logger]
})
export class AppModule {}
```

然后通过使用 `@nestjs/common` 中的 Logger 进行类型提示来注入日志记录器:

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
