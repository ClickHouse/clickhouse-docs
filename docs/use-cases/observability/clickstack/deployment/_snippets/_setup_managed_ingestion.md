import Image from '@theme/IdealImage';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import otel_collector_start from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import advanced_otel_collector from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This will prompt the user to select their ingestion source. Managed ClickStack supports a number of ingestion sources, including OpenTelemetry and [Vector](https://vector.dev/), as well as the option to send data directly to ClickHouse in your own schema.

<Image img={select_source} size="md" alt='Select source' border/>

:::note OpenTelemetry recommended
We strongly recommend using OpenTelemetry as the ingestion format. It provides the simplest and most optimized experience, with out-of-the-box schemas that are specifically designed to work efficiently with ClickStack.
:::

<Tabs groupId="ingestion-sources">
<TabItem value="open-telemetry" label="OpenTelemetry" default>

To send OpenTelemetry data to Managed ClickStack, we recommend using an OpenTelemetry Collector. The collector acts as a gateway that receives OpenTelemetry data from your applications (and other collectors) and forwards it to ClickHouse Cloud.

If you do not already have one running, start a collector using steps below. For users with existing collectors, a configuration example is also provided.

### Start a collector {#start-a-collector}

The following assumes the recommended path of using the **ClickStack distribution of the OpenTelemetry Collector**, which includes additional processing and is optimized specifically for ClickHouse Cloud. For users looking to use their own OpenTelemetry Collector see ["Configure existing collectors."](#configure-existing-collectors)

To get started quickly, copy and run the Docker command shown.

<Image img={otel_collector_start} size="md" alt='OTel collector source' border/>

This command should include your connection credentials `CLICKHOUSE_ENDPOINT` and `CLICKHOUSE_PASSWORD` pre-populated.

:::note Deploying to production
While this command uses the `default` user to connect Managed ClickStack, we recommend creating a dedicated user when [going to production](/use-cases/observability/clickstack/production#create-a-user) and modifying your configuration.
:::

Running this single command starts the ClickStack collector with OTLP endpoints exposed on ports 4317 (gRPC) and 4318 (HTTP). If you already have OpenTelemetry instrumentation and agents, you can immediately begin sending telemetry data to these endpoints. 

### Configure existing collectors {#configure-existing-collectors}

Users can also configure their own existing OpenTelemetry Collectors or use their own distribution of the collector. 

:::note ClickHouse exporter required
If using your own distribution e.g. the [contrib image](https://github.com/open-telemetry/opentelemetry-collector-contrib), ensure it includes the [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).
:::

For this purpose, we provide an example OpenTelemetry Collector configuration that uses the ClickHouse exporter with appropriate settings and exposes OTLP receivers, matching the interfaces and behavior expected by the ClickStack distribution.

An example of this configuration is shown below (environment variables will be pre-populated if copying from the UI):

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

<Image img={advanced_otel_collector} size="md" alt='Advanced OTel collector source' border/>

For further details on configuring OpenTelemetry collectors see ["Ingesting with OpenTelemetry."](/use-cases/observability/clickstack/ingesting-data/opentelemetry)

</TabItem>
<TabItem value="vector" label="Vector" default>
Coming Soon
</TabItem>
<TabItem value="other" label="Other" default>
Coming Soon
</TabItem>
</Tabs>
