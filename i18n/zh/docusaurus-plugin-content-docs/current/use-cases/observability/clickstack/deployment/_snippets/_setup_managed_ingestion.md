import Image from '@theme/IdealImage';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import otel_collector_start from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import advanced_otel_collector from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

系统会提示你选择一个摄取源。托管版 ClickStack 支持多种摄取源，包括 OpenTelemetry 和 [Vector](https://vector.dev/)，也可以选择使用你自定义的 schema 将数据直接发送到 ClickHouse。

<Image img={select_source} size="md" alt="选择来源" border />

:::note[推荐使用 OpenTelemetry]
强烈建议采用 OpenTelemetry 作为摄取格式。
它提供最简单且高度优化的使用体验，并提供开箱即用、专为与 ClickStack 高效协同而设计的 schema。
:::

<Tabs groupId="ingestion-sources">
  <TabItem value="open-telemetry" label="OpenTelemetry" default>
    要将 OpenTelemetry 数据发送到托管版 ClickStack,建议使用 OpenTelemetry Collector。该收集器作为网关,接收来自应用程序(及其他收集器)的 OpenTelemetry 数据,并将其转发至 ClickHouse Cloud。

    如果您尚未运行收集器,请按照以下步骤启动。如果您已有现有收集器,同样提供了配置示例供参考。

    ### 启动 collector \{#start-a-collector\}

    以下内容假定您使用推荐的 **ClickStack 发行版 OpenTelemetry Collector**,该版本包含额外的处理功能,并专门针对 ClickHouse Cloud 进行了优化。如果您希望使用自己的 OpenTelemetry Collector,请参阅[&quot;配置现有收集器&quot;](#configure-existing-collectors)

    要快速开始,请复制并运行下方显示的 Docker 命令。

    <Image img={otel_collector_start} size="md" alt="OTel collector 来源" border />

    该命令应包含预先填充的连接凭据 `CLICKHOUSE_ENDPOINT` 和 `CLICKHOUSE_PASSWORD`。

    :::note[部署到生产环境]
    虽然此命令使用 `default` 用户连接托管 ClickStack,但在[投入生产](/use-cases/observability/clickstack/production#create-a-user)并修改配置时,您应该创建一个专用用户。
    :::

    运行此命令即可启动 ClickStack 收集器,OTLP 端点将在端口 4317(gRPC)和 4318(HTTP)上暴露。如果您已配置 OpenTelemetry 插桩和代理,可立即开始向这些端点发送遥测数据。

    ### 配置现有的采集器 \{#configure-existing-collectors\}

    您也可以配置现有的 OpenTelemetry Collector,或使用自定义的 Collector 发行版。

    :::note[需要 ClickHouse exporter]
    如果您使用的是自己的发行版,例如 [contrib 镜像](https://github.com/open-telemetry/opentelemetry-collector-contrib),请确保其中包含 [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)。
    :::

    为此,我们提供了一个示例 OpenTelemetry Collector 配置,该配置使用 ClickHouse 导出器并设置了适当的参数,同时公开 OTLP 接收器。此配置与 ClickStack 发行版所需的接口和行为相匹配。

    此配置的示例如下所示(从 UI 复制时将自动填充环境变量):

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

    <Image img={advanced_otel_collector} size="md" alt="高级 OTel collector 源配置" border />

    有关配置 OpenTelemetry 采集器的更多详细信息,请参阅[&quot;使用 OpenTelemetry 进行摄取&quot;](/use-cases/observability/clickstack/ingesting-data/opentelemetry)
  </TabItem>

  <TabItem value="Vector" label="Vector" default>
    敬请期待
  </TabItem>

  <TabItem value="其他" label="其他" default>
    敬请期待
  </TabItem>
</Tabs>