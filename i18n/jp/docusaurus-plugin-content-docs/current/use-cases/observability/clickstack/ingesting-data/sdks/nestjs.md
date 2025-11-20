---
slug: /use-cases/observability/clickstack/sdks/nestjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack用NestJS SDK - ClickHouse Observabilityスタック'
title: 'NestJS'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

ClickStack NestJS統合を使用すると、カスタムロガーを作成するか、デフォルトロガーを使用してClickStackにログを送信できます([nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme)を使用)。

**本ガイドで統合される機能:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ ログ</td>
      <td className="pe-2">✖️ メトリクス</td>
      <td className="pe-2">✖️ トレース</td>
    </tr>
  </tbody>
</table>

_メトリクスやAPM/トレースを送信する場合は、対応する言語統合もアプリケーションに追加する必要があります。_



## はじめに {#getting-started}

ルートの `AppModule` に `HyperDXNestLoggerModule` をインポートし、`forRoot()` メソッドで設定します。

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

設定後、`HDX_LOGGER_MODULE_PROVIDER` インジェクショントークンを使用して、プロジェクト全体でwinstonインスタンスをインジェクトできるようになります。

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

### Nestロガーの置き換え（ブートストラップ時も含む） {#replacing-the-nest-logger}

:::note 重要
この方法を使用すると、依存性注入を使用しないことになるため、`forRoot` と `forRootAsync` は不要となり、使用すべきではありません。メインモジュールからこれらを削除してください。
:::

依存性注入の使用には1つの小さな欠点があります。Nestはまずアプリケーションをブートストラップする必要があり（モジュールとプロバイダーのインスタンス化、依存関係のインジェクションなど）、このプロセス中は `HyperDXNestLogger` のインスタンスがまだ利用できないため、Nestは内部ロガーにフォールバックします。

1つの解決策は、`createLogger` 関数を使用してアプリケーションのライフサイクル外でロガーを作成し、それを `NestFactory.create` に渡すことです。Nestはカスタムロガー（`createLogger` メソッドが返すのと同じインスタンス）をLoggerクラスでラップし、すべての呼び出しをそれに転送します。

`main.ts` ファイルでロガーを作成します

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

メインモジュールを変更してLoggerサービスを提供します。

```javascript
import { Logger, Module } from "@nestjs/common"

@Module({
  providers: [Logger]
})
export class AppModule {}
```

その後、`@nestjs/common` のLoggerで型ヒントを指定するだけで、ロガーをインジェクトできます。

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
