---
slug: /use-cases/observability/clickstack/sdks
pagination_prev: null
pagination_next: null
description: 'ClickStack 向け言語 SDKs - ClickHouse Observability Stack'
title: '言語 SDKs'
doc_type: 'guide'
keywords: ['ClickStack SDKs', 'ClickStack 言語 SDKs', 'OpenTelemetry SDKs ClickStack', 'アプリケーション計装 SDKs
', 'テレメトリー収集 SDKs']
---

データは通常、**OpenTelemetry (OTel) collector** を介して ClickStack に送信されます。これは、各種言語 SDK から直接送信される場合もあれば、インフラストラクチャのメトリクスやログを収集するエージェントとして動作する中間の OpenTelemetry collector を経由する場合もあります。

言語 SDKs は、アプリケーション内部からのテレメトリー、特に **トレース** と **ログ** を収集し、このデータを OTLP エンドポイント経由で OpenTelemetry collector にエクスポートする役割を担います。collector は、そのデータを ClickHouse へインジェストする処理を行います。

ブラウザベースの環境では、SDKs が **セッションデータ**（UI イベント、クリック、ナビゲーションなど）を収集し、ユーザーセッションのリプレイを可能にする役割も担う場合があります。 



## 動作の仕組み {#how-it-works}

1. アプリケーションは ClickStack SDK（例: Node.js、Python、Go）を使用します。これらの SDK は OpenTelemetry の SDK をベースにし、追加機能と使い勝手の向上を加えたものです。
2. SDK はトレースとログを OTLP（HTTP または gRPC）経由で収集およびエクスポートします。
3. OpenTelemetry コレクターはテレメトリを受信し、設定されたエクスポーター経由で ClickHouse に書き込みます。



## サポートされている言語 {#supported-languages}

:::note OpenTelemetry compatibility
ClickStack は拡張されたテレメトリ機能を備えた独自の言語別 SDK を提供していますが、既存の OpenTelemetry SDK もそのままシームレスに利用できます。
:::

<br/>

| Language | Description | Link |
|----------|-------------|------|
| AWS Lambda | AWS Lambda 関数を計測する | [ドキュメント](/use-cases/observability/clickstack/sdks/aws_lambda) |
| Browser | ブラウザベースのアプリケーション向け JavaScript SDK | [ドキュメント](/use-cases/observability/clickstack/sdks/browser) |
| Elixir | Elixir アプリケーション | [ドキュメント](/use-cases/observability/clickstack/sdks/elixir) |
| Go | Go アプリケーションおよびマイクロサービス | [ドキュメント](/use-cases/observability/clickstack/sdks/golang) |
| Java | Java アプリケーション | [ドキュメント](/use-cases/observability/clickstack/sdks/java) |
| NestJS | NestJS アプリケーション | [ドキュメント](/use-cases/observability/clickstack/sdks/nestjs) |
| Next.js | Next.js アプリケーション | [ドキュメント](/use-cases/observability/clickstack/sdks/nextjs) |
| Node.js | サーバーサイドアプリケーション向け JavaScript ランタイム | [ドキュメント](/use-cases/observability/clickstack/sdks/nodejs) |
| Deno | Deno アプリケーション | [ドキュメント](/use-cases/observability/clickstack/sdks/deno) |
| Python | Python アプリケーションおよび Web サービス | [ドキュメント](/use-cases/observability/clickstack/sdks/python) |
| React Native | React Native モバイルアプリケーション | [ドキュメント](/use-cases/observability/clickstack/sdks/react-native) |
| Ruby | Ruby on Rails アプリケーションおよび Web サービス | [ドキュメント](/use-cases/observability/clickstack/sdks/ruby-on-rails) |



## API key による保護

OTel collector 経由で ClickStack にデータを送信するには、SDK 側でインジェスト API key を指定する必要があります。これは、SDK の `init` 関数で設定するか、`OTEL_EXPORTER_OTLP_HEADERS` 環境変数で設定できます。

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<あなたのインジェストAPIキー>'
```

この API キーは HyperDX アプリケーションによって生成され、アプリ内の `Team Settings → API Keys` から確認できます。

OpenTelemetry をサポートするほとんどの[言語 SDK](/use-cases/observability/clickstack/sdks) とテレメトリライブラリでは、アプリケーションで `OTEL_EXPORTER_OTLP_ENDPOINT` 環境変数を設定するか、SDK の初期化時に指定するだけで利用できます。

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```


## Kubernetes 連携 {#kubernetes-integration}

すべての SDK は、Kubernetes 環境内で実行されている場合、Kubernetes メタデータ（ポッド名、ネームスペースなど）との自動相関付けをサポートします。これにより、次のことが可能になります。

- サービスに関連付けられたポッドおよびノードの Kubernetes メトリクスを表示する
- アプリケーションのログとトレースをインフラストラクチャのメトリクスと相関付ける
- Kubernetes クラスター全体のリソース使用状況とパフォーマンスを追跡する

この機能を有効にするには、OpenTelemetry Collector を構成して、リソースタグをポッドに転送するようにします。詳細なセットアップ手順については、[Kubernetes 連携ガイド](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods)を参照してください。
