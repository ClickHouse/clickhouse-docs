---
slug: /use-cases/observability/clickstack/ingesting-data/otel-collector
pagination_prev: null
pagination_next: null
description: 'ClickStack 向け OpenTelemetry コレクター - ClickHouse オブザーバビリティ スタック'
sidebar_label: 'OpenTelemetry コレクター'
title: 'ClickStack OpenTelemetry コレクター'
doc_type: 'guide'
keywords: ['ClickStack', 'OpenTelemetry collector', 'ClickHouse observability', 'OTel collector configuration', 'OpenTelemetry ClickHouse']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

このページでは、公式の ClickStack OpenTelemetry (OTel) コレクターの設定方法について詳しく説明します。


## コレクターの役割 {#collector-roles}

OpenTelemetryコレクターは、主に2つの役割で展開できます:

- **Agent** - Agentインスタンスは、エッジ(サーバー上やKubernetesノード上など)でデータを収集するか、OpenTelemetry SDKで計装されたアプリケーションから直接イベントを受信します。後者の場合、agentインスタンスはアプリケーションと共に、またはアプリケーションと同じホスト上(サイドカーやDaemonSetなど)で実行されます。Agentは、データをClickHouseに直接送信するか、gatewayインスタンスに送信できます。前者の場合は、[Agentデプロイメントパターン](https://opentelemetry.io/docs/collector/deployment/agent/)と呼ばれます。

- **Gateway** - Gatewayインスタンスは、独立したサービス(Kubernetes内のデプロイメントなど)を提供し、通常はクラスター単位、データセンター単位、またはリージョン単位で展開されます。これらは、単一のOTLPエンドポイントを介してアプリケーション(または他のコレクターがagentとして)からイベントを受信します。通常、複数のgatewayインスタンスが展開され、それらの間で負荷を分散するために標準のロードバランサーが使用されます。すべてのagentとアプリケーションがこの単一のエンドポイントにシグナルを送信する場合、これは[Gatewayデプロイメントパターン](https://opentelemetry.io/docs/collector/deployment/gateway/)と呼ばれることがよくあります。

**重要: ClickStackのデフォルト配布を含むコレクターは、[以下で説明するgatewayの役割](#collector-roles)を想定しており、agentまたはSDKからデータを受信します。**

OTelコレクターをagentの役割で展開するユーザーは、通常、ClickStackバージョンではなく[コレクターのデフォルトcontribディストリビューション](https://github.com/open-telemetry/opentelemetry-collector-contrib)を使用しますが、[Fluentd](https://www.fluentd.org/)や[Vector](https://vector.dev/)などの他のOTLP互換技術を自由に使用できます。


## コレクターのデプロイ {#configuring-the-collector}

スタンドアロンデプロイメントで独自のOpenTelemetryコレクターを管理している場合（HyperDX専用ディストリビューションを使用する場合など）、可能な限りゲートウェイロールには[公式のClickStackディストリビューションのコレクターを使用することを推奨します](/use-cases/observability/clickstack/deployment/hyperdx-only#otel-collector)が、独自のものを使用する場合は、[ClickHouseエクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)が含まれていることを確認してください。

### スタンドアロン {#standalone}

OTelコレクターのClickStackディストリビューションをスタンドアロンモードでデプロイするには、以下のdockerコマンドを実行します：

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

環境変数`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME`、`CLICKHOUSE_PASSWORD`を使用して、ターゲットのClickHouseインスタンスを上書きできます。`CLICKHOUSE_ENDPOINT`は、プロトコルとポートを含む完全なClickHouse HTTPエンドポイントである必要があります（例：`http://localhost:8123`）。

**これらの環境変数は、コレクターを含むすべてのdockerディストリビューションで使用できます。**

`OPAMP_SERVER_URL`はHyperDXデプロイメントを指す必要があります（例：`http://localhost:4320`）。HyperDXはデフォルトでポート`4320`の`/v1/opamp`にOpAMP（Open Agent Management Protocol）サーバーを公開します。HyperDXを実行しているコンテナからこのポートを公開してください（例：`-p 4320:4320`を使用）。

:::note OpAMPポートの公開と接続
コレクターがOpAMPポートに接続するには、HyperDXコンテナによってポートが公開されている必要があります（例：`-p 4320:4320`）。ローカルテストの場合、macOSユーザーは`OPAMP_SERVER_URL=http://host.docker.internal:4320`を設定できます。Linuxユーザーは`--network=host`を使用してコレクターコンテナを起動できます。
:::

本番環境では、[適切な認証情報](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)を持つユーザーを使用してください。

### 設定の変更 {#modifying-otel-collector-configuration}

#### dockerの使用 {#using-docker}

OpenTelemetryコレクターを含むすべてのdockerイメージは、環境変数`OPAMP_SERVER_URL`、`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME`、`CLICKHOUSE_PASSWORD`を使用してClickHouseインスタンスを使用するように設定できます：

例えば、オールインワンイメージの場合：

```shell
export OPAMP_SERVER_URL=<OPAMP_SERVER_URL>
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
```

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

#### Docker Compose {#docker-compose-otel}

Docker Composeでは、上記と同じ環境変数を使用してコレクター設定を変更します：

```yaml
otel-collector:
  image: hyperdx/hyperdx-otel-collector
  environment:
    CLICKHOUSE_ENDPOINT: "https://mxl4k3ul6a.us-east-2.aws.clickhouse-staging.com:8443"
    HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
    CLICKHOUSE_USER: "default"
    CLICKHOUSE_PASSWORD: "password"
    OPAMP_SERVER_URL: "http://app:${HYPERDX_OPAMP_PORT}"
  ports:
    - "13133:13133" # health_check extension
    - "24225:24225" # fluentd receiver
    - "4317:4317" # OTLP gRPC receiver
    - "4318:4318" # OTLP http receiver
    - "8888:8888" # metrics extension
  restart: always
  networks:
    - internal
```

### 高度な設定 {#advanced-configuration}

OTelコレクターのClickStackディストリビューションは、カスタム設定ファイルをマウントし、環境変数を設定することで基本設定を拡張できます。カスタム設定は、OpAMPを介してHyperDXが管理する基本設定とマージされます。


#### コレクター設定の拡張 {#extending-collector-config}

カスタムレシーバー、プロセッサー、またはパイプラインを追加するには:

1. 追加設定を含むカスタム設定ファイルを作成します
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

  # ホストシステムメトリクスを収集
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

**オールインワンイメージでデプロイ:**

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/custom-config.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

**スタンドアロンコレクターでデプロイ:**

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
カスタム設定では、新しいレシーバー、プロセッサー、パイプラインのみを定義します。基本プロセッサー（`memory_limiter`、`batch`）とエクスポーター（`clickhouse`）は既に定義されているため、名前で参照してください。カスタム設定は基本設定とマージされ、既存のコンポーネントを上書きすることはできません。
:::

より複雑な設定については、[デフォルトのClickStackコレクター設定](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml)および[ClickHouseエクスポータードキュメント](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options)を参照してください。

#### 設定構造 {#configuration-structure}

[`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/)、[`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)、[`processors`](https://opentelemetry.io/docs/collector/configuration/#processors)を含むOTelコレクターの設定の詳細については、[公式OpenTelemetryコレクタードキュメント](https://opentelemetry.io/docs/collector/configuration)を参照してください。


## コレクターのセキュリティ保護 {#securing-the-collector}

OpenTelemetryコレクターのClickStackディストリビューションには、OpAMP（Open Agent Management Protocol）の組み込みサポートが含まれており、OTLPエンドポイントを安全に設定および管理するために使用されます。起動時に、ユーザーは`OPAMP_SERVER_URL`環境変数を指定する必要があります。この変数は、`/v1/opamp`でOpAMP APIをホストするHyperDXアプリを指すように設定してください。

この統合により、HyperDXアプリのデプロイ時に作成される自動生成された取り込みAPIキーを使用して、OTLPエンドポイントが保護されます。コレクターに送信されるすべてのテレメトリデータには、認証のためにこのAPIキーを含める必要があります。このキーは、HyperDXアプリの`Team Settings → API Keys`で確認できます。

<Image img={ingestion_key} alt='取り込みキー' size='lg' />

デプロイメントをさらに保護するために、以下を推奨します：

- コレクターがHTTPS経由でClickHouseと通信するように設定する。
- 制限された権限を持つ取り込み専用ユーザーを作成する - 以下を参照してください。
- OTLPエンドポイントに対してTLSを有効にし、SDK/エージェントとコレクター間の暗号化通信を確保する。これは[カスタムコレクター設定](#extending-collector-config)を介して設定できます。

### 取り込みユーザーの作成 {#creating-an-ingestion-user}

ClickHouseへの取り込みのために、OTelコレクター専用のデータベースとユーザーを作成することを推奨します。このユーザーには、[ClickStackによって作成および使用されるテーブル](/use-cases/observability/clickstack/ingesting-data/schemas)に対する作成および挿入の権限が必要です。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

これは、コレクターが`otel`データベースを使用するように設定されていることを前提としています。これは環境変数`HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`を通じて制御できます。この変数を[他の環境変数と同様に](#modifying-otel-collector-configuration)コレクターをホストするイメージに渡してください。


## 処理 - フィルタリング、変換、およびエンリッチメント {#processing-filtering-transforming-enriching}

ユーザーは取り込み時にイベントメッセージのフィルタリング、変換、およびエンリッチメントを行いたいと考えるのが一般的です。ClickStackコネクタの設定は変更できないため、さらなるイベントのフィルタリングと処理が必要なユーザーには、次のいずれかの方法を推奨します:

- フィルタリングと処理を実行する独自のOTelコレクターをデプロイし、OTLPを介してClickStackコレクターにイベントを送信してClickHouseに取り込む。
- 独自のOTelコレクターをデプロイし、ClickHouseエクスポーターを使用してClickHouseに直接イベントを送信する。

OTelコレクターを使用して処理を行う場合、ゲートウェイインスタンスで変換を実行し、エージェントインスタンスでの作業を最小限に抑えることを推奨します。これにより、サーバー上で実行されるエッジのエージェントが必要とするリソースを可能な限り最小限に抑えることができます。通常、ユーザーはエージェントでフィルタリング(不要なネットワーク使用を最小限に抑えるため)、タイムスタンプの設定(オペレーター経由)、およびコンテキストを必要とするエンリッチメントのみを実行しています。例えば、ゲートウェイインスタンスが異なるKubernetesクラスターに存在する場合、k8sエンリッチメントはエージェントで実行する必要があります。

OpenTelemetryは、ユーザーが活用できる以下の処理およびフィルタリング機能をサポートしています:

- **プロセッサー** - プロセッサーは、[レシーバーによって収集されたデータを変更または変換](https://opentelemetry.io/docs/collector/transforming-telemetry/)してからエクスポーターに送信します。プロセッサーは、コレクター設定の`processors`セクションで設定された順序で適用されます。これらはオプションですが、最小限のセットが[通常推奨されます](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。ClickHouseでOTelコレクターを使用する場合、プロセッサーを以下に制限することを推奨します:

- [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)は、コレクターでのメモリ不足状況を防ぐために使用されます。推奨事項については[リソースの見積もり](#estimating-resources)を参照してください。
- コンテキストに基づいてエンリッチメントを行うプロセッサー。例えば、[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)は、k8sメタデータを使用してスパン、メトリクス、およびログのリソース属性を自動的に設定できます。例えば、イベントをソースポッドIDでエンリッチメントします。
- トレースに必要な場合の[テールサンプリングまたはヘッドサンプリング](https://opentelemetry.io/docs/concepts/sampling/)。
- [基本的なフィルタリング](https://opentelemetry.io/docs/collector/transforming-telemetry/) - オペレーター経由で実行できない場合に、不要なイベントを削除します(以下を参照)。
- [バッチ処理](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - ClickHouseを使用する際にデータがバッチで送信されることを保証するために不可欠です。[「挿入の最適化」](#optimizing-inserts)を参照してください。

- **オペレーター** - [オペレーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)は、レシーバーで利用可能な最も基本的な処理単位を提供します。基本的な解析がサポートされており、SeverityやTimestampなどのフィールドを設定できます。JSONおよび正規表現の解析がサポートされており、イベントのフィルタリングと基本的な変換も可能です。ここでイベントのフィルタリングを実行することを推奨します。

オペレーターや[変換プロセッサー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/transformprocessor/README.md)を使用した過度なイベント処理は避けることを推奨します。これらは、特にJSON解析において、かなりのメモリとCPUオーバーヘッドを発生させる可能性があります。いくつかの例外を除き、マテリアライズドビューとカラムを使用して、挿入時にClickHouseですべての処理を行うことが可能です。具体的には、コンテキストを認識したエンリッチメント、例えばk8sメタデータの追加などです。詳細については、[SQLによる構造の抽出](/use-cases/observability/schema-design#extracting-structure-with-sql)を参照してください。

### 例 {#example-processing}

以下の設定は、この[非構造化ログファイル](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz)の収集を示しています。この設定は、ClickStackゲートウェイにデータを送信するエージェントロールのコレクターで使用できます。

ログ行から構造を抽出する(`regex_parser`)およびイベントをフィルタリングするためのオペレーターの使用と、イベントをバッチ処理しメモリ使用量を制限するプロセッサーの使用に注意してください。


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

OTLP 通信を行う際は、[取り込み用 API キーを含む認可ヘッダー](#securing-the-collector) を必ず付与する必要があることに注意してください。

より高度な構成については、[OpenTelemetry Collector のドキュメント](https://opentelemetry.io/docs/collector/) を参照することをお勧めします。


## 挿入の最適化 {#optimizing-inserts}

強力な一貫性保証を維持しながら高い挿入パフォーマンスを実現するには、ClickStackコレクターを介してObservabilityデータをClickHouseに挿入する際に、いくつかのシンプルなルールに従う必要があります。OTelコレクターを正しく設定することで、以下のルールに従うことは容易になります。これにより、ClickHouseを初めて使用する際にユーザーが遭遇する[一般的な問題](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)も回避できます。

### バッチ処理 {#batching}

デフォルトでは、ClickHouseに送信される各挿入により、ClickHouseは挿入データと保存が必要なその他のメタデータを含むストレージパートを即座に作成します。したがって、各挿入に含まれるデータ量が少ない大量の挿入を送信するよりも、各挿入により多くのデータを含む少量の挿入を送信する方が、必要な書き込み回数を削減できます。一度に少なくとも1,000行の比較的大きなバッチでデータを挿入することを推奨します。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)をご覧ください。

デフォルトでは、ClickHouseへの挿入は同期的であり、同一の場合は冪等性を持ちます。マージツリーエンジンファミリーのテーブルでは、ClickHouseはデフォルトで自動的に[挿入の重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)を行います。これは、以下のようなケースで挿入が耐障害性を持つことを意味します:

- (1) データを受信するノードに問題がある場合、挿入クエリはタイムアウト(またはより具体的なエラー)となり、確認応答を受信しません。
- (2) ノードによってデータが書き込まれたものの、ネットワーク中断により確認応答がクエリの送信者に返せない場合、送信者はタイムアウトまたはネットワークエラーを受け取ります。

コレクターの観点からは、(1)と(2)を区別することは困難です。しかし、どちらの場合でも、確認応答されなかった挿入は即座に再試行できます。再試行される挿入クエリが同じ順序で同じデータを含んでいる限り、元の(確認応答されなかった)挿入が成功していた場合、ClickHouseは再試行された挿入を自動的に無視します。

このため、OTelコレクターのClickStackディストリビューションは[バッチプロセッサー](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md)を使用します。これにより、上記の要件を満たす一貫した行のバッチとして挿入が送信されることが保証されます。コレクターが高スループット(秒あたりのイベント数)を持つことが予想され、各挿入で少なくとも5000イベントを送信できる場合、これは通常パイプラインで必要な唯一のバッチ処理です。この場合、コレクターはバッチプロセッサーの`timeout`に達する前にバッチをフラッシュし、パイプラインのエンドツーエンドレイテンシーを低く保ち、バッチのサイズを一貫させます。

### 非同期挿入の使用 {#use-asynchronous-inserts}

通常、コレクターのスループットが低い場合、ユーザーは小さなバッチを送信せざるを得ませんが、それでも最小限のエンドツーエンドレイテンシー内でデータがClickHouseに到達することを期待します。この場合、バッチプロセッサーの`timeout`が期限切れになると小さなバッチが送信されます。これは問題を引き起こす可能性があり、非同期挿入が必要となる状況です。ユーザーがゲートウェイとして機能するClickStackコレクターにデータを送信している場合、この問題はまれです。アグリゲーターとして機能することで、この問題を軽減します。[コレクターの役割](#collector-roles)を参照してください。

大きなバッチが保証できない場合、ユーザーは[非同期挿入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)を使用してバッチ処理をClickHouseに委任できます。非同期挿入では、データは最初にバッファに挿入され、その後データベースストレージに非同期的に書き込まれます。

<Image img={observability_6} alt='非同期挿入' size='md' />

[非同期挿入が有効](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)な場合、ClickHouseが①挿入クエリを受信すると、クエリのデータは②まずメモリ内バッファに即座に書き込まれます。③次のバッファフラッシュが発生すると、バッファのデータは[ソート](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)され、パートとしてデータベースストレージに書き込まれます。データベースストレージにフラッシュされる前は、データはクエリで検索できないことに注意してください。バッファフラッシュは[設定可能](/optimize/asynchronous-inserts)です。

コレクターで非同期挿入を有効にするには、接続文字列に`async_insert=1`を追加します。配信保証を得るために、`wait_for_async_insert=1`(デフォルト)を使用することを推奨します。詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)をご覧ください。


非同期インサートからのデータは、ClickHouse のバッファがフラッシュされたタイミングで挿入されます。これは、[`async_insert_max_data_size`](/operations/settings/settings#async_insert_max_data_size) を超えた場合、または最初の INSERT クエリから [`async_insert_busy_timeout_ms`](/operations/settings/settings#async_insert_max_data_size) ミリ秒後のいずれかで発生します。`async_insert_stale_timeout_ms` が 0 以外の値に設定されている場合、最後のクエリから `async_insert_stale_timeout_ms` ミリ秒経過後にデータが挿入されます。ユーザーはこれらの設定を調整することで、パイプラインのエンドツーエンドのレイテンシを制御できます。バッファフラッシュの調整に使用できるその他の設定は[こちら](/operations/settings/settings#async_insert)に記載されています。一般的には、デフォルト値のままで問題ありません。

:::note 適応型非同期インサートの検討
少数のエージェントのみを使用し、スループットは低いがエンドツーエンドのレイテンシに厳しい要件があるケースでは、[adaptive asynchronous inserts](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts) が有用な場合があります。一般的に、これらは ClickHouse による高スループットなオブザーバビリティ用途のユースケースには適用されません。
:::

最後に、ClickHouse への同期インサートに関連する従来の重複排除動作は、非同期インサートを使用する場合、デフォルトでは有効になっていません。必要に応じて、設定 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate) を参照してください。

この機能の設定に関する詳細は、この[ドキュメントページ](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)、または詳細な[ブログ記事](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。



## スケーリング {#scaling}

ClickStack OTelコレクターはゲートウェイインスタンスとして動作します - [コレクターの役割](#collector-roles)を参照してください。これらは通常、データセンターごとまたはリージョンごとにスタンドアロンサービスを提供します。単一のOTLPエンドポイントを介して、アプリケーション(またはエージェントロールの他のコレクター)からイベントを受信します。通常、複数のコレクターインスタンスがデプロイされ、標準のロードバランサーを使用してそれらの間で負荷を分散します。

<Image img={clickstack_with_gateways} alt='ゲートウェイによるスケーリング' size='lg' />

このアーキテクチャの目的は、計算集約的な処理をエージェントからオフロードし、リソース使用量を最小限に抑えることです。これらのClickStackゲートウェイは、本来エージェントで実行する必要がある変換タスクを実行できます。さらに、多数のエージェントからイベントを集約することで、ゲートウェイは大きなバッチをClickHouseに送信し、効率的な挿入を可能にします。これらのゲートウェイコレクターは、エージェントとSDKソースの追加やイベントスループットの増加に応じて、容易にスケールできます。

### Kafkaの追加 {#adding-kafka}

上記のアーキテクチャがメッセージキューとしてKafkaを使用していないことに気付かれるかもしれません。

メッセージバッファとしてKafkaキューを使用することは、ロギングアーキテクチャで見られる一般的な設計パターンであり、ELKスタックによって普及しました。これにはいくつかの利点があります。主に、より強力なメッセージ配信保証を提供し、バックプレッシャーへの対処に役立ちます。メッセージは収集エージェントからKafkaに送信され、ディスクに書き込まれます。理論的には、クラスター化されたKafkaインスタンスは、メッセージを解析および処理するよりもデータを線形にディスクに書き込む方が計算オーバーヘッドが少ないため、高スループットのメッセージバッファを提供します。たとえば、Elasticでは、トークン化とインデックス作成に大きなオーバーヘッドが発生します。エージェントからデータを移動することで、ソースでのログローテーションの結果としてメッセージを失うリスクも軽減されます。最後に、一部のユースケースにとって魅力的なメッセージリプレイとクロスリージョンレプリケーション機能を提供します。

しかし、ClickHouseは非常に高速にデータを挿入できます - 中程度のハードウェアで毎秒数百万行を処理できます。ClickHouseからのバックプレッシャーはまれです。多くの場合、Kafkaキューを活用することは、アーキテクチャの複雑さとコストの増加を意味します。ログが銀行取引やその他のミッションクリティカルなデータと同じ配信保証を必要としないという原則を受け入れることができるなら、Kafkaの複雑さを避けることを推奨します。

ただし、高い配信保証やデータのリプレイ機能(複数のソースへの可能性を含む)が必要な場合、Kafkaは有用なアーキテクチャの追加となり得ます。

<Image img={observability_8} alt='Kafkaの追加' size='lg' />

この場合、OTelエージェントは[Kafkaエクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md)を介してKafkaにデータを送信するように構成できます。ゲートウェイインスタンスは、[Kafkaレシーバー](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md)を使用してメッセージを消費します。詳細については、ConfluentとOTelのドキュメントを参照することを推奨します。

:::note OTelコレクター構成
ClickStack OpenTelemetryコレクターディストリビューションは、[カスタムコレクター構成](#extending-collector-config)を使用してKafkaで構成できます。
:::


## リソースの見積もり {#estimating-resources}

OTelコレクターのリソース要件は、イベントのスループット、メッセージのサイズ、および実行される処理量によって決まります。OpenTelemetryプロジェクトでは、リソース要件を見積もるために利用できる[ベンチマーク](https://opentelemetry.io/docs/collector/benchmarks/)を提供しています。

[弊社の経験では](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)、3コアと12GBのRAMを搭載したClickStackゲートウェイインスタンスは、1秒あたり約60,000イベントを処理できます。これは、フィールドの名前変更を行う最小限の処理パイプラインを想定しており、正規表現は使用していません。

ゲートウェイへのイベント送信を担当し、イベントにタイムスタンプを設定するだけのエージェントインスタンスについては、予想される1秒あたりのログ数に基づいてサイジングすることを推奨します。以下は、開始点として使用できる概算値です:

| ログ記録レート | コレクターエージェントのリソース |
| -------------- | -------------------------------- |
| 1k/秒          | 0.2CPU、0.2GiB                   |
| 5k/秒          | 0.5 CPU、0.5GiB                  |
| 10k/秒         | 1 CPU、1GiB                      |


## JSONサポート {#json-support}

<BetaBadge />

:::warning ベータ機能
**ClickStack**におけるJSON型のサポートは**ベータ機能**です。JSON型自体はClickHouse 25.3以降で本番環境での使用が可能ですが、ClickStack内での統合は現在も活発に開発中であり、制限事項がある場合や、将来的に変更される可能性、またはバグが含まれる可能性があります
:::

ClickStackは、バージョン`2.0.4`から[JSON型](/interfaces/formats/JSON)をベータサポートしています。

### JSON型の利点 {#benefits-json-type}

JSON型は、ClickStackユーザーに以下の利点を提供します:

- **型の保持** - 数値は数値のまま、真偽値は真偽値のまま保持され、すべてを文字列に平坦化する必要がなくなります。これにより、型変換が減少し、クエリがシンプルになり、より正確な集計が可能になります。
- **パスレベルのカラム** - 各JSONパスが独自のサブカラムとなり、I/Oが削減されます。クエリは必要なフィールドのみを読み取るため、特定のフィールドをクエリするためにカラム全体を読み取る必要があった従来のMap型と比較して、大幅なパフォーマンス向上が実現されます。
- **深いネストにも対応** - Map型で必要とされていた手動での平坦化や、その後の扱いにくいJSONExtract関数を使用することなく、複雑で深くネストされた構造を自然に処理できます。
- **動的で進化するスキーマ** - チームが時間の経過とともに新しいタグや属性を追加する可観測性データに最適です。JSONはスキーマ移行なしで、これらの変更を自動的に処理します。
- **高速なクエリと低メモリ使用量** - `LogAttributes`のような属性に対する一般的な集計では、読み取るデータ量が5〜10分の1になり、劇的な高速化が実現され、クエリ時間とピークメモリ使用量の両方が削減されます。
- **シンプルな管理** - パフォーマンスのためにカラムを事前にマテリアライズする必要がありません。各フィールドが独自のサブカラムとなり、ネイティブのClickHouseカラムと同じ速度を実現します。

### JSONサポートの有効化 {#enabling-json-support}

コレクターでこのサポートを有効にするには、コレクターを含むすべてのデプロイメントで環境変数`OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'`を設定します。これにより、JSON型を使用してClickHouseでスキーマが作成されます。

:::note HyperDXサポート
JSON型をクエリするには、環境変数`BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true`を使用してHyperDXアプリケーション層でもサポートを有効にする必要があります。
:::

例:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

### マップベースのスキーマからJSON型への移行 {#migrating-from-map-based-schemas-to-json}

:::important 後方互換性
[JSON型](/interfaces/formats/JSON)は、既存のマップベースのスキーマと**後方互換性がありません**。この機能を有効にすると、`JSON`型を使用した新しいテーブルが作成され、手動でのデータ移行が必要になります。
:::

マップベースのスキーマから移行するには、以下の手順に従ってください:

<VerticalStepper headerLevel="h4">

#### OTelコレクターの停止 {#stop-the-collector}

#### 既存テーブルの名前変更とソースの更新 {#rename-existing-tables-sources}

既存のテーブルの名前を変更し、HyperDXでデータソースを更新します。

例:

```sql
RENAME TABLE otel_logs TO otel_logs_map;
RENAME TABLE otel_metrics TO otel_metrics_map;
```

#### コレクターのデプロイ {#deploy-the-collector}

`OTEL_AGENT_FEATURE_GATE_ARG`を設定してコレクターをデプロイします。

#### JSONスキーマサポートを有効にしてHyperDXコンテナを再起動 {#restart-the-hyperdx-container}

```shell
export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
```

#### 新しいデータソースの作成 {#create-new-data-sources}

JSONテーブルを参照する新しいデータソースをHyperDXで作成します。

</VerticalStepper>

#### 既存データの移行(オプション) {#migrating-existing-data}

古いデータを新しいJSONテーブルに移動するには:

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
約100億行未満のデータセットにのみ推奨されます。Map型で以前に保存されたデータは型の精度を保持していませんでした(すべての値が文字列でした)。その結果、この古いデータは、期限切れになるまで新しいスキーマでは文字列として表示され、フロントエンドで型変換が必要になります。新しいデータの型はJSON型で保持されます。
:::
