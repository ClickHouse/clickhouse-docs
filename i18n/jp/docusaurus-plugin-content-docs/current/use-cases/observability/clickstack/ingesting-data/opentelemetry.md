---
slug: /use-cases/observability/clickstack/ingesting-data/opentelemetry
pagination_prev: null
pagination_next: null
description: 'ClickStack 向け OpenTelemetry を用いたデータ取り込み - ClickHouse Observability スタック'
title: 'OpenTelemetry を用いたデータ取り込み'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'traces', 'observability', 'telemetry']
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

すべてのデータは、ログ、メトリクス、トレース、およびセッションデータの主なエントリポイントとして機能する **OpenTelemetry (OTel) コレクタ** インスタンスを介して ClickStack に取り込まれます。このインスタンスには、公式のコレクタディストリビューションである [ClickStack distribution](#installing-otel-collector) を使用することを推奨します。

ユーザーは、このコレクタに対して、[language SDKs](/use-cases/observability/clickstack/sdks) から、またはインフラストラクチャのメトリクスやログを収集するデータ収集エージェント（[agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) ロールで動作する OTel コレクタや、[Fluentd](https://www.fluentd.org/)、[Vector](https://vector.dev/) などのその他のテクノロジー）を通じてデータを送信します。


## ClickStack OpenTelemetry コレクターのインストール {#installing-otel-collector}

ClickStack OpenTelemetry コレクターは、以下を含むほとんどの ClickStack ディストリビューションに含まれています:

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
- [Helm](/use-cases/observability/clickstack/deployment/helm)

### スタンドアロン {#standalone}

ClickStack OTel コレクターは、スタックの他のコンポーネントから独立して、スタンドアロンでデプロイすることもできます。

[HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only) ディストリビューションを使用している場合、ClickHouse へのデータ配信は自身で行う必要があります。これは以下の方法で実現できます:

- 独自の OpenTelemetry コレクターを実行し、ClickHouse を指定する - 以下を参照してください。
- [Vector](https://vector.dev/)、[Fluentd](https://www.fluentd.org/) などの代替ツール、またはデフォルトの [OTel contrib collector distribution](https://github.com/open-telemetry/opentelemetry-collector-contrib) を使用して ClickHouse に直接送信する。

:::note ClickStack OpenTelemetry コレクターの使用を推奨します
これにより、標準化されたデータ取り込み、スキーマの強制、HyperDX UI との即座の互換性といったメリットを享受できます。デフォルトのスキーマを使用すると、自動ソース検出と事前設定されたカラムマッピングが有効になります。
:::

詳細については、["コレクターのデプロイ"](/use-cases/observability/clickstack/ingesting-data/otel-collector) を参照してください。


## OpenTelemetryデータの送信 {#sending-otel-data}

ClickStackにデータを送信するには、OpenTelemetryインストルメンテーションをOpenTelemetryコレクターが提供する以下のエンドポイントに設定します：

- **HTTP (OTLP):** `http://localhost:4318`
- **gRPC (OTLP):** `localhost:4317`

OpenTelemetryをサポートするほとんどの[言語SDK](/use-cases/observability/clickstack/sdks)およびテレメトリライブラリでは、アプリケーション内で`OTEL_EXPORTER_OTLP_ENDPOINT`環境変数を設定するだけです：

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

さらに、APIインジェストキーを含む認証ヘッダーが必要です。このキーは、HyperDXアプリの`Team Settings → API Keys`で確認できます。

<Image img={ingestion_key} alt='インジェストキー' size='lg' />

言語SDKの場合、これは`init`関数または`OTEL_EXPORTER_OTLP_HEADERS`環境変数のいずれかで設定できます。例：

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

エージェントも同様に、すべてのOTLP通信にこの認証ヘッダーを含める必要があります。例えば、エージェントロールで[OTelコレクターのcontribディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-contrib)をデプロイする場合、OTLPエクスポーターを使用できます。この[構造化ログファイル](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz)を使用するエージェント設定の例を以下に示します。認証キーの指定が必要です - `<YOUR_API_INGESTION_KEY>`を参照してください。


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
      address: 0.0.0.0:9888 # 同一ホスト上で2つのコレクターを実行しているため変更
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]
```
