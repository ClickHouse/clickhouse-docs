---
'slug': '/use-cases/observability/clickstack/sdks'
'pagination_prev': null
'pagination_next': null
'description': '言語SDKはClickStackのための - ClickHouseの可観測性スタック'
'title': '言語SDK'
'doc_type': 'guide'
---

データは通常、**OpenTelemetry (OTel) コレクター**を介して ClickStack に送信されます。これは、言語 SDK から直接、またはインフラストラクチャメトリックやログを収集するエージェントとして機能する中間の OpenTelemetry コレクターを通じて行われます。

言語 SDK は、アプリケーション内からテレメトリを収集する責任があります。特に、**トレース**と**ログ**を収集し、OTLP エンドポイントを介して OpenTelemetry コレクターにエクスポートし、ClickHouse への取り込みを処理します。

ブラウザベースの環境では、SDK は、ユーザーセッションのリプレイを可能にするために、UI イベント、クリック、ナビゲーションを含む**セッションデータ**を収集する責任もあります。

## 仕組み {#how-it-works}

1. アプリケーションは ClickStack SDK（例：Node.js、Python、Go）を使用します。これらの SDK は、拡張された機能と使いやすさの向上を備えた OpenTelemetry SDK に基づいています。
2. SDK は OTLP（HTTP または gRPC）を介してトレースとログを収集し、エクスポートします。
3. OpenTelemetry コレクターはテレメトリを受信し、構成されたエクスポーターを介して ClickHouse に書き込みます。

## 対応言語 {#supported-languages}

:::note OpenTelemetry 互換性
ClickStack は、拡張されたテレメトリと機能を持つ独自の言語 SDK を提供していますが、既存の OpenTelemetry SDK をシームレスに使用することもできます。
:::

<br/>

| 言語         | 説明                                   | リンク                                                                   |
|--------------|----------------------------------------|-------------------------------------------------------------------------|
| AWS Lambda   | AWS Lambda 関数の計測               | [ドキュメント](/use-cases/observability/clickstack/sdks/aws_lambda)    |
| ブラウザ     | ブラウザベースのアプリケーション用の JavaScript SDK | [ドキュメント](/use-cases/observability/clickstack/sdks/browser)      |
| Elixir       | Elixir アプリケーション               | [ドキュメント](/use-cases/observability/clickstack/sdks/elixir)       |
| Go           | Go アプリケーションとマイクロサービス | [ドキュメント](/use-cases/observability/clickstack/sdks/golang)       |
| Java         | Java アプリケーション                 | [ドキュメント](/use-cases/observability/clickstack/sdks/java)         |
| NestJS       | NestJS アプリケーション               | [ドキュメント](/use-cases/observability/clickstack/sdks/nestjs)       |
| Next.js      | Next.js アプリケーション              | [ドキュメント](/use-cases/observability/clickstack/sdks/nextjs)       |
| Node.js      | サーバーサイドアプリケーション用の JavaScript 実行環境 | [ドキュメント](/use-cases/observability/clickstack/sdks/nodejs)      |
| Deno         | Deno アプリケーション                 | [ドキュメント](/use-cases/observability/clickstack/sdks/deno)         |
| Python       | Python アプリケーションとウェブサービス | [ドキュメント](/use-cases/observability/clickstack/sdks/python)       |
| React Native  | React Native モバイルアプリケーション  | [ドキュメント](/use-cases/observability/clickstack/sdks/react-native) |
| Ruby         | Ruby on Rails アプリケーションとウェブサービス | [ドキュメント](/use-cases/observability/clickstack/sdks/ruby-on-rails) |

## API キーによるセキュリティ {#securing-api-key}

OTel コレクターを介して ClickStack にデータを送信するには、SDK で取り込み API キーを指定する必要があります。これは、SDK の `init` 関数を使用するか、`OTEL_EXPORTER_OTLP_HEADERS` 環境変数を設定することで行うことができます。

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

この API キーは HyperDX アプリケーションによって生成され、`Team Settings → API Keys` のアプリ内で利用可能です。

ほとんどの [言語 SDK](/use-cases/observability/clickstack/sdks) や OpenTelemetry をサポートするテレメトリライブラリでは、アプリケーション内で `OTEL_EXPORTER_OTLP_ENDPOINT` 環境変数を設定するか、SDK の初期化時に指定するだけで済みます。

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

## Kubernetes との統合 {#kubernetes-integration}

すべての SDK は、Kubernetes 環境で実行されているときに Kubernetes メタデータ（ポッド名、ネームスペースなど）との自動関連付けをサポートしています。これにより、次のことが可能になります。

- サービスに関連するポッドとノードの Kubernetes メトリックを表示する
- アプリケーションのログとトレースをインフラストラクチャメトリックと関連付ける
- Kubernetes クラスター全体のリソース使用量とパフォーマンスを追跡する

この機能を有効にするには、OpenTelemetry コレクターを構成してリソースタグをポッドに転送する必要があります。詳細な設定手順については、[Kubernetes 統合ガイド](/use-cases/observability/clickstack/ingesting-data/kubernetes#forwarding-resouce-tags-to-pods)を参照してください。
