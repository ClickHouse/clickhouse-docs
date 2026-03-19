---
sidebar_label: 'Setup Guide'
slug: /integrations/fivetran/setup-guide
sidebar_position: 2
description: 'Step-by-step guide to configure ClickHouse Cloud as a Fivetran destination.'
title: 'Fivetran ClickHouse Destination - Setup Guide'
doc_type: 'guide'
keywords: ['fivetran', 'clickhouse destination', 'setup guide', 'configuration']
---

import Image from '@theme/IdealImage';
import clickhouse_setup_guide1 from '@site/static/images/integrations/data-ingestion/etl-tools/fivetran/clickhouse_setup_guide1.png';
import clickhouse_setup_guide2 from '@site/static/images/integrations/data-ingestion/etl-tools/fivetran/clickhouse_setup_guide2.png';
import clickhouse_setup_guide3 from '@site/static/images/integrations/data-ingestion/etl-tools/fivetran/clickhouse_setup_guide3.png';
import clickhouse_setup_guide4 from '@site/static/images/integrations/data-ingestion/etl-tools/fivetran/clickhouse_setup_guide4.png';

# Fivetran ClickHouse Destination - Setup Guide

## Prerequisites {#prerequisites}

To connect Fivetran to ClickHouse Cloud, you need:

- A Fivetran account with [permission to add destinations](https://fivetran.com/docs/using-fivetran/fivetran-dashboard/account-settings/role-based-access-control#legacyandnewrbacmodel).
- A ClickHouse Cloud service. See the [Quick Start Guide](/getting-started/quick-start/cloud) if you need to create one. Copy the `default` user credentials when the service is created — the password is shown only once.

### Create a dedicated Fivetran user (recommended) {#create-user}

Instead of using the `default` user, create a dedicated user for the Fivetran destination. Run the following SQL with the `default` user:

```sql
CREATE USER fivetran_user IDENTIFIED BY '<password>'; -- use a secure password generator

GRANT CURRENT GRANTS ON *.* TO fivetran_user;
```

Optionally, revoke access to databases that Fivetran should not touch:

```sql
REVOKE ALL ON default.* FROM fivetran_user;
```

You can run these statements in the ClickHouse Cloud SQL console. Select your service from the navigation menu, then click **+** to add a new query.

<Image img={clickhouse_setup_guide3} size="lg" border alt="ClickHouse Cloud SQL console" />

Paste the SQL statements into the query editor, replace `<password>` with a secure password, and click **Run**.

<Image img={clickhouse_setup_guide4} size="lg" border alt="Executing the user creation statements" />

:::warning
Grant privileges directly to the Fivetran user, not through a role. The connector's grants check currently only queries direct user grants. See [Role-based grants](/integrations/fivetran/troubleshooting#role-based-grants) for details.
:::

## Find connection details {#find-connection-details}

Find the hostname of your service in the ClickHouse Cloud console. Select your service from the navigation menu and click **Connect**.

<Image img={clickhouse_setup_guide1} size="lg" border alt="ClickHouse Cloud Connect button" />

In the connection dialog, select **Native**. The hostname matches the `--host` argument and follows the format `<service>.<region>.<provider>.clickhouse.cloud`.

<Image img={clickhouse_setup_guide2} size="lg" border alt="ClickHouse Cloud hostname" />

The port for the Fivetran destination is the ClickHouse Cloud native secure port: **9440**.

## Configure the destination in Fivetran {#configure-destination}

1. Log in to your [Fivetran account](https://fivetran.com/login).
2. Go to the **Destinations** page and click **Add destination**.
3. Enter a **Destination name** of your choice.
4. Click **Add**.
5. Select **ClickHouse Cloud** as the destination type.
6. Enter your ClickHouse Cloud service **hostname**.
7. Enter the **port** (`9440`).
8. Enter the **username** and **password** of the dedicated Fivetran user.
9. Click **Save & Test**.

Fivetran runs a connectivity check against your ClickHouse Cloud service. If it succeeds, you can start configuring connectors to ingest data.

:::note
Fivetran automatically configures a [Fivetran Platform Connector](https://fivetran.com/docs/logs/fivetran-platform) that syncs connection logs and account metadata to a `fivetran_metadata` schema in the destination. This lets you monitor connections, track usage, and audit changes.
:::

## Advanced configuration {#advanced-configuration}

The ClickHouse Cloud destination supports an optional JSON configuration file for fine-tuning batch sizes. This file can be uploaded through the Fivetran destination settings.

:::note
This configuration is entirely optional. If no file is uploaded, the destination uses sensible defaults that work well for most use cases.
:::

### Configuration schema {#configuration-schema}

The file must be valid JSON with the following structure:

```json
{
  "destination_configurations": {
    "write_batch_size": 50000,
    "select_batch_size": 200
  }
}
```

### Available settings {#available-settings}

| Setting | Type | Default | Allowed range | Description |
|---------|------|---------|---------------|-------------|
| `write_batch_size` | integer | `100000` | 5,000 – 100,000 | Rows per batch for insert, update, and replace operations. |
| `select_batch_size` | integer | `1500` | 200 – 1,500 | Rows per batch for SELECT queries used during updates. |
| `mutation_batch_size` | integer | `1500` | 200 – 1,500 | Rows per batch for `ALTER TABLE UPDATE` mutations in history mode. |
| `hard_delete_batch_size` | integer | `1500` | 200 – 1,500 | Rows per batch for hard delete operations in history mode. |

All fields are optional — omitted fields use the default value. Values outside the allowed range cause a sync error. Unknown fields are silently ignored.

### Uploading the configuration file {#uploading-config}

1. In the Fivetran dashboard, navigate to your ClickHouse Cloud destination.
2. Edit the destination configuration.
3. Upload the JSON file.

To update the configuration later, edit the destination settings and upload a new file. The configuration applies to all syncs for the destination — it cannot vary per connector.

## Verify the connection {#verify-connection}

After configuring the destination and at least one source connector:

1. Trigger a sync from the Fivetran dashboard.
2. In ClickHouse, verify the data arrived:
   ```sql
   SELECT count() FROM <schema>.<table>;
   ```
3. Check the `fivetran_metadata` schema for sync history and logs:
   ```sql
   SELECT * FROM fivetran_metadata.connectors;
   ```
