---
'slug': '/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud'
'title': 'ClickHouse Cloud'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 1
'description': 'ClickHouse CloudでClickStackをデプロイする'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import cloud_connect from '@site/static/images/use-cases/observability/clickhouse_cloud_connection.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';
import hyperdx_cloud_landing from '@site/static/images/use-cases/observability/hyperdx_cloud_landing.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';

<PrivatePreviewBadge/>

このオプションは、ClickHouse Cloudを使用しているユーザー向けに設計されています。このデプロイメントパターンでは、ClickHouseとHyperDXの両方がClickHouse Cloudでホストされており、ユーザーがセルフホスティングする必要のあるコンポーネントの数が最小限に抑えられます。

インフラ管理の削減に加え、このデプロイメントパターンでは認証がClickHouse Cloud SSO/SAMLと統合されています。セルフホスト型のデプロイメントとは異なり、ダッシュボード、保存された検索、ユーザー設定、アラートなどのアプリケーションステートを保存するためのMongoDBインスタンスをプロビジョニングする必要もありません。

このモードでは、データの取り込みは完全にユーザーに委ねられています。ユーザーは、自分自身のホストされたOpenTelemetryコレクター、クライアントライブラリからの直接取り込み、ClickHouseネイティブのテーブルエンジン（KafkaやS3など）、ETLパイプライン、またはClickHouse Cloudの管理された取り込みサービスであるClickPipesを使用して、ClickHouse Cloudにデータを取り込むことができます。このアプローチは、ClickStackを操作する最もシンプルで高性能な方法を提供します。

### 適した用途 {#suitable-for}

このデプロイメントパターンは、以下のシナリオに最適です：

1. 既にClickHouse Cloudに可観測性データがあり、HyperDXを使用して視覚化したい場合。
2. 大規模な可観測性デプロイメントを運用しており、ClickHouse CloudのClickStackの専用パフォーマンスとスケーラビリティが必要な場合。
3. すでにClickHouse Cloudを分析に使用しており、ClickStackの計測ライブラリを使用してアプリケーションに計測機能を追加したい場合 — 同じクラスターにデータを送信します。この場合、可観測性のワークロードのためにコンピュートを孤立化するために、[warehouses](/cloud/reference/warehouses)の使用をお勧めします。

## デプロイメント手順 {#deployment-steps}

以下のガイドは、すでにClickHouse Cloudサービスを作成したことを前提としています。サービスを作成していない場合は、クイックスタートガイドの「["ClickHouseサービスを作成する"](/getting-started/quick-start/cloud#1-create-a-clickhouse-service)」ステップに従ってください。

<VerticalStepper headerLevel="h3">

### サービスの資格情報をコピーする（オプション） {#copy-service-credentials}

**可視化したい既存の可観測性イベントがある場合、この手順はスキップできます。**

メインサービスのリストに移動し、HyperDXで可視化するための可観測性イベントを配信する予定のサービスを選択します。

ナビゲーションメニューから`Connect`ボタンを押します。モーダルが開き、さまざまなインターフェースや言語を介して接続する方法に関する一連の指示とともに、サービスの資格情報が提供されます。ドロップダウンから`HTTPS`を選択し、接続エンドポイントと資格情報を記録します。

<Image img={cloud_connect} alt="ClickHouse Cloud connect" size="lg"/>

### Open Telemetryコレクターをデプロイする（オプション） {#deploy-otel-collector}

**可視化したい既存の可観測性イベントがある場合、この手順はスキップできます。**

この手順では、Open Telemetry（OTel）スキーマを使用してテーブルが作成され、HyperDXでデータソースをシームレスに作成できるようになります。これにより、[sample datasets](/use-cases/observability/clickstack/sample-datasets)を読み込むために使用できるOLTPエンドポイントが提供され、OTelイベントをClickStackに送信できます。

:::note 標準Open Telemetryコレクターの使用
以下の指示は、ClickStack配布版の代わりにOTelコレクターの標準配布版を使用しています。後者は設定のためにOpAMPサーバーを必要とします。これは現在、プライベートプレビューではサポートされていません。以下の設定は、コレクターのClickStack配布版で使用されているバージョンを再現し、イベントを送信できるOTLPエンドポイントを提供します。
:::

OTelコレクターの設定をダウンロードします：

```bash
curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/deployment/_snippets/otel-cloud-config.yaml
```

<details>
<summary>otel-cloud-config.yaml</summary>

```yaml file=docs/use-cases/observability/clickstack/deployment/_snippets/otel-cloud-config.yaml
receivers:
  otlp/hyperdx:
    protocols:
      grpc:
        include_metadata: true
        endpoint: '0.0.0.0:4317'
      http:
        cors:
          allowed_origins: ['*']
          allowed_headers: ['*']
        include_metadata: true
        endpoint: '0.0.0.0:4318'
processors:
  transform:
    log_statements:
      - context: log
        error_mode: ignore
        statements:
          # JSON parsing: Extends log attributes with the fields from structured log body content, either as an OTEL map or
          # as a string containing JSON content.
          - set(log.cache, ExtractPatterns(log.body, "(?P<0>(\\{.*\\}))")) where
            IsString(log.body)
          - merge_maps(log.attributes, ParseJSON(log.cache["0"]), "upsert")
            where IsMap(log.cache)
          - flatten(log.attributes) where IsMap(log.cache)
          - merge_maps(log.attributes, log.body, "upsert") where IsMap(log.body)
      - context: log
        error_mode: ignore
        conditions:
          - severity_number == 0 and severity_text == ""
        statements:
          # Infer: extract the first log level keyword from the first 256 characters of the body
          - set(log.cache["substr"], log.body.string) where Len(log.body.string)
            < 256
          - set(log.cache["substr"], Substring(log.body.string, 0, 256)) where
            Len(log.body.string) >= 256
          - set(log.cache, ExtractPatterns(log.cache["substr"],
            "(?i)(?P<0>(alert|crit|emerg|fatal|error|err|warn|notice|debug|dbug|trace))"))
          # Infer: detect FATAL
          - set(log.severity_number, SEVERITY_NUMBER_FATAL) where
            IsMatch(log.cache["0"], "(?i)(alert|crit|emerg|fatal)")
          - set(log.severity_text, "fatal") where log.severity_number ==
            SEVERITY_NUMBER_FATAL
          # Infer: detect ERROR
          - set(log.severity_number, SEVERITY_NUMBER_ERROR) where
            IsMatch(log.cache["0"], "(?i)(error|err)")
          - set(log.severity_text, "error") where log.severity_number ==
            SEVERITY_NUMBER_ERROR
          # Infer: detect WARN
          - set(log.severity_number, SEVERITY_NUMBER_WARN) where
            IsMatch(log.cache["0"], "(?i)(warn|notice)")
          - set(log.severity_text, "warn") where log.severity_number ==
            SEVERITY_NUMBER_WARN
          # Infer: detect DEBUG
          - set(log.severity_number, SEVERITY_NUMBER_DEBUG) where
            IsMatch(log.cache["0"], "(?i)(debug|dbug)")
          - set(log.severity_text, "debug") where log.severity_number ==
            SEVERITY_NUMBER_DEBUG
          # Infer: detect TRACE
          - set(log.severity_number, SEVERITY_NUMBER_TRACE) where
            IsMatch(log.cache["0"], "(?i)(trace)")
          - set(log.severity_text, "trace") where log.severity_number ==
            SEVERITY_NUMBER_TRACE
          # Infer: else
          - set(log.severity_text, "info") where log.severity_number == 0
          - set(log.severity_number, SEVERITY_NUMBER_INFO) where log.severity_number == 0
      - context: log
        error_mode: ignore
        statements:
          # Normalize the severity_text case
          - set(log.severity_text, ConvertCase(log.severity_text, "lower"))
  resourcedetection:
    detectors:
      - env
      - system
      - docker
    timeout: 5s
    override: false
  batch:
  memory_limiter:
    # 80% of maximum memory up to 2G, adjust for low memory environments
    limit_mib: 1500
    # 25% of limit up to 2G, adjust for low memory environments
    spike_limit_mib: 512
    check_interval: 5s
connectors:
  routing/logs:
    default_pipelines: [logs/out-default]
    error_mode: ignore
    table:
      - context: log
        statement: route() where IsMatch(attributes["rr-web.event"], ".*")
        pipelines: [logs/out-rrweb]
exporters:
  debug:
    verbosity: detailed
    sampling_initial: 5
    sampling_thereafter: 200
  clickhouse/rrweb:
    database: ${env:CLICKHOUSE_DATABASE}
    endpoint: ${env:CLICKHOUSE_ENDPOINT}
    password: ${env:CLICKHOUSE_PASSWORD}
    username: ${env:CLICKHOUSE_USER}
    ttl: 720h
    logs_table_name: hyperdx_sessions
    timeout: 5s
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
  clickhouse:
    database: ${env:CLICKHOUSE_DATABASE}
    endpoint: ${env:CLICKHOUSE_ENDPOINT}
    password: ${env:CLICKHOUSE_PASSWORD}
    username: ${env:CLICKHOUSE_USER}
    ttl: 720h
    timeout: 5s
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
extensions:
  health_check:
    endpoint: :13133
service:
  pipelines:
    traces:
      receivers: [otlp/hyperdx]
      processors: [memory_limiter, batch]
      exporters: [clickhouse]
    metrics:
      receivers: [otlp/hyperdx]
      processors: [memory_limiter, batch]
      exporters: [clickhouse]
    logs/in:
      receivers: [otlp/hyperdx]
      exporters: [routing/logs]
    logs/out-default:
      receivers: [routing/logs]
      processors: [memory_limiter, transform, batch]
      exporters: [clickhouse]
    logs/out-rrweb:
      receivers: [routing/logs]
      processors: [memory_limiter, batch]
      exporters: [clickhouse/rrweb]

```

</details>

次のDockerコマンドを使用してコレクターをデプロイし、以前に記録した接続設定に応じて環境変数を設定します。使用するオペレーティングシステムに応じた適切なコマンドを使う必要があります。

```bash

# modify to your cloud endpoint
export CLICKHOUSE_ENDPOINT=
export CLICKHOUSE_PASSWORD=

# optionally modify 
export CLICKHOUSE_DATABASE=default


# osx
docker run --rm -it \
  -p 4317:4317 -p 4318:4318 \
  -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  -e CLICKHOUSE_USER=default \
  -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  -e CLICKHOUSE_DATABASE=${CLICKHOUSE_DATABASE} \
  --user 0:0 \
  -v "$(pwd)/otel-cloud-collector.yaml":/etc/otel/config.yaml \
  -v /var/log:/var/log:ro \
  -v /private/var/log:/private/var/log:ro \
  otel/opentelemetry-collector-contrib:latest \
  --config /etc/otel/config.yaml


# linux command


# docker run --network=host --rm -it \

#   -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \

#   -e CLICKHOUSE_USER=default \

#   -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \

#   -e CLICKHOUSE_DATABASE=${CLICKHOUSE_DATABASE} \

#   --user 0:0 \

#   -v "$(pwd)/otel-cloud-config.yaml":/etc/otel/config.yaml \

#   -v /var/log:/var/log:ro \

#   -v /private/var/log:/private/var/log:ro \

#   otel/opentelemetry-collector-contrib:latest \

#   --config /etc/otel/config.yaml
```

:::note
本番環境では、取り込み用の専用ユーザーを作成し、データベースや必要なテーブルへのアクセス権限を制限することをお勧めします。詳細については、「["データベースと取り込みユーザー"](/use-cases/observability/clickstack/production#database-ingestion-user)」を参照してください。
:::

### HyperDXに接続する {#connect-to-hyperdx}

サービスを選択し、次に左メニューから`HyperDX`を選択します。

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

ユーザーを作成する必要はなく、自動的に認証され、データソースを作成するように求められます。

HyperDXインターフェースを探索したいだけのユーザーには、OTelデータを使用する[サンプルデータセット](/use-cases/observability/clickstack/sample-datasets)をお勧めします。

<Image img={hyperdx_cloud_landing} alt="ClickHouse Cloud HyperDX Landing" size="lg"/>

### データソースを作成する {#create-a-datasource}

HyperDXはOpen Telemetryネイティブですが、Open Telemetry専用ではありません - ユーザーは希望する場合、自分のテーブルスキーマを使用できます。

#### Open Telemetryスキーマを使用する {#using-otel-schemas}

上記のOTelコレクターを使用してClickHouse内にデータベースとテーブルを作成している場合は、作成ソースモデル内のすべてのデフォルト値を保持し、`Table`フィールドに`otel_logs`の値を入力してログソースを作成します。他のすべての設定は自動で検出され、`Save New Source`をクリックできます。

<Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX Datasource" size="lg"/>

トレースおよびOTelメトリクスのソースを作成するために、ユーザーは上部メニューから`Create New Source`を選択できます。

<Image img={hyperdx_create_new_source} alt="HyperDX create new source" size="lg"/>

ここから、必要なソースタイプを選択し、次に適切なテーブル（トレースの場合は`otel_traces`テーブルを選択）を選択します。すべての設定は自動で検出されるはずです。

<Image img={hyperdx_create_trace_datasource} alt="HyperDX create trace source" size="lg"/>

:::note ソースの相関
ClickStackのログやトレースなどの異なるデータソースは、お互いに相関させることができます。これを有効にするには、各ソースで追加の設定が必要です。たとえば、ログソースでは、対応するトレースソースを指定することができ、トレースソースではその逆が可能です。詳細については、「["相関ソース"](/use-cases/observability/clickstack/config#correlated-sources)」を参照してください。
:::

#### カスタムスキーマを使用する {#using-custom-schemas}

データを持つ既存のサービスにHyperDXを接続しようとするユーザーは、必要に応じてデータベースとテーブルの設定を完了できます。テーブルがClickHouseのOpen Telemetryスキーマに準拠している場合、設定は自動で検出されます。

独自のスキーマを使用する場合は、必須フィールドを指定してログソースを作成することをお勧めします — 詳細については、「["ログソース設定"](/use-cases/observability/clickstack/config#logs)」を参照してください。

</VerticalStepper>

## JSONタイプのサポート {#json-type-support}

<BetaBadge/>

ClickStackは、バージョン`2.0.4`から[JSONタイプ](/interfaces/formats/JSON)のベータサポートを提供しています。

このタイプの利点については、[JSONタイプの利点](/use-cases/observability/clickstack/ingesting-data/otel-collector#benefits-json-type)を参照してください。

JSONタイプのサポートを有効にするには、ユーザーは以下の環境変数を設定する必要があります：

- `OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json'` - OTelコレクターでのサポートを有効にし、JSONタイプを使用してスキーマが作成されることを保証します。

さらに、ユーザーはsupport@clickhouse.comに問い合わせて、JSONがClickHouse Cloudサービスの両方で有効になっていることを確認する必要があります。
