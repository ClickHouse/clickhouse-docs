---
slug: /use-cases/observability/clickstack/sdks/nestjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack 的 NestJS SDK - ClickHouse 可观测性技术栈'
title: 'NestJS'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

ClickStack 的 NestJS 集成允许你创建一个 logger，或使用默认
logger 将日志发送到 ClickStack（由 [nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme) 提供支持）。

**本指南集成：**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 日志</td>
      <td className="pe-2">✖️ 指标</td>
      <td className="pe-2">✖️ 链路追踪</td>
    </tr>
  </tbody>
</table>

_若要发送指标或 APM/链路追踪数据，你还需要在应用程序中添加对应语言的集成。_



## 入门指南 {#getting-started}

将 `HyperDXNestLoggerModule` 导入到根模块 `AppModule` 中,并使用 `forRoot()` 方法进行配置。

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

之后,winston 实例将可以通过 `HDX_LOGGER_MODULE_PROVIDER` 注入令牌在整个项目中使用:

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

### 替换 Nest 日志记录器(包括引导阶段) {#replacing-the-nest-logger}

:::note 重要提示
采用此方式将放弃依赖注入,这意味着不再需要使用 `forRoot` 和 `forRootAsync`,也不应该使用它们。请从主模块中移除这些方法。
:::

使用依赖注入存在一个小缺陷。Nest 需要先引导应用程序(实例化模块和提供者、注入依赖项等),而在此过程中 `HyperDXNestLogger` 实例尚未就绪,这意味着 Nest 会回退使用内部日志记录器。

一种解决方案是使用 `createLogger` 函数在应用程序生命周期之外创建日志记录器,并将其传递给 `NestFactory.create`。Nest 随后会将我们的自定义日志记录器(即 `createLogger` 方法返回的实例)包装到 Logger 类中,并将所有调用转发给它:

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

然后通过使用 `@nestjs/common` 中的 Logger 进行类型标注来注入日志记录器:

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
