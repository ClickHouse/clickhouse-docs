---
'slug': '/use-cases/data-lake/unity-catalog'
'sidebar_label': 'Unity Catalog'
'title': 'Unity Catalog'
'pagination_prev': null
'pagination_next': null
'description': '在本指南中，我们将引导您通过使用 ClickHouse 和 Unity Catalog 查询 S3 存储桶中的数据的步骤。'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

<ExperimentalBadge/>

:::note
与 Unity Catalog 的集成适用于管理和外部表。
此集成当前仅在 AWS 上支持。
:::

ClickHouse支持与多个目录（Unity、Glue、Polaris等）的集成。本指南将指导您如何使用 ClickHouse 查询由 Databricks 管理的数据，并使用 [Unity Catalog](https://www.databricks.com/product/unity-catalog)。

Databricks 为其数据湖提供多种数据格式。使用 ClickHouse，您可以将 Unity Catalog 表查询为 Delta 和 Iceberg。

## 在 Databricks 中配置 Unity {#configuring-unity-in-databricks}

为了允许 ClickHouse 与 Unity 目录进行交互，您需要确保 Unity Catalog 配置为允许与外部读取器进行交互。这可以通过按照 [“启用对 Unity Catalog 的外部数据访问”](https://docs.databricks.com/aws/en/external-access/admin) 指南来实现。

除了启用外部访问外，请确保配置集成的主体在包含表的模式上拥有 `EXTERNAL USE SCHEMA` [权限](https://docs.databricks.com/aws/en/external-access/admin#external-schema)。

一旦您的目录配置完毕，您必须为 ClickHouse 生成凭据。根据您与 Unity 的交互模式，可以使用两种不同的方法：

* 对于 Iceberg 客户端，使用作为 [服务主体](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m) 的身份验证。

* 对于 Delta 客户端，使用个人访问令牌 ([PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat))。


## 在 Unity Catalog 和 ClickHouse 之间创建连接 {#creating-a-connection-between-unity-catalog-and-clickhouse}

配置好 Unity Catalog 并设置好认证后，建立 ClickHouse 和 Unity Catalog 之间的连接。

### 读取 Delta {#read-delta}

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog')
SETTINGS warehouse = 'CATALOG_NAME', catalog_credential = '<PAT>', catalog_type = 'unity'
```

### 读取 Iceberg {#read-iceberg}

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace', 
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql'
```

## 使用 ClickHouse 查询 Unity Catalog 表 {#querying-unity-catalog-tables-using-clickhouse}

现在，连接已建立，您可以开始通过 Unity Catalog 进行查询。例如：

```sql
USE unity;

SHOW TABLES;

┌─name───────────────────────────────────────────────┐
│ clickbench.delta_hits                              │
│ demo.fake_user                                     │
│ information_schema.catalog_privileges              │
│ information_schema.catalog_tags                    │
│ information_schema.catalogs                        │
│ information_schema.check_constraints               │
│ information_schema.column_masks                    │
│ information_schema.column_tags                     │
│ information_schema.columns                         │
│ information_schema.constraint_column_usage         │
│ information_schema.constraint_table_usage          │
│ information_schema.information_schema_catalog_name │
│ information_schema.key_column_usage                │
│ information_schema.parameters                      │
│ information_schema.referential_constraints         │
│ information_schema.routine_columns                 │
│ information_schema.routine_privileges              │
│ information_schema.routines                        │
│ information_schema.row_filters                     │
│ information_schema.schema_privileges               │
│ information_schema.schema_tags                     │
│ information_schema.schemata                        │
│ information_schema.table_constraints               │
│ information_schema.table_privileges                │
│ information_schema.table_tags                      │
│ information_schema.tables                          │
│ information_schema.views                           │
│ information_schema.volume_privileges               │
│ information_schema.volume_tags                     │
│ information_schema.volumes                         │
│ uniform.delta_hits                                 │
└────────────────────────────────────────────────────┘
```

如果您使用的是 Iceberg 客户端，则仅会显示启用 Uniform 的 Delta 表：

```sql
SHOW TABLES

┌─name───────────────┐
│ uniform.delta_hits │
└────────────────────┘
```

要查询表：

```sql
SELECT count(*) FROM `uniform.delta_hits`
```

:::note 反引号必需
反引号是必需的，因为 ClickHouse 不支持多个命名空间。
:::

要检查表的 DDL：

```sql
SHOW CREATE TABLE `uniform.delta_hits`

CREATE TABLE unity_uniform.`uniform.delta_hits`
(
    `WatchID` Int64,
    `JavaEnable` Int32,
    `Title` String,
    `GoodEvent` Int32,
    `EventTime` DateTime64(6, 'UTC'),
    `EventDate` Date,
    `CounterID` Int32,
    `ClientIP` Int32,
    ...
    `FromTag` String,
    `HasGCLID` Int32,
    `RefererHash` Int64,
    `URLHash` Int64,
    `CLID` Int32
)
ENGINE = Iceberg('s3://<path>);

```

## 将数据从数据湖加载到 ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

如果您需要将数据从 Databricks 加载到 ClickHouse，首先创建一个本地 ClickHouse 表：

```sql
CREATE TABLE hits
(
    `WatchID` Int64,
    `JavaEnable` Int32,
    `Title` String,
    `GoodEvent` Int32,
    `EventTime` DateTime64(6, 'UTC'),
    `EventDate` Date,
    `CounterID` Int32,
    `ClientIP` Int32,
    ...
    `FromTag` String,
    `HasGCLID` Int32,
    `RefererHash` Int64,
    `URLHash` Int64,
    `CLID` Int32
)
PRIMARY KEY (CounterID, EventDate, UserID, EventTime, WatchID);
```

然后通过 `INSERT INTO SELECT` 从 Unity Catalog 表加载数据：

```sql
INSERT INTO hits SELECT * FROM unity_uniform.`uniform.delta_hits`;
```
