---
slug: /use-cases/observability/clickstack/ingesting-data/opentelemetry
pagination_prev: null
pagination_next: null
description: 'OpenTelemetry を使用した ClickStack へのデータインジェスト - ClickHouse Observability Stack'
title: 'OpenTelemetry によるインジェスト'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'traces', 'observability', 'telemetry']
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

すべてのデータは **OpenTelemetry (OTel) collector** インスタンス経由で ClickStack に取り込まれます。このインスタンスは、ログ、メトリクス、トレース、およびセッションデータの主な入口として機能します。この用途には、collector の公式ディストリビューションである [ClickStack distribution](#installing-otel-collector) を使用することを推奨します。

ユーザーは、この collector に対して、[language SDKs](/use-cases/observability/clickstack/sdks) から、あるいはインフラストラクチャのメトリクスやログを収集するデータ収集エージェント経由でデータを送信します（[agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) ロールで動作する OTel collector や、[Fluentd](https://www.fluentd.org/)、[Vector](https://vector.dev/) などの他のテクノロジーなど）。

## ClickStack OpenTelemetry コレクターのインストール {#installing-otel-collector}

ClickStack OpenTelemetry コレクターは、次のものを含むほとんどの ClickStack ディストリビューションに同梱されています：

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm](/use-cases/observability/clickstack/deployment/helm)

### スタンドアロン {#standalone}

ClickStack の OTel collector は、スタック内の他のコンポーネントとは独立したスタンドアロンとしてもデプロイできます。

[HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only) ディストリビューションを使用している場合、ClickHouse へのデータ取り込みは利用者自身で行う必要があります。これは次のいずれかの方法で行えます。

- 独自の OpenTelemetry collector を実行し、ClickHouse を宛先として指定する — 以下を参照してください。
- [Vector](https://vector.dev/)、[Fluentd](https://www.fluentd.org/) などの代替ツール、あるいはデフォルトの [OTel contrib collector distribution](https://github.com/open-telemetry/opentelemetry-collector-contrib) を使用して、直接 ClickHouse に送信する。

:::note ClickStack OpenTelemetry collector の使用を推奨します
これにより、標準化されたインジェスト、スキーマの強制適用、そして HyperDX UI との標準での互換性といったメリットを得られます。デフォルトのスキーマを使用することで、自動的なソース検出とあらかじめ設定されたカラムのマッピングが有効になります。
:::

詳細については「[Deploying the collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)」を参照してください。

## OpenTelemetry データの送信 {#sending-otel-data}

ClickStack にデータを送信するには、OpenTelemetry Collector によって公開されている次のエンドポイントを、OpenTelemetry 計装の送信先として指定します。

* **HTTP (OTLP):** `http://localhost:4318`
* **gRPC (OTLP):** `localhost:4317`

ほとんどの [language SDKs](/use-cases/observability/clickstack/sdks) や OpenTelemetry をサポートするテレメトリライブラリでは、アプリケーションで `OTEL_EXPORTER_OTLP_ENDPOINT` 環境変数を設定するだけで構成できます。

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

さらに、API インジェストキーを含んだ Authorization ヘッダーが必要です。キーは HyperDX アプリの `Team Settings → API Keys` から確認できます。

<Image img={ingestion_key} alt="Ingestion keys" size="lg" />

言語別 SDK 向けには、`init` 関数で設定するか、`OTEL_EXPORTER_OTLP_HEADERS` 環境変数で設定できます。例えば次のように設定します:

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<あなたのインジェストAPIキー>'
```

エージェントも同様に、すべての OTLP 通信にこの Authorization ヘッダーを含める必要があります。たとえば、エージェントとして [OTel collector の contrib ディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-contrib) をデプロイする場合、OTLP exporter を使用できます。次に、この [構造化ログファイル](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz) を取り込むエージェントの設定例を示します。Authorization 用のキーを指定する必要がある点に注意してください。`<YOUR_API_INGESTION_KEY>` を指定します。

```yaml
# clickhouse-agent-config.yaml {#clickhouse-agent-configyaml}
receivers:
  filelog:
    include:
      - /opt/data/logs/access-structured.log
    start_at: beginning
    operators:
      - type: json_parser
        timestamp:
          parse_from: attributes.time_local
          layout: '%Y-%m-%d %H:%M:%S'
exporters:
  # HTTP setup
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
 
  # gRPC setup (alternative)
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
processors:
  batch:
    timeout: 5s
    send_batch_size: 1000
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # 同一ホスト上で2つのコレクターを実行しているため変更
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]
```
