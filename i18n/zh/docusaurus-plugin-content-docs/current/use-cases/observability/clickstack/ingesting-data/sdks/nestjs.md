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

ClickStack 的 NestJS 集成允许你创建一个 logger，或使用默认 logger，将日志发送到 ClickStack（基于 [nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme) 实现）。

**本指南集成了：**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 日志</td>
      <td className="pe-2">✖️ 指标</td>
      <td className="pe-2">✖️ 链路追踪</td>
    </tr>
  </tbody>
</table>

_如果需要发送指标或 APM/链路追踪数据，你还需要在应用中添加对应语言的集成。_



## 入门

在根 `AppModule` 中导入 `HyperDXNestLoggerModule`，并使用 `forRoot()` 方法进行配置。

```javascript
import { Module } from '@nestjs/common';
import { HyperDXNestLoggerModule } from '@hyperdx/node-logger';

@Module({
  imports: [
    HyperDXNestLoggerModule.forRoot({
      apiKey: ***您的摄取 API 密钥***,
      maxLevel: 'info',
      service: '我的应用',
    }),
  ],
})
export class AppModule {}
```

之后，就可以在整个项目中通过 `HDX_LOGGER_MODULE_PROVIDER` 注入令牌来注入该 winston 实例：

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

### 替换 Nest 日志记录器（也适用于应用启动）

:::note Important
这样做会放弃对依赖注入的使用，这意味着不再需要、也不应再使用 `forRoot` 和 `forRootAsync`。请从主模块中将它们移除。
:::

使用依赖注入有一个小缺点。Nest 必须先完成应用程序的启动引导（实例化模块和 provider、注入依赖等），在此过程中 `HyperDXNestLogger` 的实例尚不可用，这意味着 Nest 会退回使用其内部日志记录器。

一种解决方案是在应用程序生命周期之外，使用 `createLogger` 函数创建日志记录器，并将其传递给 `NestFactory.create`。Nest 随后会将我们的自定义日志记录器（由 `createLogger` 方法返回的同一个实例）封装到 Logger 类中，并将所有调用转发给它：

在 `main.ts` 文件中创建日志记录器

```javascript
import { HyperDXNestLoggerModule } from '@hyperdx/node-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: HyperDXNestLoggerModule.createLogger({
      apiKey: ***您的摄取 API 密钥***,
      maxLevel: 'info',
      service: 'my-app',
    })
  });
  await app.listen(3000);
}
bootstrap();
```

修改主模块，使其提供 Logger 服务：

```javascript
import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [Logger],
})
export class AppModule {}
```

然后只需将其类型标注为来自 `@nestjs/common` 的 Logger，即可完成注入：

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
