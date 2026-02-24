---
slug: /use-cases/data-lake/polaris-catalog
sidebar_label: 'Polaris catalog'
title: 'Polaris catalog'
pagination_prev: null
pagination_next: null
description: 'In this guide, we will walk you through the steps to query
 your data using ClickHouse and the Snowflake Polaris catalog.'
keywords: ['Polaris', 'Snowflake', 'Data Lake']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

ClickHouse supports integration with multiple catalogs (Unity, Glue, Polaris,
etc.). In this guide, we will walk you through the steps to query your data
using ClickHouse and the [Apache Polaris Catalog](https://polaris.apache.org/releases/1.1.0/getting-started/using-polaris/#setup).

:::note
This integration uses the Iceberg table format and connects to Polaris via the REST catalog API.
:::

## Prerequisites {#prerequisites}

To connect to the Polaris catalog, you will need:

- Snowflake Open Catalog (hosted Polaris) or self hosted Polaris Catalog
- Your Polaris catalog endpoint URL (for example, `https://<account-id>.<region>.aws.snowflakecomputing.com/polaris/api/catalog/v1`)
- Catalog credentials (client ID and client secret)
- The OAuth tokens URI for your Polaris instance
- Storage endpoint for the object store where your Iceberg data lives (for example, S3)

## Creating a connection between Polaris and ClickHouse {#connecting}

Create a database that connects ClickHouse to your Polaris catalog:

```sql
CREATE DATABASE polaris_catalog
ENGINE = DataLakeCatalog('https://<account-id>.<region>.aws.snowflakecomputing.com/polaris/api/catalog/v1')
SETTINGS
    catalog_type = 'rest',
    catalog_credential = '<client-id>:<client-secret>',
    warehouse = 'snowflake',
    auth_scope = 'PRINCIPAL_ROLE:ALL',
    oauth_server_uri = 'https://<account-id>.<region>.aws.snowflakecomputing.com/polaris/api/catalog/v1/oauth/tokens',
    storage_endpoint = 'https://s3.<region>.amazonaws.com'
```

Replace the placeholders:

- **`<account-id>.<region>.aws.snowflakecomputing.com`** — Your Snowflake account URL (for example, `xxxxxx.eu-west-3.aws.snowflakecomputing.com`).
- **`<client-id>:<client-secret>`** — Your Polaris catalog credentials
- **`storage_endpoint`** — The endpoint for the object store that holds your Iceberg data (for example, `https://s3.eu-central-1.amazonaws.com` for AWS S3).

## Query the Polaris catalog using ClickHouse {#query-polaris-catalog}

Once the connection is in place, you can query Polaris:

```sql title="Query"
USE polaris_catalog;
SHOW TABLES;
```

To query a table:

```sql title="Query"
SELECT count(*) FROM `schema_name.table_name`;
```

:::note
Backticks are required when the table name includes more than one namespace (for example, `schema.table`).
:::

To inspect the table DDL:

```sql
SHOW CREATE TABLE `schema_name.table_name`;
```

## Loading data from Polaris into ClickHouse {#loading-data-into-clickhouse}

To load data from Polaris into a local ClickHouse table, create the target table with your desired schema, then insert from the Polaris table:

```sql title="Query"
CREATE TABLE my_local_table
(
    -- define columns to match your Iceberg table
    `id` Int64,
    `name` String,
    `event_time` DateTime64(3)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO my_local_table
SELECT * FROM polaris_catalog.`schema_name.table_name`;
```
