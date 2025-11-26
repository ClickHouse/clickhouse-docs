---
slug: /use-cases/data-lake/unity-catalog
sidebar_label: 'Unity catalog'
title: 'Unity catalog'
pagination_prev: null
pagination_next: null
description: '在本指南中，我们将逐步讲解如何使用 ClickHouse 和 Unity Catalog 查询存储在 S3 存储桶中的数据。'
keywords: ['Unity', '数据湖']
show_related_blogs: true
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

:::note
与 Unity Catalog 的集成适用于托管表和外部表。
此集成目前仅在 AWS 上受支持。
:::

ClickHouse 支持与多个目录集成（Unity、Glue、Polaris 等）。本指南将引导您完成使用 ClickHouse 和 [Unity Catalog](https://www.databricks.com/product/unity-catalog) 查询由 Databricks 管理的数据的步骤。

Databricks 为其 Lakehouse（湖仓）支持多种数据格式。借助 ClickHouse，您可以将 Unity Catalog 中的表以 Delta 或 Iceberg 格式进行查询。

:::note
由于该功能仍为实验性功能，您需要通过以下命令启用它：
`SET allow_experimental_database_unity_catalog = 1;`
:::


## 在 Databricks 中配置 Unity {#configuring-unity-in-databricks}

要允许 ClickHouse 与 Unity Catalog 交互，需要确保 Unity Catalog 已配置为允许与外部读取方交互。可以按照[《为 Unity Catalog 启用外部数据访问》](https://docs.databricks.com/aws/en/external-access/admin)指南进行配置。

除启用外部访问外，还要确保用于配置集成的主体（principal）在包含这些表的 schema 上具有 `EXTERNAL USE SCHEMA` [权限](https://docs.databricks.com/aws/en/external-access/admin#external-schema)。

在完成目录配置后，必须为 ClickHouse 生成凭证。根据与 Unity 的交互模式，可以使用以下两种不同的方法：

* 对于 Iceberg 客户端，使用[服务主体](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m)进行身份验证。

* 对于 Delta 客户端，使用个人访问令牌（Personal Access Token，简称 [PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)）。



## 在 Unity Catalog 与 ClickHouse 之间创建连接

在完成 Unity Catalog 的配置并设置好身份验证后，即可在 ClickHouse 与 Unity Catalog 之间建立连接。

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


## 使用 ClickHouse 查询 Unity Catalog 表

现在连接已经建立后，你可以开始通过 Unity Catalog 执行查询。例如：

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

如果使用 Iceberg 客户端，则只会显示启用了 Uniform 的 Delta 表：

```sql
SHOW TABLES

┌─name───────────────┐
│ uniform.delta_hits │
└────────────────────┘
```

查询表：

```sql
SELECT count(*) FROM `uniform.delta_hits`
```

:::note 需要反引号
需要使用反引号，因为 ClickHouse 不支持多个命名空间。
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


## 将数据湖中的数据加载到 ClickHouse

如果需要将数据从 Databricks 加载到 ClickHouse，首先在本地创建一个 ClickHouse 表：

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

然后通过执行 `INSERT INTO ... SELECT` 语句，将 Unity Catalog 表中的数据加载进来：

```sql
INSERT INTO hits SELECT * FROM unity_uniform.`uniform.delta_hits`;
```
