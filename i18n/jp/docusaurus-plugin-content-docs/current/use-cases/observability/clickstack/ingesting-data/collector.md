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
      - '13133:13133' # health_check拡張
      - '24225:24225' # fluentdレシーバー
      - '4317:4317' # OTLP gRPCレシーバー
      - '4318:4318' # OTLP httpレシーバー
      - '8888:8888' # metrics拡張
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
  # ローカルファイルからログを収集
  filelog:
    include:
      - /var/log/**/*.log
      - /var/log/syslog
      - /var/log/messages
    start_at: beginning

  # ホストシステムのメトリクスを収集
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
    # ログパイプライン
    logs/host:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
    
    # メトリクスパイプライン
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

すべての OTLP 通信で、[インジェスト API key を含む Authorization ヘッダー](#securing-the-collector) を必ず付与する必要がある点に注意してください。

より高度な設定については、[OpenTelemetry Collector のドキュメント](https://opentelemetry.io/docs/collector/) を参照してください。

## 挿入の最適化 {#optimizing-inserts}

ClickStack collector 経由で Observability データを ClickHouse に挿入する際に、高い挿入性能と強い一貫性保証を両立するには、いくつかの単純なルールに従う必要があります。OTel collector を正しく構成すれば、これらのルールに従うことは容易になります。これにより、ClickHouse を初めて利用するユーザーが直面しがちな[一般的な問題](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)も回避できます。

### バッチ処理 {#batching}

デフォルトでは、ClickHouse に送信された各 insert に対して、ClickHouse はその insert のデータと、あわせて保存する必要があるその他のメタデータを含むストレージパーツを即座に作成します。したがって、各 insert に少量のデータしか含まない大量の insert を送信するよりも、各 insert により多くのデータを含めた少数の insert を送信するほうが、必要な書き込み回数を削減できます。データは一度に少なくとも 1,000 行以上の、十分に大きなバッチで挿入することを推奨します。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)を参照してください。

デフォルトでは、ClickHouse への insert は同期的に実行され、内容が同一であれば冪等です。merge tree エンジンファミリーのテーブルに対しては、ClickHouse はデフォルトで自動的に [insert の重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)を行います。これは、次のようなケースでも insert が安全に扱えることを意味します。

- (1) データを受け取るノードに問題がある場合、insert クエリはタイムアウト（またはより具体的なエラー）となり、ACK（確認応答）を受け取りません。
- (2) データ自体はノードによって書き込まれたものの、ネットワーク障害によりクエリ送信元へ ACK を返せない場合、送信元はタイムアウトまたはネットワークエラーを受け取ります。

collector の視点からは、(1) と (2) を区別するのは難しい場合があります。しかし、どちらの場合でも、ACK が返ってこなかった insert はそのまま直ちにリトライできます。リトライした insert クエリが同じ順序で同じデータを含んでいる限り、元の（ACK されなかった）insert が成功していれば、ClickHouse はリトライされた insert を自動的に無視します。

このため、ClickStack に含まれる OTel collector では [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md) を使用しています。これにより、上記の要件を満たす行の一貫したバッチとして insert が送信されます。collector に高いスループット（毎秒イベント数）が想定されており、各 insert で少なくとも 5,000 イベントを送信できる場合、通常はパイプラインで必要となるバッチ処理はこれだけで十分です。この場合、collector は batch processor の `timeout` に達する前にバッチをフラッシュし、パイプライン全体のレイテンシを低く保ちつつ、バッチサイズの一貫性を確保します。

### 非同期挿入を使用する {#use-asynchronous-inserts}

通常、コレクターのスループットが低い場合、ユーザーはより小さなバッチを送信せざるを得ませんが、それでもエンドツーエンドのレイテンシーを最小限に抑えつつ、データが ClickHouse に届くことを期待します。このような場合、バッチプロセッサの `timeout` が切れると小さなバッチが送信されます。これが問題を引き起こすことがあり、その際に非同期挿入が必要となります。ClickStack コレクターを Gateway として動作させてそこにデータを送信している場合、この問題はまれです。アグリゲーターとして動作することでこの問題を緩和できるためです。詳細は [Collector roles](#collector-roles) を参照してください。

大きなバッチを保証できない場合、[Asynchronous Inserts](/best-practices/selecting-an-insert-strategy#asynchronous-inserts) を使用してバッチ処理を ClickHouse に委譲できます。非同期挿入では、データはまずバッファに挿入され、その後データベースストレージに後から、すなわち非同期に書き込まれます。

<Image img={observability_6} alt="非同期挿入" size="md"/>

[非同期挿入が有効](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)な場合、ClickHouse が ① 挿入クエリを受信すると、そのクエリのデータは ② まず即座にインメモリバッファに書き込まれます。③ 次のバッファフラッシュが発生すると、バッファ内のデータは [ソートされ](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)、パーツとしてデータベースストレージに書き込まれます。なお、データはデータベースストレージにフラッシュされるまではクエリで検索できません。バッファフラッシュのタイミングは[設定可能](/optimize/asynchronous-inserts)です。

コレクターで非同期挿入を有効にするには、接続文字列に `async_insert=1` を追加します。到達保証を得るために、`wait_for_async_insert=1`（デフォルト）の使用を推奨します。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。

非同期挿入によるデータは、ClickHouse のバッファがフラッシュされたときに挿入されます。これは、[`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) を超えた場合、または最初の INSERT クエリから [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) ミリ秒経過した場合のいずれかで発生します。`async_insert_stale_timeout_ms` にゼロ以外の値が設定されている場合は、最後のクエリから `async_insert_stale_timeout_ms milliseconds` 経過後にデータが挿入されます。これらの設定を調整することで、パイプラインのエンドツーエンドのレイテンシーを制御できます。バッファフラッシュの調整に使用できるその他の設定は[こちら](/operations/settings/settings#async_insert)に記載されています。一般的には、デフォルト値で問題ありません。

:::note 適応型非同期挿入の検討
エージェント数が少なく、スループットも低い一方でエンドツーエンドのレイテンシーに厳しい要件がある場合、[adaptive asynchronous inserts](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) が有用な場合があります。一般的に、これは ClickHouse で見られるような高スループットのオブザーバビリティユースケースにはあまり適していません。
:::

最後に、ClickHouse への同期挿入に関連付けられていた従来の重複排除動作は、非同期挿入を使用する場合はデフォルトでは有効になりません。必要に応じて、設定 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate) を参照してください。

この機能の設定方法の詳細は、この[ドキュメントページ](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)や、より詳しい[ブログ記事](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。

## スケーリング {#scaling}

ClickStack の OTel collector はゲートウェイ インスタンスとして動作します。詳細は [Collector roles](#collector-roles) を参照してください。これは通常、データセンターごと、あるいはリージョンごとに独立したサービスとして提供されます。これらはアプリケーション（またはエージェントロールの他の collector）から、単一の OTLP エンドポイント経由でイベントを受信します。一般的には複数の collector インスタンスをデプロイし、標準的なロードバランサーを使用して、それらの間で負荷を分散します。

<Image img={clickstack_with_gateways} alt="ゲートウェイによるスケーリング" size="lg"/>

このアーキテクチャの目的は、計算負荷の高い処理をエージェントからオフロードし、エージェントのリソース使用量を最小限に抑えることです。これらの ClickStack ゲートウェイは、本来であればエージェント側で実行する必要がある変換処理を実行できます。さらに、多数のエージェントからイベントを集約することで、ゲートウェイは ClickHouse に対して大きなバッチを送信できるようになり、効率的な挿入が可能になります。エージェントや SDK ソースの追加やイベントスループットの増加に応じて、これらのゲートウェイ collector は容易にスケールアウトできます。 

### Kafka の追加 {#adding-kafka}

ここまでに示したアーキテクチャでは、メッセージキューとして Kafka を使用していないことに気付く読者もいるでしょう。

メッセージバッファとして Kafka キューを用いるのは、ログ収集アーキテクチャでよく見られる一般的な設計パターンであり、ELK スタックによって広く普及しました。これにはいくつかの利点があります。主として、より強いメッセージ配送保証を提供し、バックプレッシャーへの対応に役立つ点です。メッセージは収集エージェントから Kafka に送信され、ディスクに書き込まれます。理論上、クラスタ構成の Kafka インスタンスは、高スループットなメッセージバッファを提供できます。これは、メッセージを解析・処理するよりも、データをディスクに線形に書き込む方が計算オーバーヘッドが小さいためです。例えば Elastic では、トークナイズやインデックス作成に大きなオーバーヘッドが発生します。データをエージェントから切り離すことで、送信元でのログローテーションによってメッセージを失うリスクも減らすことができます。最後に、一部のユースケースでは魅力となり得る、メッセージのリプレイ機能やリージョン間レプリケーション機能も提供します。

しかし、ClickHouse はデータを非常に高速に挿入でき、通常のハードウェアでも毎秒数百万行を処理できます。ClickHouse 側でバックプレッシャーが発生することはまれです。多くの場合、Kafka キューを活用することは、アーキテクチャの複雑さとコストの増加を意味します。ログは銀行取引やその他のミッションクリティカルなデータと同等の配送保証を必要としない、という原則を受け入れられるのであれば、Kafka を導入してまでアーキテクチャを複雑化させることは避けることを推奨します。

一方で、高い配送保証や（複数の宛先に対して）データをリプレイできる機能が必要な場合、Kafka は有用なアーキテクチャ上の追加要素となり得ます。

<Image img={observability_8} alt="Kafka の追加" size="lg"/>

この場合、OTel エージェントは [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) を使用して Kafka にデータを送信するよう構成できます。ゲートウェイインスタンスは、[Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) を使用してメッセージを消費します。詳細については Confluent と OTel のドキュメントを参照することを推奨します。

:::note OTel collector の構成
ClickStack の OpenTelemetry collector ディストリビューションは、[custom collector configuration](#extending-collector-config) を使用して Kafka を組み込むように構成できます。
:::

## リソースの見積もり {#estimating-resources}

OTel collector のリソース要件は、イベントのスループット、メッセージサイズ、および実行される処理量によって異なります。OpenTelemetry プロジェクトは、リソース要件を見積もる際に使用できる[ベンチマーク](https://opentelemetry.io/docs/collector/benchmarks/)を提供しています。

[当社の経験では](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)、3 コアと 12GB の RAM を持つ ClickStack ゲートウェイのインスタンスで、1 秒あたり約 60k イベントを処理できます。これは、フィールド名の変更のみを行い、正規表現を使用しない最小限の処理パイプラインを想定しています。

ゲートウェイへのイベント転送と、イベントへのタイムスタンプ設定のみを担当するエージェントインスタンスについては、想定される 1 秒あたりのログ数に基づいてサイジングすることを推奨します。以下は、検討を始める際の目安となる概算値です。

| ログレート | collector エージェントへのリソース |
|--------------|------------------------------|
| 1k/秒        | 0.2 CPU, 0.2GiB             |
| 5k/秒        | 0.5 CPU, 0.5GiB             |
| 10k/秒       | 1 CPU, 1GiB                 |

## JSON サポート {#json-support}

<BetaBadge/>

:::warning ベータ機能
**ClickStack** における JSON 型サポートは**ベータ機能**です。JSON 型自体は ClickHouse 25.3+ で本番運用が可能な状態ですが、ClickStack 内での統合は現在も活発に開発が進められており、制限があったり、将来変更されたり、不具合を含む可能性があります。
:::

ClickStack はバージョン `2.0.4` から [JSON 型](/interfaces/formats/JSON) のベータサポートを提供しています。

### JSON 型の利点 {#benefits-json-type}

JSON 型は、ClickStack ユーザーに対して次のような利点を提供します。

- **型の保持** - 数値は数値のまま、boolean は boolean のまま維持され、すべてを文字列にフラット化する必要がなくなります。これにより、キャストが減り、クエリがシンプルになり、集計の精度も向上します。
- **パスレベルのカラム** - 各 JSON パスはそれぞれ独立したサブカラムになり、I/O が削減されます。クエリは必要なフィールドだけを読み取るため、特定のフィールドを問い合わせるためにカラム全体を読み込む必要があった従来の Map 型に比べて、大きな性能向上が得られます。
- **深いネストにもそのまま対応** - 複雑で深くネストした構造を、Map 型で必要とされていたような手動のフラット化や、その後の扱いづらい JSONExtract 関数なしで自然に扱えます。
- **動的で進化するスキーマ** - チームが時間とともに新しいタグや属性を追加していくようなオブザーバビリティデータに最適です。JSON はこれらの変更をスキーマ移行なしで自動的に処理します。
- **より高速なクエリと低いメモリ消費** - `LogAttributes` のような属性に対する典型的な集計では、読み取るデータ量が 5〜10 倍少なくなり、クエリ速度が劇的に向上することで、クエリ時間とピークメモリ使用量の両方を削減できます。
- **シンプルな管理** - 性能のためにカラムを事前にマテリアライズする必要はありません。各フィールドが独立したサブカラムとなり、ネイティブな ClickHouse カラムと同等の速度を実現します。

### JSON サポートを有効化する {#enabling-json-support}

コレクターでこのサポートを有効にするには、コレクターを含む任意のデプロイメントに対して環境変数 `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` を設定します。これにより、ClickHouse 上でスキーマが JSON 型として作成されます。

:::note HyperDX のサポート
JSON 型をクエリできるようにするには、環境変数 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` を設定し、HyperDX のアプリケーションレイヤーでもサポートを有効化する必要があります。
:::

たとえば、次のように設定します。

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest
```


### Map ベースのスキーマから JSON 型への移行 {#migrating-from-map-based-schemas-to-json}

:::important 後方互換性
[JSON type](/interfaces/formats/JSON) は既存の Map ベースのスキーマと **後方互換性がありません**。この機能を有効にすると、`JSON` 型を使用する新しいテーブルが作成されるため、データ移行を手動で実施する必要があります。
:::

Map ベースのスキーマから移行するには、次の手順に従います。

<VerticalStepper headerLevel="h4">

#### OTel collector を停止する {#stop-the-collector}

#### 既存のテーブル名を変更し、ソースを更新する {#rename-existing-tables-sources}

既存のテーブル名を変更し、HyperDX 内のデータソースを更新します。

例えば次のように実行します:

```sql
RENAME TABLE otel_logs TO otel_logs_map;
RENAME TABLE otel_metrics TO otel_metrics_map;
```

#### OTel collector をデプロイする  {#deploy-the-collector}

`OTEL_AGENT_FEATURE_GATE_ARG` を設定した状態で OTel collector をデプロイします。

#### JSON スキーマ対応の HyperDX コンテナを再起動する {#restart-the-hyperdx-container}

```shell
export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
```

#### 新しいデータソースを作成する {#create-new-data-sources}

JSON テーブルを参照する新しいデータソースを HyperDX 内に作成します。

</VerticalStepper>

#### 既存データの移行（任意） {#migrating-existing-data}

既存のデータを新しい JSON テーブルに移行するには:

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
約100億行未満のデータセットにのみ推奨されます。過去に `Map` 型で保存したデータでは型の精度が保持されておらず（すべての値が文字列でした）、その結果、この古いデータは保持期間を過ぎて削除されるまでは新しいスキーマでも文字列として扱われ、フロントエンド側でのキャストが必要になります。一方、新しいデータについては `JSON` 型により本来の型が保持されます。
:::
