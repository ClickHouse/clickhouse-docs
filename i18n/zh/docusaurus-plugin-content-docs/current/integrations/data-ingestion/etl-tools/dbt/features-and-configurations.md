---
sidebar_label: '功能和配置'
slug: /integrations/dbt/features-and-configurations
sidebar_position: 2
description: '在 ClickHouse 中使用 dbt 的功能特性'
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


### Schema 与 Database 的区别 \\{#schema-vs-database\\}

dbt 模型的关系标识符 `database.schema.table` 与 ClickHouse 不兼容，因为 ClickHouse 不支持 `schema`。
因此我们采用简化形式 `schema.table`，其中 `schema` 实际上对应的是 ClickHouse 的数据库。不推荐使用 `default` 数据库。

### SET 语句警告 \\{#set-statement-warning\\}

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


### 关于 ClickHouse 集群 \\{#about-the-clickhouse-cluster\\}

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

使用非副本引擎（non-replicated engine）的 table 和 incremental 物化不会受到 `cluster` 设置的影响（模型只会在当前连接的节点上创建）。

**兼容性**

如果某个模型是在未使用 `cluster` 设置的情况下创建的，dbt-clickhouse 会检测到这种情况，并在针对该模型执行所有 DDL/DML 时，不使用 `on cluster` 子句。


#### 写后读一致性 \\{#read-after-write-consistency\\}

dbt 依赖写入后读取（read-after-insert）一致性模型。如果你无法保证所有操作都落在同一个副本上，那么这与包含多个副本的 ClickHouse 集群不兼容。日常使用 dbt 时你可能不会遇到问题，但可以根据集群配置采用以下策略来确保这一点：

- 如果你使用的是 ClickHouse Cloud 集群，只需在 profile 的 `custom_settings` 属性中设置 `select_sequential_consistency: 1`。你可以在[这里](/operations/settings/settings#select_sequential_consistency)找到有关该设置的更多信息。
- 如果你使用的是自托管集群，请确保所有 dbt 请求都发送到同一个 ClickHouse 副本。如果其上方有负载均衡器，尝试使用某种 `replica aware routing` / `sticky sessions` 机制，以便始终访问同一个副本。在 ClickHouse Cloud 之外的集群中添加 `select_sequential_consistency = 1` 这个设置是[不推荐的](/operations/settings/settings#select_sequential_consistency)。

## 功能概览 \\{#general-information-about-features\\}

### 通用模型配置 \\{#general-model-configurations\\}

下表展示了一些物化方式共享的配置。有关 dbt 通用模型配置的详细信息，请参阅 [dbt 文档](https://docs.getdbt.com/category/general-configs)：

| Option                 | Description                                                                                                                                                                                                                                                                                                          | Default if any |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| engine                 | 创建表时要使用的表引擎（表类型）                                                                                                                                                                                                                                                                                     | `MergeTree()`  |
| order_by               | 由列名或任意表达式组成的元组。这允许你创建一个较小的稀疏索引，从而更快地查找数据。                                                                                                                                                                                                                                  | `tuple()`      |
| partition_by           | 分区是按照指定条件对表中记录进行的逻辑组合。分区键可以是基于表中列的任意表达式。                                                                                                                                                                                                                                   |                |
| primary_key            | 与 order_by 类似，是 ClickHouse 的主键表达式。如果未指定，ClickHouse 将使用 order_by 表达式作为主键。                                                                                                                                                                                                            |                |
| settings               | 一个包含 "TABLE" 级别设置的映射/字典，在与此模型相关的 DDL 语句（如 `CREATE TABLE`）中使用                                                                                                                                                                                                                         |                |
| query_settings         | 一个包含 ClickHouse 用户级别设置的映射/字典，在与此模型相关的 `INSERT` 或 `DELETE` 语句中使用                                                                                                                                                                                                                      |                |
| ttl                    | 一个用于表的生存时间 (TTL) 表达式。该 TTL 表达式是一个字符串，用于为表指定 TTL。                                                                                                                                                                                                                                   |                |
| indexes                | 要创建的 [数据跳过索引](/optimize/skipping-indexes) 列表。详情参见 [关于数据跳过索引](#data-skipping-indexes)。                                                                                                                                                                                                     |                |
| sql_security           | 执行该 VIEW 底层查询时要使用的 ClickHouse 用户。[可接受的取值](/sql-reference/statements/create/view#sql_security)：`definer`、`invoker`。                                                                                                                                                                         |                |
| definer                | 如果 `sql_security` 设为 `definer`，则必须在 `definer` 子句中指定任意已存在的用户或 `CURRENT_USER`。                                                                                                                                                                                                              |                |
| projections            | 要创建的 [projections](/data-modeling/projections) 列表。详情参见 [关于 projections](#projections)。                                                                                                                                                                                                              |                |

#### 关于数据跳过索引 \{#data-skipping-indexes\}

数据跳过索引仅在 `table` 物化类型下可用。要为表添加一组数据跳过索引，请使用 `indexes` 配置：

```sql
{{ config(
        materialized='table',
        indexes=[{
          'name': 'your_index_name',
          'definition': 'your_column TYPE minmax GRANULARITY 2'
        }]
) }}
```


#### 关于投影 \{#projections\}

你可以使用 `projections` 配置，为 `table` 和 `distributed_table` 物化形式添加[投影](/data-modeling/projections)：

```sql
{{ config(
       materialized='table',
       projections=[
           {
               'name': 'your_projection_name',
               'query': 'SELECT department, avg(age) AS avg_age GROUP BY department'
           }
       ]
) }}
```

**注意**：对于分布式表，投影只应用于 `_local` 表，而不会应用于分布式代理表本身。


### 支持的表引擎 \\{#supported-table-engines\\}

| 类型                   | 详情                                                                                      |
|------------------------|-------------------------------------------------------------------------------------------|
| MergeTree (默认)       | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB        | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |

**注意**：对于 materialized view，支持所有 *MergeTree 引擎。

### 实验性支持的表引擎 \\{#experimental-supported-table-engines\\}

| 类型              | 详情                                                                      |
|-------------------|---------------------------------------------------------------------------|
| Distributed Table | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| Dictionary        | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

如果你在使用上述任一引擎时，通过 dbt 连接 ClickHouse 遇到问题，请在[此处](https://github.com/ClickHouse/dbt-clickhouse/issues)报告问题。

### 关于模型设置的说明 \\{#a-note-on-model-settings\\}

ClickHouse 提供多种类型/层级的“settings”。在上面的模型配置中，其中两类是可配置的。`settings` 指的是在 `CREATE TABLE/VIEW` 这类 DDL 语句中使用的 `SETTINGS` 子句，因此通常是特定于某个 ClickHouse 表引擎的设置。新的
`query_settings` 用于在用于模型物化（包括增量物化）的 `INSERT` 和 `DELETE` 查询中添加 `SETTINGS` 子句。
ClickHouse 中有数百个设置，并不总是很清楚哪些是“表”设置，哪些是“用户”
设置（尽管后者通常可以在 `system.settings` 表中查看）。通常推荐使用默认值，在使用这些属性前应进行充分的研究和测试。

### 列配置 \\{#column-configuration\\}

> **_注意：_** 使用下面的列配置选项前，必须启用并强制执行 [model contracts](https://docs.getdbt.com/docs/collaborate/govern/model-contracts)。

| 选项 | 描述                                                                                                                                                         | 默认值（如有） |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| codec  | 一个字符串，由传递给列 DDL 中 `CODEC()` 的参数组成。例如：`codec: "Delta, ZSTD"` 将被编译为 `CODEC(Delta, ZSTD)`。    |    
| ttl    | 一个字符串，包含一个 [TTL（生存时间）表达式](https://clickhouse.com/docs/guides/developer/ttl)，用于在列的 DDL 中定义生存时间 (TTL) 规则。例如：`ttl: ts + INTERVAL 1 DAY` 将被编译为 `TTL ts + INTERVAL 1 DAY`。 |

#### 模式配置示例 \{#example-of-schema-configuration\}

```yaml
models:
  - name: table_column_configs
    description: 'Testing column-level configurations'
    config:
      contract:
        enforced: true
    columns:
      - name: ts
        data_type: timestamp
        codec: ZSTD
      - name: x
        data_type: UInt8
        ttl: ts + INTERVAL 1 DAY
```


#### 添加复杂类型 \{#adding-complex-types\}

dbt 会通过分析用于创建模型的 SQL 语句来自动确定每一列的数据类型。但在某些情况下，此过程可能无法准确确定数据类型，从而与契约中 `data_type` 属性指定的类型发生冲突。为了解决这一问题，我们建议在模型 SQL 中使用 `CAST()` 函数显式定义所需的类型。例如：

```sql
{{
    config(
        materialized="materialized_view",
        engine="AggregatingMergeTree",
        order_by=["event_type"],
    )
}}

select
  -- event_type may be infered as a String but we may prefer LowCardinality(String):
  CAST(event_type, 'LowCardinality(String)') as event_type,
  -- countState() may be infered as `AggregateFunction(count)` but we may prefer to change the type of the argument used:
  CAST(countState(), 'AggregateFunction(count, UInt32)') as response_count, 
  -- maxSimpleState() may be infered as `SimpleAggregateFunction(max, String)` but we may prefer to also change the type of the argument used:
  CAST(maxSimpleState(event_type), 'SimpleAggregateFunction(max, LowCardinality(String))') as max_event_type
from {{ ref('user_events') }}
group by event_type
```


## 功能 \\{#features\\}

### 物化方式：view \{#materialization-view\}

可以将 dbt 模型创建为 [ClickHouse view](/sql-reference/table-functions/view/)，
并按以下语法进行配置：

项目文件（`dbt_project.yml`）：

```yaml
models:
  <resource-path>:
    +materialized: view
```

或者在配置块中（`models/<model_name>.sql`）：

```python
{{ config(materialized = "view") }}
```


### 物化：表 \{#materialization-table\}

可以将 dbt 模型创建为一个 [ClickHouse 表](/operations/system-tables/tables/)，并使用以下语法进行配置：

项目文件（`dbt_project.yml`）：

```yaml
models:
  <resource-path>:
    +materialized: table
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
```

或者在配置块中（位于 `models/&lt;model_name&gt;.sql`）：

```python
{{ config(
    materialized = "table",
    engine = "<engine-type>",
    order_by = [ "<column-name>", ... ],
    partition_by = [ "<column-name>", ... ],
      ...
    ]
) }}
```


### 物化：增量 \{#materialization-incremental\}

在每次执行 dbt 时，表模型都会被重新构建。对于较大的结果集或复杂转换，这可能不可行且成本极高。为了解决这一问题并缩短构建时间，可以将 dbt 模型创建为增量的 ClickHouse 表，并使用以下语法进行配置：

在 `dbt_project.yml` 中定义模型：

```yaml
models:
  <resource-path>:
    +materialized: incremental
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
    +unique_key: [ <column-name>, ... ]
    +inserts_only: [ True|False ]
```

或者在 `models/<model_name>.sql` 中的 config 块中：

```python
{{ config(
    materialized = "incremental",
    engine = "<engine-type>",
    order_by = [ "<column-name>", ... ],
    partition_by = [ "<column-name>", ... ],
    unique_key = [ "<column-name>", ... ],
    inserts_only = [ True|False ],
      ...
    ]
) }}
```


#### 配置 \\{#incremental-configurations\\}

针对此物化类型特有的配置如下所示：

| Option                   | Description                                                                                                                                                                                                                                                       | Required?                                                                            |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `unique_key`             | 唯一标识行的一组列名（元组）。有关唯一性约束的更多详细信息，请参见[此处](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional)。                                                                                       | 必需。如果未提供，已变更的行将在增量表中被写入两次。 |
| `inserts_only`           | 已被弃用，推荐使用行为相同的 `append` 增量 `strategy`。如果在增量模型中设置为 True，增量更新将直接插入目标表，而不会创建中间表。如果设置了 `inserts_only`，将忽略 `incremental_strategy`。 | 可选（默认值：`False`）                                                          |
| `incremental_strategy`   | 用于增量物化的策略。支持 `delete+insert`、`append`、`insert_overwrite` 或 `microbatch`。有关策略的更多详细信息，请参见[此处](/integrations/dbt/features-and-configurations#incremental-model-strategies) | 可选（默认值：'default'）                                                        |
| `incremental_predicates` | 应用于增量物化的附加条件（仅在使用 `delete+insert` 策略时生效）                                                                                                                                                                                    | 可选                      

#### 增量模型策略 \\{#incremental-model-strategies\\}

`dbt-clickhouse` 支持三种增量模型策略。

##### 默认（旧版）策略 \\{#default-legacy-strategy\\}

过去，ClickHouse 对更新和删除仅提供有限支持，其形式是异步的 “mutations”。
为了模拟预期的 dbt 行为，
`dbt-clickhouse` 默认会创建一个新的临时表，该表包含所有未受影响（未被删除、未被更改）的“旧”
记录，以及所有新的或已更新的记录，
然后将这个临时表与现有的增量模型关系进行交换或替换。这是唯一一种能够在操作完成前出现问题时，
仍然保留原始关系对象的策略；然而，由于它涉及对原始表进行完整拷贝，因此执行成本可能相当高且速度较慢。

##### Delete+Insert 策略 \\{#delete-insert-strategy\\}

ClickHouse 在 22.8 版本中引入了“轻量级删除”这一实验性特性。轻量级删除比 `ALTER TABLE ... DELETE`
操作快得多，因为它不需要重写 ClickHouse 分区片段。增量策略 `delete+insert`
利用轻量级删除来实现比“旧版”策略性能显著更好的增量物化。不过，使用此策略时需要注意以下重要事项：

- 必须在 ClickHouse 服务器上通过设置
  `allow_experimental_lightweight_delete=1` 启用轻量级删除，或者
  在 profile 中设置 `use_lw_deletes=true`（这会为你的 dbt 会话启用该设置项）
- 轻量级删除目前已可用于生产环境，但在 23.3 之前的 ClickHouse 版本上可能会存在性能和其他方面的问题。
- 此策略会直接在受影响的表/关系上操作（不会创建任何中间表或临时表），
  因此如果在操作过程中出现问题，
  增量模型中的数据很可能会处于无效状态
- 当使用轻量级删除时，dbt-clickhouse 会启用 `allow_nondeterministic_mutations` 设置项。在一些极其
  罕见的情况下，如果使用了非确定性的 `incremental_predicates`，
  这可能会导致已更新/删除条目的竞争条件（以及 ClickHouse 日志中的相关日志消息）。
  为了确保结果一致，
  增量谓词应只包含针对在增量物化期间不会被修改的数据的子查询。

##### 微批策略（需要 dbt-core >= 1.9） \\{#microbatch-strategy\\}

增量策略 `microbatch` 自 dbt-core 1.9 版本起提供，旨在高效处理大规模
时序数据转换。在 dbt-clickhouse 中，它构建在现有的 `delete_insert`
增量策略之上，根据模型中的 `event_time` 和 `batch_size` 配置，将增量数据拆分为预定义的时间序列批次。

除了处理大规模转换之外，微批还提供以下能力：

- [重新处理失败批次](https://docs.getdbt.com/docs/build/incremental-microbatch#retry)。
- 自动检测[并行批次执行](https://docs.getdbt.com/docs/build/parallel-batch-execution)。
- 无需在[回填](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills)中编写复杂的条件逻辑。

关于微批的详细用法，请参考[官方文档](https://docs.getdbt.com/docs/build/incremental-microbatch)。

###### 可用的微批配置 \\{#available-microbatch-configurations\\}

| 选项               | 描述                                                                                                                                                                                                                                                                                                                                       | 默认值（如有） |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| event_time         | 指示“该行在什么时间发生”的列。对于你的微批模型，以及任何需要基于时间进行过滤的直接父级模型，都是必需的。                                                                                                                                                                                                                                   |                |
| begin              | 微批模型的“时间起点”。这是任何初始或全量刷新构建的起始时间点。比如，对于以天为粒度的微批模型，在 2024-10-01 这天运行，且 begin = '2023-10-01'，将会处理 366 个批次（这一年是闰年！），外加“今天”的那个批次。                                                                                                         |                |
| batch_size         | 批次的时间粒度。支持的取值为 `hour`、`day`、`month` 和 `year`。                                                                                                                                                                                                                                      |                |
| lookback           | 在最新书签之前额外处理 X 个批次，以捕获延迟到达的记录。                                                                                                                                                                                                                                                                                     | 1              |
| concurrent_batches | 覆盖 dbt 对并发（同时）运行批次的自动检测行为。阅读更多内容：[配置并发批次](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches)。设置为 true 时，将并发（并行）运行批次；设置为 false 时，则顺序（依次）运行批次。                                                 |                |

##### Append 策略 \\{#append-strategy\\}

此策略取代了 dbt-clickhouse 早期版本中的 `inserts_only` 设置。该方法只是将新行追加到现有关联中。
因此不会消除重复行，也不会创建任何临时或中间表。如果数据中允许存在重复行，或者通过增量查询的 WHERE 子句/过滤条件排除了重复行，这是速度最快的方法。

##### insert_overwrite 策略（实验性） \\{#insert-overwrite-strategy\\}

> [IMPORTANT]  
> 目前，insert_overwrite 策略在分布式物化中尚未得到完整支持。

执行以下步骤：

1. 创建一个与增量模型对应关系具有相同结构的暂存（临时）表：  
   `CREATE TABLE <staging> AS <target>`。
2. 将仅包含新记录（由 `SELECT` 生成）插入到暂存表中。
3. 仅将新的分区（出现在暂存表中的分区）替换到目标表中。

这种方法具有以下优点：

- 比默认策略更快，因为它不会复制整张表。
- 比其他策略更安全，因为在 INSERT 操作成功完成之前，它不会修改原始表：
  如果在中间过程中发生失败，原始表不会被修改。
- 它实现了“分区不可变性”的数据工程最佳实践，从而简化了增量与并行数据处理、回滚等操作。

该策略要求在模型配置中设置 `partition_by`。模型配置中其他特定于策略的参数会被忽略。

### 物化：materialized&#95;view（实验性） \{#materialized-view\}

`materialized_view` 物化应当是对一个已存在的（源）表执行的 `SELECT`。Adapter 会创建一个以模型名命名的
目标表，
以及一个名称为 `<model_name>_mv` 的 ClickHouse MATERIALIZED VIEW。与 PostgreSQL 不同，ClickHouse 的 materialized view
不是“静态的”（并且
没有对应的 REFRESH 操作）。相反，它充当“插入触发器（insert trigger）”：当有行插入源表时，会先通过视图定义中指定的 `SELECT`
“转换（transformation）”，再将转换后的新行插入到目标表中。参见这个[测试文件](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)，
以获取关于如何使用此功能的入门示例。

ClickHouse 支持让多个 materialized view 将记录写入同一个目标表。
为了在 dbt-clickhouse 中支持这一点，你可以在模型文件中构造一个 `UNION`，使得每个 materialized view 的 SQL 都被形如
`--my_mv_name:begin` 和 `--my_mv_name:end` 的注释包裹起来。

例如，下面的配置将构建两个 materialized view，并且都将数据写入该模型的同一个目标表中。
materialized view 的名称将采用 `<model_name>_mv1` 和 `<model_name>_mv2` 的形式：

```sql
--mv1:begin
select a,b,c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a,b,c from {{ source('raw', 'table_2') }}
--mv2:end
```

> 重要提示！
>
> 在更新包含多个 materialized view（MV）的模型时，尤其是在重命名某个 MV 时，
> dbt-clickhouse 不会自动删除旧的 MV，而是会给出如下警告信息：
> `Warning - Table <previous table name> was detected with the same pattern as model name <your model name> but was not found in this run. In case it is a renamed mv that was previously part of this model, drop it manually (!!!) `


#### 历史数据回补 \{#data-catch-up\}

当前，在创建 materialized view（MV）时，会先将历史数据写入目标表，然后才创建 MV 本身。

换句话说，dbt-clickhouse 会先创建目标表，并根据为 MV 定义的查询预加载历史数据。只有在这一步完成之后，才会创建 MV。

如果不希望在创建 MV 时预加载历史数据，可以通过将 catch-up 配置项设置为 False 来禁用此行为：

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False
)}}
```


#### 可刷新 materialized view \{#refreshable-materialized-views\}

要使用 [Refreshable Materialized View](/materialized-view/refreshable-materialized-view)，
请在 MV 模型中根据需要调整以下配置项（这些配置项都应设置在一个
refreshable 配置对象中）：

| Option                        | Description                                                              | Required | Default Value |
| ----------------------------- | ------------------------------------------------------------------------ | -------- | ------------- |
| refresh&#95;interval          | 间隔子句（必填）                                                                 | Yes      |               |
| randomize                     | 随机化子句，将出现在 `RANDOMIZE FOR` 之后                                            |          |               |
| append                        | 如果设置为 `True`，每次刷新都会向表中插入行而不删除已有行。该插入不是原子操作，与常规的 INSERT SELECT 一样。        |          | False         |
| depends&#95;on                | 可刷新 materialized view 的依赖列表。请按如下格式提供依赖项 `{schema}.{view_name}`           |          |               |
| depends&#95;on&#95;validation | 是否校验在 `depends_on` 中提供的依赖是否存在。如果某个依赖未包含 schema，将在 `default` schema 上执行校验 |          | False         |

一个可刷新 materialized view 的配置示例：

```python
{{
    config(
        materialized='materialized_view',
        refreshable={
            "interval": "EVERY 5 MINUTE",
            "randomize": "1 MINUTE",
            "append": True,
            "depends_on": ['schema.depend_on_model'],
            "depends_on_validation": True
        }
    )
}}
```


#### 限制 \\{#limitations\\}

* 在 ClickHouse 中创建带有依赖关系的可刷新 materialized view (MV) 时，如果在创建时指定的依赖不存在，ClickHouse 不会抛出错误。相反，该可刷新 MV 将保持在非活动状态，等待依赖被满足后才开始处理更新或刷新。此行为是设计使然，但如果未及时处理所需依赖，可能会导致数据可用性延迟。建议用户在创建可刷新 materialized view 之前，确保所有依赖都已正确定义且已存在。
* 截至目前，MV 与其依赖之间不存在实际的 “dbt linkage”，因此无法保证创建顺序。
* 尚未在多个 MV 指向同一目标模型的场景下对可刷新功能进行测试。

### 物化：字典（实验性） \\{#materialization-dictionary\\}

请参阅 https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py 中的测试，
以了解如何为 ClickHouse 字典实现物化的示例

### 物化：distributed_table（实验性） \\{#materialization-distributed-table\\}

通过以下步骤创建分布式表：

1. 创建临时视图，并使用 SQL 查询以获取正确的结构
2. 基于该视图创建空的本地表
3. 基于本地表创建分布式表
4. 将数据插入分布式表，这样数据就会在分片之间进行分布，而不会被重复写入。

注意：

- dbt-clickhouse 查询现在会自动包含 `insert_distributed_sync = 1` 这一设置项，以确保下游增量物化操作能够正确执行。
  这可能会导致某些分布式表插入操作比预期更慢。

#### 分布式表模型示例 \{#distributed-table-model-example\}

```sql
{{
    config(
        materialized='distributed_table',
        order_by='id, created_at',
        sharding_key='cityHash64(id)',
        engine='ReplacingMergeTree'
    )
}}

select id, created_at, item
from {{ source('db', 'table') }}
```


#### 自动生成的迁移 \{#distributed-table-generated-migrations\}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = ReplacingMergeTree
    ORDER BY (id, created_at);

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```


#### 配置 \\{#distributed-table-configurations\\}

本物化类型特有的配置如下：

| Option     | Description                                                        | Default if any |
| ---------- | ------------------------------------------------------------------ | -------------- |
| sharding_key | 在向分布式引擎表中插入数据时，分片键用于决定目标服务器。分片键可以是随机值，也可以是哈希函数的输出结果 | `rand()`)      |

### materialization: distributed_incremental（实验性） \\{#materialization-distributed-incremental\\}

基于与分布式表相同理念构建的增量模型，主要难点在于正确处理所有增量策略。

1. _Append 策略_ 只是将数据插入分布式表。
2. _Delete+Insert 策略_ 会创建分布式临时表，以便在每个分片上处理全部数据。
3. _Default（旧版）策略_ 出于同样的原因，会创建分布式临时表和中间表。

只会替换分片表，因为分布式表本身不存储数据。
仅当启用了 `full_refresh` 模式或表结构可能发生变化时，才会重新加载分布式表。

#### 分布式增量模型示例 \{#distributed-incremental-model-example\}

```sql
{{
    config(
        materialized='distributed_incremental',
        engine='MergeTree',
        incremental_strategy='append',
        unique_key='id,created_at'
    )
}}

select id, created_at, item
from {{ source('db', 'table') }}
```


#### 自动生成的迁移 \{#distributed-incremental-generated-migrations\}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = MergeTree;

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```


### 快照 \{#snapshot\}

dbt 快照允许随着时间推移记录可变模型的变更。这样一来，就可以对模型执行时点查询，使分析师可以“回到过去”查看模型之前的状态。ClickHouse 连接器支持此功能，并可使用以下语法进行配置：

在 `snapshots/<model_name>.sql` 中的配置块：

```python
{{
   config(
     schema = "<schema-name>",
     unique_key = "<column-name>",
     strategy = "<strategy>",
     updated_at = "<updated-at-column-name>",
   )
}}
```

如需了解更多关于配置的信息，请参阅 [snapshot configs](https://docs.getdbt.com/docs/build/snapshots#snapshot-configs) 参考页面。


### 约定与约束 \\{#contracts-and-constraints\\}

仅支持精确匹配的列类型约定。例如，如果约定中指定的列类型为 UInt32，而模型返回的是 UInt64 或其他整数类型，则会执行失败。
ClickHouse 也 _只_ 支持在整个表/模型级别定义的 `CHECK` 约束。不支持主键、外键、唯一约束以及列级别的 CHECK 约束。
（参见 ClickHouse 关于主键 / ORDER BY 键的文档。）

### 其他 ClickHouse 宏 \\{#additional-clickhouse-macros\\}

#### 模型物化实用宏 \\{#model-materialization-utility-macros\\}

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

#### s3Source 辅助宏 \\{#s3source-helper-macro\\}

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

#### 跨数据库宏支持 \\{#cross-database-macro-support\\}

dbt-clickhouse 现在支持 `dbt Core` 中包含的大多数跨数据库宏，但有以下例外情况：

* 在 ClickHouse 中，`split_part` SQL 函数是通过 splitByChar 函数实现的。该函数要求用于拆分的分隔符必须是常量字符串，因此在此宏中使用的 `delimeter` 参数会被解释为字符串，而不是列名
* 同样地，ClickHouse 中的 `replace` SQL 函数要求 `old_chars` 和 `new_chars` 参数为常量字符串，因此在调用此宏时，这些参数会被解释为字符串，而不是列名。

## 目录支持 \\{#catalog-support\\}

### dbt Catalog 集成状态 \\{#dbt-catalog-integration-status\\}

dbt Core v1.10 引入了对 Catalog 集成的支持，使适配器能够将模型物化到管理 Apache Iceberg 等开放表格式的外部 Catalog 中。**此特性目前尚未在 dbt-clickhouse 中原生实现。**你可以在 [GitHub issue #489](https://github.com/ClickHouse/dbt-clickhouse/issues/489) 中跟踪该特性的实现进度。

### ClickHouse Catalog 支持 \\{#clickhouse-catalog-support\\}

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


### 关于变通方案的说明 \\{#benefits-workarounds\\}

这些变通方案的优点是：

* 你可以立即访问不同类型的外部表和外部 catalog，而无需等待原生 dbt catalog 集成。
* 当原生 catalog 支持可用时，你将拥有一条平滑的迁移路径。

但目前也存在一些限制：

* **手动设置：**在可以在 dbt 中引用之前，必须先在 ClickHouse 中手动创建 Iceberg 表和 catalog 数据库。
* **无 catalog 级别 DDL：**dbt 无法管理 catalog 级别的操作，比如在外部 catalog 中创建或删除 Iceberg 表。因此，目前你无法通过 dbt 连接器来创建它们。未来可能会加入使用 `Iceberg()` 引擎创建表的能力。
* **写入操作：**目前对 Iceberg/Data Catalog 表的写入能力有限。请查看 ClickHouse 文档以了解可用的选项。