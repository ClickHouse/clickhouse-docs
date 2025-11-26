---
slug: /use-cases/observability/clickstack/sdks/nestjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack 用 NestJS SDK - ClickHouse Observability スタック'
title: 'NestJS'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'ログ', '連携', 'アプリケーション監視']
---

ClickStack 向け NestJS 連携を使用すると、ロガーを作成するか、デフォルトのロガーを使用して、ログを ClickStack（[nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme) を利用）に送信できます。

**このガイドで扱う内容:**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ ログ</td>
      <td className="pe-2">✖️ メトリクス</td>
      <td className="pe-2">✖️ トレース</td>
    </tr>
  </tbody>
</table>

_メトリクスや APM/トレースを送信するには、対応する言語用インテグレーションをアプリケーションに追加する必要があります。_



## はじめに

ルートの `AppModule` に `HyperDXNestLoggerModule` をインポートし、`forRoot()` メソッドで設定を行います。

```javascript
import { Module } from '@nestjs/common';
import { HyperDXNestLoggerModule } from '@hyperdx/node-logger';

@Module({
  imports: [
    HyperDXNestLoggerModule.forRoot({
      apiKey: ***インジェストAPIキー***,
      maxLevel: 'info',
      service: 'my-app',
    }),
  ],
})
export class AppModule {}
```

その後、`HDX_LOGGER_MODULE_PROVIDER` インジェクショントークンを使用して、winston のインスタンスをプロジェクト全体の任意の場所にインジェクトできるようになります。

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

### Nest logger の置き換え（ブートストラップ時にも有効）

:::note Important
これを行うと依存性注入を使わなくなるため、`forRoot` と `forRootAsync` は不要となり、使用すべきではありません。メインモジュールから削除してください。
:::

依存性注入を使用する場合には、1 つ小さな欠点があります。Nest はまずアプリケーションをブートストラップする必要があり（モジュールとプロバイダのインスタンス化、依存性の注入など）、この処理の間は `HyperDXNestLogger` のインスタンスがまだ利用できません。つまり、その間は Nest は内部ロガーにフォールバックします。

この問題の 1 つの解決策は、アプリケーションライフサイクルの外側で `createLogger` 関数を使ってロガーを作成し、それを `NestFactory.create` に渡すことです。Nest はその後、カスタムロガー（`createLogger` メソッドから返される同じインスタンス）を Logger クラスでラップし、すべての呼び出しをそのロガーに転送します。

`main.ts` ファイルでロガーを作成する

```javascript
import { HyperDXNestLoggerModule } from '@hyperdx/node-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: HyperDXNestLoggerModule.createLogger({
      apiKey: ***インジェストAPIキー***,
      maxLevel: 'info',
      service: 'my-app',
    })
  });
  await app.listen(3000);
}
bootstrap();
```

メインモジュールを変更して Logger サービスを提供するようにします。

```javascript
import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [Logger],
})
export class AppModule {}
```

次に、`@nestjs/common` の `Logger` を型ヒントとして指定するだけで、ロガーを簡単にインジェクトできます。

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
