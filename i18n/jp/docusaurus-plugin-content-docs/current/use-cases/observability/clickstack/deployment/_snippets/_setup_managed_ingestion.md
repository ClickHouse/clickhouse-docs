import Image from '@theme/IdealImage';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import otel_collector_start from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import advanced_otel_collector from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

インジェストソースの選択を求められます。マネージド ClickStack では、OpenTelemetry や [Vector](https://vector.dev/) など、複数のインジェストソースをサポートしているほか、独自のスキーマで ClickHouse にデータを直接送信するオプションも利用できます。

<Image img={select_source} size="md" alt="ソースの選択" border />

:::note[OpenTelemetry の利用を推奨]
インジェスト形式として OpenTelemetry の利用を強く推奨します。
ClickStack と効率的に連携するよう特別に設計された、すぐに使えるスキーマを備えており、最もシンプルかつ最適化されたエクスペリエンスを提供します。
:::

<Tabs groupId="ingestion-sources">
  <TabItem value="OpenTelemetry" label="OpenTelemetry" default>
    Managed ClickStackにOpenTelemetryデータを送信する場合は、OpenTelemetry Collectorを使用してください。コレクターは、アプリケーション(および他のコレクター)からOpenTelemetryデータを受信し、ClickHouse Cloudに転送するゲートウェイとして機能します。

    コレクターが実行されていない場合は、以下の手順でコレクターを起動してください。既存のコレクターがある場合は、設定例も提供しています。

    ### コレクターを起動する \{#start-a-collector\}

    以下では、追加の処理を含み、ClickHouse Cloud向けに最適化された **ClickStack distribution of the OpenTelemetry Collector** を使用する推奨方法を前提としています。独自のOpenTelemetry Collectorを使用する場合は、[&quot;既存のコレクターの設定&quot;](#configure-existing-collectors)を参照してください。

    すぐに開始するには、表示されているDockerコマンドをコピーして実行します。

    <Image img={otel_collector_start} size="md" alt="OTel collector のソース" border />

    このコマンドには、接続認証情報 `CLICKHOUSE_ENDPOINT` と `CLICKHOUSE_PASSWORD` が事前に入力されています。

    :::note[本番環境へのデプロイ]
    このコマンドはManaged ClickStackへの接続に`default`ユーザーを使用していますが、[本番環境に移行する](/use-cases/observability/clickstack/production#create-a-user)際には専用ユーザーを作成し、設定を変更してください。
    :::

    このコマンドを実行すると、ポート4317（gRPC）および4318（HTTP）でOTLPエンドポイントが公開されたClickStackコレクターが起動します。既にOpenTelemetryインストルメンテーションとエージェントを使用している場合は、これらのエンドポイントへのテレメトリデータ送信を直ちに開始できます。

    ### 既存のコレクターの設定 \{#configure-existing-collectors\}

    既存のOpenTelemetryコレクターを設定したり、独自のコレクターディストリビューションを使用したりすることも可能です。

    :::note[ClickHouse exporter required]
    独自のディストリビューション(例: [contrib イメージ](https://github.com/open-telemetry/opentelemetry-collector-contrib))を使用している場合は、[ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) が含まれていることを確認してください。
    :::

    この目的のために、適切な設定でClickHouseエクスポーターを使用し、OTLPレシーバーを公開するOpenTelemetry Collectorの設定例が提供されています。この設定は、ClickStackディストリビューションが期待するインターフェースと動作に一致します。

    この設定の例を以下に示します(UIからコピーした場合、環境変数は自動的に入力されます):

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

    <Image img={advanced_otel_collector} size="md" alt="高度な OTel collector のソース" border />

    OpenTelemetryコレクターの設定の詳細については、[&quot;OpenTelemetryでのデータ取り込み&quot;](/use-cases/observability/clickstack/ingesting-data/opentelemetry)を参照してください。
  </TabItem>

  <TabItem value="Vector" label="Vector" default>
    近日公開予定
  </TabItem>

  <TabItem value="その他" label="その他" default>
    近日公開
  </TabItem>
</Tabs>