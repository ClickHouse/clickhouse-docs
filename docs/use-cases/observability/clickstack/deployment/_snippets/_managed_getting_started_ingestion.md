import Image from '@theme/IdealImage';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import select_source_vector from '@site/static/images/clickstack/getting-started/select_source_vector.png';
import start_ingestion from '@site/static/images/clickstack/getting-started/start_ingestion.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ExampleOTelConfig from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_config_example_otel.md';

From your ClickHouse Cloud service, launch ClickStack. On the ClickStack **Getting Started** page, select **Start ingestion**.

<Image img={start_ingestion} size="lg" alt="Start ingestion" border/>

On the **Choose an ingestion source** page, select [OpenTelemetry](https://opentelemetry.io/) or [Vector](https://vector.dev/). You can also send data directly to ClickHouse using a [supported integration](/integrations) and your own schema.

:::note[OpenTelemetry recommended]
OpenTelemetry provides preconfigured schemas for logs, traces, metrics, and sessions.
:::

<Tabs groupId="ingestion-sources">

<TabItem value="open-telemetry" label="OpenTelemetry" default>

<Image img={select_source} size="lg" alt="Select OpenTelemetry as the ingestion source" border/>

#### Choose a collector setup {#choose-a-collector-setup}

<Tabs>

<TabItem value="new-collector" label="Start a new collector" default>

On the **Start Collector** tab, copy the generated command. It follows this format:

```shell
docker run -e CLICKHOUSE_ENDPOINT="https://<host>:8443" \
    -e CLICKHOUSE_USER="default" \
    -e CLICKHOUSE_PASSWORD="<your_password_here>" \
    -p 4317:4317 -p 4318:4318 \
    clickhouse/clickstack-otel-collector:latest
```

Replace `<host>` and `<your_password_here>` with the values for your ClickHouse Cloud service, then run the command.

The collector runs in the foreground. Leave this terminal open and use a second terminal for the remaining commands in this guide.

:::tip[Use a dedicated ingestion user]
If you created a dedicated ingestion user, update the generated command:

- Replace `CLICKHOUSE_USER="default"` with `CLICKHOUSE_USER="clickstack-ingest"`.
- Set `CLICKHOUSE_PASSWORD` to the dedicated user's password.

Otherwise, use the generated command with the default ClickHouse Cloud credentials.
:::

</TabItem>

<TabItem value="existing-collector" label="Use an existing collector">

Select **Configure existing collector**, then adapt your collector configuration:

Use an OpenTelemetry Collector as a gateway between your applications and ClickHouse Cloud.

The example uses the dedicated `clickstack-ingest` user. If you skipped the optional user-creation step, use the `default` user and its password instead.

Merge the following components into your existing configuration rather than replacing unrelated receivers, processors, exporters, or extensions.

:::note[Collector components required]
Your collector distribution must include the [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) and [routing connector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/routingconnector). The OpenTelemetry Collector Contrib distribution includes both components.
:::

The example adds OTLP receivers, batching and memory limiting, Session Replay routing, and ClickHouse exporters.

<ExampleOTelConfig/>

Reuse your existing OTLP receiver and preserve its authentication and TLS settings. If your configuration already uses the component or pipeline IDs in the example, merge or rename them instead of creating duplicate IDs. Running two receivers on ports `4317` and `4318` causes a port conflict.

After merging the configuration, reload or restart the collector using your existing deployment process.

For further details on configuring OpenTelemetry collectors, see [Ingesting with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry).

</TabItem>

</Tabs>

</TabItem>

<TabItem value="vector" label="Vector">

<Image img={select_source_vector} size="lg" alt="Select Vector as the ingestion source" border/>

[Vector](https://vector.dev) is a high-performance, vendor-neutral observability data pipeline, especially popular for log ingestion due to its flexibility and low resource footprint.

When using Vector with ClickStack, you define the schema. It can follow OpenTelemetry conventions or use fields specific to your events.

:::note[Existing Vector pipeline required]
Continue with this guide if you already run Vector with an input pipeline. The data sent through the pipeline must include a **timestamp column** or equivalent time field, which you select when configuring the data source in the ClickStack UI.

The steps below add a ClickHouse sink to your existing pipeline.
:::

#### Create a database and table {#create-database-and-tables}

Vector requires a table and schema to be defined prior to data ingestion.

Create a database in the [ClickHouse Cloud SQL console](/cloud/get-started/sql-console):

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

If you created the dedicated ingestion user, grant it access to the table:

```sql
GRANT SELECT, INSERT ON logs.nginx_logs TO `clickstack-ingest`;
```

Your table must align with the output schema produced by Vector. Adjust the schema as needed for your data, following the recommended [schema best practices](/docs/best-practices/select-data-types).

We strongly recommend understanding how [Primary keys](/docs/primary-indexes) work in ClickHouse and choosing an ordering key based on your access patterns. See the [ClickStack-specific](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key) guidance on choosing a primary key.

Once the table exists, add a ClickHouse sink to your Vector configuration:

```yaml
sinks:
  clickhouse:
    type: clickhouse
    inputs:
      - your_input
    endpoint: "https://<host>:8443"
    database: logs
    table: nginx_logs
    format: json_each_row
    skip_unknown_fields: true
    auth:
      strategy: basic
      user: clickstack-ingest
      password: "<your_password_here>"
```

Replace `your_input` with the input from your existing pipeline. Replace `<host>` and `<your_password_here>` with the values for your ClickHouse Cloud service and dedicated ingestion user. If you skipped the optional user-creation step, use `default` and its password instead. If required, change the target database or table.

Save the updated configuration, then reload or restart Vector using your existing deployment process.

For more examples of ingesting data with Vector, see [Ingesting with Vector](/use-cases/observability/clickstack/ingesting-data/vector) or the [Vector ClickHouse sink documentation](https://vector.dev/docs/reference/configuration/sinks/clickhouse/) for advanced options.

Create a data source for the table populated by your Vector pipeline. ClickStack prompts you to create one on your first login.

<Image img={create_vector_datasource} alt="Create a Vector data source" size="lg"/>

For the Nginx example in this guide, select `time_local` as the timestamp column and `logs.nginx_logs` as the source table.

Set **Default SELECT** to:

```sql
time_local, remote_addr, status, request
```

The example table doesn't contain a `Body` column. Set **Body Expression** to:

```sql
concat(
  remote_addr, ' ',
  remote_user, ' ',
  '[', formatDateTime(time_local, '%d/%b/%Y:%H:%M:%S %z'), '] ',
  '"', request, '" ',
  toString(status), ' ',
  toString(body_bytes_sent), ' ',
  '"', http_referer, '" ',
  '"', http_user_agent, '" ',
  '"', http_x_forwarded_for, '" ',
  toString(request_time), ' ',
  toString(upstream_response_time), ' ',
  '"', http_host, '"'
)
```

For other source settings, see the [ClickStack configuration reference](/use-cases/observability/clickstack/config).

</TabItem>

</Tabs>
