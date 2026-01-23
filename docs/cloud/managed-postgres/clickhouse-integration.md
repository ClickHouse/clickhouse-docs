---
slug: /cloud/managed-postgres/clickhouse-integration
sidebar_label: 'ClickHouse Integration'
title: 'ClickHouse Integration'
description: 'Replicate your Postgres data to ClickHouse using built-in CDC capabilities'
keywords: ['postgres', 'clickhouse integration', 'cdc', 'replication', 'clickpipes', 'data sync']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import chIntegrationIntro from '@site/static/images/managed-postgres/clickhouse-integration-intro.png';
import replicationServiceStep from '@site/static/images/managed-postgres/replication-service-step.png';
import selectTablesStep from '@site/static/images/managed-postgres/select-tables-step.png';
import integrationRunning from '@site/static/images/managed-postgres/integration-running.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="clickhouse-integration" />

Every Managed Postgres instance comes with built-in CDC capabilities to any of your ClickHouse services. This allows you to move some or all of the data on your Postgres instance to ClickHouse and have changes in data on Postgres be reflected on ClickHouse continous and nearly real-time. This is powered by [ClickPipes](/integrations/clickpipes) under the hood.

To access this, click on **ClickHouse Integration** in the sidebar of your Postgres instance.

<Image img={chIntegrationIntro} alt="ClickHouse integration landing page showing the integration option in the sidebar" size="md" border/>

:::note
Before you proceed, ensure that your Postgres service is accessible to the ClickPipes service. This should be the case by default, but if you've restricted IP access you may need to grant access to some source IPs from [this](/integrations/clickpipes#list-of-static-ips) list based on the region where your **ClickHouse service** is located.
:::

Click **Replicate data in ClickHouse** to start setting up your ClickPipe.

<VerticalStepper type="numbered" headerLevel="h2">

## Configure the replication service {#configure-replication-service}

Fill in the replication settings:

- **Integration name**: A name for this ClickPipe
- **ClickHouse service**: Select an existing ClickHouse Cloud service or create a new one
- **Postgres database**: The source database to replicate from
- **Replication method**: Choose one of:
  - **Initial load + CDC**: Import existing data and keep tables updated with new changes (recommended)
  - **Initial load only**: One-time snapshot of existing data with no ongoing updates
  - **CDC only**: Skip the initial snapshot and only capture new changes going forward

<Image img={replicationServiceStep} alt="Replication service configuration showing integration name, destination service, and replication method options" size="md" border/>

Click **Next** to proceed.

## Select tables to replicate {#select-tables}

Choose a destination database and select which tables to replicate:

- **Destination database**: Select an existing ClickHouse database or create a new one
- **Prefix default destination table names with schema name**: Adds the Postgres schema as a prefix to avoid naming conflicts
- **Preserve NULL values from source**: Maintains NULL values instead of converting to defaults
- **Remove deleted rows during merges**: For [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) tables, physically removes deleted rows during background merges

Expand schemas and select individual tables to replicate. You can also customize destination table names and column settings.

<Image img={selectTablesStep} alt="Select tables step showing database selection, replication options, and table picker grouped by schema" size="md" border/>

Click **Replicate data to ClickHouse** to start the replication.

## Monitor your ClickPipe {#monitor-clickpipe}

Once the ClickPipe starts, you'll see it listed in the same menu. The initial snapshot of all data may take some time depending on the size of your tables.

<Image img={integrationRunning} alt="ClickHouse integration list showing a running ClickPipe with its destination service and status" size="md" border/>

Click on the integration name to view detailed status, monitor progress, view errors, and manage the ClickPipe. See [Lifecycle of a Postgres ClickPipe](/integrations/clickpipes/postgres/lifecycle) to understand the different states your ClickPipe may be in.

</VerticalStepper>
