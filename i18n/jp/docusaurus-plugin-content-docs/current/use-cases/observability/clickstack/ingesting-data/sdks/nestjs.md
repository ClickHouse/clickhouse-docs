---
slug: /use-cases/observability/clickstack/sdks/nestjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack 向け NestJS SDK - ClickHouse Observability Stack'
title: 'NestJS'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

ClickStack 用 NestJS インテグレーションを利用すると、ロガーを新たに作成するか、デフォルトの
ロガーを使用して、ログを ClickStack に送信できます ([nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme) を利用) 。

**このガイドで扱う機能:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ ログ</td>
      <td className="pe-2">✖️ メトリクス</td>
      <td className="pe-2">✖️ トレース</td>
    </tr>
  </tbody>
</table>

*メトリクスや APM/トレースを送信するには、対応する言語向けインテグレーションをアプリケーションに追加する必要があります。*

## はじめに \{#getting-started\}

ルートとなる `AppModule` に `HyperDXNestLoggerModule` をインポートし、`forRoot()` メソッドを使用して設定します。

```javascript
import { Module } from '@nestjs/common';
import { HyperDXNestLoggerModule } from '@hyperdx/node-logger';

@Module({
  imports: [
    HyperDXNestLoggerModule.forRoot({
      url: 'http://your-otel-collector:4318',
      apiKey: ***YOUR_INGESTION_API_KEY***, // Not need for Managed ClickStack
      maxLevel: 'info',
      service: 'my-app',
    }),
  ],
})
export class AppModule {}
```

その後、`winston` インスタンスは、`HDX_LOGGER_MODULE_PROVIDER` インジェクショントークンを使って、プロジェクト全体のどこからでも DI で利用できるようになります。

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

### Nest のロガーの差し替え (ブートストラップ時も含む)  \{#replacing-the-nest-logger\}

:::note Important
これを行うと依存性注入を利用した設定はできなくなるため、`forRoot` および `forRootAsync` は不要となり、使用すべきではありません。メインモジュールからこれらを削除してください。
:::

依存性注入を利用する方法には、小さな欠点が 1 つあります。Nest はまずアプリケーションをブートストラップする必要があります (モジュールやプロバイダのインスタンス化、依存関係の注入など) 。この処理の間は `HyperDXNestLogger` のインスタンスがまだ利用可能ではないため、Nest は組み込みロガーにフォールバックします。

1 つの解決策としては、`createLogger` 関数を使ってアプリケーションのライフサイクル外でロガーを作成し、それを `NestFactory.create` に渡すことです。すると Nest は、Logger クラスの内部でカスタムロガー (`createLogger` メソッドから返される同じインスタンス) をラップし、すべての呼び出しをそのロガーに転送します。

`main.ts` ファイルでロガーを作成します

```javascript
import { HyperDXNestLoggerModule } from '@hyperdx/node-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: HyperDXNestLoggerModule.createLogger({
      url: 'http://your-otel-collector:4318',
      apiKey: ***YOUR_INGESTION_API_KEY***, // Not needed for Managed ClickStack
      maxLevel: 'info',
      service: 'my-app',
    })
  });
  await app.listen(3000);
}
bootstrap();
```

メインモジュールを変更して Logger サービスを提供するようにしてください：

```javascript
import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [Logger],
})
export class AppModule {}
```

その後、`@nestjs/common` の `Logger` 型として指定するだけで、ロガーを簡単にインジェクトできます：

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
