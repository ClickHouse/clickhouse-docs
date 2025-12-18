---
slug: /use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud
title: 'ClickHouse Cloud'
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: 'ClickHouse Cloud を利用した ClickStack のデプロイ'
doc_type: 'guide'
keywords: ['clickstack', 'deployment', 'setup', 'configuration', 'observability']
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
import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

<PrivatePreviewBadge />

::::note[プライベートプレビュー]
この機能は ClickHouse Cloud のプライベートプレビュー中です。組織として優先的なアクセスに関心がある場合は、
<TrackedLink href="https://clickhouse.com/cloud/clickstack-private-preview" eventName="docs.clickstack_deployment.waitlist_cta">ウェイトリストに登録してください</TrackedLink>。

ClickHouse Cloud を初めて利用する場合は、
<TrackedLink href="/docs/cloud/overview" eventName="docs.clickstack_deployment.cloud_learn_more_cta">こちら</TrackedLink> をクリックして詳細を確認するか、<TrackedLink href="https://clickhouse.cloud/signUp" eventName="docs.clickstack_deployment.cloud_signup_cta" target="_blank" rel="noopener noreferrer">無料トライアルにサインアップ</TrackedLink>して開始してください。
::::

このオプションは、ClickHouse Cloud を利用しているユーザー向けに設計されています。このデプロイメントパターンでは、ClickHouse と HyperDX の両方が ClickHouse Cloud 上にホストされるため、ユーザーがセルフホストする必要のあるコンポーネント数を最小限に抑えられます。

インフラ管理の負荷を軽減できるだけでなく、このデプロイメントパターンでは認証が ClickHouse Cloud の SSO/SAML と統合されます。セルフホスト型デプロイメントと異なり、ダッシュボード、保存済み検索、ユーザー設定、アラートなどのアプリケーション状態を保存するための MongoDB インスタンスを用意する必要もありません。

このモードでは、データのインジェストは完全にユーザーに委ねられます。独自にホストした OpenTelemetry コレクター、クライアントライブラリからの直接インジェスト、Kafka や S3 などの ClickHouse ネイティブなテーブルエンジン、ETL パイプライン、あるいは ClickHouse Cloud のマネージドインジェストサービスである ClickPipes を使用して、ClickHouse Cloud にデータを取り込むことができます。このアプローチは、ClickStack を運用するうえで最もシンプルかつ高パフォーマンスな方法を提供します。


### 適したユースケース {#suitable-for}

このデプロイメントパターンは、次のようなシナリオに最適です。

1. すでに ClickHouse Cloud にオブザーバビリティデータがあり、それを HyperDX を使って可視化したい場合。
2. 大規模なオブザーバビリティデプロイメントを運用しており、ClickHouse Cloud と組み合わせた ClickStack の専用のパフォーマンスとスケーラビリティが必要な場合。
3. すでに分析用途で ClickHouse Cloud を利用していて、ClickStack のインストルメンテーションライブラリを使ってアプリケーションを計測し、同じクラスターにデータを送信したい場合。この場合は、オブザーバビリティワークロード用のコンピュートリソースを分離するために [warehouses](/cloud/reference/warehouses) の利用を推奨します。

## デプロイ手順 {#deployment-steps}

このガイドでは、すでに ClickHouse Cloud サービスが作成済みであることを前提とします。まだサービスを作成していない場合は、クイックスタートガイドの「[ClickHouse サービスを作成する](/getting-started/quick-start/cloud#1-create-a-clickhouse-service)」の手順に従ってください。

<VerticalStepper headerLevel="h3">
  ### サービス認証情報のコピー（オプション）

  **サービスで可視化する既存のオブザーバビリティイベントが既にある場合は、この手順をスキップできます。**

  メインのサービス一覧に移動し、HyperDXで可視化するオブザーバビリティイベントを収集するサービスを選択してください。

  ナビゲーションメニューから`Connect`ボタンをクリックします。モーダルが開き、サービスの認証情報と、各種インターフェースおよび言語による接続手順が表示されます。ドロップダウンから`HTTPS`を選択し、接続エンドポイントと認証情報を控えてください。

  <Image img={cloud_connect} alt="ClickHouse Cloud への接続" size="lg" />

  ### OpenTelemetry Collectorのデプロイ（オプション）

  **サービスで可視化する既存のオブザーバビリティイベントが既にある場合は、この手順をスキップできます。**

  このステップでは、OpenTelemetry (OTel) スキーマでテーブルを作成し、HyperDXでデータソースをシームレスに作成できるようにします。また、[サンプルデータセット](/use-cases/observability/clickstack/sample-datasets)の読み込みやOTelイベントのClickStackへの送信に使用できるOLTPエンドポイントも提供します。

  :::note 標準OpenTelemetry collectorの使用
  以下の手順では、ClickStackディストリビューションではなく、OTel collectorの標準ディストリビューションを使用します。ClickStackディストリビューションは設定にOpAMPサーバーが必要ですが、現在プライベートプレビューではサポートされていません。以下の設定は、ClickStackディストリビューションのcollectorで使用されているバージョンを再現し、イベント送信用のOTLPエンドポイントを提供します。
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

  以下のDockerコマンドを使用してコレクターをデプロイします。事前に記録した接続設定を各環境変数に設定し、オペレーティングシステムに応じて適切なコマンドを使用してください。

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
  本番環境では、インジェスト専用のユーザーを作成し、必要なデータベースとテーブルへのアクセス権限を制限することを推奨します。詳細については、[&quot;データベースとインジェストユーザー&quot;](/use-cases/observability/clickstack/production#database-ingestion-user)を参照してください。
  :::

  ### HyperDXに接続する

  サービスを選択し、左側のメニューから `HyperDX` を選択します。

  <Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg" />

  ユーザーを作成する必要はなく、自動的に認証された後、データソースの作成を求められます。

  HyperDXインターフェースの操作のみを確認したいユーザーには、OTelデータを使用した[サンプルデータセット](/use-cases/observability/clickstack/sample-datasets)の利用を推奨します。

  <Image img={hyperdx_cloud_landing} alt="ClickHouse Cloud HyperDX のランディングページ" size="lg" />

  ### ユーザー権限

  HyperDXにアクセスするユーザーは、ClickHouse Cloudコンソールの認証情報を使用して自動的に認証されます。アクセス制御は、サービス設定で構成されたSQLコンソールの権限を通じて行われます。

  #### ユーザーアクセスを設定するには

  1. ClickHouse Cloud コンソールで対象のサービスに移動します
  2. **Settings** → **SQL Console Access** に移動します
  3. 各ユーザーに適切な権限レベルを設定します。
     * **Service Admin → Full Access** - アラート機能を有効化するために必要です
     * **Service Read Only → Read Only** - オブザーバビリティデータの閲覧およびダッシュボードの作成が可能です
     * **No access** - HyperDX にアクセスできません

  <Image img={read_only} alt="ClickHouse Cloud（読み取り専用）" />

  :::important アラートには管理者アクセスが必要です
  アラートを有効にするには、**Service Admin**権限（SQL Console Accessドロップダウンの**Full Access**に対応）を持つユーザーが少なくとも1名、HyperDXに一度ログインする必要があります。これにより、アラートクエリを実行する専用ユーザーがデータベースにプロビジョニングされます。
  :::

  ### データソースを作成する

  HyperDXはOpenTelemetryネイティブですが、OpenTelemetry専用ではありません。必要に応じて独自のテーブルスキーマを使用することも可能です。

  #### OpenTelemetryスキーマの使用

  上記のOTel collectorを使用してClickHouse内にデータベースとテーブルを作成する場合、ソース作成モデル内のすべてのデフォルト値を保持し、`Table`フィールドに`otel_logs`を入力してログソースを作成します。その他の設定はすべて自動検出されるため、`Save New Source`をクリックしてください。

  <Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud の HyperDX データソース" size="lg" />

  トレースおよびOTelメトリクスのソースを作成するには、トップメニューから`新しいソースを作成`を選択してください。

  <Image img={hyperdx_create_new_source} alt="HyperDX で「新しいソースを作成」" size="lg" />

  ここから、必要なソースタイプを選択し、次に適切なテーブルを選択します。例えば、トレースの場合は `otel_traces` テーブルを選択してください。すべての設定は自動的に検出されます。

  <Image img={hyperdx_create_trace_datasource} alt="HyperDX でトレース用データソースを作成" size="lg" />

  :::note ソースの相関付け
  ClickStackでは、ログやトレースなどの異なるデータソースを相互に相関付けることができます。これを有効にするには、各ソースで追加の設定が必要です。例えば、ログソースで対応するトレースソースを指定でき、トレースソースでも同様です。詳細については、[&quot;相関ソース&quot;](/use-cases/observability/clickstack/config#correlated-sources)を参照してください。
  :::

  #### カスタムスキーマの使用

  既存のデータを持つサービスにHyperDXを接続する場合は、必要に応じてデータベースとテーブルの設定を行ってください。テーブルがClickHouse用のOpenTelemetryスキーマに準拠している場合、設定は自動的に検出されます。

  独自のスキーマを使用する場合は、必須フィールドが指定されていることを確認したログソースを作成することを推奨します。詳細については、[&quot;ログソースの設定&quot;](/use-cases/observability/clickstack/config#logs)を参照してください。
</VerticalStepper>

<JSONSupport/>

さらに、JSON が利用中の ClickHouse Cloud サービスで有効になっているか確認するため、support@clickhouse.com までお問い合わせください。