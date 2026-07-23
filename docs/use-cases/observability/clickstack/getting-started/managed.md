---
slug: /use-cases/observability/clickstack/getting-started/managed
title: 'Getting started with managed ClickStack'
sidebar_label: 'Managed'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/example-datasets/index
description: 'Getting started with Managed ClickStack'
doc_type: 'guide'
keywords: ['Managed ClickStack', 'getting started', 'ClickHouse Cloud']
toc_max_heading_level: 3
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CreateIngestionUser from '@site/docs/use-cases/observability/clickstack/managed-onboarding/_snippets/_create_ingestion_user.md';
import ExampleOTelConfig from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_config_example_otel.md';
import clickstack_ingestion_test from '@site/static/images/clickstack/getting-started/clickstack_ingestion_test.png';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import select_source_vector from '@site/static/images/clickstack/getting-started/select_source_vector.png';
import start_ingestion from '@site/static/images/clickstack/getting-started/start_ingestion.png';

Deploy Managed ClickStack on ClickHouse Cloud, send a test event through your ingestion pipeline, and confirm that the event is available in the ClickStack UI.

ClickHouse Cloud operates the ClickHouse backend while you retain control over the ingestion pipeline and schema. Managed ClickStack provides:

- Automatic scaling of compute, independent of storage
- Low-cost and effectively unlimited retention based on object storage
- Independent isolation of read and write workloads with [warehouses](/cloud/reference/warehouses)
- Integrated authentication
- Automated backups
- Security and compliance features
- Seamless upgrades

## Before you begin {#before-you-begin}

### Create a ClickHouse Cloud service {#create-a-managed-clickstack-service}

Complete [Create a ClickHouse service](/getting-started/quick-start/cloud#1-create-a-clickhouse-service) in the ClickHouse Cloud quickstart. Before continuing, confirm that the service is running and that you have permission to create database users.

### Prepare your ingestion environment {#prepare-your-ingestion-environment}

Your ingestion path determines the remaining prerequisites:

- To start a new [OpenTelemetry Collector](/use-cases/observability/clickstack/ingesting-data/otel-collector), install [Docker](https://docs.docker.com/get-docker/).
- To use an existing collector, configure it in the [gateway role](/use-cases/observability/clickstack/ingesting-data/otel-collector#collector-roles) and ensure that you can update its configuration.
- To use Vector, start with an [existing Vector pipeline](/use-cases/observability/clickstack/ingesting-data/vector) that can send data to ClickHouse.

## Set up Managed ClickStack {#set-up-managed-clickstack}

<VerticalStepper headerLevel="h3">

### Create a dedicated ingestion user (optional) {#create-an-ingestion-user}

Open the [ClickHouse Cloud SQL console](/cloud/get-started/sql-console) and run:

<CreateIngestionUser />

### Start ingestion in ClickStack {#choose-an-ingestion-source}

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

### Send test data {#send-test-data}

Send a test event through the ingestion path you configured.

<Tabs groupId="ingestion-sources">

<TabItem value="open-telemetry" label="OpenTelemetry" default>

Send a test log with the current timestamp:

```shell
NOW_NANO="$(date +%s)000000000"

curl -i "http://localhost:4318/v1/logs" \
  -H "Content-Type: application/json" \
  --data-binary @- <<EOF
{
  "resourceLogs": [{
    "resource": {
      "attributes": [{
        "key": "service.name",
        "value": {"stringValue": "clickstack-docs-test"}
      }]
    },
    "scopeLogs": [{
      "scope": {"name": "clickstack-docs-test"},
      "logRecords": [{
        "timeUnixNano": "${NOW_NANO}",
        "severityText": "INFO",
        "body": {"stringValue": "ClickStack ingestion test"}
      }]
    }]
  }]
}
EOF
```

If you use an existing collector, replace `http://localhost:4318` with its OTLP HTTP endpoint. If the receiver requires authentication, add the required header to the `curl` command.

A successful request returns `HTTP/1.1 200 OK`.

After a few seconds, confirm in the ClickHouse Cloud SQL console that the event reached the logs table:

```sql
SELECT Timestamp, Body
FROM default.otel_logs
WHERE Body = 'ClickStack ingestion test'
ORDER BY Timestamp DESC
LIMIT 1;
```

</TabItem>

<TabItem value="vector" label="Vector">

Send a representative event through the input of your existing Vector pipeline.

In the ClickHouse Cloud SQL console, confirm that the event reached the target table:

```sql
SELECT *
FROM logs.nginx_logs
ORDER BY time_local DESC
LIMIT 1;
```

The result should contain the event you sent. For more Vector source and transformation examples, see [Ingesting with Vector](/use-cases/observability/clickstack/ingesting-data/vector).

</TabItem>

</Tabs>

### Open ClickStack and confirm ingestion {#open-clickstack-and-confirm-ingestion}

Open the logs view in ClickStack.

<Tabs groupId="ingestion-sources">

<TabItem value="open-telemetry" label="OpenTelemetry" default>

Search for `ClickStack ingestion test`.

The result should include the test event with the `clickstack-docs-test` service name.

<Image img={clickstack_ingestion_test} size="lg" alt="ClickStack logs view showing the ClickStack ingestion test event" border/>

</TabItem>

<TabItem value="vector" label="Vector">

Select the data source for your table and confirm that the logs view contains the event you sent.

<Image img={clickstack_managed_ui} size="lg" alt="Logs in the ClickStack UI"/>

</TabItem>

</Tabs>

</VerticalStepper>

You now have a Managed ClickStack service, a working ingestion path, and a test event that you can inspect in ClickStack.

## Next steps {#next-steps}

### Send application and infrastructure data {#send-application-and-infrastructure-data}

If you have applications or infrastructure to instrument with OpenTelemetry, follow the relevant guide linked from the ClickStack ingestion UI.

- Instrument applications with a [supported OpenTelemetry SDK](/use-cases/observability/clickstack/sdks). The SDK sends traces and logs to your OpenTelemetry Collector, which acts as a gateway to Managed ClickStack.
- Collect [host logs](/use-cases/observability/clickstack/integrations/host-logs) with OpenTelemetry Collectors running in the agent role and forward the data to your gateway collector.
- For Kubernetes monitoring, follow the [Kubernetes integration guide](/use-cases/observability/clickstack/integrations/kubernetes).
- For other telemetry sources, see the [ClickStack integration guides](/use-cases/observability/clickstack/integration-guides).

### Explore sample data {#explore-sample-data}

To explore ClickStack with a richer dataset:

- [Example dataset](/use-cases/observability/clickstack/getting-started/sample-data) - Load data from the public demo and diagnose an issue.
- [Local logs and metrics](/use-cases/observability/clickstack/getting-started/local-data) - Collect local files and system metrics on macOS or Linux with a local OpenTelemetry Collector.

### Prepare for production {#prepare-for-production}

If you created the `clickstack-ingest` user, store its password securely and use this account for collector ingestion instead of the `default` administrative account.

Before using ClickStack in production, review [Going to production](/use-cases/observability/clickstack/production) for security, retention, and operational guidance, and [Estimating resources](/use-cases/observability/clickstack/estimating-resources) to size compute for your expected ingest volume.

For Managed ClickStack deployment tasks, see the [Managed ClickStack deployment guide](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud#additional-tasks).
