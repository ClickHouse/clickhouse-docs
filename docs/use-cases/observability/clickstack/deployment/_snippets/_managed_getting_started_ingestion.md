import Image from '@theme/IdealImage';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import select_source_vector from '@site/static/images/clickstack/getting-started/select_source_vector.png';
import start_ingestion from '@site/static/images/clickstack/getting-started/start_ingestion.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ConfigureExistingManagedCollector from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_configure_existing_managed_collector.md';
import ConfigureManagedVector from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_configure_managed_vector.md';

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

<ConfigureExistingManagedCollector/>

</TabItem>

</Tabs>

</TabItem>

<TabItem value="vector" label="Vector">

<Image img={select_source_vector} size="lg" alt="Select Vector as the ingestion source" border/>

<ConfigureManagedVector/>

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
