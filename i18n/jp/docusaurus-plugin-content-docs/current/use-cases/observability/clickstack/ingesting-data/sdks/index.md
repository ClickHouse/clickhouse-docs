---
slug: /use-cases/observability/clickstack/sdks
pagination_prev: null
pagination_next: null
description: 'ClickStack 向け言語 SDK - The ClickHouse Observability Stack'
title: '言語 SDKs'
doc_type: 'guide'
keywords: ['ClickStack SDKs', 'ClickStack 言語 SDKs', 'OpenTelemetry SDKs ClickStack', 'アプリケーションのインストルメンテーション SDKs
', 'テレメトリ収集 SDKs']
---

データは通常、**OpenTelemetry (OTel) Collector** を介して ClickStack に送信されます。これは、言語 SDK から直接送信される場合もあれば、インフラストラクチャのメトリクスやログを収集するエージェントとして動作する中間の OpenTelemetry Collector を経由する場合もあります。

言語 SDK は、アプリケーション内部からのテレメトリ、特に **traces** や **logs** を収集し、OTLP エンドポイント経由で OpenTelemetry Collector にエクスポートする役割を担います。Collector はその後、ClickHouse へのインジェストを処理します。

ブラウザベースの環境では、SDK が **session data**（UI イベント、クリック、ナビゲーションを含む）の収集も担当し、ユーザーセッションのリプレイを可能にします。 

## 動作の仕組み {#how-it-works}

1. アプリケーションは ClickStack SDK（例: Node.js、Python、Go）を使用します。これらの SDK は OpenTelemetry SDKs を基盤としており、追加機能と使いやすさの向上が行われています。
2. SDK はトレースとログを収集し、OTLP（HTTP または gRPC）経由でエクスポートします。
3. OpenTelemetry collector がテレメトリを受信し、設定されたエクスポーターを通じて ClickHouse に書き込みます。

## サポートされている言語 {#supported-languages}

:::note OpenTelemetry 互換性
ClickStack は強化されたテレメトリ機能を備えた独自の言語 SDK を提供しますが、既存の OpenTelemetry SDKS もそのままシームレスに利用できます。
:::

<br/>

| Language | Description | Link |
|----------|-------------|------|
| AWS Lambda | AWS Lambda 関数をインストルメントする | [Documentation](/use-cases/observability/clickstack/sdks/aws_lambda) |
| Browser | ブラウザベースのアプリケーション向け JavaScript SDK | [Documentation](/use-cases/observability/clickstack/sdks/browser) |
| Elixir | Elixir アプリケーション | [Documentation](/use-cases/observability/clickstack/sdks/elixir) |
| Go | Go アプリケーションおよびマイクロサービス | [Documentation](/use-cases/observability/clickstack/sdks/golang) |
| Java | Java アプリケーション | [Documentation](/use-cases/observability/clickstack/sdks/java) |
| NestJS | NestJS アプリケーション | [Documentation](/use-cases/observability/clickstack/sdks/nestjs) |
| Next.js | Next.js アプリケーション | [Documentation](/use-cases/observability/clickstack/sdks/nextjs) |
| Node.js | サーバーサイドアプリケーション向けの JavaScript ランタイム | [Documentation](/use-cases/observability/clickstack/sdks/nodejs) |
| Deno | Deno アプリケーション | [Documentation](/use-cases/observability/clickstack/sdks/deno) |
| Python | Python アプリケーションおよび Web サービス | [Documentation](/use-cases/observability/clickstack/sdks/python) |
| React Native | React Native モバイルアプリケーション | [Documentation](/use-cases/observability/clickstack/sdks/react-native) |
| Ruby | Ruby on Rails アプリケーションおよび Web サービス | [Documentation](/use-cases/observability/clickstack/sdks/ruby-on-rails) |

## API key による保護

OTel collector 経由で ClickStack にデータを送信するには、SDK でインジェスト API key を指定する必要があります。これは SDK の `init` 関数で設定するか、`OTEL_EXPORTER_OTLP_HEADERS` 環境変数で指定します。

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<あなたのインジェストAPIキー>'
```

この API キーは HyperDX アプリケーションで生成され、アプリの `Team Settings → API Keys` から取得できます。

ほとんどの [language SDKs](/use-cases/observability/clickstack/sdks) や OpenTelemetry をサポートするテレメトリライブラリでは、アプリケーションで `OTEL_EXPORTER_OTLP_ENDPOINT` 環境変数を設定するか、SDK の初期化時に指定するだけで利用できます。

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```


## Kubernetes integration {#kubernetes-integration}

すべての SDK は、Kubernetes 環境で実行されている場合、Kubernetes メタデータ（ポッド名、ネームスペースなど）との自動的な相関付けをサポートします。これにより、次のことが可能になります。

- サービスに関連付けられたポッドおよびノードの Kubernetes メトリクスを表示する
- アプリケーションのログおよびトレースをインフラストラクチャのメトリクスと相関付ける
- Kubernetes クラスター全体のリソース使用状況とパフォーマンスを追跡する

この機能を有効にするには、OpenTelemetry collector を構成し、リソースタグをポッドに転送するようにします。詳細なセットアップ手順については、[Kubernetes integration guide](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods) を参照してください。