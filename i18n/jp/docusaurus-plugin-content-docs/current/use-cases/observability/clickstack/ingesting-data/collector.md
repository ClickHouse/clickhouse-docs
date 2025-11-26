---
slug: /use-cases/observability/clickstack/ingesting-data/otel-collector
pagination_prev: null
pagination_next: null
description: 'ClickStack 向け OpenTelemetry collector - ClickHouse オブザーバビリティスタック'
sidebar_label: 'OpenTelemetry collector'
title: 'ClickStack OpenTelemetry collector'
doc_type: 'guide'
keywords: ['ClickStack', 'OpenTelemetry collector', 'ClickHouse オブザーバビリティ', 'OTel collector の構成', 'OpenTelemetry ClickHouse']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

このページでは、公式の ClickStack OpenTelemetry（OTel）コレクターの設定方法に関する詳細を説明します。


## コレクターのロール {#collector-roles}

OpenTelemetry コレクターは主に 2 つのロールでデプロイできます:

- **エージェント (Agent)** - エージェントのインスタンスは、サーバーや Kubernetes ノード上などエッジでデータを収集したり、OpenTelemetry SDK でインスツルメントされたアプリケーションからイベントを直接受信します。後者の場合、エージェントのインスタンスはアプリケーションと同じプロセス、または同じホスト（サイドカーやデーモンセットなど）上で動作します。エージェントは収集したデータを直接 ClickHouse に送信することも、ゲートウェイのインスタンスに送信することもできます。前者の場合、この方式は [Agent deployment pattern](https://opentelemetry.io/docs/collector/deployment/agent/) と呼ばれます。 

- **ゲートウェイ (Gateway)** - ゲートウェイのインスタンスは、スタンドアロンのサービス（例: Kubernetes におけるデプロイメント）として提供され、通常はクラスター単位、データセンター単位、またはリージョン単位で配置されます。これらはアプリケーション（もしくはエージェントとして動作する他のコレクター）から、単一の OTLP エンドポイント経由でイベントを受信します。一般的には、複数のゲートウェイ・インスタンスをデプロイし、市販または標準的なロードバランサーを用いてそれらの間で負荷分散を行います。すべてのエージェントおよびアプリケーションがこの単一のエンドポイントにシグナルを送信する場合、この方式は [Gateway deployment pattern](https://opentelemetry.io/docs/collector/deployment/gateway/) と呼ばれることがよくあります。 

**重要: コレクターは、ClickStack のデフォルトディストリビューションを含め、エージェントや SDK からデータを受信する[以下で説明するゲートウェイ・ロール](#collector-roles)を想定しています。**

エージェント・ロールで OTel collector をデプロイするユーザーは、通常、ClickStack 版ではなく [collector の default contrib distribution](https://github.com/open-telemetry/opentelemetry-collector-contrib) を使用しますが、[Fluentd](https://www.fluentd.org/) や [Vector](https://vector.dev/) など、他の OTLP 互換テクノロジーを自由に利用することもできます。



## コレクターのデプロイ

HyperDX のみのディストリビューションを使用する場合など、スタンドアロンのデプロイメントで独自の OpenTelemetry collector を管理している場合でも、可能であればゲートウェイの役割には[公式の ClickStack ディストリビューション版コレクターの使用を推奨します](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector)。ただし、独自のコレクターを利用することを選択する場合は、[ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) が含まれていることを必ず確認してください。

### スタンドアロン

スタンドアロンモードで OTel コレクターの ClickStack ディストリビューション版をデプロイするには、次の Docker コマンドを実行します。

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME`、`CLICKHOUSE_PASSWORD` の環境変数を使用して、対象の ClickHouse インスタンスを上書きできる点に注意してください。`CLICKHOUSE_ENDPOINT` には、プロトコルおよびポートを含む完全な ClickHouse の HTTP エンドポイントを指定する必要があります。たとえば `http://localhost:8123` のようになります。

**これらの環境変数は、コネクタを含む任意の Docker ディストリビューションで使用できます。**

`OPAMP_SERVER_URL` は、たとえば `http://localhost:4320` のように、自身の HyperDX デプロイメントを指すように設定する必要があります。HyperDX は、デフォルトでポート `4320` 上の `/v1/opamp` に OpAMP (Open Agent Management Protocol) サーバーを公開します。HyperDX を実行しているコンテナからこのポートが公開されていることを確認してください (例: `-p 4320:4320` を使用)。

:::note OpAMP ポートの公開と接続
コレクターが OpAMP ポートに接続できるようにするには、そのポートが HyperDX コンテナによって公開されている必要があります (例: `-p 4320:4320`)。ローカルテストの場合、OSX ユーザーは `OPAMP_SERVER_URL=http://host.docker.internal:4320` を設定できます。Linux ユーザーは `--network=host` を指定してコレクターコンテナを起動できます。
:::

本番環境では、[適切なクレデンシャル](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user) を持つユーザーを使用する必要があります。

### 設定の変更

#### Docker の使用

OpenTelemetry コレクターを含むすべての Docker イメージは、環境変数 `OPAMP_SERVER_URL`、`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME`、`CLICKHOUSE_PASSWORD` を使用して、接続先の ClickHouse インスタンスを構成できます。

例として、オールインワンイメージは次のとおりです。

```shell
export OPAMP_SERVER_URL=<OPAMP_SERVER_URL>
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

#### Docker Compose

Docker Compose を使用する場合も、上記と同じ環境変数を使用してコレクター設定を変更します。

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

### 高度な設定

ClickStack ディストリビューション版の OTel collector では、カスタム設定ファイルをマウントし、環境変数を設定することで、ベース設定を拡張できます。カスタム設定は、OpAMP 経由で HyperDX によって管理されるベース設定と統合されます。


#### コレクター設定の拡張

カスタムの receiver、processor、または pipeline を追加するには、次の手順を実行します。

1. 追加の設定を含むカスタム設定ファイルを作成します
2. ファイルを `/etc/otelcol-contrib/custom.config.yaml` にマウントします
3. 環境変数 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml` を設定します

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

**オールインワンイメージを使ってデプロイする：**

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

**スタンドアロンコレクターを使ってデプロイする：**

```bash
docker run -d \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

:::note
新しい `receivers`、`processors`、`pipelines` はカスタム構成内でのみ定義してください。ベースとなる processors（`memory_limiter`、`batch`）と exporters（`clickhouse`）はすでに定義されているため、名前で参照します。カスタム構成はベース構成とマージされ、既存のコンポーネントを上書きすることはできません。
:::

より複雑な構成については、[デフォルトの ClickStack collector 構成](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml)および [ClickHouse exporter ドキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)を参照してください。

#### 構成の構造

[`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/)、[`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)、[`processors`](https://opentelemetry.io/docs/collector/configuration/#processors) を含む OTel collector の構成の詳細については、[公式 OpenTelemetry collector ドキュメント](https://opentelemetry.io/docs/collector/configuration)を参照することを推奨します。


## コレクターのセキュリティ保護

OpenTelemetry collector の ClickStack ディストリビューションには OpAMP (Open Agent Management Protocol) のサポートが組み込まれており、これを使用して OTLP エンドポイントを安全に構成および管理します。起動時に、ユーザーは `OPAMP_SERVER_URL` 環境変数を指定する必要があります。これは、`/v1/opamp` で OpAMP API を提供している HyperDX アプリを指すように設定してください。

この連携により、OTLP エンドポイントは HyperDX アプリのデプロイ時に自動生成されるインジェスト API key によって保護されます。コレクターに送信されるすべてのテレメトリデータには、認証のためにこの API key を含める必要があります。キーは HyperDX アプリの `Team Settings → API Keys` から確認できます。

<Image img={ingestion_key} alt="インジェストキー" size="lg" />

デプロイメントをさらに安全にするために、次のことを推奨します。

* コレクターが ClickHouse と HTTPS 経由で通信するように設定する。
* 権限を限定したインジェスト専用ユーザーを作成する（後述）。
* OTLP エンドポイントで TLS を有効化し、SDK/エージェントとコレクター間の通信を暗号化する。これは [カスタムコレクター設定](#extending-collector-config) で構成できます。

### インジェスト用ユーザーの作成

ClickHouse へのインジェストのために、OTel collector 専用のデータベースとユーザーを作成することを推奨します。これには、[ClickStack によって作成・使用されるテーブル](/use-cases/observability/clickstack/ingesting-data/schemas)を作成し、そこへ挿入できる権限を付与してください。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

ここでは、コレクターがデータベース `otel` を使用するように設定されていることを前提としています。これは、環境変数 `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE` によって制御できます。collector を含むイメージに、[他の環境変数と同様に](#modifying-otel-collector-configuration) この値を渡します。


## 処理 - フィルタリング、変換、およびエンリッチメント {#processing-filtering-transforming-enriching}

ユーザーはインジェスト中にイベントメッセージをフィルタリング、変換、およびエンリッチしたいことがよくあります。ClickStack コネクタの設定は変更できないため、さらなるイベントフィルタリングや処理が必要なユーザーには、次のいずれかを推奨します。

- 独自の OTel collector をデプロイし、その中でフィルタリングと処理を行い、イベントを OTLP 経由で ClickStack collector に送信して ClickHouse にインジェストする。
- 独自の OTel collector をデプロイし、ClickHouse exporter を使用してイベントを直接 ClickHouse に送信する。

処理を OTel collector を使って行う場合、ゲートウェイインスタンス側で変換を行い、エージェントインスタンス側での処理を最小限に抑えることを推奨します。これにより、サーバー上で動作するエッジ側のエージェントに必要なリソースをできるだけ少なくできます。一般的に、ユーザーはフィルタリング（不要なネットワーク使用量を最小化するため）、タイムスタンプの設定（オペレーター経由）、およびコンテキストを必要とするエンリッチメントのみをエージェントで行います。たとえば、ゲートウェイインスタンスが別の Kubernetes クラスター内にある場合、k8s のエンリッチメントはエージェント側で行う必要があります。

OpenTelemetry は、ユーザーが活用できる次の処理およびフィルタリング機能をサポートしています。

- **Processors** - Processor は、[receiver によって収集されたデータをエクスポーターに送信する前に変更または変換](https://opentelemetry.io/docs/collector/transforming-telemetry/)します。Processor は collector 設定の `processors` セクションに記述された順序で適用されます。これらは任意ですが、最小限のセットは[一般的に推奨](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)されます。OTel collector を ClickHouse と併用する場合、Processor は次のものに制限することを推奨します。

- [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md) は、collector 上でのメモリ不足の事態を防ぐために使用します。推奨事項については [Estimating Resources](#estimating-resources) を参照してください。
- コンテキストに基づいてエンリッチメントを行う任意の Processor。たとえば、[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor) は、k8s メタデータを使って span、メトリクス、およびログのリソース属性を自動的に設定できます（例: イベントをその送信元のポッド ID でエンリッチする）。
- トレースに必要な場合の [テイルまたはヘッドサンプリング](https://opentelemetry.io/docs/concepts/sampling/)。
- [基本的なフィルタリング](https://opentelemetry.io/docs/collector/transforming-telemetry/) - オペレーター経由では実施できない場合に、不要なイベントをドロップする（後述）。
- [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - ClickHouse と連携する場合に、データをバッチで送信するために不可欠です。["Optimizing inserts"](#optimizing-inserts) を参照してください。

- **Operators** - [Operators](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md) は、receiver で利用可能な最も基本的な処理単位を提供します。基本的なパースがサポートされており、Severity や Timestamp などのフィールドを設定できます。ここでは JSON および正規表現によるパースに加え、イベントフィルタリングや基本的な変換がサポートされています。イベントフィルタリングはここで行うことを推奨します。

オペレーターや [transform processors](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md) を使用して過度なイベント処理を行うことは避けることを推奨します。これらは特に JSON パースにおいて、多大なメモリおよび CPU オーバーヘッドを招く可能性があります。いくつかの例外、具体的にはコンテキストを考慮したエンリッチメント（例: k8s メタデータの追加）を除き、INSERT 時に ClickHouse 側でマテリアライズドビューや列を用いてすべての処理を行うことも可能です。詳細については、[Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql) を参照してください。

### 例 {#example-processing}

次の設定は、この[非構造化ログファイル](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)の収集方法を示しています。この設定は、エージェントロールの collector が ClickStack ゲートウェイへデータを送信する際に使用できます。

`regex_parser` オペレーターを使用してログ行から構造を抽出し、イベントをフィルタリングしている点と、Processor を使用してイベントをバッチ化しメモリ使用量を制限している点に注目してください。



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
      address: 0.0.0.0:9888 # 同一ホスト上で2つのコレクターを実行しているため変更
  pipelines:
    logs:
      receivers: [filelog]
      processors: [batch]
      exporters: [otlphttp/hdx]

```

OTLP で通信する際は、必ず [インジェスト API key を含む Authorization ヘッダー](#securing-the-collector) を付与する必要がある点に注意してください。

より高度な設定については、[OpenTelemetry collector のドキュメント](https://opentelemetry.io/docs/collector/) を参照してください。


## 挿入の最適化 {#optimizing-inserts}

高い挿入パフォーマンスと強い整合性保証を両立するために、ユーザーは ClickStack collector 経由で ClickHouse に Observability データを挿入する際、いくつかの簡単なルールに従う必要があります。OTel collector を正しく構成していれば、これらのルールに従うことは容易です。また、これにより、初めて ClickHouse を使用する際に遭遇しがちな[一般的な問題](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)も回避できます。

### バッチ処理 {#batching}

デフォルトでは、ClickHouse に送信された各挿入は、挿入されたデータおよび保存が必要なその他のメタデータを含むストレージのパーツを、ClickHouse が即座に作成します。そのため、少量のデータを含む多数の挿入を行うよりも、より多くのデータを含む少数の挿入を行う方が、必要な書き込み回数を減らせます。1 回あたり少なくとも 1,000 行以上の、比較的大きなバッチでデータを挿入することを推奨します。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)を参照してください。

デフォルトでは、ClickHouse への挿入は同期的に行われ、内容が同一であれば冪等です。MergeTree エンジンファミリーのテーブルでは、ClickHouse はデフォルトで自動的に[挿入の重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)を行います。これは、挿入が次のようなケースに対して耐性を持つことを意味します。

- (1) データを受信したノードに問題が発生した場合、挿入クエリはタイムアウト（またはより具体的なエラー）し、ACK を受信できません。
- (2) ノードによってデータは書き込まれたものの、ネットワーク中断によりクエリ送信元に ACK を返せない場合、送信側はタイムアウトかネットワークエラーを受け取ります。

collector の観点では、(1) と (2) を区別するのは困難です。しかし、どちらの場合でも、ACK を受け取れていない挿入は直ちにリトライできます。リトライされた挿入クエリに、同じ順序で同じデータが含まれている限り、元の（ACK されなかった）挿入が成功していれば、ClickHouse はリトライされた挿入を自動的に無視します。

このため、OTel collector の ClickStack ディストリビューションでは、[batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)を使用します。これにより、上記要件を満たす一貫した行バッチとして挿入が送信されることが保証されます。collector に高スループット（毎秒イベント数）が期待され、かつ 1 回の挿入で少なくとも 5000 イベントを送信できる場合、通常はパイプラインで必要となるバッチ処理はこれだけです。この場合、collector は batch processor の `timeout` に到達する前にバッチをフラッシュし、パイプラインのエンドツーエンド遅延を低く保ちつつ、バッチサイズの一貫性を確保します。

### 非同期挿入の使用 {#use-asynchronous-inserts}

通常、collector のスループットが低い場合でも、ユーザーはデータが最小限のエンドツーエンド遅延で ClickHouse に到達することを期待するため、より小さなバッチを送信せざるを得なくなります。この場合、batch processor の `timeout` が切れたタイミングで小さなバッチが送信されます。これは問題を引き起こす可能性があり、その際に非同期挿入が必要となります。ユーザーが Gateway として動作する ClickStack collector にデータを送信している場合、この問題はまれです。collector がアグリゲータとして動作し、この問題を緩和するためです。詳細は [Collector roles](#collector-roles) を参照してください。

大きなバッチを保証できない場合、ユーザーは [Asynchronous Inserts](/best-practices/selecting-an-insert-strategy#asynchronous-inserts) を使用して、バッチ処理を ClickHouse に委譲できます。非同期挿入では、データはまずバッファに挿入され、その後データベースストレージに後から（非同期に）書き込まれます。

<Image img={observability_6} alt="非同期挿入" size="md"/>

[非同期挿入が有効](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)な場合、ClickHouse が ① 挿入クエリを受信すると、クエリのデータは ② まず即座にインメモリバッファに書き込まれます。次回のバッファフラッシュが ③ 行われるときに、バッファ内のデータは[ソート](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)され、パーツとしてデータベースストレージに書き込まれます。なお、データはデータベースストレージにフラッシュされるまではクエリから検索できません。バッファのフラッシュタイミングは[設定可能](/optimize/asynchronous-inserts)です。

collector で非同期挿入を有効にするには、接続文字列に `async_insert=1` を追加します。配信保証を得るため、`wait_for_async_insert=1`（デフォルト）の使用を推奨します。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。



非同期挿入されたデータは、ClickHouse のバッファがフラッシュされたタイミングで挿入されます。これは、[`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) を超えたとき、または最初の INSERT クエリから [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) ミリ秒経過したときのいずれかで発生します。`async_insert_stale_timeout_ms` が 0 以外の値に設定されている場合は、最後のクエリから `async_insert_stale_timeout_ms` ミリ秒後にデータが挿入されます。ユーザーは、これらの設定を調整することでパイプラインのエンドツーエンドのレイテンシーを制御できます。バッファのフラッシュ動作をチューニングするために使用できるその他の設定は[こちら](/operations/settings/settings#async_insert)に記載されています。多くの場合は、デフォルト値で十分です。

:::note 適応型非同期挿入の検討
少数のエージェントしか使用しておらず、スループットは低いものの、エンドツーエンドのレイテンシー要件が厳しいケースでは、[adaptive asynchronous inserts](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) が有用な場合があります。一般に、これは ClickHouse によく見られるような高スループットの Observability ユースケースには適用されません。
:::

最後に、ClickHouse への同期挿入に関連していた従来の重複排除の挙動は、非同期挿入を使用する場合にはデフォルトでは有効になっていません。必要に応じて、設定 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate) を参照してください。

この機能の構成に関する詳細は、この[ドキュメントページ](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)、またはより詳細な[ブログ記事](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。



## スケーリング {#scaling}

ClickStack の OTel collector はゲートウェイインスタンスとして動作します - [Collector roles](#collector-roles) を参照してください。これは通常、データセンターごと、またはリージョンごとに独立したサービスとして提供されます。これらはアプリケーション（またはエージェントロールの他の collector）から、単一の OTLP エンドポイント経由でイベントを受信します。一般的には複数の collector インスタンスをデプロイし、標準的なロードバランサーを用いてトラフィックをそれらに分散させます。

<Image img={clickstack_with_gateways} alt="ゲートウェイによるスケーリング" size="lg"/>

このアーキテクチャの目的は、計算コストの高い処理をエージェントからオフロードし、それによってエージェントのリソース使用量を最小化することです。これらの ClickStack ゲートウェイは、本来であればエージェント側で実行する必要がある変換処理を実行できます。さらに、多数のエージェントからイベントを集約することで、ゲートウェイは ClickHouse に対して大きなバッチ単位でデータを送信でき、効率的な挿入が可能になります。エージェントや SDK ソースが増え、イベントスループットが増加しても、これらのゲートウェイ collector は容易にスケールアウトできます。 

### Kafka の追加 {#adding-kafka}

ここまでのアーキテクチャでは、メッセージキューとして Kafka を使用していないことにお気付きかもしれません。

Kafka キューをメッセージバッファとして用いるのは、ログアーキテクチャでよく見られる設計パターンであり、ELK スタックによって広く知られるようになりました。これにはいくつかの利点があります。主なものは、より強力なメッセージ配送の保証を提供し、バックプレッシャーへの対処を支援できる点です。メッセージは収集エージェントから Kafka に送信され、ディスクに書き込まれます。理論上、クラスタ構成の Kafka インスタンスは、高スループットなメッセージバッファを提供できます。なぜなら、メッセージを解析・処理するよりも、データをディスクに線形に書き込むほうが計算オーバーヘッドが小さいためです。例えば Elastic では、トークナイズとインデックス作成に大きなオーバーヘッドがかかります。データをエージェントから切り離すことで、送信元でのログローテーションによるメッセージ損失のリスクも低減できます。最後に、一部のユースケースにとって魅力的となり得るメッセージのリプレイやリージョン間レプリケーションの機能も提供します。

しかし、ClickHouse はデータ挿入を非常に高速に処理でき、一般的なハードウェアでも毎秒数百万行の書き込みが可能です。そのため ClickHouse からのバックプレッシャーはまれです。多くの場合、Kafka キューを活用することは、アーキテクチャの複雑さとコストの増大を意味します。ログが銀行取引やその他のミッションクリティカルなデータと同等の配送保証を必要としない、という考え方を受け入れられるのであれば、Kafka による複雑化は避けることを推奨します。

一方で、高い配送保証や（複数の宛先に対する可能性も含めた）データのリプレイ能力が必要な場合、Kafka は有用なアーキテクチャ上の追加コンポーネントとなり得ます。

<Image img={observability_8} alt="Kafka の追加" size="lg"/>

この場合、OTel エージェントは [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) を使用して Kafka にデータを送信するように構成できます。ゲートウェイインスタンスは、[Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) を用いてメッセージを消費します。詳細については Confluent および OTel のドキュメントを参照することを推奨します。

:::note OTel collector の設定
ClickStack の OpenTelemetry collector ディストリビューションは、[custom collector configuration](#extending-collector-config) を使用して Kafka を利用するように構成できます。
:::



## リソース見積もり {#estimating-resources}

OTel collector のリソース要件は、イベントのスループット、メッセージサイズ、および実行される処理量によって異なります。OpenTelemetry プロジェクトでは、ユーザーがリソース要件を見積もるために利用できる[ベンチマーク](https://opentelemetry.io/docs/collector/benchmarks/)を公開しています。

[弊社の経験では](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)、3 コアと 12GB の RAM を備えた ClickStack ゲートウェイインスタンスは、1 秒あたり約 6 万件のイベントを処理できます。これは、フィールド名の変更のみを行い、正規表現を使用しない最小限の処理パイプラインを想定しています。

ゲートウェイへのイベント送信と、イベントへのタイムスタンプ設定のみを担当するエージェントインスタンスについては、想定される 1 秒あたりのログ数に基づいてサイジングすることを推奨します。以下は、ユーザーが出発点として利用できるおおよその値です。

| ログレート | collector エージェントへのリソース |
|--------------|------------------------------------|
| 1k/second    | 0.2CPU, 0.2GiB                    |
| 5k/second    | 0.5 CPU, 0.5GiB                   |
| 10k/second   | 1 CPU, 1GiB                       |



## JSON サポート

<BetaBadge />

:::warning ベータ機能
**ClickStack** における JSON 型サポートは **ベータ機能** です。JSON 型自体は ClickHouse 25.3+ で本番運用可能な状態ですが、ClickStack への統合は現在も開発中であり、制限があったり、将来変更されたり、不具合を含む可能性があります。
:::

ClickStack はバージョン `2.0.4` から [JSON 型](/interfaces/formats/JSON) のベータサポートを提供しています。

### JSON 型の利点

JSON 型は ClickStack ユーザーに対して次のような利点を提供します。

* **型の保持** - 数値は数値のまま、ブール値はブール値のまま維持され、すべてを文字列にフラット化する必要がありません。そのためキャストが減り、クエリが簡潔になり、集計結果の精度も向上します。
* **パス単位のカラム** - 各 JSON パスが個別のサブカラムになり、I/O を削減します。クエリは必要なフィールドだけを読み取るため、特定フィールドをクエリするのにカラム全体を読み込む必要があった従来の Map 型に比べて大きな性能向上が得られます。
* **深いネストもそのまま扱える** - 複雑で深くネストした構造を、Map 型で必要だったような手動のフラット化や、その後に続く扱いづらい JSONExtract 関数なしで自然に扱えます。
* **動的で進化するスキーマ** - チームが時間とともに新しいタグや属性を追加していくようなオブザーバビリティデータに最適です。JSON はスキーママイグレーションなしで、こうした変更を自動的に処理します。
* **高速なクエリと低メモリ使用量** - `LogAttributes` のような属性に対する典型的な集計では、読み取るデータ量が 5〜10 倍少なくなり、クエリ時間とピークメモリ使用量の両方を大幅に削減できます。
* **シンプルな管理** - パフォーマンス向上のために事前にカラムをマテリアライズしておく必要はありません。各フィールドが個別のサブカラムになることで、ネイティブな ClickHouse カラムと同等の速度を実現します。

### JSON サポートの有効化

コレクターでこのサポートを有効にするには、コレクターを含む任意のデプロイメントで環境変数 `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` を設定します。これにより、ClickHouse 上のスキーマが JSON 型を用いて作成されます。

:::note HyperDX サポート
JSON 型に対してクエリを実行するには、環境変数 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` を通じて HyperDX アプリケーションレイヤー側でもサポートを有効化する必要があります。
:::

例えば次のようにします。

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

### Map ベースのスキーマから JSON 型への移行

:::important 後方互換性
[JSON 型](/interfaces/formats/JSON) は、既存の Map ベースのスキーマと **後方互換性がありません**。この機能を有効にすると、`JSON` 型を使用する新しいテーブルが作成されるため、データの手動移行が必要です。
:::

Map ベースのスキーマから移行するには、次の手順に従います。

<VerticalStepper headerLevel="h4">
  #### OTel collector を停止する

  #### 既存のテーブル名を変更し、ソースを更新する

  既存のテーブル名を変更し、HyperDX 内のデータソースを更新します。

  例えば:

  ```sql
  RENAME TABLE otel_logs TO otel_logs_map;
  RENAME TABLE otel_metrics TO otel_metrics_map;
  ```

  #### collector をデプロイする

  `OTEL_AGENT_FEATURE_GATE_ARG` を設定して collector をデプロイします。

  #### JSON スキーマ対応の HyperDX コンテナを再起動する

  ```shell
  export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
  ```

  #### 新しいデータソースを作成する

  JSON テーブルを指す新しいデータソースを HyperDX で作成します。
</VerticalStepper>

#### 既存データの移行（任意）

古いデータを新しい JSON テーブルに移動するには、次のようにします。

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
約100億行未満のデータセットにのみ推奨されます。以前に `Map` 型で保存されたデータでは型の精度が保持されておらず（すべての値が文字列でした）、その結果、この古いデータは期限切れなどで削除されるまでは新しいスキーマでも文字列として扱われるため、フロントエンド側でのキャストが必要になります。新規データの型は `JSON` 型によって保持されます。
:::
