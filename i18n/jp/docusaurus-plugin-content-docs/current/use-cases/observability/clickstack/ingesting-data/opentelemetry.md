---
slug: /use-cases/observability/clickstack/ingesting-data/opentelemetry
pagination_prev: null
pagination_next: null
description: 'ClickStack 向け OpenTelemetry によるデータインジェスト - ClickHouse Observability Stack'
title: 'OpenTelemetry によるデータインジェスト'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'traces', 'observability', 'telemetry']
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

すべてのデータは **OpenTelemetry (OTel) collector** インスタンスを経由して ClickStack に取り込まれます。このインスタンスは、ログ、メトリクス、トレース、セッションデータの主なエントリポイントとして機能します。このインスタンスには、collector の公式な [ClickStack distribution](#installing-otel-collector) を使用することを推奨します。

ユーザーは、この collector に対して、[language SDKs](/use-cases/observability/clickstack/sdks) から、またはインフラストラクチャのメトリクスやログを収集するデータ収集エージェント（[agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) ロールで動作する OTel collector や、[Fluentd](https://www.fluentd.org/)、[Vector](https://vector.dev/) などの他のテクノロジー）を通じてデータを送信します。


## ClickStack OpenTelemetry collector のインストール {#installing-otel-collector}

ClickStack OpenTelemetry collector は、次のようなほとんどの ClickStack ディストリビューションに含まれています：

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm](/use-cases/observability/clickstack/deployment/helm)

### スタンドアロン {#standalone}

ClickStack OTel collector は、スタック内の他のコンポーネントとは独立したスタンドアロンとしてもデプロイできます。

[HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only) ディストリビューションを使用している場合は、ClickHouse へのデータ取り込みはユーザー自身の責任となります。これは次の方法で実行できます：

- 独自の OpenTelemetry collector を実行し、ClickHouse を宛先として指定する — 詳細は以下を参照してください。
- [Vector](https://vector.dev/)、[Fluentd](https://www.fluentd.org/) などの代替ツール、あるいは標準の [OTel contrib collector distribution](https://github.com/open-telemetry/opentelemetry-collector-contrib) を使用して、直接 ClickHouse に送信する。

:::note ClickStack OpenTelemetry collector の利用を推奨します
これにより、標準化されたインジェスト、スキーマの厳密な適用、HyperDX UI とのすぐに利用可能な互換性といった利点を得られます。デフォルトのスキーマを使用すると、ソースの自動検出と事前設定済みのカラムマッピングが有効になります。
:::

詳細については「[Deploying the collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)」を参照してください。



## OpenTelemetry データの送信

ClickStack にデータを送信するには、OpenTelemetry Collector によって提供される次のエンドポイントを、OpenTelemetry 計装コードの送信先として指定します。

* **HTTP (OTLP):** `http://localhost:4318`
* **gRPC (OTLP):** `localhost:4317`

ほとんどの [言語 SDK](/use-cases/observability/clickstack/sdks) や OpenTelemetry をサポートするテレメトリライブラリでは、アプリケーション内で `OTEL_EXPORTER_OTLP_ENDPOINT` 環境変数を設定するだけで利用できます。

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

さらに、API インジェストキーを含む Authorization ヘッダーが必要です。キーは HyperDX アプリの `Team Settings → API Keys` から確認できます。

<Image img={ingestion_key} alt="インジェストキー" size="lg" />

各言語向け SDKS の場合、これは `init` 関数で設定するか、`OTEL_EXPORTER_OTLP_HEADERS` 環境変数で設定できます。例えば次のように指定します:

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<あなたのインジェストAPIキー>'
```

エージェントも同様に、すべての OTLP 通信でこの Authorization ヘッダーを含める必要があります。例えば、エージェントの役割で [OTel collector の contrib ディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-contrib) をデプロイする場合、OTLP exporter を使用できます。この [構造化ログファイル](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz) を取り込むエージェントの設定例を以下に示します。Authorization キーを指定する必要がある点に注意してください（`<YOUR_API_INGESTION_KEY>` を参照）。


```yaml
# clickhouse-agent-config.yaml
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
  # HTTP設定
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
 
  # gRPC設定（代替）
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
      address: 0.0.0.0:9888 # 同一ホスト上で2つのコレクターを実行するため変更
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]
```
