---
sidebar_label: '功能和配置'
slug: /integrations/dbt/features-and-configurations
sidebar_position: 2
description: '可用功能和通用配置的说明'
keywords: ['clickhouse', 'dbt', 'features']
title: '功能和配置'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 功能与配置 \{#features-and-configurations\}

<ClickHouseSupportedBadge/>

本节介绍 dbt 在 ClickHouse 中可用的一些功能。

<TOCInline toc={toc}  maxHeadingLevel={3} />

## Profile.yml 配置 \{#profile-yml-configurations\}

要从 dbt 连接到 ClickHouse，您需要在 `profiles.yml` 文件中添加一个 [profile](https://docs.getdbt.com/docs/core/connect-data-platform/connection-profiles)。ClickHouse 的 profile 遵循以下语法格式：

```yaml
your_profile_name:
  target: dev
  outputs:
    dev:
      type: clickhouse

      # Optional
      schema: [default] # ClickHouse database for dbt models
      driver: [http] # http or native.  If not set this will be autodetermined based on port setting
      host: [localhost] 
      port: [8123]  # If not set, defaults to 8123, 8443, 9000, 9440 depending on the secure and driver settings 
      user: [default] # User for all database operations
      password: [<empty string>] # Password for the user
      cluster: [<empty string>] # If set, certain DDL/table operations will be executed with the `ON CLUSTER` clause using this cluster. Distributed materializations require this setting to work. See the following ClickHouse Cluster section for more details.
      verify: [True] # Validate TLS certificate if using TLS/SSL
      secure: [False] # Use TLS (native protocol) or HTTPS (http protocol)
      client_cert: [null] # Path to a TLS client certificate in .pem format
      client_cert_key: [null] # Path to the private key for the TLS client certificate
      retries: [1] # Number of times to retry a "retriable" database exception (such as a 503 'Service Unavailable' error)
      compression: [<empty string>] # Use gzip compression if truthy (http), or compression type for a native connection
      connect_timeout: [10] # Timeout in seconds to establish a connection to ClickHouse
      send_receive_timeout: [300] # Timeout in seconds to receive data from the ClickHouse server
      cluster_mode: [False] # Use specific settings designed to improve operation on Replicated databases (recommended for ClickHouse Cloud)
      use_lw_deletes: [False] # Use the strategy `delete+insert` as the default incremental strategy.
      check_exchange: [True] # Validate that clickhouse support the atomic EXCHANGE TABLES command.  (Not needed for most ClickHouse versions)
      local_suffix: [_local] # Table suffix of local tables on shards for distributed materializations.
      local_db_prefix: [<empty string>] # Database prefix of local tables on shards for distributed materializations. If empty, it uses the same database as the distributed table.
      allow_automatic_deduplication: [False] # Enable ClickHouse automatic deduplication for Replicated tables
      tcp_keepalive: [False] # Native client only, specify TCP keepalive configuration. Specify custom keepalive settings as [idle_time_sec, interval_sec, probes].
      custom_settings: [{}] # A dictionary/mapping of custom ClickHouse settings for the connection - default is empty.
      database_engine: '' # Database engine to use when creating new ClickHouse schemas (databases).  If not set (the default), new databases will use the default ClickHouse database engine (usually Atomic).
      threads: [1] # Number of threads to use when running queries. Before setting it to a number higher than 1, make sure to read the [read-after-write consistency](#read-after-write-consistency) section.
      
      # Native (clickhouse-driver) connection settings
      sync_request_timeout: [5] # Timeout for server ping
      compress_block_size: [1048576] # Compression block size if compression is enabled
```


### Schema 与 Database 的区别 \{#schema-vs-database\}

dbt 模型的关系标识符 `database.schema.table` 与 ClickHouse 不兼容，因为 ClickHouse 不支持 `schema`。
因此我们采用简化形式 `schema.table`，其中 `schema` 实际上对应的是 ClickHouse 的数据库。不推荐使用 `default` 数据库。

### SET 语句警告 \{#set-statement-warning\}

在许多环境中，使用 SET 语句在所有 dbt 查询中持久化某个 ClickHouse 设置并不可靠，
且可能导致意外失败。尤其是在通过负载均衡器使用 HTTP 连接、将查询分发到多个节点
（例如 ClickHouse Cloud）时问题更为突出，不过在某些情况下，即使是原生 ClickHouse 连接也可能出现类似情况。
因此，我们建议将所有必需的 ClickHouse 设置配置在 dbt profile 的 `custom_settings` 属性中，
将其作为推荐实践，而不是依赖作为 pre-hook 执行的 `SET` 语句（尽管偶尔会有人这样建议）。

### 设置 `quote_columns` \{#setting-quote_columns\}

为避免出现警告，请确保在 `dbt_project.yml` 中显式设置 `quote_columns` 的值。有关详细信息，请参阅 [quote&#95;columns 文档](https://docs.getdbt.com/reference/resource-configs/quote_columns)。

```yaml
seeds:
  +quote_columns: false  #or `true` if you have CSV column headers with spaces
```


### 关于 ClickHouse 集群 \{#about-the-clickhouse-cluster\}

在使用 ClickHouse 集群时，需要考虑两点：

- 设置 `cluster` 参数。
- 确保写后读一致性，尤其是在使用多个 `threads` 时。

#### 集群设置 \{#cluster-setting\}

profile 中的 `cluster` 设置允许 dbt-clickhouse 连接并运行在一个 ClickHouse 集群上。如果在 profile 中设置了 `cluster`，则**默认情况下所有模型都会带有 `ON CLUSTER` 子句创建**——使用 **Replicated** 引擎的模型除外。这包括：

* 创建数据库
* 视图物化
* 表和增量物化
* Distributed 物化

Replicated 引擎**不会**包含 `ON CLUSTER` 子句，因为它们被设计为在内部管理复制。

要为某个特定模型**禁用**基于集群的创建，请添加 `disable_on_cluster` 配置：

```sql
{{ config(
        engine='MergeTree',
        materialized='table',
        disable_on_cluster='true'
    )
}}

```

使用非副本引擎（non-replicated engine）的 table 和 incremental 物化不会受到 `cluster` 设置的影响（模型只会
在当前连接的节点上创建）。

**兼容性**

如果某个模型是在未使用 `cluster` 设置的情况下创建的，dbt-clickhouse 会检测到这种情况，并在针对该模型执行所有 DDL/DML
时，不使用 `on cluster` 子句。


#### 写后读一致性 \{#read-after-write-consistency\}

dbt 依赖写入后读取（read-after-insert）一致性模型。如果你无法保证所有操作都落在同一个副本上，那么这与包含多个副本的 ClickHouse 集群不兼容。日常使用 dbt 时你可能不会遇到问题，但可以根据集群配置采用以下策略来确保这一点：

- 如果你使用的是 ClickHouse Cloud 集群，只需在 profile 的 `custom_settings` 属性中设置 `select_sequential_consistency: 1`。你可以在[这里](/operations/settings/settings#select_sequential_consistency)找到有关该设置的更多信息。
- 如果你使用的是自托管集群，请确保所有 dbt 请求都发送到同一个 ClickHouse 副本。如果其上方有负载均衡器，尝试使用某种 `replica aware routing` / `sticky sessions` 机制，以便始终访问同一个副本。在 ClickHouse Cloud 之外的集群中添加 `select_sequential_consistency = 1` 这个设置是[不推荐的](/operations/settings/settings#select_sequential_consistency)。

## 其他 ClickHouse 宏 \{#additional-clickhouse-macros\}

### 模型物化实用宏 \{#model-materialization-utility-macros\}

包含以下宏，用于简化创建 ClickHouse 特有的表和视图：

- `engine_clause` -- 使用 `engine` 模型配置属性来指定 ClickHouse 表引擎。dbt-clickhouse
  默认使用 `MergeTree` 引擎。
- `partition_cols` -- 使用 `partition_by` 模型配置属性来指定 ClickHouse 分区键。默认情况下不会配置
  分区键。
- `order_cols` -- 使用 `order_by` 模型配置属性来指定 ClickHouse ORDER BY/排序键。如果未指定，
  ClickHouse 将使用空元组 ()，表数据将不排序。
- `primary_key_clause` -- 使用 `primary_key` 模型配置属性来指定 ClickHouse 主键。默认情况下，
  主键会被设置为 ORDER BY 子句。
- `on_cluster_clause` -- 使用 `cluster` 配置属性，为某些 dbt 操作添加 `ON CLUSTER` 子句：
  分布式物化、视图创建、数据库创建。
- `ttl_config` -- 使用 `ttl` 模型配置属性来指定 ClickHouse 表的生存时间 (TTL) 表达式。默认情况
  下不会配置生存时间 (TTL)。

### s3Source 辅助宏 \{#s3source-helper-macro\}

`s3source` 宏简化了使用 ClickHouse S3 表函数直接从 S3 中查询 ClickHouse 数据的过程。它通过
从一个具名配置字典中为 S3 表函数填充参数来实现（该字典的名称必须以 `s3` 结尾）。该宏
首先在 profile 的 `vars` 中查找该字典，然后在模型配置中查找。该字典可以包含
以下任意键，用于填充 S3 表函数的参数：

| Argument Name         | Description                                                                                                                                                                                  |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bucket                | bucket 的基础 URL，例如 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi`。如果未提供协议，则默认使用 `https://`。                                         |
| path                  | 用于表查询的 S3 路径，例如 `/trips_4.gz`。支持 S3 通配符。                                                                                                  |
| fmt                   | 引用的 S3 对象的预期 ClickHouse 输入格式（例如 `TSV` 或 `CSVWithNames`）。                                                                                         |
| structure             | bucket 中数据的列结构，作为名称/数据类型对的列表，例如 `['id UInt32', 'date DateTime', 'value String']`。如果未提供，ClickHouse 将推断结构。 |
| aws_access_key_id     | S3 访问密钥 ID。                                                                                                                                                                        |
| aws_secret_access_key | S3 秘密访问密钥。                                                                                                                                                                           |
| role_arn              | 用于安全访问 S3 对象的 ClickhouseAccess IAM 角色的 ARN。更多信息请参见此[文档](/cloud/data-sources/secure-s3)。     |
| compression           | S3 对象使用的压缩方式。如果未提供，ClickHouse 将尝试基于文件名自动判断压缩方式。                                                   |

有关如何使用此宏的示例，请参见
[S3 测试文件](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py)。

### 跨数据库宏支持 \{#cross-database-macro-support\}

dbt-clickhouse 现在支持 `dbt Core` 中包含的大多数跨数据库宏，但有以下例外情况：

* 在 ClickHouse 中，`split_part` SQL 函数是通过 splitByChar 函数实现的。该函数要求用于拆分的分隔符必须是常量字符串，因此在此宏中使用的 `delimeter` 参数会被解释为字符串，而不是列名
* 同样地，ClickHouse 中的 `replace` SQL 函数要求 `old_chars` 和 `new_chars` 参数为常量字符串，因此在调用此宏时，这些参数会被解释为字符串，而不是列名。

## 目录支持 \{#catalog-support\}

### dbt Catalog 集成状态 \{#dbt-catalog-integration-status\}

dbt Core v1.10 引入了对 Catalog 集成的支持，使适配器能够将模型物化到管理 Apache Iceberg 等开放表格式的外部 Catalog 中。**此特性目前尚未在 dbt-clickhouse 中原生实现。**你可以在 [GitHub issue #489](https://github.com/ClickHouse/dbt-clickhouse/issues/489) 中跟踪该特性的实现进度。

### ClickHouse Catalog 支持 \{#clickhouse-catalog-support\}

ClickHouse 最近新增了对 Apache Iceberg 表和数据目录的原生支持。大多数功能目前仍标记为 `experimental`，但在较新的 ClickHouse 版本中已经可以开始使用。

* 可以使用 ClickHouse，通过 [Iceberg table engine](/engines/table-engines/integrations/iceberg) 和 [iceberg table function](/sql-reference/table-functions/iceberg)，**查询存储在对象存储（S3、Azure Blob Storage、Google Cloud Storage）中的 Iceberg 表**。

* 此外，ClickHouse 提供了 [DataLakeCatalog database engine](/engines/database-engines/datalakecatalog)，用于 **连接外部数据目录**，包括 AWS Glue Catalog、Databricks Unity Catalog、Hive Metastore 和 REST Catalog。借助该引擎，可以直接从外部目录查询开放表格式数据（Iceberg、Delta Lake），而无需产生数据副本。

### 使用 Iceberg 和 Catalog 的变通方案 \{#workarounds-iceberg-catalogs\}

如果你已经在 ClickHouse 集群中通过上文介绍的工具定义了 Iceberg 表或 Catalog，那么你可以在 dbt 项目中读取这些 Iceberg 表或 Catalog 的数据。你可以利用 dbt 中的 `source` 功能在 dbt 项目中引用这些表。例如，如果你想访问 REST Catalog 中的表，可以执行以下操作：

1. **创建一个指向外部 Catalog 的数据库：**

```sql
-- Example with REST Catalog
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE iceberg_catalog
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```

2. **在 dbt 中将 catalog 数据库及其数据表定义为数据源：** 请注意，这些表应当已经存在于 ClickHouse 中

```yaml
version: 2

sources:
  - name: external_catalog
    database: iceberg_catalog
    tables:
      - name: orders
      - name: customers
```

3. **在你的 dbt 模型中使用 catalog 表：**

```sql
SELECT 
    o.order_id,
    c.customer_name,
    o.order_date
FROM {{ source('external_catalog', 'orders') }} o
INNER JOIN {{ source('external_catalog', 'customers') }} c
    ON o.customer_id = c.customer_id
```


### 关于变通方案的说明 \{#benefits-workarounds\}

这些变通方案的优点是：

* 你可以立即访问不同类型的外部表和外部 catalog，而无需等待原生 dbt catalog 集成。
* 当原生 catalog 支持可用时，你将拥有一条平滑的迁移路径。

但目前也存在一些限制：

* **手动设置：**在可以在 dbt 中引用之前，必须先在 ClickHouse 中手动创建 Iceberg 表和 catalog 数据库。
* **无 catalog 级别 DDL：**dbt 无法管理 catalog 级别的操作，比如在外部 catalog 中创建或删除 Iceberg 表。因此，目前你无法通过 dbt 连接器来创建它们。未来可能会加入使用 `Iceberg()` 引擎创建表的能力。
* **写入操作：**目前对 Iceberg/Data Catalog 表的写入能力有限。请查看 ClickHouse 文档以了解可用的选项。