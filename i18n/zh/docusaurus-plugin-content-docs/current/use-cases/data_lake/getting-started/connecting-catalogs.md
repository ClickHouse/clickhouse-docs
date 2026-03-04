---
title: '连接到数据目录'
sidebar_label: '连接到目录'
slug: /use-cases/data-lake/getting-started/connecting-catalogs
sidebar_position: 2
toc_max_heading_level: 3
pagination_prev: use-cases/data_lake/getting-started/querying-directly
pagination_next: use-cases/data_lake/getting-started/accelerating-analytics
description: '使用 DataLakeCatalog 数据库引擎将外部数据目录中的表以原生 ClickHouse 数据库的形式暴露出来，从而把 ClickHouse 与外部数据目录连接起来。'
keywords: ['数据湖', '湖仓', '目录', 'glue', 'unity', 'rest', 'lakekeeper', 'nessie', 'OneLake']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

在[上一节](/use-cases/data-lake/getting-started/querying-directly)中，你通过直接传递存储路径来查询开放表格式的表。在实际场景中，大多数组织会通过**数据目录（data catalog）**来管理表的元数据——这是一个集中式注册系统，用于跟踪表的位置、模式（schema）和分区。 当你使用 [`DataLakeCatalog`](/engines/database-engines/datalakecatalog) 数据库引擎将 ClickHouse 连接到目录时，整个目录会呈现为一个 ClickHouse 数据库。目录中的每一张表都会自动呈现出来，并且可以使用完整的 ClickHouse SQL 进行查询——无需了解各个表的具体路径，也不必为每张表单独管理凭证。

本指南将演示如何连接到 [Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog)。ClickHouse 还支持以下目录——完整的配置步骤请参考各自的参考指南：

| Catalog              | Reference guide                                               |
| -------------------- | ------------------------------------------------------------- |
| AWS Glue             | [AWS Glue catalog](/use-cases/data-lake/glue-catalog)         |
| Iceberg REST Catalog | [REST catalog](/use-cases/data-lake/rest-catalog)             |
| Lakekeeper           | [Lakekeeper catalog](/use-cases/data-lake/lakekeeper-catalog) |
| Project Nessie       | [Nessie catalog](/use-cases/data-lake/nessie-catalog)         |
| Microsoft OneLake    | [Fabric OneLake](/use-cases/data-lake/onelake-catalog)        |

## 连接到 Unity Catalog \{#connecting-to-unity-catalog\}

<BetaBadge />

作为示例，我们将使用 Unity Catalog。

[Databricks Unity Catalog](https://www.databricks.com/product/unity-catalog) 为 Databricks Lakehouse 数据提供集中式治理。

Databricks 为其 Lakehouse 支持多种数据格式。借助 ClickHouse，你可以将 Unity Catalog 中的表作为 Delta 和 Iceberg 表进行查询。

:::note
与 Unity Catalog 的集成适用于托管表和外部表。
此集成目前仅支持在 AWS 上使用。
:::

### 在 Databricks 中配置 Unity \{#configuring-unity-in-databricks\}

要允许 ClickHouse 与 Unity Catalog 交互，需要确保 Unity Catalog 已配置为允许与外部读取方（external reader）交互。可以按照[“Enable external data access to Unity Catalog”](https://docs.databricks.com/aws/en/external-access/admin) 指南进行配置。

除了启用外部访问（external access）之外，还要确保用于配置该集成的主体（principal）在包含这些表的 schema 上拥有 `EXTERNAL USE SCHEMA` [权限](https://docs.databricks.com/aws/en/external-access/admin#external-schema)。

Catalog 配置完成后，必须为 ClickHouse 生成凭证。根据与 Unity 的交互模式，可以使用两种不同的方法：

* 对于 Iceberg 客户端，使用 [service principal](https://docs.databricks.com/aws/en/dev-tools/auth/oauth-m2m) 进行身份验证。

* 对于 Delta 客户端，使用个人访问令牌（Personal Access Token，[PAT](https://docs.databricks.com/aws/en/dev-tools/auth/pat)）。

### 连接到目录 \{#connect-catalog\}

使用这些凭证，您可以连接到相应的端点，查询 Iceberg 或 Delta 表。

<Tabs groupId="connection-formats">
  <TabItem value="delta" label="Delta" default>
    应使用 [Unity Catalog](/use-cases/data-lake/unity-catalog) 来访问 Delta 格式的数据。

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

完成与目录的连接后，您就可以列出其中的表。

```sql
SHOW TABLES FROM unity

┌─name───────────────────────────────────────────────┐
│ unity.logs                                         │
│ unity.single_day_log                               │
└────────────────────────────────────────────────────┘

31 rows in set.
```

### 浏览表结构 \{#exploring-table-schemas\}

我们可以使用标准的 `SHOW CREATE TABLE` 命令来查看这些表是如何创建的。

:::note 必须使用反引号
注意需要同时指定命名空间和表名，并用反引号包裹——ClickHouse 不支持多个命名空间。
:::

下面的示例假定在对 REST Iceberg 目录进行查询：

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

支持所有 ClickHouse 函数。同样，命名空间和表名应使用反引号（`）括起来。

```sql

SELECT count()
FROM unity.`icebench.single_day_log`

┌───count()─┐
│ 282634391 │ -- 282.63 million
└───────────┘

1 row in set. Elapsed: 1.265 sec.
```

如需完整的设置步骤，请参阅 [Unity Catalog 参考指南](/use-cases/data-lake/unity-catalog)。
