---
slug: /use-cases/data-lake/biglake-catalog
sidebar_label: 'BigLake Metastore'
title: 'BigLake Metastore'
pagination_prev: null
pagination_next: null
description: 'In this guide, we will walk you through the steps to query
 your data in Google Cloud Storage using ClickHouse and the BigLake Metastore.'
keywords: ['BigLake', 'GCS', 'Data Lake', 'Iceberg', 'Google Cloud']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

ClickHouse supports integration with multiple catalogs (Unity, Glue, Polaris, etc.). This guide will walk you through the steps to query your Iceberg tables in [BigLake Metastore](https://cloud.google.com/biglake/docs) via ClickHouse.

:::note
As this feature is beta, you will need to enable it using:
`SET allow_database_iceberg = 1;`
:::

## Prerequisites {#prerequisites}

Before creating a connection from ClickHouse to BigLake Metastore, ensure you have:

- A **Google Cloud project** with BigLake Metastore enabled
- **Application Default credentials** (Oauth client ID and client secret) for an application, created via [Google Cloud Console](https://docs.cloud.google.com/docs/authentication/provide-credentials-adc)
- A **refresh token** obtained by completing the OAuth flow with the appropriate scopes (e.g. `https://www.googleapis.com/auth/bigquery` and storage scope for GCS)
- A **warehouse** path: a GCS bucket (and optional prefix) where your tables are stored, e.g. `gs://your-bucket` or `gs://your-bucket/prefix`

## Creating a connection between BigLake Metastore and ClickHouse {#creating-a-connection}

With the OAuth credentials in place, create a database in ClickHouse that uses the [DataLakeCatalog](/engines/database-engines/datalakecatalog) database engine:

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE biglake_metastore
ENGINE = DataLakeCatalog('https://biglake.googleapis.com/iceberg/v1/restcatalog')
SETTINGS
    catalog_type = 'biglake',
    google_adc_client_id = '<client-id>',
    google_adc_client_secret = '<client-secret>',
    google_adc_refresh_token = '<refresh-token>',
    google_adc_quota_project_id = '<gcp-project-id>',
    warehouse = 'gs://<bucket_name>/<optional-prefix>';
```

## Querying BigLake Metastore tables using ClickHouse {#querying-biglake-metastore-tables}

Once the connection is created, you can query tables registered in the BigLake Metastore.

```sql
USE biglake_metastore;

SHOW TABLES;
```

Example output:

```response
┌─name─────────────────────┐
│icebench.my_iceberg_table │   
└──────────────────────────┘
```

```sql
SELECT count(*) FROM `icebench.my_iceberg_table`;
```

:::note Backticks required
Backticks are required because ClickHouse doesn't support more than one namespace.
:::

To inspect the table definition:

```sql
SHOW CREATE TABLE `icebench.my_iceberg_table`;
```

## Loading data from BigLake into ClickHouse {#loading-data-into-clickhouse}

To load data from a BigLake Metastore table into a local ClickHouse table for faster repeated queries, create a MergeTree table and insert from the catalog:

```sql
CREATE TABLE clickhouse_table
(
    `id` Int64,
    `event_time` DateTime64(3),
    `user_id` String,
    `payload` String
)
ENGINE = MergeTree
ORDER BY (event_time, id);

INSERT INTO local_events
SELECT * FROM biglake_metastore.`icebench.my_iceberg_table`;
```

After the initial load, query `clickhouse_table` for lower latency. Re-run the `INSERT INTO ... SELECT` to refresh data from BigLake when needed.
