---
title: 'Connecting to a data catalog'
sidebar_label: 'Connecting to catalogs'
slug: /use-cases/data-lake/getting-started/connecting-catalogs
sidebar_position: 2
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/getting-started/querying-directly
pagination_next: use-cases/data_lake/getting-started/accelerating-analytics
description: 'Connect ClickHouse to external data catalogs using the DataLakeCatalog database engine to expose catalog tables as native ClickHouse databases.'
keywords: ['data lake', 'lakehouse', 'catalog', 'glue', 'unity', 'rest', 'lakekeeper', 'nessie', 'OneLake']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

In the [previous section](/use-cases/data-lake/getting-started/querying-directly), you queried lakehouse tables by passing storage paths directly. In practice, most organizations manage table metadata through a **data catalog** - a central registry that tracks table locations, schemas, and partitions. When you connect ClickHouse to a catalog using the [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) database engine, the entire catalog is exposed as a ClickHouse database. Every table in the catalog appears automatically and can be queried with full ClickHouse SQL - no need to know individual table paths or manage credentials per table.

This guide walks through connecting to [Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog). ClickHouse also supports the following catalogs - refer to each reference guide for full setup instructions:

| Catalog | Reference guide |
|---------|----------------|
| AWS Glue | [AWS Glue catalog](/use-cases/data-lake/glue-catalog) |
| Iceberg REST Catalog | [REST catalog](/use-cases/data-lake/rest-catalog) |
| Lakekeeper | [Lakekeeper catalog](/use-cases/data-lake/lakekeeper-catalog) |
| Project Nessie | [Nessie catalog](/use-cases/data-lake/nessie-catalog) |
| Microsoft OneLake | [Fabric OneLake](/use-cases/data-lake/onelake-catalog) |

## Connecting to a Unity Catalog {#connecting-to-unity-catalog}

<BetaBadge/>

For example purposes, we'll use the Unity catalog.

[Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog) provides centralized governance for Databricks lakehouse data.

Databricks supports multiple data formats for their lakehouse. With ClickHouse, you can query Unity Catalog tables as both Delta and Iceberg.

:::note
Integration with the Unity Catalog works for managed and external tables.
This integration is currently only supported on AWS.
:::

### Configuring Unity in Databricks {#configuring-unity-in-databricks}

To allow ClickHouse to interact with the Unity catalog, you need to make sure the Unity Catalog is configured to allow interaction with an external reader. This can be achieved by following the[ "Enable external data access to Unity Catalog"](https://docs.databricks.com/aws/en/external-access/admin) guide.

In addition to enabling external access, ensure the principal configuring the integration has the `EXTERNAL USE SCHEMA` [privilege](https://docs.databricks.com/aws/en/external-access/admin#external-schema) on the schema containing the tables.

Once your catalog is configured, you must generate credentials for ClickHouse. Two different methods can be used, depending on your interaction mode with Unity:

* For Iceberg clients, use authentication as a [service principal](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m).

* For Delta clients, use a Personal Access Token ([PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)).

### Connect to the catalog {#connect-catalog}

With the credentials, you can connect to the relevant endpoint to query the files in either Iceberg or Delta.

<Tabs groupId="connection-formats">
<TabItem value="delta" label="Delta" default>

The [Unity catalog](/use-cases/data-lake/unity-catalog) should be used for accessing data in the Delta format.

```sql
SET allow_experimental_database_unity_catalog = 1;

CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog')
SETTINGS warehouse = 'CATALOG_NAME', catalog_credential = '<PAT>', catalog_type = 'unity';
```

</TabItem>
<TabItem value="iceberg" label="Iceberg" default>

```sql
SET allow_database_iceberg = 1;

CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg-rest')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace',
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql';
```

</TabItem>
</Tabs>

### List tables {#list-tables}

Once the connection has been established to your catalog, you can list the tables.

```sql
SHOW TABLES FROM unity

┌─name───────────────────────────────────────────────┐
│ unity.logs                                         │
│ unity.single_day_log                               │
└────────────────────────────────────────────────────┘

31 rows in set.
```

### Exploring table schemas {#exploring-table-schemas}

We can use the standard `SHOW CREATE TABLE` command.

:::note Backticks required
Note the need to specify the namespace and the table name, surrounded with backticks - ClickHouse doesn't support more than one namespace.
:::

The following assumes querying the Rest iceberg catalog:

```sql
SHOW CREATE TABLE unity.`icebench.single_day_log`

CREATE TABLE unity.`icebench.single_day_log`
(
    `pull_request_number` Nullable(Int64),
    `commit_sha` Nullable(String),
    `check_start_time` Nullable(DateTime64(6, 'UTC')),
    `check_name` Nullable(String),
    `instance_type` Nullable(String),
    `instance_id` Nullable(String),
    `event_date` Nullable(Date32),
    `event_time` Nullable(DateTime64(6, 'UTC')),
    `event_time_microseconds` Nullable(DateTime64(6, 'UTC')),
    `thread_name` Nullable(String),
    `thread_id` Nullable(Decimal(20, 0)),
    `level` Nullable(String),
    `query_id` Nullable(String),
    `logger_name` Nullable(String),
    `message` Nullable(String),
    `revision` Nullable(Int64),
    `source_file` Nullable(String),
    `source_line` Nullable(Decimal(20, 0)),
    `message_format_string` Nullable(String)
)
ENGINE = Iceberg('s3://...')
```

### Querying a table {#querying-a-table}

All ClickHouse functions are supported. Again, the namespace and table name should be delimited with backticks.

```sql

SELECT count()
FROM unity.`icebench.single_day_log`

┌───count()─┐
│ 282634391 │ -- 282.63 million
└───────────┘

1 row in set. Elapsed: 1.265 sec.
```

For full setup instructions, see the [Unity catalog reference guide](/use-cases/data-lake/unity-catalog).
