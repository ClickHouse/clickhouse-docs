import Image from '@theme/IdealImage';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import start_ingestion from '@site/static/images/clickstack/getting-started/start_ingestion.png';
import otel_collector_start from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import advanced_otel_collector from '@site/static/images/clickstack/getting-started/advanced_otel_collector.png';
import vector_config from '@site/static/images/clickstack/getting-started/vector_config.png';

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Image img={start_ingestion} size="lg" alt='Start Ingestion' border/>

Select "Start Ingestion" and you'll be prompted to select an ingestion source. Managed ClickStack supports OpenTelemetry and [Vector](https://vector.dev/) as its main ingestion sources. However, users are also free to send data directly to ClickHouse in their own schema using any of the [ClickHouse Cloud support integrations](/integrations).

<Image img={select_source} size="lg" alt='Select source' border/>

:::note[OpenTelemetry recommended]
Use of the OpenTelemetry is strongly recommended as the ingestion format.
It provides the simplest and most optimized experience, with out-of-the-box schemas that are specifically designed to work efficiently with ClickStack.
:::

<Tabs groupId="ingestion-sources">

<TabItem value="open-telemetry" label="OpenTelemetry" default>

To send OpenTelemetry data to Managed ClickStack, you're recommended to use an OpenTelemetry Collector. The collector acts as a gateway that receives OpenTelemetry data from your applications (and other collectors) and forwards it to ClickHouse Cloud.

If you don't already have one running, start a collector using the steps below. If you have existing collectors, a configuration example is also provided.

### Start a collector {#start-a-collector}

The following assumes the recommended path of using the **ClickStack distribution of the OpenTelemetry Collector**, which includes additional processing and is optimized specifically for ClickHouse Cloud. If you're looking to use your own OpenTelemetry Collector, see ["Configure existing collectors."](#configure-existing-collectors)

To get started quickly, copy and run the Docker command shown.

<Image img={otel_collector_start} size="md" alt='OTel collector source'/>

This command should include your connection credentials pre-populated.

:::note[Deploying to production]
While this command uses the `default` user to connect Managed ClickStack, you should create a dedicated user when [going to production](/use-cases/observability/clickstack/production#create-a-user) and modifying your configuration.
:::

Running this single command starts the ClickStack collector with OTLP endpoints exposed on ports 4317 (gRPC) and 4318 (HTTP). If you already have OpenTelemetry instrumentation and agents, you can immediately begin sending telemetry data to these endpoints. 

### Configure existing collectors {#configure-existing-collectors}

It's also possible to configure your own existing OpenTelemetry Collectors or use your own distribution of the collector. 

:::note[ClickHouse exporter required]
If you're using your own distribution, for example the [contrib image](https://github.com/open-telemetry/opentelemetry-collector-contrib), ensure that it includes the [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).
:::

For this purpose, you're provided with an example OpenTelemetry Collector configuration that uses the ClickHouse exporter with appropriate settings and exposes OTLP receivers. This configuration matches the interfaces and behavior expected by the ClickStack distribution.

An example of this configuration is shown below (environment variables will be pre-populated if copying from the UI):

```yaml file=docs/use-cases/observability/clickstack/deployment/_snippets/otel-cloud-config.yaml
receivers:
  otlp/hyperdx:
    protocols:
      grpc:
        include_metadata: true
        endpoint: "0.0.0.0:4317"
      http:
        cors:
          allowed_origins: ["*"]
          allowed_headers: ["*"]
        include_metadata: true
        endpoint: "0.0.0.0:4318"
processors:
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
    database: default
    endpoint: <clickhouse_cloud_endpoint>
    password: <your_password_here>
    username: default
    ttl: 720h
    logs_table_name: hyperdx_sessions
    timeout: 5s
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s
  clickhouse:
    database: default
    endpoint: <clickhouse_cloud_endpoint>
    password: <your_password_here>
    username: default
    ttl: 720h
    timeout: 5s
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s

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
      processors: [memory_limiter, batch]
      exporters: [clickhouse]
    logs/out-rrweb:
      receivers: [routing/logs]
      processors: [memory_limiter, batch]
      exporters: [clickhouse/rrweb]

```

<Image img={advanced_otel_collector} size="lg" alt='Advanced OTel collector source' border/>

For further details on configuring OpenTelemetry collectors, see ["Ingesting with OpenTelemetry."](/use-cases/observability/clickstack/ingesting-data/opentelemetry)

</TabItem>
<TabItem value="vector" label="Vector" default>

[Vector](https://vector.dev) is a high-performance, vendor-neutral observability data pipeline, especially popular for log ingestion due to its flexibility and low resource footprint.

When using Vector with ClickStack, users are responsible for defining their own schemas. These schemas may follow OpenTelemetry conventions, but they can also be entirely custom, representing user-defined event structures.

:::note Timestamp required
The only strict requirement for Managed ClickStack, is that the data includes a **timestamp column** (or equivalent time field), which can be declared when configuring the data source in the ClickStack UI.
:::

The following assumes you have an instance of Vector running, pre-configured with ingest pipelines, delivering data.

### Create a database and table {#create-database-and-tables}

Vector requires a table and schema to be defined prior to data ingestion.

First create a database. This can be done via the [ClickHouse Cloud console](/cloud/get-started/sql-console). 

For example, create a database for logs:

```sql
CREATE DATABASE IF NOT EXISTS logs
```

Then create a table whose schema matches the structure of your log data. The example below assumes a classic Nginx access log format:

```sql
CREATE TABLE logs.nginx_logs
(
    `time_local` DateTime,
    `remote_addr` IPv4,
    `remote_user` LowCardinality(String),
    `request` String,
    `status` UInt16,
    `body_bytes_sent` UInt64,
    `http_referer` String,
    `http_user_agent` String,
    `http_x_forwarded_for` LowCardinality(String),
    `request_time` Float32,
    `upstream_response_time` Float32,
    `http_host` String
)
ENGINE = MergeTree
ORDER BY (toStartOfMinute(time_local), status, remote_addr);
```

Your table must align with the output schema produced by Vector. Adjust the schema as needed for your data, following the recommended [schema best practices](/docs/best-practices/select-data-types). 

We strongly recommend understanding how [Primary keys](/docs/primary-indexes) work in ClickHouse and choosing an ordering key based on your access patterns. See the [ClickStack-specific](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key) guidance on choosing a primary key.

Once the table exists, copy the configuration snippet shown. Adjust the input to consume your existing pipelines, as well as the target table and database if required. Credentials should be pre-populated.

<Image img={vector_config} size="lg" alt='Vector configuration'/>

For more examples of ingesting data with Vector, see ["Ingesting with Vector"](/use-cases/observability/clickstack/ingesting-data/vector) or the [Vector ClickHouse sink documentation](https://vector.dev/docs/reference/configuration/sinks/clickhouse/) for advanced options.

</TabItem>
</Tabs>
