---
'slug': '/use-cases/observability/clickstack/ingesting-data/otel-collector'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack のための OpenTelemetry コレクター - ClickHouse のモニタリングスタック'
'sidebar_label': 'OpenTelemetry コレクター'
'title': 'ClickStack OpenTelemetry コレクター'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import observability_6 from '@site/static/images/use-cases/observability/observability-6.png';
import observability_8 from '@site/static/images/use-cases/observability/observability-8.png';
import clickstack_with_gateways from '@site/static/images/use-cases/observability/clickstack-with-gateways.png';
import clickstack_with_kafka from '@site/static/images/use-cases/observability/clickstack-with-kafka.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';

このページには、公式の ClickStack OpenTelemetry (OTel) コレクタの設定に関する詳細が含まれています。

## コレクタの役割 {#collector-roles}

OpenTelemetry コレクタは、主に 2 つの役割でデプロイできます：

- **エージェント** - エージェントインスタンスは、サーバーや Kubernetes ノードなどのエッジでデータを収集するか、または OpenTelemetry SDK で計測されたアプリケーションから直接イベントを受信します。後者の場合、エージェントインスタンスはアプリケーションと同じホスト（サイドカーや DaemonSet など）でアプリケーションと一緒に実行されます。エージェントは、データを直接 ClickHouse に送信するか、ゲートウェイインスタンスに送信できます。前者の場合、これは [Agent deployment pattern](https://opentelemetry.io/docs/collector/deployment/agent/) と呼ばれます。

- **ゲートウェイ** - ゲートウェイインスタンスは、通常、クラスター、データセンター、またはリージョンごとに、単独のサービスを提供します。これらは、単一の OTLP エンドポイントを介してアプリケーション（またはエージェントとしての他のコレクタ）からイベントを受信します。通常、ゲートウェイインスタンスのセットがデプロイされ、ロードバランサーが自動的に配置され、負荷を分散します。すべてのエージェントとアプリケーションがこの単一のエンドポイントに信号を送信する場合、この配置は [Gateway deployment pattern](https://opentelemetry.io/docs/collector/deployment/gateway/) と呼ばれることが多いです。

**重要: コレクタは、ClickStack のデフォルト配布版を含む、以下に説明する [ゲートウェイの役割](#collector-roles) を前提とし、エージェントまたは SDK からデータを受信します。**

エージェントの役割で OTel コレクタをデプロイするユーザーは、通常 [default contrib distribution of the collector](https://github.com/open-telemetry/opentelemetry-collector-contrib) を使用し、ClickStack バージョンを使用しませんが、[Fluentd](https://www.fluentd.org/) や [Vector](https://vector.dev/) などの他の OTLP 対応技術を使用することができます。

## コレクタのデプロイ {#configuring-the-collector}

HyperDX のみの配布を使用しているときのように、独自の OpenTelemetry コレクタをスタンドアロンデプロイメントで管理している場合は、可能な限り [ClickStack の公式配布版のコレクタを使用することを推奨](https://github.com/open-telemetry/opentelemetry-collector-contrib)しますが、独自のコレクタを持ち込むことを選択する場合は、[ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)を含むことを確認してください。

### スタンドアロン {#standalone}

OTel コネクタの ClickStack 配布をスタンドアロンモードでデプロイするには、次の docker コマンドを実行します：

```shell
docker run -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

対象の ClickHouse インスタンスは、環境変数 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME`、および `CLICKHOUSE_PASSWORD` で上書きできます。`CLICKHOUSE_ENDPOINT` は、プロトコルとポートを含む完全な ClickHouse HTTP エンドポイントである必要があります。たとえば、`http://localhost:8123` です。

**これらの環境変数は、コネクタを含む任意の docker 配布に使用できます。**

`OPAMP_SERVER_URL` は、HyperDX のデプロイメントを指す必要があります。たとえば、`http://localhost:4320` です。HyperDX は、デフォルトでポート `4320` の `/v1/opamp` に OpAMP (Open Agent Management Protocol) サーバーを公開しています。このポートが HyperDX を実行するコンテナから公開されていることを確認してください（たとえば、`-p 4320:4320` を使用）。

:::note OpAMP ポートを公開し接続する
コレクタが OpAMP ポートに接続するには、HyperDX コンテナでこのポートを公開する必要があります。たとえば、`-p 4320:4320` としてください。ローカルでのテストのために、OSX ユーザーは `OPAMP_SERVER_URL=http://host.docker.internal:4320` を設定できます。Linux ユーザーは `--network=host` を使用してコレクタコンテナを開始できます。
:::

ユーザーは、生産環境で [適切な認証情報](https://opentelemetry.io/docs/collector/configuration/#processors)を持つユーザーを使用する必要があります。

### 設定の変更 {#modifying-otel-collector-configuration}

#### Dockerを使用する {#using-docker}

OpenTelemetry コレクタを含むすべての docker イメージは、環境変数 `OPAMP_SERVER_URL`、`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USERNAME`、および `CLICKHOUSE_PASSWORD` を使用して ClickHouse インスタンスを構成できます。

たとえば、オールインワンイメージを次のように設定します：

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

Docker Compose を使用する場合、上記と同じ環境変数を使用してコレクタ設定を変更します：

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

現在、OTel コレクタの ClickStack 配布版は、構成ファイルの変更をサポートしていません。 TLS の設定やバッチサイズの変更など、より複雑な構成が必要な場合は、[デフォルト設定](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml)をコピーして変更し、[here](/observability/integrating-opentelemetry#exporting-to-clickhouse) および [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md#configuration-options) に記載されている ClickHouse exporter を使用して、独自の OTel コレクタのバージョンをデプロイすることをお勧めします。

OpenTelemetry (OTel) コレクタのデフォルト ClickStack 設定は、[ここ](https://github.com/hyperdxio/hyperdx/blob/main/docker/otel-collector/config.yaml) で確認できます。

#### 設定構造 {#configuration-structure}

OTel コレクタの設定に関する詳細、[`receivers`](https://opentelemetry.io/docs/collector/transforming-telemetry/)、[`operators`](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)、および [`processors`](https://opentelemetry.io/docs/collector/configuration/#processors) の設定方法については、[公式の OpenTelemetry コレクタ ドキュメント](https://opentelemetry.io/docs/collector/configuration)を参照することをお勧めします。

## コレクタのセキュリティ {#securing-the-collector}

OpenTelemetry コレクタの ClickStack 配布版には、OTLP エンドポイントを安全に構成および管理するために使用される OpAMP (Open Agent Management Protocol) の組み込みサポートが含まれています。起動時に、ユーザーは `OPAMP_SERVER_URL` 環境変数を提供する必要があります。これは、OpAMP API が `/v1/opamp` にホストされている HyperDX アプリを指すべきです。

この統合により、HyperDX アプリがデプロイされるときに作成される自動生成のデータ取り込み API キーを使用して OTLP エンドポイントが保護されます。コレクタに送信されるすべてのテレメトリデータは、認証のためにこの API キーを含む必要があります。キーは、`Team Settings → API Keys` の下で HyperDX アプリで確認できます。

<Image img={ingestion_key} alt="Ingestion keys" size="lg"/>

デプロイメントのセキュリティを高めるために、次のことを推奨します：

- ClickHouse と HTTPS で通信するようにコレクタを構成します。
- 限られた権限を持つデータ取り込み用の専用ユーザーを作成します - 以下を参照。
- OTLP エンドポイントの TLS を有効にして、SDK/エージェントとコレクタ間の暗号化通信を確保します。 **現在、これはユーザーがコレクタのデフォルト配布をデプロイし、自分で設定を管理することを必要とします**。

### データ取り込みユーザーの作成 {#creating-an-ingestion-user}

OTel コレクタ用に ClickHouse へのデータ取り込みを行う専用のデータベースとユーザーを作成することを推奨します。これには、[ClickStack によって作成および使用されるテーブル](https://opentelemetry.io/docs/collector/transforming-telemetry/) の作成および挿入を行う能力が必要です。

```sql
CREATE DATABASE otel;
CREATE USER hyperdx_ingest IDENTIFIED WITH sha256_password BY 'ClickH0u3eRocks123!';
GRANT SELECT, INSERT, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest;
```

これはコレクタがデータベース `otel` を使用するように設定されていることを前提としています。これは、環境変数 `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE` を介して制御できます。これをコレクタをホストするイメージに [他の環境変数](#modifying-otel-collector-configuration) に似た方法で渡してください。

## 処理 - フィルタリング、変換、強化 {#processing-filtering-transforming-enriching}

ユーザーは、データ取り込み中にイベントメッセージをフィルタリング、変換、および強化したいと考えるでしょう。ClickStack コネクタの設定は変更できないため、さらなるイベントフィルタリングおよび処理が必要なユーザーには、次のいずれかを推奨します：

- フィルタリングおよび処理を行う OTel コレクタの独自バージョンをデプロイし、OTLP を介して ClickStack コレクタにイベントを送信して ClickHouse へのデータ取り込みを行います。
- OTel コレクタの独自バージョンをデプロイし、ClickHouse exporter を使用してイベントを直接 ClickHouse に送信します。

OTel コレクタを使用して処理を行う場合は、ゲートウェイインスタンスで変換を行い、エージェントインスタンスで行う作業を最小限に抑えることを推奨します。これにより、サーバー上で実行されているエッジのエージェントが必要とするリソースが最小限に抑えられます。通常、ユーザーはフィルタリング（不要なネットワーク使用を最小限に抑えるため）や、タイムスタンプの設定（オペレーターを介して）およびエンリッチメントを行っているのを見かけます。たとえば、ゲートウェイインスタンスが異なる Kubernetes クラスターに存在する場合、k8s エンリッチメントはエージェントで行う必要があります。

OpenTelemetry は、ユーザーが活用できる以下の処理およびフィルタリング機能をサポートしています：

- **プロセッサ** - プロセッサは、[receivers によって収集されたデータを変更または変換](https://opentelemetry.io/docs/collector/transforming-telemetry/)して、エクスポータに送信する前に処理します。プロセッサは、コレクタ設定の `processors` セクションで設定された順序で適用されます。これらはオプションですが、最小セットは [通常推奨されます](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor#recommended-processors)。ClickHouse で OTel コレクタを使用する場合は、プロセッサを次のように制限することを推奨します：

- [memory_limiter](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/memorylimiterprocessor/README.md)は、コレクタ上でのメモリ不足の状況を防ぐために使用されます。推奨事項については、[Estimating Resources](#estimating-resources)を参照してください。
- コンテキストに基づいてエンリッチメントを行うプロセッサ。たとえば、[Kubernetes Attributes Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor)は、k8s メタデータを持つスパン、メトリクス、ログリソース属性を自動的に設定することを可能にします。
- 必要に応じて、[Tail or head sampling](https://opentelemetry.io/docs/concepts/sampling/)を行います。
- [Basic filtering](https://opentelemetry.io/docs/collector/transforming-telemetry/) - オペレーターを介してこれが行えない場合に、不必要なイベントをドロップします。
- [Batching](https://github.com/open-telemetry/opentelemetry-collector/tree/main/processor/batchprocessor) - ClickHouse で作業する際にデータがバッチとして送信されることを確認するために不可欠です。["Optimizing inserts"](#optimizing-inserts)を参照してください。

- **オペレーター** - [オペレーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/pkg/stanza/docs/operators/README.md)は、receiver で使用できる最も基本的な処理単位を提供します。基本的なパースがサポートされており、Severity や Timestamp などのフィールドを設定できます。ここでは、JSON および正規表現のパースがサポートされており、イベントフィルタリングおよび基本的な変換が行えます。ここでイベントフィルタリングを行うことを推奨します。

ユーザーは、オペレーターを使用して過剰なイベント処理を行わないことを推奨します。こうした処理は、特に JSON パースにおいて、かなりのメモリおよび CPU オーバーヘッドを伴います。ClickHouse では、物質化ビューやカラムでの insert 時にすべての処理を行うことが可能ですが、特にコンテキストに依存するエンリッチメント（例：k8s メタデータの追加）にはいくつかの例外があります。詳細については、[Extracting structure with SQL](/use-cases/observability/schema-design#extracting-structure-with-sql)を参照してください。

### 例 {#example-processing}

以下の構成は、この [非構造化ログファイル](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/access-unstructured.log.gz) の収集を示しています。この構成は、ClickStack ゲートウェイにデータを送信するエージェント役のコレクタによって使用される可能性があります。

ログ行から構造を抽出するためにオペレーターを使用し（`regex_parser`）、イベントをフィルタリングし、イベントをバッチ処理してメモリ使用量を制限するためのプロセッサを示しています。

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
  # HTTP setup
  otlphttp/hdx:
    endpoint: 'http://localhost:4318'
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    compression: gzip

  # gRPC setup (alternative)
  otlp/hdx:
    endpoint: 'localhost:4317'
    headers:
      authorization: <YOUR_API_INGESTION_KEY>
    compression: gzip
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

OTLP 通信で、データ取り込み API キーを含む [認証ヘッダー](#securing-the-collector) を含める必要があることに注意してください。

さらに高度な構成が必要な場合は、[OpenTelemetry コレクタのドキュメント](https://opentelemetry.io/docs/collector/)を参照してください。

## インサートの最適化 {#optimizing-inserts}

高いインサートパフォーマンスを達成しながら強力な整合性保証を得るために、ユーザーは ClickHouse への観測データの挿入時にシンプルなルールを遵守する必要があります。OTel コレクタの正しい構成により、次のルールを容易に守ることができます。これにより、[一般的な問題](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse)を避けることもできます。

### バッチ処理 {#batching}

デフォルトでは、ClickHouse に送信される各インサートは、ClickHouse がインサートからのデータと、格納する必要のあるその他のメタデータを含むストレージの一部を即座に作成します。したがって、より多くのデータを含む小規模なインサートを送信することは、大規模なインサートの送信よりも必要な書き込み数を減少させます。データは、最低でも 1,000 行の比較的大きなバッチで挿入することを推奨します。さらなる詳細は [こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)を参照してください。

デフォルトでは、ClickHouse へのインサートは同期的であり、同一の場合には冪等性があります。MergeTree エンジンファミリーのテーブルの場合、ClickHouse はデフォルトでインサートを[重複排除します](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)。これは、以下のようなケースでインサートが許容されることを意味します：

- (1) データを受け取っているノードに問題がある場合、インサートクエリはタイムアウトするか（またはより特定のエラーが発生し）、確認を受け取ることができません。
- (2) ノードによってデータが書き込まれたが、ネットワークの中断のためにクエリの送信者に確認を返せない場合、送信者はタイムアウトまたはネットワークエラーを受け取ります。

コレクタの観点からは、(1) と (2) は区別が難しい場合があります。ただし、どちらの場合も、確認されていないインサートは即座に再試行できます。再試行インサートクエリが同じデータを同じ順序で含んでいる限り、ClickHouse は元の（未確認の）インサートが成功した場合、再試行インサートを自動的に無視します。

そのため、ClickStack の OTel コレクタは [batch processor](https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md) を使用しています。これにより、前述の要件を満たす行の一貫したバッチとしてインサートが送信されることが保証されます。コレクタに高いスループット（秒あたりのイベント）が期待され、各インサートで 5,000 イベント以上が送信される場合、通常はパイプラインで必要な唯一のバッチ処理です。この場合、コレクタはバッチプロセッサの `timeout` が達成される前にバッチをフラッシュし、パイプラインのエンドツーエンドのレイテンシを低く保ち、バッチが一貫したサイズであることを保証します。

### 非同期インサートを使用する {#use-asynchronous-inserts}

通常、ユーザーはコレクタのスループットが低いときに小さいバッチを送信することを余儀なくされ、それでもデータが ClickHouse に到達するのに最低限のエンドツーエンドのレイテンシを期待します。この場合、バッチプロセッサの `timeout` が期限切れになると、小さいバッチが送信されます。この問題は、ユーザーがゲートウェイとして機能する ClickStack コレクタにデータを送信しているときには稀です。集約器として機能することでこの問題を軽減します - [Collector roles](#collector-roles)を参照してください。

すでに大きなバッチの保証ができない場合は、[Asynchronous Inserts](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)を使用して ClickHouse にバッチ処理を委任することができます。非同期インサートでは、データがまずバッファに挿入され、その後データベースストレージに書き込まれます。

<Image img={observability_6} alt="Async inserts" size="md"/>

[非同期インサートを有効にすると](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)、ClickHouse は ① インサートクエリが受信されると、クエリのデータが ② 最初にインメモリバッファに即座に書き込まれます。③ 次のバッファフラッシュの際に、バッファのデータが [順序付けされ](https://guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)、データベースストレージの部分として書き込まれます。注意が必要なのは、データがデータベースストレージにフラッシュされるまでクエリで検索できないことです。バッファフラッシュは [構成可能です](/optimize/asynchronous-inserts)。

コレクタの非同期インサートを有効にするには、接続文字列に `async_insert=1` を追加します。ユーザーには、配信保証を得るために `wait_for_async_insert=1`（デフォルト値）を使用することをお勧めします - 詳細は [こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)を参照してください。

非同期インサートからのデータは、ClickHouse のバッファがフラッシュされたときに挿入されます。これは、最初の INSERT クエリから `async_insert_max_data_size` を超えた後、または `async_insert_busy_timeout_ms` ミリ秒後に発生します。`async_insert_stale_timeout_ms` がゼロ以外の値に設定されている場合、データは最後のクエリから `async_insert_stale_timeout_ms` ミリ秒後に挿入されます。ユーザーは、これらの設定を調整してパイプラインのエンドツーエンドのレイテンシを制御できます。バッファフラッシュを調整するために使用可能なさらなる設定は [こちら](https://operations/settings/settings#async_insert)に文書化されています。一般的には、デフォルト設定が適切です。

:::note 適応型非同期インサートを考慮する
低スループットだが厳格なエンドツーエンドのレイテンシ要件がある場合、[適応型非同期インサート](https://clickhouse.com/blog/clickhouse-release-24-02#adaptive-asynchronous-inserts)が有用かもしれません。一般的には、ClickHouseを使用した高スループットの観測用途には適用されません。
:::

最後に、非同期インサートを使用する場合、ClickHouse への同期インサートに関連する以前の重複排除機能はデフォルトで無効になっています。必要な場合は、設定 [`async_insert_deduplicate`](/operations/settings/settings#async_insert_deduplicate)を参照してください。

この機能の構成に関する詳細は、この [docs page](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)や、詳細な [blog post](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)で確認できます。

## スケーリング {#scaling}

ClickStack OTel コレクタはゲートウェイインスタンスとして機能します - [Collector roles](#collector-roles)を参照してください。これらは、通常、データセンターまたはリージョンごとに単独のサービスを提供します。これらは、単一の OTLP エンドポイントを介してアプリケーション（またはエージェント役の他のコレクタ）からイベントを受信します。通常、コレクタインスタンスのセットがデプロイされ、アウト・オブ・ザ・ボックスのロードバランサーがそれらの負荷を分散します。

<Image img={clickstack_with_gateways} alt="Scaling with gateways" size="lg"/>

このアーキテクチャの目的は、エージェントから計算集約型の処理をオフロードし、リソース使用量を最小限に抑えることです。ClickStack ゲートウェイは、エージェントが行う必要のある変換タスクを実行できます。さらに、複数のエージェントからイベントを集約することで、ゲートウェイは ClickHouse に大規模なバッチを送信できるようにし、効率的な挿入を可能にします。これらのゲートウェイコレクタは、より多くのエージェントと SDK ソースが追加され、イベントスループットが増加するにつれて容易にスケーリングできます。

### Kafkaの追加 {#adding-kafka}

上記のアーキテクチャに Kafka をメッセージキューとして使用していないことに気づくかもしれません。

メッセージバッファとして Kafka キューを使用することは、ロギングアーキテクチャにおいて一般的なデザインパターンであり、ELK スタックによって広められました。これにはいくつかの利点があります：主に、強力なメッセージ配信保証を提供し、バックプレッシャーに対処するのを助けることです。メッセージは、収集エージェントから Kafka に送信され、ディスクに書き込まれます。理論的には、クラスター化された Kafka インスタンスは、メッセージを解析して処理するよりも、直線的にディスクにデータを書き込むため、非常に高いスループットのメッセージバッファを提供するはずです。例えば、Elastic でのトークン化やインデキシングは、大きなオーバーヘッドを伴います。データをエージェントから移動させることで、ソースでのログローテーションの結果としてメッセージを失うリスクも軽減されます。最後に、一部のユースケースには魅力的なメッセージ再送信およびクロスリージョンのレプリケーション機能を提供します。

ただし、ClickHouse はデータを非常に迅速に挿入できます - 中程度のハードウェアで毎秒数百万件の行を処理できます。ClickHouse のバックプレッシャーは稀です。一般に、Kafka キューを利用することは、より多くのアーキテクチャの複雑さとコストを伴います。ログが銀行取引や他の重要なデータと同じ配信保証を必要としないという原則を受け入れることができるのであれば、Kafka の複雑さを避けることを推奨します。

ただし、高い配信保証やデータの再送信機能（おそらく複数のソースに再送信する能力）が必要な場合、Kafka は有用なアーキテクチャの追加となり得ます。

<Image img={observability_8} alt="Adding kafka" size="lg"/>

この場合、OTel エージェントは [Kafka exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/kafkaexporter/README.md) を介して Kafka にデータを送信するように構成できます。ゲートウェイインスタンスは、[Kafka receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/kafkareceiver/README.md) を使用してメッセージを消費します。詳細については、Confluent と OTel のドキュメントを参照することを推奨します。

:::note OTel コレクタの設定
ClickStack OpenTelemetry コレクタの配布版は Kafka と一緒に使用できないため、設定の変更が必要です。ユーザーは、ClickHouse exporter を使用してデフォルトの OTel コレクタをデプロイする必要があります。
:::

## リソースの推定 {#estimating-resources}

OTel コレクタのリソース要件は、イベントスループット、メッセージサイズ、および実行される処理の量によって異なります。OpenTelemetry プロジェクトは、リソース要件を推定するための[ベンチマーク](https://opentelemetry.io/docs/collector/benchmarks/)を提供しています。

[私たちの経験では](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#architectural-overview)、3 コアおよび 12GB の RAM を持つ ClickStack ゲートウェイインスタンスは、毎秒約 60,000 イベントを処理できます。これは、フィールドのリネームを担当する最小限の処理パイプラインを前提としています。

ゲートウェイにイベントを送信する役割を持つエージェントインスタンスでは、イベントのタイムスタンプの設定のみを行います。ログの期待される数に基づいて、次の数値をスタートポイントとして推奨します：

| ログ生成率 | コレクタエージェントのリソース |
|------------|--------------------------------|
| 1k/秒     | 0.2CPU, 0.2GiB                |
| 5k/秒     | 0.5 CPU, 0.5GiB               |
| 10k/秒    | 1 CPU, 1GiB                   |

## JSON サポート {#json-support}

<BetaBadge/>

ClickStack は、バージョン `2.0.4` から [JSON タイプ](/interfaces/formats/JSON)のベータサポートを提供しています。

### JSON タイプの利点 {#benefits-json-type}

JSON タイプは ClickStack ユーザーに次の利点を提供します：

- **型保存** - 数字は数字のまま、真偽値は真偽値のままです—すべてを文字列にフラット化する必要はありません。これにより、キャストが減り、クエリが簡素化され、集計がより正確になります。
- **パスレベルのカラム** - 各 JSON パスは独自のサブカラムになり、I/O が削減されます。クエリは必要なフィールドのみを読み取るため、特定のフィールドをクエリするために全カラムを読み取る必要があった古い Map タイプに比べて大きなパフォーマンス向上が得られます。
- **深いネスティングが簡単** - 手動でフラット化する必要なしに、複雑で深くネストされた構造を自然に扱えるようになります（Map タイプで必要だった）。
- **動的で進化するスキーマ** - チームが時間の経過とともに新しいタグや属性を追加する観測データに最適です。JSON はスキーマ移行なしでこれらの変更を自動的に処理します。
- **より高速なクエリ、低メモリ** - `LogAttributes` のような属性に対する典型的な集計で、5-10 倍少ないデータが読み込まれ、速度の向上が見られ、クエリ時間とピークメモリ使用が削減されます。
- **シンプルな管理** - パフォーマンスのためにカラムを事前にマテリアライズする必要がありません。各フィールドは独自のサブカラムとなり、ネイティブの ClickHouse カラムと同じスピードを提供します。

### JSON サポートを有効にする {#enabling-json-support}

コレクタにこのサポートを有効にするには、コレクタを含むすべてのデプロイメントで環境変数 `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` を設定します。これにより、スキーマが ClickHouse に JSON タイプを使用して作成されることが保証されます。

:::note HyperDX サポート
JSON タイプをクエリするためには、HyperDX アプリケーション層でも環境変数 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` を介してサポートを有効にする必要があります。
:::

例えば：

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e OPAMP_SERVER_URL=${OPAMP_SERVER_URL} -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-otel-collector
```

### Map ベースのスキーマから JSON タイプへの移行 {#migrating-from-map-based-schemas-to-json}

:::重要 過去の互換性
[JSON タイプ](/interfaces/formats/JSON)は、既存の Map ベースのスキーマとの互換性はありません。新しいテーブルは JSON タイプを使用して作成されます。
:::

Map ベースのスキーマから移行するには、以下の手順に従ってください：

<VerticalStepper headerLevel="h4">

#### OTel コレクタを停止する {#stop-the-collector}

#### 既存のテーブルの名前を変更し、データソースを更新する {#rename-existing-tables-sources}

既存のテーブルの名前を変更し、HyperDX のデータソースを更新します。

例えば：

```sql
RENAME TABLE otel_logs TO otel_logs_map;
RENAME TABLE otel_metrics TO otel_metrics_map;
```

#### コレクタをデプロイする {#deploy-the-collector}

`OTEL_AGENT_FEATURE_GATE_ARG` を設定したコレクタをデプロイします。

#### JSON スキーマサポートで HyperDX コンテナを再起動する {#restart-the-hyperdx-container}

```shell
export BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true
```

#### 新しいデータソースを作成する {#create-new-data-sources}

JSON テーブルを指す新しいデータソースを HyperDX に作成します。

</VerticalStepper>

#### 既存のデータの移行（オプション） {#migrating-existing-data}

古いデータを新しい JSON テーブルに移動するには：

```sql
INSERT INTO otel_logs SELECT * FROM otel_logs_map;
INSERT INTO otel_metrics SELECT * FROM otel_metrics_map;
```

:::warning
推奨は、約 10 億行未満のデータセットに限ります。以前に Map タイプで保存されていたデータは、型の精度を保持しませんでした（すべての値は文字列でした）。その結果、この古いデータは、古いスキーマ内で年数が経つまで新しいスキーマでは文字列として表示され、フロントエンドでのキャスティングを必要とします。新しいデータについては、JSON タイプで型が保存されます。
:::
