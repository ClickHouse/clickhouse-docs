---
slug: /use-cases/observability/clickstack/ingesting-data/opentelemetry
pagination_prev: null
pagination_next: null
toc_max_heading_level: 2
description: 'OpenTelemetry を使用した ClickStack へのデータインジェスト - ClickHouse Observability Stack'
title: 'OpenTelemetry によるインジェスト'
doc_type: 'guide'
keywords: ['clickstack', 'opentelemetry', 'traces', 'observability', 'telemetry']
---

import Image from '@theme/IdealImage';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

すべてのデータは **OpenTelemetry (OTel) collector** インスタンス経由で ClickStack に取り込まれます。このインスタンスは、ログ、メトリクス、トレース、およびセッションデータの主な入口として機能します。この用途には、collector の公式ディストリビューションである [ClickStack distribution](#installing-otel-collector) を使用することを推奨します。

ユーザーは、この collector に対して、[language SDKs](/use-cases/observability/clickstack/sdks) から、あるいはインフラストラクチャのメトリクスやログを収集するデータ収集エージェント経由でデータを送信します（[agent](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) ロールで動作する OTel collector や、[Fluentd](https://www.fluentd.org/)、[Vector](https://vector.dev/) などの他のテクノロジーなど）。管理された OpenTelemetry パイプラインを利用したいチーム向けに、[Bindplane](/use-cases/observability/clickstack/integration-partners/bindplane)は ClickStack をネイティブな宛先としてサポートする OpenTelemetry ネイティブなソリューションを提供し、テレメトリの収集・処理・ルーティングを簡素化します。


## OpenTelemetry データの送信 \{#sending-otel-data\}

<Tabs groupId="os-type">
  <TabItem value="managed-clickstack" label="マネージド型 ClickStack" default>
    ### ClickStack OpenTelemetry collector のインストール

    Managed ClickStack にデータを送信するには、OTel collector を [gateway ロール](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) でデプロイする必要があります。OTel 互換のインストゥルメンテーションは、HTTP または gRPC 上の OTLP を通じてこの collector にイベントを送信します。

    :::note ClickStack OpenTelemetry collector の使用を推奨します
    これにより、標準化されたインジェスト、スキーマの強制適用、そして ClickStack UI (HyperDX) との標準での互換性といったメリットを得られます。デフォルトのスキーマを使用することで、自動的なソース検出とあらかじめ設定されたカラムのマッピングが有効になります。
    :::

    詳細については「[Deploying the collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)」を参照してください。

    ### collector へのデータ送信

    Managed ClickStack にデータを送信するには、OpenTelemetry collector が公開する次のエンドポイントを、OpenTelemetry インストゥルメンテーションの送信先として指定します。

    * **HTTP (OTLP):** `http://localhost:4318`
    * **gRPC (OTLP):** `localhost:4317`

    OpenTelemetry をサポートする [言語 SDK](/use-cases/observability/clickstack/sdks) やテレメトリライブラリでは、アプリケーション内で `OTEL_EXPORTER_OTLP_ENDPOINT` 環境変数を設定するだけで構成できます。

    ```shell
    export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
    ```

    エージェントロールで [OTel collector の contrib ディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-contrib) をデプロイする場合、OTLP exporter を使用して ClickStack collector にデータを送信できます。以下に、この [構造化ログファイル](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz) を取り込むためのエージェント構成の例を示します。

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
      # HTTP setup
      otlphttp/hdx:
        endpoint: 'http://localhost:4318'
        compression: gzip
     
      # gRPC setup (alternative)
      otlp/hdx:
        endpoint: 'localhost:4317'
        compression: gzip
    processors:
      batch:
        timeout: 5s
        send_batch_size: 1000
    service:
      telemetry:
        metrics:
          address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
      pipelines:
        logs:
          receivers: [filelog]
          processors: [batch]
          exporters: [otlphttp/hdx]
    ```
  </TabItem>

  <TabItem value="oss-clickstack" label="オープンソース版 ClickStack" default>
    ClickStack OpenTelemetry collector は、次のものを含むほとんどの ClickStack ディストリビューションに同梱されています。

    * [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)
    * [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)
    * [Helm](/use-cases/observability/clickstack/deployment/helm)

    ### ClickStack OpenTelemetry collector のインストール

    ClickStack の OTel collector は、スタック内の他のコンポーネントとは独立したスタンドアロンとしてもデプロイできます。

    [HyperDX-only](/use-cases/observability/clickstack/deployment/hyperdx-only) ディストリビューションを使用している場合、ClickHouse へのデータのインジェストは利用者自身で行う必要があります。これは次のいずれかの方法で行えます。

    * 独自の OpenTelemetry collector を実行し、ClickHouse を宛先として指定する — 以下を参照してください。
    * [Vector](https://vector.dev/)、[Fluentd](https://www.fluentd.org/) などの代替ツール、あるいはデフォルトの [OTel contrib collector distribution](https://github.com/open-telemetry/opentelemetry-collector-contrib) を使用して、直接 ClickHouse に送信する。

    :::note ClickStack OpenTelemetry collector の使用を推奨します
    これにより、標準化されたインジェスト、スキーマの強制適用、そして HyperDX UI との標準での互換性といったメリットを得られます。デフォルトのスキーマを使用することで、自動的なソース検出とあらかじめ設定されたカラムのマッピングが有効になります。
    :::

    詳細については「[Deploying the collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)」を参照してください。

    ### コレクターへのデータ送信

    ClickStack にデータを送信するには、OpenTelemetry collector が公開している次のエンドポイントを OpenTelemetry インストルメンテーションの送信先として指定します。

    * **HTTP (OTLP):** `http://localhost:4318`
    * **gRPC (OTLP):** `localhost:4317`

    [language SDKs](/use-cases/observability/clickstack/sdks) や OpenTelemetry をサポートするテレメトリライブラリでは、アプリケーション内で環境変数 `OTEL_EXPORTER_OTLP_ENDPOINT` を設定するだけで送信できます。

    ```shell
    export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
    ```

    さらに、API インジェストキーを含む Authorization ヘッダーが必要です。キーは HyperDX アプリの `Team Settings → API Keys` で確認できます。

    <Image img={ingestion_key} alt="インジェストキー" size="lg" />

    言語 SDK の場合は、`init` 関数で設定するか、`OTEL_EXPORTER_OTLP_HEADERS` 環境変数を介して設定できます。たとえば次のとおりです。

    ```shell
    OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
    ```

    エージェントも同様に、すべての OTLP 通信にこの認可ヘッダーを含める必要があります。たとえば、エージェントとして [OTel collector の contrib distribution](https://github.com/open-telemetry/opentelemetry-collector-contrib) をデプロイする場合、OTLP exporter を使用できます。この [構造化ログファイル](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-structured.log.gz) を取り込むエージェント構成の例を以下に示します。認可キーを指定する必要がある点に注意してください（`<YOUR_API_INGESTION_KEY>` を参照）。

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
          address: 0.0.0.0:9888 # Modified as 2 collectors running on same host
      pipelines:
        logs:
          receivers: [filelog]
          processors: [batch]
          exporters: [otlphttp/hdx]
    ```
  </TabItem>
</Tabs>