---
slug: /use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud
title: 'Managed'
pagination_prev: null
pagination_next: null
sidebar_position: 1
toc_max_heading_level: 2
description: 'Deploying Managed ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'deployment', 'setup', 'configuration', 'observability']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import clickstack_ui_setup_ingestion from '@site/static/images/clickstack/clickstack-ui-setup-ingestion.png';
import read_only from '@site/static/images/clickstack/read-only-access.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import select_service from '@site/static/images/clickstack/select_service.png';
import select_source_clickstack_ui from '@site/static/images/clickstack/select-source-clickstack-ui.png';
import advanced_otel_collector_clickstack_ui from '@site/static/images/clickstack/advanced-otel-collector-clickstack-ui.png'
import otel_collector_start_clickstack_ui from '@site/static/images/clickstack/otel-collector-start-clickstack-ui.png';
import vector_config_clickstack_ui from '@site/static/images/clickstack/vector-config-clickstack-ui.png';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import ExampleOTelConfig from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_config_example_otel.md';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import SetupManagedIngestion from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_setup_managed_ingestion.md';
import NavigateClickStackUI from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_navigate_managed.md';
import ProviderSelection from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_select_provider.md';
import UseCaseSelector from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_select_usecase.md';
import new_service from '@site/static/images/clickstack/getting-started/new_service.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<BetaBadge/>

::::note[Beta feature]
This feature is in ClickHouse Cloud beta.
::::

This **guide is for existing users of ClickHouse Cloud**. If you're new to ClickHouse Cloud, we recommend our [Getting Started](/use-cases/observability/clickstack/getting-started/managed) guide for Managed ClickStack.

In this deployment pattern, both ClickHouse and the ClickStack UI (HyperDX) are hosted in ClickHouse Cloud, minimizing the number of components the user needs to self-host.

As well as reducing infrastructure management, this deployment pattern ensures authentication is integrated with ClickHouse Cloud SSO/SAML. Unlike self-hosted deployments, there is also no need to provision a MongoDB instance to store application state — such as dashboards, saved searches, user settings, and alerts. Users also benefit from:

- Automatic scaling of compute independent of storage
- Low-cost and effectively unlimited retention based on object storage
- The ability to independently isolate read and write workloads with Warehouses.
- Integrated authentication
- Automated backups
- Security and compliance features
- Seamless upgrades

In this mode, data ingestion is entirely left to the user. You can ingest data into Managed ClickStack using your own hosted OpenTelemetry collector, direct ingestion from client libraries, ClickHouse-native table engines (such as Kafka or S3), ETL pipelines, or ClickPipes — ClickHouse Cloud's managed ingestion service. This approach offers the simplest and most performant way to operate ClickStack.

### Suitable for {#suitable-for}

This deployment pattern is ideal in the following scenarios:

1. You already have observability data in ClickHouse Cloud and wish to visualize it using ClickStack.
2. You operate a large observability deployment and need the dedicated performance and scalability of ClickStack running on ClickHouse Cloud.
3. You're already using ClickHouse Cloud for analytics and want to instrument your application using ClickStack instrumentation libraries — sending data to the same cluster. In this case, we recommend using [warehouses](/cloud/reference/warehouses) to isolate compute for observability workloads.

## Setup steps {#setup-steps}

The following guide assumes you have already created a ClickHouse Cloud service. If you haven't created a service, follow the [Getting Started](/use-cases/observability/clickstack/getting-started/managed) guide for Managed ClickStack. This will leave you with a service in the same state as this guide i.e. ready for observability data with ClickStack enabled.

<Tabs groupId="service-create-select">

<TabItem value="create" label="Create a new service" default>
<br/>
<VerticalStepper headerLevel="h3">

### Create a new service {#create-a-service}

From the ClickHouse Cloud landing page, select `New service` to create a new service.

<Image img={new_service} size="lg" alt='Service Service' border/>

### Specify your provider, region and resource {#specify-your-region-and-resources}

<ProviderSelection/>

### Setup ingestion {#setup-ingestion-create-new}

Once your service has been provisioned, ensure the the service is selected and click "ClickStack" from the left menu.

<SetupManagedIngestion/>

### Navigate to the ClickStack UI {#navigate-to-clickstack-ui-cloud-create-new}

<NavigateClickStackUI/>

<br/>

</VerticalStepper>

</TabItem>

<TabItem value="select" label="Use an existing service">
<br/>
<VerticalStepper headerLevel="h3">

### Select a service {#select-service}

From the ClickHouse Cloud landing page, select the service for which you wish to enable managed ClickStack.

:::important Estimating resources
This guide assumes you have provisioned sufficient resources to handle the volume of observability data you plan to ingest and query with ClickStack. To estimate the required resources, refer to the [production guide](/use-cases/observability/clickstack/production#estimating-resources). 

If your ClickHouse service already hosts existing workloads, such as real-time application analytics, we recommend creating a child service using [ClickHouse Cloud's warehouses feature](/cloud/reference/warehouses) to isolate the observability workload. This ensures your existing applications aren't disrupted, while keeping the datasets accessible from both services.
:::

<Image img={select_service} alt="Select service" size="lg"/>

### Navigate to the ClickStack UI {#navigate-to-the-clickstack-ui-existing}

Select 'ClickStack' from the left navigation menu. You will be redirected to the ClickStack UI and automatically authenticated based on your ClickHouse Cloud permissions. 

If any OpenTelemetry tables exist already in your service, these will be auto-detected, and corresponding data sources created.

:::note Auto-detection of datasources
Auto-detection relies on the standard OpenTelemetry table schema provided by the ClickStack distribution of the OpenTelemetry collector. Sources are created for the database with the most complete set of tables. Additional tables can be added as [separate data sources](/use-cases/observability/clickstack/config#datasource-settings) if needed.
:::

If auto detection is successful, you should be directed to the search view where you can immediately begin exploring your data. 

<Image img={clickstack_managed_ui} size="lg" alt='ClickStack UI'/>

If this step is successful, that that's it — you’re all set 🎉, otherwise proceed to setting up ingestion.

### Setup ingestion {#setup-ingestion-existing-service}

If auto-detection fails, or you have no existing tables, you will be prompted to set up ingestion.

<Image img={clickstack_ui_setup_ingestion} alt="ClickStack UI setup ingestion" size="lg"/>

Select "Start Ingestion" and you'll be prompted to select an ingestion source. Managed ClickStack supports OpenTelemetry and [Vector](https://vector.dev/) as its main ingestion sources. However, users are also free to send data directly to ClickHouse in their own schema using any of the [ClickHouse Cloud support integrations](/integrations).

<Image img={select_source_clickstack_ui} size="lg" alt='Select source - ClickStack UI' border/>

:::note[OpenTelemetry recommended]
Use of the OpenTelemetry is strongly recommended as the ingestion format.
It provides the simplest and most optimized experience, with out-of-the-box schemas that are specifically designed to work efficiently with ClickStack.
:::

<Tabs groupId="ingestion-sources-existing">

<TabItem value="open-telemetry" label="OpenTelemetry" default>

To send OpenTelemetry data to Managed ClickStack, you're recommended to use an OpenTelemetry Collector. The collector acts as a gateway that receives OpenTelemetry data from your applications (and other collectors) and forwards it to ClickHouse Cloud.

If you don't already have one running, start a collector using the steps below. If you have existing collectors, a configuration example is also provided.

### Start a collector {#start-a-collector-existing}

The following assumes the recommended path of using the **ClickStack distribution of the OpenTelemetry Collector**, which includes additional processing and is optimized specifically for ClickHouse Cloud. If you're looking to use your own OpenTelemetry Collector, see ["Configure existing collectors."](#configure-existing-collectors)

To get started quickly, copy and run the Docker command shown.

<Image img={otel_collector_start_clickstack_ui} size="md" alt='OTel collector source'/>

**Modify this command with your service credentials, recorded when you created your service.**

:::note[Deploying to production]
While this command uses the `default` user to connect Managed ClickStack, you should create a dedicated user when [going to production](/use-cases/observability/clickstack/production#create-a-user) and modifying your configuration.
:::

Running this single command starts the ClickStack collector with OTLP endpoints exposed on ports 4317 (gRPC) and 4318 (HTTP). If you already have OpenTelemetry instrumentation and agents, you can immediately begin sending telemetry data to these endpoints. 

### Configure existing collectors {#configure-existing-collectors-existing}

It's also possible to configure your own existing OpenTelemetry Collectors or use your own distribution of the collector. 

:::note[ClickHouse exporter required]
If you're using your own distribution, for example the [contrib image](https://github.com/open-telemetry/opentelemetry-collector-contrib), ensure that it includes the [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter).
:::

For this purpose, you're provided with an example OpenTelemetry Collector configuration that uses the ClickHouse exporter with appropriate settings and exposes OTLP receivers. This configuration matches the interfaces and behavior expected by the ClickStack distribution.

<ExampleOTelConfig/>

<Image img={advanced_otel_collector_clickstack_ui} size="lg" alt='Advanced OTel collector source'/>

For further details on configuring OpenTelemetry collectors, see ["Ingesting with OpenTelemetry."](/use-cases/observability/clickstack/ingesting-data/opentelemetry)

### Start ingestion (optional) {#start-ingestion-existing}

If you have existing applications or infrastructure to instrument with OpenTelemetry, navigate to the relevant guides linked from "Connect an application". 

To instrument your applications to collect traces and logs, use the [supported language SDKs](/use-cases/observability/clickstack/sdks) which send data to your OpenTelemetry Collector acting as a gateway for ingestion into Managed ClickStack. 

Logs can be [collected using OpenTelemetry Collectors](/use-cases/observability/clickstack/integrations/host-logs) running in agent mode, forwarding data to the same collector. For Kubernetes monitoring, follow the [dedicated guide](/use-cases/observability/clickstack/integrations/kubernetes). For other integrations, see our [quickstart guides](/use-cases/observability/clickstack/integration-guides).

<br/>
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

<Image img={vector_config_clickstack_ui} size="lg" alt='Vector configuration'/>

For more examples of ingesting data with Vector, see ["Ingesting with Vector"](/use-cases/observability/clickstack/ingesting-data/vector) or the [Vector ClickHouse sink documentation](https://vector.dev/docs/reference/configuration/sinks/clickhouse/) for advanced options.

<br/>
</TabItem>
</Tabs>

### Navigate to the ClickStack UI {#navigate-to-clickstack-ui-existing-service}

Once you have completed setting up ingestion and started to send data, select "Next".

<Tabs groupId="datsources-sources-existing">

<TabItem value="open-telemetry" label="OpenTelemetry" default>

If you've ingested OpenTelemetry data using this guide, data sources are created automatically and no further setup is required. You can start exploring ClickStack right away. You'll be directed to the search view with a source automatically selected so you can begin querying immediately.

<Image img={clickstack_managed_ui} size="lg" alt='ClickStack UI'/>

That's it — you’re all set 🎉.
<br/>
</TabItem>

<TabItem value="vector" label="Vector" default>

If you've ingested via Vector data or another source, you will be prompted to configure the data source.

<Image img={create_vector_datasource} alt="Create datasource - vector" size="lg"/>

The configuration above assumes an Nginx-style schema with a `time_local` column used as the timestamp. This should be, where possible, the timestamp column declared in the primary key. **This column is mandatory**.

We also recommend updating the `Default SELECT` to explicitly define which columns are returned in the logs view. If additional fields are available, such as service name, log level, or a body column, these can also be configured. The timestamp display column can also be overridden if it differs from the column used in the table's primary key and configured above.

In the example above, a `Body` column doesn't exist in the data. Instead, it is defined using a SQL expression that reconstructs an Nginx log line from the available fields.

For other possible options, see the [configuration reference](/use-cases/observability/clickstack/config#hyperdx).

Once the source is configured, click "Save" and begin exploring your data.

<Image img={clickstack_managed_ui} size="lg" alt='ClickStack UI'/>
<br/>
</TabItem>

</Tabs>

</VerticalStepper>

</TabItem>
</Tabs>

## Additional tasks {#additional-tasks}

### Granting access to Managed ClickStack {#configure-access}

1. Navigate to your service in the ClickHouse Cloud console
2. Go to **Settings** → **SQL Console Access**
3. Set the appropriate permission level for each user:
   - **Service Admin → Full Access** - Required for enabling alerts
   - **Service Read Only → Read Only** - Can view observability data and create dashboards
   - **No access** - Can't access HyperDX

<Image img={read_only} alt="ClickHouse Cloud Read Only" size="md"/>

:::important Alerts require admin access
To enable alerts, at least one user with **Service Admin** permissions (mapped to **Full Access** in the SQL Console Access dropdown) must log into HyperDX at least once. This provisions a dedicated user in the database that runs alert queries.
:::

### Using ClickStack with read-only compute {#clickstack-read-only-compute}

The ClickStack UI can run entirely on a read-only ClickHouse Cloud service. This is the recommended setup when you want to isolate ingestion and query workloads.

#### How ClickStack selects compute {#how-clickstack-selects-compute}

ClickStack UI always connects to the ClickHouse service from where it is launched in the ClickHouse Cloud console.

This means:

* If you open ClickStack from a read-only service, all queries issued by ClickStack UI will run on that read-only compute.
* If you open ClickStack from a read-write service, ClickStack will use that compute instead.

No additional configuration inside ClickStack is required to enforce read-only behavior.

#### Recommended setup {#recommended-setup}

To run ClickStack on read-only compute:

1. Create or identify a ClickHouse Cloud service in the warehouse configured as read-only.
2. In the ClickHouse Cloud console, select the read-only service.
3. Launch ClickStack from the left navigation menu.

Once launched, ClickStack UI will automatically bind to this read-only service.

### Adding more data sources {#adding-data-sources}

ClickStack is OpenTelemetry native but not OpenTelemetry exclusive - you can use your own table schemas if desired.

The following describes how users can add additional data sources beyond those that are configured automatically.

#### Using OpenTelemetry schemas {#using-otel-schemas}

If you're using an OTel collector to create the database and tables within ClickHouse, retain all default values within the create source model, completing the `Table` field with the value `otel_logs` - to create a logs source. All other settings should be auto-detected, allowing you to click `Save New Source`.

<Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX Datasource" size="lg"/>

To create sources for traces and OTel metrics, you can select `Create New Source` from the top menu.

<Image img={hyperdx_create_new_source} alt="ClickStack create new source" size="lg"/>

From here, select the required source type followed by the appropriate table e.g. for traces, select the table `otel_traces`. All settings should be auto-detected.

<Image img={hyperdx_create_trace_datasource} alt="ClickStack create trace source" size="lg"/>

:::note Correlating sources
Note that different data sources in ClickStack—such as logs and traces—can be correlated with each other. To enable this, additional configuration is required on each source. For example, in the logs source, you can specify a corresponding trace source, and vice versa in the traces source. See ["Correlated sources"](/use-cases/observability/clickstack/config#correlated-sources) for further details.
:::

#### Using custom schemas {#using-custom-schemas}

Users looking to connect ClickStack to an existing service with data can complete the database and table settings as required. Settings will be auto-detected if tables conform to the OpenTelemetry schemas for ClickHouse. 

If using your own schema, we recommend creating a Logs source ensuring the required fields are specified - see ["Log source settings"](/use-cases/observability/clickstack/config#logs) for further details.

<JSONSupport/>

Additionally, you should contact support@clickhouse.com to ensure JSON is enabled on your ClickHouse Cloud service.
