---
title: '连接到数据目录'
sidebar_label: '连接到目录'
slug: /use-cases/data-lake/getting-started/connecting-catalogs
sidebar_position: 2
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/guides/querying-directly
pagination_next: use-cases/data_lake/guides/accelerating-analytics
description: '使用 DataLakeCatalog 数据库引擎将 ClickHouse 连接到外部数据目录，并将目录中的表映射为原生 ClickHouse 数据库。'
keywords: ['数据湖', '湖仓', '目录', 'glue', 'unity', 'rest', 'lakekeeper', 'nessie', 'OneLake']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

在[上一节](/use-cases/data-lake/getting-started/querying-directly)中，您通过直接传入存储路径来查询开放表格式的数据。在实际场景中，大多数组织会通过**数据目录**管理表元数据——它是一个集中式注册表，用于跟踪表的位置、模式和分区。当您使用 [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) 数据库引擎将 ClickHouse 连接到目录时，整个目录都会作为一个 ClickHouse 数据库公开出来。目录中的每个表都会自动显示，并且可以使用完整的 ClickHouse SQL 进行查询——无需了解各个表的具体路径，也无需为每个表单独管理凭据。

本指南将逐步介绍如何连接到 [Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog)。ClickHouse 还支持以下目录——完整的设置说明请参阅相应的参考指南：

| Catalog              | Reference guide                                          |
| -------------------- | -------------------------------------------------------- |
| AWS Glue             | [AWS Glue 目录](/use-cases/data-lake/glue-catalog)         |
| Iceberg REST Catalog | [REST 目录](/use-cases/data-lake/rest-catalog)             |
| Lakekeeper           | [Lakekeeper 目录](/use-cases/data-lake/lakekeeper-catalog) |
| Project Nessie       | [Nessie 目录](/use-cases/data-lake/nessie-catalog)         |
| Microsoft OneLake    | [Fabric OneLake](/use-cases/data-lake/onelake-catalog)   |

## 连接到 Unity Catalog \{#connecting-to-unity-catalog\}

<BetaBadge />

这里以 Unity Catalog 为例。

[Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog) 为 Databricks lakehouse 数据提供集中治理。

Databricks 的 lakehouse 支持多种数据格式。借助 ClickHouse，您可以以 Delta 和 Iceberg 两种格式查询 Unity Catalog 表。

:::note
与 Unity Catalog 的集成适用于托管表和外部表。
该集成目前仅支持 AWS。
:::

### 在 Databricks 中配置 Unity \{#configuring-unity-in-databricks\}

要允许 ClickHouse 与 Unity Catalog 交互，您需要确保 Unity Catalog 已配置为允许外部读取器访问。可按照[“启用对 Unity Catalog 的外部数据访问”](https://docs.databricks.com/aws/en/external-access/admin)指南进行配置。

除了启用外部访问外，还要确保负责配置该集成的主体对包含这些表的 schema 具有 `EXTERNAL USE SCHEMA` [权限](https://docs.databricks.com/aws/en/external-access/admin#external-schema)。

完成目录配置后，您必须为 ClickHouse 生成凭证。根据您与 Unity 的交互方式，可使用以下两种不同的方法：

* 对于 Iceberg 客户端，使用[服务主体](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m)进行身份验证。

* 对于 Delta 客户端，使用个人访问令牌 ([PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)) 。

### 连接到目录 \{#connect-catalog\}

使用这些凭据，您可以连接到相应的端点，查询 Iceberg 或 Delta 表。

<Tabs groupId="connection-formats">
  <TabItem value="delta" label="Delta" default>
    应使用 [Unity Catalog](/use-cases/data-lake/unity-catalog) 访问 Delta 格式的数据。

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

### 列出表 \{#list-tables\}

建立与目录的连接后，您可以列出其中的表。

```sql
SHOW TABLES FROM unity

┌─name───────────────────────────────────────────────┐
│ unity.logs                                         │
│ unity.single_day_log                               │
└────────────────────────────────────────────────────┘

31 rows in set.
```

### 查看表结构 \{#exploring-table-schemas\}

我们可以使用标准的 `SHOW CREATE TABLE` 命令来查看这些表的创建方式。

:::note 需要使用反引号
请注意，需要指定命名空间和表名，并用反引号括起来；ClickHouse 不支持多个命名空间。
:::

以下内容假定查询的是 REST Iceberg catalog：

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

### 查询表 \{#querying-a-table\}

支持所有 ClickHouse 函数。同样，命名空间和表名都应使用反引号括起来。

```sql

SELECT count()
FROM unity.`icebench.single_day_log`

┌───count()─┐
│ 282634391 │ -- 282.63 million
└───────────┘

1 row in set. Elapsed: 1.265 sec.
```

有关完整的设置说明，请参阅 [Unity Catalog 参考指南](/use-cases/data-lake/unity-catalog)。
