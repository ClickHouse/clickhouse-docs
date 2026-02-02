---
slug: /use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud
title: 'Managed'
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: 'Deploying Managed ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'deployment', 'setup', 'configuration', 'observability']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import read_only from '@site/static/images/clickstack/read-only-access.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import select_service from '@site/static/images/clickstack/select_service.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import SetupManagedIngestion from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_setup_managed_ingestion.md';
import StartManagedIngestion from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_start_managed_ingestion.md';
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
<TabItem value="select" label="Use an existing service" default>

<VerticalStepper headerLevel="h3">

### Select a service {#select-service}

From the ClickHouse Cloud landing page, select the service for which you wish to enable managed ClickStack.

:::important Estimating resources
This guide assumes you have provisioned sufficient resources to handle the volume of observability data you plan to ingest and query with ClickStack. To estimate the required resources, refer to the [production guide](/use-cases/observability/clickstack/production#estimating-resources). 

If your ClickHouse service already hosts existing workloads, such as real-time application analytics, we recommend creating a child service using [ClickHouse Cloud's warehouses feature](/cloud/reference/warehouses) to isolate the observability workload. This ensures your existing applications are not disrupted, while keeping the datasets accessible from both services.
:::

<Image img={select_service} alt="Select service" size="md"/>

Select 'ClickStack' from the left navigation menu.

### Setup ingestion {#setup-ingestion}

<SetupManagedIngestion/>

### Start ingestion {#start-ingestion}

<StartManagedIngestion/>

### Navigate to the ClickStack UI {#navigate-to-clickstack-ui-cloud}

<NavigateClickStackUI/>

</VerticalStepper>

</TabItem>
<TabItem value="create" label="Create a new service" default>

<VerticalStepper headerLevel="h3">

### Create a new service {#create-a-service}

From the ClickHouse Cloud landing page, select `New service` to create a new service.

<Image img={new_service} size="md" alt='Service Service' border/>

### Select your use case {#select-your-use-case}

<UseCaseSelector/>

### Specify your provider, region and data size {#specify-your-data-size}

<ProviderSelection/>

### Setup ingestion {#setup-ingestion-create-new}

<SetupManagedIngestion/>

### Start ingestion {#start-ingestion-create-new}

<StartManagedIngestion/>

### Navigate to the ClickStack UI {#navigate-to-clickstack-ui-cloud-create-new}

<NavigateClickStackUI/>

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
   - **No access** - Cannot access HyperDX

<Image img={read_only} alt="ClickHouse Cloud Read Only" size="md"/>

:::important Alerts require admin access
To enable alerts, at least one user with **Service Admin** permissions (mapped to **Full Access** in the SQL Console Access dropdown) must log into HyperDX at least once. This provisions a dedicated user in the database that runs alert queries.
:::

### Adding more data sources {#adding-data-sources}

ClickStack is OpenTelemetry native but not OpenTelemetry exclusive - you can use your own table schemas if desired.

The following describes how users can add additional data sources beyond those that are configured automatically.

#### Using OpenTelemetry schemas  {#using-otel-schemas}

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

Users looking to connect HyperDX to an existing service with data can complete the database and table settings as required. Settings will be auto-detected if tables conform to the OpenTelemetry schemas for ClickHouse. 

If using your own schema, we recommend creating a Logs source ensuring the required fields are specified - see ["Log source settings"](/use-cases/observability/clickstack/config#logs) for further details.

<JSONSupport/>

Additionally, you should contact support@clickhouse.com to ensure JSON is enabled on your ClickHouse Cloud service.
