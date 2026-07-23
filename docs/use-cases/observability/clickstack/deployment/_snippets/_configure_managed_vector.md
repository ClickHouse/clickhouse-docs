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
