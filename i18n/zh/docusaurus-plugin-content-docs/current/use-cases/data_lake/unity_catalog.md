---
slug: /use-cases/data-lake/unity-catalog
sidebar_label: 'Unity catalog'
title: 'Unity catalog'
pagination_prev: null
pagination_next: null
description: '在本指南中，我们将逐步演示如何使用 ClickHouse 和 Unity Catalog 查询 S3 存储桶中的数据。'
keywords: ['Unity', '数据湖']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
与 Unity Catalog 的集成适用于托管表和外部表。
当前此集成仅在 AWS 上受支持。
:::

ClickHouse 支持与多个目录（Unity、Glue、Polaris 等）集成。本文将引导您完成使用 ClickHouse 和 [Unity Catalog](https://www.databricks.com/product/unity-catalog) 查询由 Databricks 管理的数据的步骤。

Databricks 为其湖仓（lakehouse）支持多种数据格式。借助 ClickHouse，您可以将 Unity Catalog 中的表以 Delta 和 Iceberg 的形式进行查询。

:::note
由于此功能为实验性功能，您需要通过以下方式将其启用：
`SET allow_experimental_database_unity_catalog = 1;`
:::


## 在 Databricks 中配置 Unity {#configuring-unity-in-databricks}

为了允许 ClickHouse 与 Unity Catalog 交互，需要确保已将 Unity Catalog 配置为允许与外部读取方交互。可按照[“Enable external data access to Unity Catalog”](https://docs.databricks.com/aws/en/external-access/admin) 指南进行配置。

除了启用外部访问之外，还要确保用于配置集成的主体（principal）在包含这些表的 schema 上拥有 `EXTERNAL USE SCHEMA` [权限](https://docs.databricks.com/aws/en/external-access/admin#external-schema)。

Unity Catalog 配置完成后，必须为 ClickHouse 生成凭证。根据与 Unity 的交互模式，可以使用两种不同的方法：

* 对于 Iceberg 客户端，使用[服务主体](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m)进行身份验证。

* 对于 Delta 客户端，使用个人访问令牌（Personal Access Token，简称 [PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)）。

## 在 Unity Catalog 和 ClickHouse 之间创建连接 {#creating-a-connection-between-unity-catalog-and-clickhouse}

完成 Unity Catalog 的配置并设置好身份验证后，就可以建立 Unity Catalog 与 ClickHouse 之间的连接。

### 读取 Delta

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog')
SETTINGS warehouse = 'CATALOG_NAME', catalog_credential = '<PAT>', catalog_type = 'unity'
```


### 读取 Iceberg 表

```sql
CREATE DATABASE unity
ENGINE = DataLakeCatalog('https://<workspace-id>.cloud.databricks.com/api/2.1/unity-catalog/iceberg')
SETTINGS catalog_type = 'rest', catalog_credential = '<client-id>:<client-secret>', warehouse = 'workspace', 
oauth_server_uri = 'https://<workspace-id>.cloud.databricks.com/oidc/v1/token', auth_scope = 'all-apis,sql'
```


## 使用 ClickHouse 查询 Unity Catalog 中的表

现在连接已经就绪，您可以开始通过 Unity Catalog 进行查询。例如：

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

使用 Iceberg 客户端时，只会显示已启用 Uniform 的 Delta 表：

```sql
SHOW TABLES

┌─name───────────────┐
│ uniform.delta_hits │
└────────────────────┘
```

要查询一个表：

```sql
SELECT count(*) FROM `uniform.delta_hits`
```

:::note 必须使用反引号
之所以必须使用反引号，是因为 ClickHouse 不支持多个命名空间。
:::

要查看该表的 DDL：

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


## 从数据湖将数据加载到 ClickHouse

如果需要将 Databricks 中的数据加载到 ClickHouse，请先创建一个本地 ClickHouse 表：

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

然后通过 `INSERT INTO ... SELECT ...` 语句从 Unity Catalog 表中加载数据：

```sql
INSERT INTO hits SELECT * FROM unity_uniform.`uniform.delta_hits`;
```
