---
slug: /use-cases/observability/clickstack/ingesting-data/otel-collector
pagination_prev: null
pagination_next: null
description: 'ClickStack 用 OpenTelemetry collector - ClickHouse Observability スタック'
sidebar_label: 'OpenTelemetry collector'
title: 'ClickStack OpenTelemetry Collector'
doc_type: 'guide'
keywords: ['ClickStack', 'OpenTelemetry collector', 'ClickHouse のオブザーバビリティ', 'OTel collector の構成', 'OpenTelemetry ClickHouse']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

このページでは、公式の ClickStack OpenTelemetry (OTel) コレクターの設定に関する詳細を説明します。

## コレクターのロール {#collector-roles}

OpenTelemetry コレクターは、主に 2 つのロールでデプロイできます:

- **エージェント (Agent)** - エージェントインスタンスはエッジでデータを収集します。たとえばサーバー上や Kubernetes ノード上で動作したり、OpenTelemetry SDK でインスツルメントされたアプリケーションからイベントを直接受信します。後者の場合、エージェントインスタンスはアプリケーションと同じホスト上、またはアプリケーションと一緒に (サイドカーやデーモンセットなどとして) 実行されます。エージェントは、収集したデータを直接 ClickHouse に送信することも、ゲートウェイインスタンスに送信することもできます。前者のケースは [Agent deployment pattern](https://opentelemetry.io/docs/collector/deployment/agent/) と呼ばれます。 

- **ゲートウェイ (Gateway)** - ゲートウェイインスタンスは、スタンドアロンのサービス (たとえば Kubernetes におけるデプロイメント) を提供し、通常はクラスタごと、データセンターごと、リージョンごとにデプロイされます。これらは単一の OTLP エンドポイント経由で、アプリケーション (またはエージェントとして動作する他のコレクター) からイベントを受信します。通常、複数のゲートウェイインスタンスがデプロイされ、その間で負荷を分散するために、あらかじめ用意されたロードバランサーが使用されます。すべてのエージェントとアプリケーションがこの単一のエンドポイントにシグナルを送信する場合、これはしばしば [Gateway deployment pattern](https://opentelemetry.io/docs/collector/deployment/gateway/) と呼ばれます。 

**重要: コレクターは、ClickStack のデフォルトディストリビューションを含め、ここで説明する [ゲートウェイロール](#collector-roles) を前提としており、エージェントや SDK からデータを受信します。**

エージェントロールで OTel collector をデプロイするユーザーは、通常、ClickStack バージョンではなく [collector の default contrib distribution](https://github.com/open-telemetry/opentelemetry-collector-contrib) を使用しますが、[Fluentd](https://www.fluentd.org/) や [Vector](https://vector.dev/) など、他の OTLP 互換テクノロジーを自由に利用することもできます。

## コレクターのデプロイ {#configuring-the-collector}

HyperDX のみのディストリビューションを使用する場合など、スタンドアロンデプロイメントで独自の OpenTelemetry コレクターを管理している場合でも、可能であればゲートウェイとして[公式の ClickStack ディストリビューション版コレクターを使用することを推奨します](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector)。ただし独自のコレクターを利用する場合は、必ず [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) が含まれていることを確認してください。

### スタンドアロン {#standalone}

ClickStack ディストリビューション版の OTel コネクタをスタンドアロンモードでデプロイするには、次の Docker コマンドを実行します。

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME`、`CLICKHOUSE_PASSWORD` という環境変数を使って、接続先の ClickHouse インスタンスを上書きできます。`CLICKHOUSE_ENDPOINT` には、プロトコルとポートを含む完全な ClickHouse の HTTP エンドポイントを指定します。たとえば `http://localhost:8123` のようになります。

**これらの環境変数は、コネクタを含む任意の Docker ディストリビューションで使用できます。**

`OPAMP_SERVER_URL` には、HyperDX のデプロイメントを指す URL を指定します。たとえば `http://localhost:4320` のようになります。HyperDX は、デフォルトでポート `4320` 上の `/v1/opamp` で OpAMP (Open Agent Management Protocol) サーバーを公開します。HyperDX を実行しているコンテナからこのポートが公開されていることを確認してください (例: `-p 4320:4320` を使用)。

:::note OpAMP ポートの公開と接続
Collector が OpAMP ポートに接続できるようにするには、そのポートが HyperDX コンテナから公開されている必要があります (例: `-p 4320:4320`)。ローカルテストの場合、OSX ユーザーは `OPAMP_SERVER_URL=http://host.docker.internal:4320` を設定できます。Linux ユーザーは `--network=host` を指定して Collector コンテナを起動できます。
:::

本番環境では、[適切な認証情報](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user) を持つユーザーを使用してください。


### 構成の変更 {#modifying-otel-collector-configuration}

#### docker を使用する {#using-docker}

OpenTelemetry collector を含むすべての docker イメージは、環境変数 `OPAMP_SERVER_URL`、`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME`、`CLICKHOUSE_PASSWORD` を使用して ClickHouse インスタンスに接続するよう構成できます。

例えば、オールインワンイメージの場合:

```shell
export OPAMP_SERVER_URL=<OPAMP_SERVER_URL>
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```

:::note 画像名の更新
ClickStack のイメージは、現在 `clickhouse/clickstack-*`（以前は `docker.hyperdx.io/hyperdx/*`）として公開されています。
:::


#### Docker Compose {#docker-compose-otel}

Docker Compose を使用する際は、上記と同じ環境変数を使用してコレクターの設定を変更します。

```yaml
  otel-collector:
    image: hyperdx/hyperdx-otel-collector
    environment:
      CLICKHOUSE_ENDPOINT: 'https://mxl4k3ul6a.us-east-2.aws.clickhouse-staging.com:8443'
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      CLICKHOUSE_USER: 'default'
      CLICKHOUSE_PASSWORD: 'password'
      OPAMP_SERVER_URL: 'http://app:${HYPERDX_OPAMP_PORT}'
    ports:
      - '13133:13133' # health_check extension
      - '24225:24225' # fluentd receiver
      - '4317:4317' # OTLP gRPC receiver
      - '4318:4318' # OTLP http receiver
      - '8888:8888' # metrics extension
    restart: always
    networks:
      - internal
```

### 高度な設定 {#advanced-configuration}

ClickStack ディストリビューションの OTel collector では、カスタム設定ファイルをマウントし、環境変数を設定することで、基本設定を拡張できます。カスタム設定は、OpAMP を介して HyperDX によって管理されている基本設定とマージされます。

#### コレクター設定の拡張 {#extending-collector-config}

カスタムの receiver、processor、または pipeline を追加するには:

1. 追加の設定を含むカスタム設定ファイルを作成する
2. そのファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウントする
3. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml` を設定する

**カスタム設定の例:**

```yaml
receivers:
  # Collect logs from local files
  filelog:
    include:
      - /var/log/**/*.log
      - /var/log/syslog
      - /var/log/messages
    start_at: beginning

  # Collect host system metrics
  hostmetrics:
    collection_interval: 30s
    scrapers:
      cpu:
        metrics:
          system.cpu.utilization:
            enabled: true
      memory:
        metrics:
          system.memory.utilization:
            enabled: true
      disk:
      network:
      filesystem:
        metrics:
          system.filesystem.utilization:
            enabled: true

service:
  pipelines:
    # Logs pipeline
    logs/host:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
    
    # Metrics pipeline
    metrics/hostmetrics:
      receivers: [hostmetrics]
      processors:
        - memory_limiter
        - batch
      exporters:
        - clickhouse
```

**オールインワンイメージでデプロイする：**

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  clickhouse/clickstack-all-in-one:latest
```

**スタンドアロン コレクターを使用してデプロイする：**

```bash
docker run -d \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-otel-collector:latest
```

:::note
新しい receiver、processor、pipeline はカスタム設定内でのみ定義します。ベースの processor（`memory_limiter`、`batch`）および exporter（`clickhouse`）はすでに定義済みなので、名前で参照してください。カスタム設定はベース設定とマージされ、既存コンポーネントを上書きすることはできません。
:::

より複雑な設定については、[デフォルトの ClickStack collector 設定](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml)および [ClickHouse exporter ドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)を参照してください。


#### 設定構造 {#configuration-structure}

[`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/)、[`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)、[`processors`](https://opentelemetry.io/docs/collector/configuration/#processors) を含む OTel collector の構成方法の詳細については、[公式の OpenTelemetry Collector ドキュメント](https://opentelemetry.io/docs/collector/configuration) を参照してください。

## コレクターのセキュリティ保護 {#securing-the-collector}

ClickStack ディストリビューションの OpenTelemetry collector には OpAMP (Open Agent Management Protocol) への組み込みサポートが含まれており、これを使用して OTLP エンドポイントを安全に構成および管理します。起動時には `OPAMP_SERVER_URL` 環境変数を指定する必要があり、これは OpAMP API を `/v1/opamp` でホストしている HyperDX アプリを指すように設定します。

この統合により、OTLP エンドポイントは HyperDX アプリのデプロイ時に自動生成されるインジェスト API key を使用して保護されます。コレクターに送信されるすべてのテレメトリデータには、認証のためにこの API key を含める必要があります。キーは HyperDX アプリの `Team Settings → API Keys` で確認できます。

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

デプロイメントをさらに安全にするため、次のことを推奨します:

- collector が ClickHouse と HTTPS で通信するように構成する。
- 権限を制限したインジェスト専用ユーザーを作成する（詳細は以下を参照）。
- OTLP エンドポイントに対して TLS を有効化し、SDK/エージェントと collector 間の通信を暗号化する。これは [カスタム collector 設定](#extending-collector-config) で構成できます。

### インジェスト用ユーザーの作成 {#creating-an-ingestion-user}

OTel collector が ClickHouse にデータをインジェストするための専用データベースとユーザーを作成することを推奨します。このユーザーには、[ClickStack によって作成・使用されるテーブル](/use-cases/observability/clickstack/ingesting-data/schemas)を作成し、そのテーブルにデータを挿入できる権限を付与してください。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

ここでは、collector がデータベース `otel` を使用するように設定されていることを前提としています。これは環境変数 `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE` で制御できます。[他の環境変数と同様に](#modifying-otel-collector-configuration)、collector を実行しているコンテナイメージにこの値を渡してください。

## 処理 - フィルタリング、変換、エンリッチメント {#processing-filtering-transforming-enriching}

ユーザーは、インジェスト時にイベントメッセージをフィルタリング、変換、およびエンリッチしたくなることがほぼ確実です。ClickStack コネクタの設定は変更できないため、さらなるイベントフィルタリングおよび処理が必要なユーザーには、次のいずれかを推奨します。

- 独自の OTel collector をデプロイし、そこでフィルタリングおよび処理を実行し、イベントを OTLP 経由で ClickStack collector に送信して ClickHouse にインジェストする。
- 独自の OTel collector をデプロイし、ClickHouse exporter を使用してイベントを直接 ClickHouse に送信する。

処理を OTel collector で行う場合、ゲートウェイインスタンスで変換を行い、エージェントインスタンスで行う処理を最小限に抑えることを推奨します。これにより、サーバー上で動作するエッジ側のエージェントに必要なリソースを可能な限り小さくできます。一般的に、ユーザーはフィルタリング（不要なネットワーク使用を最小化するため）、タイムスタンプ設定（オペレーターによる）、およびエージェント側でコンテキストが必要となるエンリッチのみを実行することが多いです。たとえば、ゲートウェイインスタンスが別の Kubernetes クラスターに存在する場合、k8s エンリッチメントはエージェント内で行う必要があります。

OpenTelemetry は、ユーザーが活用できる以下の処理およびフィルタリング機能をサポートしています。

- **Processors** - Processor は、[receivers によって収集されたデータを取得し、それを変更または変換](https://opentelemetry.io/docs/collector/transforming-telemetry/)してから exporter に送信します。Processor は、collector 設定の `processors` セクションで設定された順序で適用されます。これらは任意ですが、最小限のセットが[一般的に推奨されています](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。OTel collector を ClickHouse と併用する場合、Processor は次のものに限定することを推奨します。

- [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) は、collector におけるメモリ不足（Out Of Memory）を防ぐために使用されます。推奨事項については [Estimating Resources](#estimating-resources) を参照してください。
- コンテキストに基づいてエンリッチを行う任意の Processor。たとえば、[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) は、k8s メタデータによりスパン、メトリクス、ログのリソース属性を自動設定できます（例: イベントに送信元ポッド ID を付与してエンリッチする）。
- トレースで必要な場合の [Tail サンプリングまたは Head サンプリング](https://opentelemetry.io/docs/concepts/sampling/)。
- [基本的なフィルタリング](https://opentelemetry.io/docs/collector/transforming-telemetry/) - オペレーターで実行できない場合に、不要なイベントをドロップする（下記参照）。
- [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - ClickHouse を扱う際にデータをバッチで送信するために不可欠です。["Optimizing inserts"](#optimizing-inserts) を参照してください。

- **Operators** - [Operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) は、receiver で利用可能な最も基本的な処理単位を提供します。基本的なパースがサポートされており、Severity や Timestamp などのフィールドを設定できます。ここでは JSON および正規表現によるパースに加え、イベントフィルタリングおよび基本的な変換がサポートされています。イベントフィルタリングはここで実行することを推奨します。

ユーザーが Operator や [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md) を用いて過度なイベント処理を行うことは避けることを推奨します。これらは、特に JSON パースでは、かなりのメモリおよび CPU のオーバーヘッドを招く可能性があります。いくつかの例外（具体的には、k8s メタデータの追加など、コンテキスト認識型のエンリッチ）を除き、ClickHouse ではマテリアライズドビューやカラムを用いて、挿入時にすべての処理を実行することが可能です。詳細については、[Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql) を参照してください。

### 例 {#example-processing}

次の構成は、この[非構造化ログファイル](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)を収集するための例です。この構成は、エージェントロールで動作するコレクターがデータを ClickStack ゲートウェイに送信する際に使用できます。

`regex_parser` オペレーターを用いてログ行から構造化データを抽出し、イベントをフィルタリングしている点と、プロセッサでイベントをバッチ処理してメモリ使用量を制限している点に注目してください。

```yaml file=code_snippets/ClickStack/config-unstructured-logs-with-processor.yaml
receivers:
  filelog:
    include:
      - /opt/data/logs/access-unstructured.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<ip>[\d.]+)\s+-\s+-\s+\[(?P<timestamp>[^\]]+)\]\s+"(?P<method>[A-Z]+)\s+(?P<url>[^\s]+)\s+HTTP/[^\s]+"\s+(?P<status>\d+)\s+(?P<size>\d+)\s+"(?P<referrer>[^"]*)"\s+"(?P<user_agent>[^"]*)"'
        timestamp:
          parse_from: attributes.timestamp
          layout: '%d/%b/%Y:%H:%M:%S %z'
          #22/Jan/2019:03:56:14 +0330
processors:
  batch:
    timeout: 1s
    send_batch_size: 100
  memory_limiter:
    check_interval: 1s
    limit_mib: 2048
    spike_limit_mib: 256
exporters:
  # HTTP設定
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    compression: gzip

  # gRPC設定（代替）
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
service:
  telemetry:
    metrics:
      address: 0.0.0.0:9888 # 同一ホスト上で2つのコレクターが実行されているため変更
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]

```

Note the need to include an [authorization header containing your ingestion API key](#securing-the-collector) in any OTLP communication.

For more advanced configuration, we suggest the [OpenTelemetry collector documentation](https://opentelemetry.io/docs/collector/).

## Optimizing inserts {#optimizing-inserts}

In order to achieve high insert performance while obtaining strong consistency guarantees, users should adhere to simple rules when inserting Observability data into ClickHouse via the ClickStack collector. With the correct configuration of the OTel collector, the following rules should be straightforward to follow. This also avoids [common issues](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse) users encounter when using ClickHouse for the first time.

### Batching {#batching}

By default, each insert sent to ClickHouse causes ClickHouse to immediately create a part of storage containing the data from the insert together with other metadata that needs to be stored. Therefore sending a smaller amount of inserts that each contain more data, compared to sending a larger amount of inserts that each contain less data, will reduce the number of writes required. We recommend inserting data in fairly large batches of at least 1,000 rows at a time. Further details [here](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance).

By default, inserts into ClickHouse are synchronous and idempotent if identical. For tables of the merge tree engine family, ClickHouse will, by default, automatically [deduplicate inserts](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time). This means inserts are tolerant in cases like the following:

- (1) If the node receiving the data has issues, the insert query will time out (or get a more specific error) and not receive an acknowledgment.
- (2) If the data got written by the node, but the acknowledgement can't be returned to the sender of the query because of network interruptions, the sender will either get a timeout or a network error.

From the collector's perspective, (1) and (2) can be hard to distinguish. However, in both cases, the unacknowledged insert can just be retried immediately. As long as the retried insert query contains the same data in the same order, ClickHouse will automatically ignore the retried insert if the original (unacknowledged) insert succeeded.

For this reason, the ClickStack distribution of the OTel collector uses the [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md). This ensures inserts are sent as consistent batches of rows satisfying the above requirements. If a collector is expected to have high throughput (events per second), and at least 5000 events can be sent in each insert, this is usually the only batching required in the pipeline. In this case the collector will flush batches before the batch processor's `timeout` is reached, ensuring the end-to-end latency of the pipeline remains low and batches are of a consistent size.

### Use asynchronous inserts {#use-asynchronous-inserts}

Typically, users are forced to send smaller batches when the throughput of a collector is low, and yet they still expect data to reach ClickHouse within a minimum end-to-end latency. In this case, small batches are sent when the `timeout` of the batch processor expires. This can cause problems and is when asynchronous inserts are required. This issue is rare if users are sending data to the ClickStack collector acting as a Gateway - by acting as aggregators, they alleviate this problem - see [Collector roles](#collector-roles).

If large batches cannot be guaranteed, users can delegate batching to ClickHouse using [Asynchronous Inserts](/best-practices/selecting-an-insert-strategy#asynchronous-inserts). With asynchronous inserts, data is inserted into a buffer first and then written to the database storage later or asynchronously respectively.

<Image img={observability_6} alt="Async inserts" size="md"/>

With [asynchronous inserts enabled](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), when ClickHouse ① receives an insert query, the query's data is ② immediately written into an in-memory buffer first. When ③ the next buffer flush takes place, the buffer's data is [sorted](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) and written as a part to the database storage. Note, that the data is not searchable by queries before being flushed to the database storage; the buffer flush is [configurable](/optimize/asynchronous-inserts).

To enable asynchronous inserts for the collector, add `async_insert=1` to the connection string. We recommend users use `wait_for_async_insert=1` (the default) to get delivery guarantees - see [here](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) for further details.

Data from an async insert is inserted once the ClickHouse buffer is flushed. This occurs either after the [`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) is exceeded or after [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) milliseconds since the first INSERT query. If the `async_insert_stale_timeout_ms` is set to a non-zero value, the data is inserted after `async_insert_stale_timeout_ms milliseconds` since the last query. Users can tune these settings to control the end-to-end latency of their pipeline. Further settings that can be used to tune buffer flushing are documented [here](/operations/settings/settings#async_insert). Generally, defaults are appropriate.

:::note Consider Adaptive Asynchronous Inserts
In cases where a low number of agents are in use, with low throughput but strict end-to-end latency requirements, [adaptive asynchronous inserts](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) may be useful. Generally, these are not applicable to high throughput Observability use cases, as seen with ClickHouse.
:::

Finally, the previous deduplication behavior associated with synchronous inserts into ClickHouse is not enabled by default when using asynchronous inserts. If required, see the setting [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate).

Full details on configuring this feature can be found on this [docs page](/optimize/asynchronous-inserts#enabling-asynchronous-inserts), or with a deep dive [blog post](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse).

## Scaling {#scaling}

The ClickStack OTel collector acts a Gateway instance - see [Collector roles](#collector-roles). These provide a standalone service, typically per data center or per region. These receive events from applications (or other collectors in the agent role) via a single OTLP endpoint. Typically a set of collector instances are deployed, with an out-of-the-box load balancer used to distribute the load amongst them.

<Image img={clickstack_with_gateways} alt="Scaling with gateways" size="lg"/>

The objective of this architecture is to offload computationally intensive processing from the agents, thereby minimizing their resource usage. These ClickStack gateways can perform transformation tasks that would otherwise need to be done by agents. Furthermore, by aggregating events from many agents, the gateways can ensure large batches are sent to ClickHouse - allowing efficient insertion. These gateway collectors can easily be scaled as more agents and SDK sources are added and event throughput increases. 

### Adding Kafka {#adding-kafka}

Readers may notice the above architectures do not use Kafka as a message queue.

Using a Kafka queue as a message buffer is a popular design pattern seen in logging architectures and was popularized by the ELK stack. It provides a few benefits: principally, it helps provide stronger message delivery guarantees and helps deal with backpressure. Messages are sent from collection agents to Kafka and written to disk. In theory, a clustered Kafka instance should provide a high throughput message buffer since it incurs less computational overhead to write data linearly to disk than parse and process a message. In Elastic, for example, tokenization and indexing incurs significant overhead. By moving data away from the agents, you also incur less risk of losing messages as a result of log rotation at the source. Finally, it offers some message reply and cross-region replication capabilities, which might be attractive for some use cases.

However, ClickHouse can handle inserting data very quickly - millions of rows per second on moderate hardware. Backpressure from ClickHouse is rare. Often, leveraging a Kafka queue means more architectural complexity and cost. If you can embrace the principle that logs do not need the same delivery guarantees as bank transactions and other mission-critical data, we recommend avoiding the complexity of Kafka.

However, if you require high delivery guarantees or the ability to replay data (potentially to multiple sources), Kafka can be a useful architectural addition.

<Image img={observability_8} alt="Adding kafka" size="lg"/>

In this case, OTel agents can be configured to send data to Kafka via the [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md). Gateway instances, in turn, consume messages using the [Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md). We recommend the Confluent and OTel documentation for further details.

:::note OTel collector configuration
The ClickStack OpenTelemetry collector distribution can be configured with Kafka using [custom collector configuration](#extending-collector-config).
:::

## Estimating resources {#estimating-resources}

Resource requirements for the OTel collector will depend on the event throughput, the size of messages and amount of processing performed. The OpenTelemetry project maintains [benchmarks users](https://opentelemetry.io/docs/collector/benchmarks/) can use to estimate resource requirements.

[In our experience](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview), a ClickStack gateway instance with 3 cores and 12GB of RAM can handle around 60k events per second. This assumes a minimal processing pipeline responsible for renaming fields and no regular expressions.

For agent instances responsible for shipping events to a gateway, and only setting the timestamp on the event, we recommend users size based on the anticipated logs per second. The following represent approximate numbers users can use as a starting point:

| Logging rate | Resources to collector agent |
|--------------|------------------------------|
| 1k/second    | 0.2CPU, 0.2GiB              |
| 5k/second    | 0.5 CPU, 0.5GiB             |
| 10k/second   | 1 CPU, 1GiB                 |

## JSON support {#json-support}

<BetaBadge/>

:::warning Beta Feature
JSON type support in **ClickStack** is a **beta feature**. While the JSON type itself is production-ready in ClickHouse 25.3+, its integration within ClickStack is still under active development and may have limitations, change in the future, or contain bugs
:::

ClickStack has beta support for the [JSON type](/interfaces/formats/JSON) from version `2.0.4`.

### Benefits of the JSON type {#benefits-json-type}

The JSON type offers the following benefits to ClickStack users:

- **Type preservation** - Numbers stay numbers, booleans stay booleans—no more flattening everything into strings. This means fewer casts, simpler queries, and more accurate aggregations.
- **Path-level columns** - Each JSON path becomes its own sub-column, reducing I/O. Queries only read the fields they need, unlocking major performance gains over the old Map type which required the entire column to be read in order to query a specific field.
- **Deep nesting just works** - Naturally handle complex, deeply nested structures without manual flattening (as required by the Map type) and subsequent awkward JSONExtract functions.
- **Dynamic, evolving schemas** - Perfect for observability data where teams add new tags and attributes over time. JSON handles these changes automatically, without schema migrations. 
- **Faster queries, lower memory** - Typical aggregations over attributes like `LogAttributes` see 5-10x less data read and dramatic speedups, cutting both query time and peak memory usage.
- **Simple management** - No need to pre-materialize columns for performance. Each field becomes its own sub-column, delivering the same speed as native ClickHouse columns.

### Enabling JSON support {#enabling-json-support}

To enable this support for the collector, set the environment variable `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` on any deployment that includes the collector. This ensures the schemas are created in ClickHouse using the JSON type.

:::note HyperDX support
In order to query the JSON type, support must also be enabled in the HyperDX application layer via the environment variable `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`.
:::

For example:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```

### Migrating from map-based schemas to the JSON type {#migrating-from-map-based-schemas-to-json}

:::important Backwards compatibility
The [JSON type](/interfaces/formats/JSON) is **not backwards compatible** with existing map-based schemas. Enabling this feature will create new tables using the `JSON` type and requires manual data migration.
:::

To migrate from the Map-based schemas, follow these steps:

<VerticalStepper headerLevel="h4">

#### Stop the OTel collector {#stop-the-collector}

#### Rename existing tables and update sources {#rename-existing-tables-sources}

Rename existing tables and update data sources in HyperDX. 

For example:

```sql
RENAME TABLE otel_logs TO otel_logs_map;
RENAME TABLE otel_metrics TO otel_metrics_map;
```

#### Deploy the collector  {#deploy-the-collector}

Deploy the collector with `OTEL_AGENT_FEATURE_GATE_ARG` set.

#### Restart the HyperDX container with JSON schema support {#restart-the-hyperdx-container}

```shell
export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
```

#### Create new data sources {#create-new-data-sources}

Create new data sources in HyperDX pointing to the JSON tables.

</VerticalStepper>

#### Migrating existing data (optional) {#migrating-existing-data}

To move old data into the new JSON tables:

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
約100億行未満のデータセットにのみ推奨されます。過去に `Map` 型で保存したデータでは型の精度が保持されておらず（すべての値が文字列でした）、その結果、この古いデータは保持期間を過ぎて削除されるまでは新しいスキーマでも文字列として扱われ、フロントエンド側でのキャストが必要になります。一方、新しいデータについては `JSON` 型により本来の型が保持されます。
:::
