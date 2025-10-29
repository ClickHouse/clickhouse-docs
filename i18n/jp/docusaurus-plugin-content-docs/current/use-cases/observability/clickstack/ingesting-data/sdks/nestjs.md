---
'slug': '/use-cases/observability/clickstack/sdks/nestjs'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 4
'description': 'NestJS SDK for ClickStack - ClickHouse 可观察性栈'
'title': 'NestJS'
'doc_type': 'guide'
---

The ClickStack NestJS統合により、ロガーを作成するか、デフォルトのロガーを使用してClickStackにログを送信できます（[nest-winston](https://www.npmjs.com/package/nest-winston?activeTab=readme)により提供されています）。

**このガイドでは以下を統合します：**

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ ログ</td>
      <td className="pe-2">✖️ メトリクス</td>
      <td className="pe-2">✖️ トレース</td>
    </tr>
  </tbody>
</table>

_メトリクスやAPM/トレースを送信するには、対応する言語統合をアプリケーションに追加する必要があります。_

## 始めに {#getting-started}

`HyperDXNestLoggerModule`をルートの`AppModule`にインポートし、`forRoot()`メソッドを使用して構成します。

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

その後、winstonインスタンスは、プロジェクト全体で`HDX_LOGGER_MODULE_PROVIDER`インジェクショントークンを使用して注入できるようになります：

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

### Nestロガーの置き換え（ブートストラッピング用にも） {#replacing-the-nest-logger}

:::note 重要
これを行うことで、依存性注入を放棄することになります。つまり、`forRoot`および`forRootAsync`は必要なく、使用すべきではありません。メインモジュールからそれらを削除してください。
:::

依存性注入を使用することには一つの小さな欠点があります。Nestはまずアプリケーションをブートストラップする必要があります（モジュールやプロバイダーをインスタンス化し、依存関係を注入など）が、このプロセス中に`HyperDXNestLogger`のインスタンスはまだ利用できず、Nestは内部ロガーにフォールバックします。

1つの解決策は、アプリケーションライフサイクルの外側でロガーを作成し、`createLogger`関数を使用してこれを`NestFactory.create`に渡すことです。Nestは私たちのカスタムロガー（`createLogger`メソッドによって返される同じインスタンス）をLoggerクラスにラップし、すべての呼び出しをそれにフォワードします：

`main.ts`ファイルでロガーを作成します

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

メインモジュールを変更してLoggerサービスを提供します：

```javascript
import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [Logger],
})
export class AppModule {}
```

その後、`@nestjs/common`からのLoggerで型ヒントを付けて単純にロガーを注入します：

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
