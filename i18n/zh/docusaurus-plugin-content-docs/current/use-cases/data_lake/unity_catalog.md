---
slug: /use-cases/data-lake/unity-catalog
sidebar_label: 'Unity catalog'
title: 'Unity catalog'
pagination_prev: null
pagination_next: null
description: '在本指南中，我们将向你展示如何使用 ClickHouse 和 Unity Catalog 查询 S3 存储桶中的数据。'
keywords: ['Unity', 'Data Lake']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
与 Unity Catalog 的集成支持托管表和外部表。
此集成目前仅支持 AWS。
:::

ClickHouse 支持与多个数据目录(Unity、Glue、Polaris 等)集成。本指南将指导您使用 ClickHouse 和 [Unity Catalog](https://www.databricks.com/product/unity-catalog) 查询由 Databricks 管理的数据。

Databricks 的湖仓架构支持多种数据格式。通过 ClickHouse,您可以以 Delta 和 Iceberg 格式查询 Unity Catalog 表。

:::note
由于此功能为实验性功能,您需要通过以下设置启用:
`SET allow_experimental_database_unity_catalog = 1;`
:::


## 在 Databricks 中配置 Unity {#configuring-unity-in-databricks}

要使 ClickHouse 能够与 Unity Catalog 交互,您需要确保 Unity Catalog 已配置为允许外部读取器访问。可以按照["启用 Unity Catalog 的外部数据访问"](https://docs.databricks.com/aws/en/external-access/admin)指南进行配置。

除了启用外部访问之外,还需确保配置集成的主体对包含表的 schema 具有 `EXTERNAL USE SCHEMA` [权限](https://docs.databricks.com/aws/en/external-access/admin#external-schema)。

配置好 catalog 后,您必须为 ClickHouse 生成凭据。根据您与 Unity 的交互模式,可以使用以下两种方法:

- 对于 Iceberg 客户端,使用[服务主体](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m)进行身份验证。

- 对于 Delta 客户端,使用个人访问令牌([PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat))。


## 在 Unity Catalog 与 ClickHouse 之间创建连接 {#creating-a-connection-between-unity-catalog-and-clickhouse}

完成 Unity Catalog 配置和身份验证后,即可在 ClickHouse 与 Unity Catalog 之间建立连接。

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

连接建立后,您可以通过 Unity Catalog 开始查询。例如:

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

如果您使用 Iceberg 客户端,则只会显示启用了 Uniform 的 Delta 表:

```sql
SHOW TABLES

┌─name───────────────┐
│ uniform.delta_hits │
└────────────────────┘
```

查询表:

```sql
SELECT count(*) FROM `uniform.delta_hits`
```

:::note 需要使用反引号
由于 ClickHouse 不支持多个命名空间,因此需要使用反引号。
:::

查看表的 DDL:

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


## 从数据湖加载数据到 ClickHouse {#loading-data-from-your-data-lake-into-clickhouse}

如果需要从 Databricks 加载数据到 ClickHouse,请先创建一个本地 ClickHouse 表:

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

然后通过 `INSERT INTO SELECT` 语句从 Unity Catalog 表中加载数据:

```sql
INSERT INTO hits SELECT * FROM unity_uniform.`uniform.delta_hits`;
```
