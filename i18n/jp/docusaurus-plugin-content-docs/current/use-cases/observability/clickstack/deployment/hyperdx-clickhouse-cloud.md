---
slug: /use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud
title: 'ClickHouse Cloud'
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: 'ClickHouse Cloud を利用した ClickStack のデプロイ'
doc_type: 'guide'
keywords: ['clickstack', 'デプロイメント', 'セットアップ', '設定', 'オブザーバビリティ']
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
import read_only from '@site/static/images/clickstack/read-only-access.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

<PrivatePreviewBadge />

::::note[プライベートプレビュー]
この機能は ClickHouse Cloud のプライベートプレビュー段階にあります。組織として優先的なアクセスを希望される場合は、
<TrackedLink href="https://clickhouse.com/cloud/clickstack-private-preview" eventName="docs.clickstack_deployment.waitlist_cta">ウェイトリストに登録してください</TrackedLink>。

ClickHouse Cloud を初めて利用する場合は、
<TrackedLink href="/docs/cloud/overview" eventName="docs.clickstack_deployment.cloud_learn_more_cta">こちら</TrackedLink> をクリックして詳細をご覧いただくか、<TrackedLink href="https://clickhouse.cloud/signUp" eventName="docs.clickstack_deployment.cloud_signup_cta" target="_blank" rel="noopener noreferrer">無料トライアルに登録</TrackedLink>して開始してください。
::::

このオプションは、ClickHouse Cloud を利用しているユーザー向けに設計されています。このデプロイメントパターンでは、ClickHouse と HyperDX の両方が ClickHouse Cloud 上でホストされるため、ユーザーがセルフホストする必要のあるコンポーネント数を最小限に抑えられます。

インフラストラクチャ管理を削減できるだけでなく、このデプロイメントパターンでは認証が ClickHouse Cloud の SSO/SAML と統合されます。セルフホスト型デプロイメントとは異なり、ダッシュボード、保存済み検索、ユーザー設定、アラートなどのアプリケーション状態を保存するための MongoDB インスタンスをプロビジョニングする必要もありません。

このモードでは、データのインジェストはすべてユーザー側で行います。自前でホストしている OpenTelemetry collector、クライアントライブラリからの直接インジェスト、Kafka や S3 などの ClickHouse ネイティブのテーブルエンジン、ETL パイプライン、または ClickHouse Cloud のマネージドなインジェストサービスである ClickPipes を使用して、ClickHouse Cloud にデータを取り込むことができます。このアプローチは、ClickStack を運用するうえで最もシンプルかつ高パフォーマンスな方法を提供します。

### 適しているケース

このデプロイメントパターンは、次のようなシナリオに最適です。

1. すでに ClickHouse Cloud にオブザーバビリティデータがあり、それを HyperDX を使って可視化したい場合。
2. 大規模なオブザーバビリティ環境を運用しており、ClickHouse Cloud と組み合わせた ClickStack の専用パフォーマンスとスケーラビリティが必要な場合。
3. すでに分析用途で ClickHouse Cloud を利用しており、ClickStack のインストルメンテーションライブラリを使ってアプリケーションを計測し、同じクラスターにデータを送信したい場合。この場合、オブザーバビリティワークロード用のコンピュートを分離するために [warehouses](/cloud/reference/warehouses) を使用することを推奨します。


## デプロイ手順 {#deployment-steps}

本ガイドは、ClickHouse Cloudサービスが既に作成されていることを前提としています。サービスをまだ作成していない場合は、クイックスタートガイドの[「ClickHouseサービスの作成」](/getting-started/quick-start/cloud#1-create-a-clickhouse-service)の手順に従ってください。

<VerticalStepper headerLevel="h3">

### サービス認証情報のコピー（任意） {#copy-service-credentials}

**サービス内で可視化したい既存のオブザーバビリティイベントがある場合、この手順はスキップできます。**

メインのサービス一覧に移動し、HyperDXで可視化するためのオブザーバビリティイベントを格納するサービスを選択します。

ナビゲーションメニューから`Connect`ボタンを押します。モーダルが開き、サービスの認証情報と、各種インターフェースや言語を使用した接続方法の手順が表示されます。ドロップダウンから`HTTPS`を選択し、接続エンドポイントと認証情報を記録します。

<Image img={cloud_connect} alt='ClickHouse Cloud接続' size='lg' />

### OpenTelemetry Collectorのデプロイ（任意） {#deploy-otel-collector}

**サービス内で可視化したい既存のオブザーバビリティイベントがある場合、この手順はスキップできます。**

この手順により、OpenTelemetry（OTel）スキーマでテーブルが作成され、HyperDXでデータソースをシームレスに作成できるようになります。また、[サンプルデータセット](/use-cases/observability/clickstack/sample-datasets)の読み込みやOTelイベントのClickStackへの送信に使用できるOTLPエンドポイントも提供されます。

:::note 標準OpenTelemetry collectorの使用
以下の手順では、ClickStackディストリビューションではなく、OTel collectorの標準ディストリビューションを使用します。後者は設定にOpAMPサーバーが必要ですが、現在プライベートプレビューではサポートされていません。以下の設定は、ClickStackディストリビューションのcollectorで使用されているバージョンを再現し、イベントを送信できるOTLPエンドポイントを提供します。
:::

OTel collectorの設定をダウンロードします：

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
          # JSON解析: 構造化ログ本文の内容からフィールドを抽出し、ログ属性を拡張します(OTELマップまたはJSON文字列として)。
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
          # 推論: 本文の最初の256文字から最初のログレベルキーワードを抽出
          - set(log.cache["substr"], log.body.string) where Len(log.body.string)
            < 256
          - set(log.cache["substr"], Substring(log.body.string, 0, 256)) where
            Len(log.body.string) >= 256
          - set(log.cache, ExtractPatterns(log.cache["substr"],
            "(?i)(?P<0>(alert|crit|emerg|fatal|error|err|warn|notice|debug|dbug|trace))"))
          # 推論: FATALを検出
          - set(log.severity_number, SEVERITY_NUMBER_FATAL) where
            IsMatch(log.cache["0"], "(?i)(alert|crit|emerg|fatal)")
          - set(log.severity_text, "fatal") where log.severity_number ==
            SEVERITY_NUMBER_FATAL
          # 推論: ERRORを検出
          - set(log.severity_number, SEVERITY_NUMBER_ERROR) where
            IsMatch(log.cache["0"], "(?i)(error|err)")
          - set(log.severity_text, "error") where log.severity_number ==
            SEVERITY_NUMBER_ERROR
          # 推論: WARNを検出
          - set(log.severity_number, SEVERITY_NUMBER_WARN) where
            IsMatch(log.cache["0"], "(?i)(warn|notice)")
          - set(log.severity_text, "warn") where log.severity_number ==
            SEVERITY_NUMBER_WARN
          # 推論: DEBUGを検出
          - set(log.severity_number, SEVERITY_NUMBER_DEBUG) where
            IsMatch(log.cache["0"], "(?i)(debug|dbug)")
          - set(log.severity_text, "debug") where log.severity_number ==
            SEVERITY_NUMBER_DEBUG
          # 推論: TRACEを検出
          - set(log.severity_number, SEVERITY_NUMBER_TRACE) where
            IsMatch(log.cache["0"], "(?i)(trace)")
          - set(log.severity_text, "trace") where log.severity_number ==
            SEVERITY_NUMBER_TRACE
          # 推論: その他の場合
          - set(log.severity_text, "info") where log.severity_number == 0
          - set(log.severity_number, SEVERITY_NUMBER_INFO) where log.severity_number == 0
      - context: log
        error_mode: ignore
        statements:
          # severity_textの大文字・小文字を正規化
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
    # 最大メモリの80%(上限2G)。低メモリ環境では調整が必要
    limit_mib: 1500
    # 制限値の25%(上限2G)。低メモリ環境では調整が必要
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

```

</details>

以下のDockerコマンドを使用してコレクターをデプロイします。事前に記録した接続設定を各環境変数に設定し、使用しているオペレーティングシステムに応じて適切なコマンドを実行してください。
```


```bash
# クラウドエンドポイントを変更してください
export CLICKHOUSE_ENDPOINT=
export CLICKHOUSE_PASSWORD=
# 必要に応じて変更してください 
export CLICKHOUSE_DATABASE=default
```


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



# Linuxコマンド



# docker run --network=host --rm -it \

# -e CLICKHOUSE&#95;ENDPOINT=${CLICKHOUSE_ENDPOINT} \

# -e CLICKHOUSE&#95;USER=default \

# -e CLICKHOUSE&#95;PASSWORD=${CLICKHOUSE_PASSWORD} \

# -e CLICKHOUSE&#95;DATABASE=${CLICKHOUSE_DATABASE} \

# --user 0:0 \

# -v &quot;$(pwd)/otel-cloud-config.yaml&quot;:/etc/otel/config.yaml \

# -v /var/log:/var/log:ro \

# -v /private/var/log:/private/var/log:ro \

# otel/opentelemetry-collector-contrib:latest \

# --config /etc/otel/config.yaml

```

:::note
本番環境では、インジェスト専用のユーザーを作成し、必要なデータベースとテーブルへのアクセス権限を制限することを推奨します。詳細については、["データベースとインジェストユーザー"](/use-cases/observability/clickstack/production#database-ingestion-user)を参照してください。
:::

### HyperDXへの接続 {#connect-to-hyperdx}

サービスを選択し、左側のメニューから`HyperDX`を選択します。

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

ユーザーを作成する必要はなく、自動的に認証された後、データソースの作成を求められます。

HyperDXインターフェースのみを試したいユーザーには、OTelデータを使用する[サンプルデータセット](/use-cases/observability/clickstack/sample-datasets)を推奨します。

<Image img={hyperdx_cloud_landing} alt="ClickHouse Cloud HyperDX Landing" size="lg"/>

### ユーザー権限 {#user-permissions}

HyperDXにアクセスするユーザーは、ClickHouse Cloudコンソールの認証情報を使用して自動的に認証されます。アクセスは、サービス設定で構成されたSQLコンソール権限によって制御されます。

#### ユーザーアクセスの設定 {#configure-access}

1. ClickHouse Cloudコンソールでサービスに移動します
2. **Settings** → **SQL Console Access**に移動します
3. 各ユーザーに適切な権限レベルを設定します:
   - **Service Admin → Full Access** - アラートを有効にするために必要
   - **Service Read Only → Read Only** - オブザーバビリティデータの表示とダッシュボードの作成が可能
   - **No access** - HyperDXにアクセスできません

<Image img={read_only} alt="ClickHouse Cloud Read Only"/>

:::important アラートには管理者アクセスが必要です
アラートを有効にするには、**Service Admin**権限(SQL Console Accessドロップダウンで**Full Access**にマッピングされる)を持つ少なくとも1人のユーザーが、少なくとも1回HyperDXにログインする必要があります。これにより、アラートクエリを実行する専用ユーザーがデータベースにプロビジョニングされます。
:::

### データソースの作成 {#create-a-datasource}

HyperDXはOpen Telemetryネイティブですが、Open Telemetry専用ではありません。ユーザーは必要に応じて独自のテーブルスキーマを使用できます。

#### Open Telemetryスキーマの使用  {#using-otel-schemas}

上記のOTel collectorを使用してClickHouse内にデータベースとテーブルを作成している場合は、ソース作成モデル内のすべてのデフォルト値を保持し、`Table`フィールドに`otel_logs`の値を入力してログソースを作成します。その他の設定はすべて自動検出されるため、`Save New Source`をクリックできます。

<Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX Datasource" size="lg"/>

トレースとOTelメトリクスのソースを作成するには、上部メニューから`Create New Source`を選択できます。

<Image img={hyperdx_create_new_source} alt="HyperDX create new source" size="lg"/>

ここから、必要なソースタイプを選択し、続いて適切なテーブルを選択します。例えば、トレースの場合は`otel_traces`テーブルを選択します。すべての設定は自動検出されます。

<Image img={hyperdx_create_trace_datasource} alt="HyperDX create trace source" size="lg"/>

:::note ソースの相関付け
ClickStack内の異なるデータソース(ログやトレースなど)は、相互に相関付けることができます。これを有効にするには、各ソースで追加の設定が必要です。例えば、ログソースでは対応するトレースソースを指定でき、トレースソースでも同様にログソースを指定できます。詳細については、["相関ソース"](/use-cases/observability/clickstack/config#correlated-sources)を参照してください。
:::

#### カスタムスキーマの使用 {#using-custom-schemas}

データを持つ既存のサービスにHyperDXを接続したいユーザーは、必要に応じてデータベースとテーブルの設定を完了できます。テーブルがClickHouse用のOpen Telemetryスキーマに準拠している場合、設定は自動検出されます。

独自のスキーマを使用する場合は、必要なフィールドが指定されていることを確認してログソースを作成することを推奨します。詳細については、["ログソース設定"](/use-cases/observability/clickstack/config#logs)を参照してください。

</VerticalStepper>

<JSONSupport/>

さらに、ユーザーはClickHouse CloudサービスでJSONが有効になっていることを確認するために、support@clickhouse.comに連絡する必要があります。
```
