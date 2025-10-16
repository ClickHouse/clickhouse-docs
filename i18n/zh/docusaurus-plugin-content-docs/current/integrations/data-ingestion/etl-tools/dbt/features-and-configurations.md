---
'sidebar_label': '功能和配置'
'slug': '/integrations/dbt/features-and-configurations'
'sidebar_position': 2
'description': '使用 dbt 与 ClickHouse 的功能'
'keywords':
- 'clickhouse'
- 'dbt'
- 'features'
'title': '功能和配置'
'doc_type': 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 特性和配置

<ClickHouseSupportedBadge/>

在本节中，我们提供有关 dbt 与 ClickHouse 一些可用特性的文档。

<TOCInline toc={toc}  maxHeadingLevel={3} />
## Profile.yml 配置 {#profile-yml-configurations}

要从 dbt 连接到 ClickHouse，您需要将 [profile](https://docs.getdbt.com/docs/core/connect-data-platform/connection-profiles) 添加到您的 `profiles.yml` 文件中。 ClickHouse 配置文件遵循以下语法：

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

      # Native (clickhouse-driver) connection settings
      sync_request_timeout: [5] # Timeout for server ping
      compress_block_size: [1048576] # Compression block size if compression is enabled
```
### Schema 与 Database {#schema-vs-database}

dbt 模型关系标识符 `database.schema.table` 与 Clickhouse 不兼容，因为 Clickhouse 不支持 `schema`。因此，我们使用简化的方法 `schema.table`，其中 `schema` 是 Clickhouse 数据库。使用 `default` 数据库并不推荐。
### SET Statement 警告 {#set-statement-warning}

在许多环境中，使用 SET 语句在所有 DBT 查询中持久化 ClickHouse 设置是不可靠的，可能会导致意外的失败。这在通过负载均衡器使用 HTTP 连接时尤其如此，负载均衡器将查询分配到多个节点（例如 ClickHouse cloud），尽管在某些情况下，这也可能在本机 ClickHouse 连接中发生。因此，我们建议作为最佳实践在 DBT 配置文件的 "custom_settings" 属性中配置任何所需的 ClickHouse 设置，而不是依赖于偶尔建议的 pre-hook "SET" 语句。
### 设置 `quote_columns` {#setting-quote_columns}

为了防止警告，请确保在您的 `dbt_project.yml` 中显式设置 `quote_columns` 的值。有关更多信息，请参见 [关于 quote_columns 的文档](https://docs.getdbt.com/reference/resource-configs/quote_columns)。

```yaml
seeds:
  +quote_columns: false  #or `true` if you have CSV column headers with spaces
```
### 关于 ClickHouse 集群 {#about-the-clickhouse-cluster}

配置文件中的 `cluster` 设置使 dbt-clickhouse 可以在 ClickHouse 集群上运行。如果在配置文件中设置了 `cluster`，**默认情况下，所有模型将使用 `ON CLUSTER` 子句创建**——除了那些使用 **Replicated** 引擎的模型。这包括：

- 数据库创建
- 视图物化
- 表和增量物化
- 分布式物化

Replicated 引擎将**不**包含 `ON CLUSTER` 子句，因为它们旨在内部管理复制。

要**选择不**基于集群为特定模型创建，可以添加 `disable_on_cluster` 配置：

```sql
{{ config(
        engine='MergeTree',
        materialized='table',
        disable_on_cluster='true'
    )
}}

```

使用非复制引擎的表和增量物化不会受到 `cluster` 设置的影响（模型将仅在连接的节点上创建）。
#### 兼容性 {#compatibility}

如果模型是在没有 `cluster` 设置的情况下创建的，dbt-clickhouse 会检测到这种情况并为该模型的所有 DDL/DML 运行没有 `on cluster` 子句的操作。
## 有关功能的一般信息 {#general-information-about-features}
### 一般表配置 {#general-table-configurations}

| 选项                  | 描述                                                                                                                                                                                                                                                                                                           | 默认值         |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| engine               | 创建表时要使用的表引擎（表的类型）                                                                                                                                                                                                                                                                              | `MergeTree()`  |
| order_by             | 列名称或任意表达式的元组。这允许您创建一个小的稀疏索引，有助于更快地查找数据。                                                                                                                                                                                                                                  | `tuple()`      |
| partition_by         | 分区是根据指定标准对表中记录的逻辑组合。分区键可以是表列中的任何表达式。                                                                                                                                                                                                                                      |                |
| sharding_key         | 分片键确定在插入分布式引擎表时目标服务器。分片键可以是随机的或作为哈希函数的输出                                                                                                                                                                                                                          | `rand()`       |
| primary_key          | 类似于 order_by 的 ClickHouse 主键表达式。如果未指定，ClickHouse 将使用 order by 表达式作为主键                                                                                                                                                                                                             |                |
| unique_key           | 唯一标识行的列名称元组。用于增量模型更新。                                                                                                                                                                                                                                                                          |                |
| settings             | 用于与此模型的 DDL 语句（如 'CREATE TABLE'）一起使用的“TABLE”设置的映射/字典                                                                                                                                                                                                                                   |                |
| query_settings       | 用于 `INSERT` 或 `DELETE` 语句的 ClickHouse 用户级设置的映射/字典，结合此模型使用                                                                                                                                                                                                                                     |                |
| ttl                  | 与表一起使用的 TTL 表达式。TTL 表达式是一个字符串，可以用来指定表的 TTL。                                                                                                                                                                                                                                       |                |
| indexes              | 要创建的索引列表，仅适用于 `table` 物化。要查看示例，请查看 ([#397](https://github.com/ClickHouse/dbt-clickhouse/pull/397))                                                                                                                                                                                    |                |
| sql_security         | 允许您指定在执行视图底层查询时要使用的 ClickHouse 用户。[`SQL SECURITY`](https://clickhouse.com/docs/sql-reference/statements/create/view#sql_security) 有两个合法值：`definer` `invoker`。                                                                                                       |                |
| definer              | 如果 `sql_security` 设置为 `definer`，您必须在 `definer` 子句中指定任何现有用户或 `CURRENT_USER`。                                                                                                                                                                                                                 |                |
### 支持的表引擎 {#supported-table-engines}

| 类型                   | 详细信息                                                                                   |
|------------------------|-------------------------------------------------------------------------------------------|
| MergeTree（默认）       | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB        | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |
### 实验性支持的表引擎 {#experimental-supported-table-engines}

| 类型              | 详细信息                                                                   |
|-------------------|---------------------------------------------------------------------------|
| Distributed Table | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| Dictionary        | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

如果您在使用上述引擎从 dbt 连接到 ClickHouse 时遇到问题，请在 [这里](https://github.com/ClickHouse/dbt-clickhouse/issues) 报告问题。
### 关于模型设置的说明 {#a-note-on-model-settings}

ClickHouse 有几种类型/级别的“设置”。在上面的模型配置中，两种类型的设置是可配置的。`settings` 指的是在 `CREATE TABLE/VIEW` 类型的 DDL 语句中使用的 `SETTINGS` 子句，因此这通常是特定于特定 ClickHouse 表引擎的设置。新的 `query_settings` 用于向用于模型物化的 `INSERT` 和 `DELETE` 查询添加 `SETTINGS` 子句（包括增量物化）。ClickHouse 有数百个设置，并且并不总是清楚哪个是“表”设置，哪个是“用户”设置（尽管后者通常可以在 `system.settings` 表中找到）。一般来说，推荐使用默认设置，任何使用这些属性的情况都应该仔细研究和测试。
### 列配置 {#column-configuration}

> **_注意:_** 以下列配置选项需要强制执行 [模型契约](https://docs.getdbt.com/docs/collaborate/govern/model-contracts)。

| 选项 | 描述                                                                                                                                                | 默认值         |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| codec  | 由传递给列的 DDL 中的 `CODEC()` 的参数组成的字符串。例如： `codec: "Delta, ZSTD"` 将被编译为 `CODEC(Delta, ZSTD)`。    |    
| ttl    | 由列的 DDL 中定义 TTL 规则的 TTL（生存时间）表达式的字符串。例如： `ttl: ts + INTERVAL 1 DAY` 将被编译为 `TTL ts + INTERVAL 1 DAY`。 |
#### 示例 {#example}

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
## 特性 {#features}
### 物化: 视图 {#materialization-view}

dbt 模型可以作为 [ClickHouse 视图](https://clickhouse.com/docs/en/sql-reference/table-functions/view/) 创建，并使用以下语法配置：

项目文件 (`dbt_project.yml`):
```yaml
models:
  <resource-path>:
    +materialized: view
```

或配置块 （`models/<model_name>.sql`）:
```python
{{ config(materialized = "view") }}
```
### 物化: 表 {#materialization-table}

dbt 模型可以作为 [ClickHouse 表](https://clickhouse.com/docs/en/operations/system-tables/tables/) 创建，并使用以下语法进行配置：

项目文件 (`dbt_project.yml`):
```yaml
models:
  <resource-path>:
    +materialized: table
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
```

或配置块 （`models/<model_name>.sql`）:
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
### 物化: 增量 {#materialization-incremental}

表模型将在每次 dbt 执行时被重建。这对于较大结果集或复杂转换可能是不可行且极其昂贵的。为了解决这个挑战并减少构建时间，dbt 模型可以创建为增量 ClickHouse 表，并使用以下语法进行配置：

在 `dbt_project.yml` 中的模型定义：
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

或在 `models/<model_name>.sql` 中的配置块：
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
#### 配置 {#configurations}
针对这种物化类型的特定配置如下所示：

| 选项                   | 描述                                                                                                                                                                                                                                                       | 是否必需?                                                                            |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `unique_key`             | 唯一标识行的列名称元组。有关唯一性约束的更多详细信息，请参见 [这里](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional)。                                                                                       | 必需。如果未提供，已更改的行将被添加两次到增量表中。 |
| `inserts_only`           | 已被弃用，取而代之以 `append` 增量 `strategy`，操作方式相同。如果为增量模型设置为 True，增量更新将直接插入到目标表中，而无需创建中间表。如果设置了 `inserts_only`，则会忽略 `incremental_strategy`。 | 可选（默认： `False`）                                                          |
| `incremental_strategy`   | 增量物化使用的策略。支持 `delete+insert`、`append`、`insert_overwrite` 或 `microbatch`。有关策略的更多详细信息，请参见 [这里](/integrations/dbt/features-and-configurations#incremental-model-strategies)。 | 可选（默认： 'default'）                                                        |
| `incremental_predicates` | 将应用于增量物化的附加条件（仅应用于 `delete+insert` 策略）。                                                                                                                                                                                      | 可选                                                                 |
#### 增量模型策略 {#incremental-model-strategies}

`dbt-clickhouse` 支持三种增量模型策略。
##### 默认（遗留）策略 {#default-legacy-strategy}

历史上，ClickHouse 仅有限支持更新和删除，以异步 "突变" 的形式。为了模拟期望的 dbt 行为，dbt-clickhouse 默认创建一个新的临时表，包含所有未受影响（未删除、未更改）的“旧”记录，以及任何新记录或更新记录，然后用这个临时表与现有的增量模型关系进行交换。这是唯一保留原始关系的策略，如果在操作完成之前出现问题；然而，由于它涉及对原始表的完全复制，因此执行可能非常昂贵且缓慢。
##### Delete+Insert 策略 {#delete-insert-strategy}

ClickHouse 在版本 22.8 中添加了“轻量级删除”作为实验性功能。轻量级删除比 ALTER TABLE ... DELETE 操作要快得多，因为它们不需要重写 ClickHouse 数据部分。增量策略 `delete+insert` 利用轻量级删除来实现增量物化，性能显著优于 "遗留" 策略。然而，使用此策略时有重要的注意事项：

- 必须在 ClickHouse 服务器上启用轻量级删除，使用设置 `allow_experimental_lightweight_delete=1` 或者您必须在您的配置文件中设置 `use_lw_deletes=true`（这将为您的 dbt 会话启用该设置）
- 轻量级删除现在已准备好用于生产，但在 23.3 之前的 ClickHouse 版本可能存在性能和其他问题。
- 此策略直接在受影响的表/关系上操作（而不创建任何中间或临时表），因此如果在操作过程中出现问题，增量模型中的数据很可能处于无效状态
- 使用轻量级删除时，dbt-clickhouse 启用了设置 `allow_nondeterministic_mutations`。在一些非常罕见的情况下，使用非确定性增量谓词可能会导致更新/删除项出现竞态条件（以及 ClickHouse 日志中的相关日志消息）。为了确保结果一致，增量谓词应该仅包含在增量物化期间不会被修改的数据的子查询。
##### Microbatch 策略（需要 dbt-core >= 1.9） {#microbatch-strategy}

增量策略 `microbatch` 自版本 1.9 起已成为 dbt-core 的一部分，旨在有效处理大型时间序列数据转换。在 dbt-clickhouse 中，它基于现有的 `delete_insert` 增量策略，通过根据 `event_time` 和 `batch_size` 模型配置将增量划分为预定义的时间序列批次。

除了处理大型转换外，microbatch 还提供了以下功能：
- [重新处理失败的批次](https://docs.getdbt.com/docs/build/incremental-microbatch#retry)。
- 自动检测 [并行批处理执行](https://docs.getdbt.com/docs/build/parallel-batch-execution)。
- 消除 [回填](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills) 中复杂条件逻辑的需求。

有关微批处理使用的详细信息，请参阅 [官方文档](https://docs.getdbt.com/docs/build/incremental-microbatch)。
###### 可用的微批处理配置 {#available-microbatch-configurations}

| 选项             | 描述                                                                                                                                                                                                                                                                                                                                | 默认值         |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| event_time         | 表示“行发生的时间”的列。是您的微批处理模型和任何应进行过滤的直接父项所必需的。                                                                                                                                                                                                                                             |                |
| begin              | 微批处理模型的“开始时间”。这是任何初始或全刷新的构建的起点。例如，`begin` = '2023-10-01' 的每日微批处理模型在 2024-10-01 运行时将处理 366 个批次（因为它是闰年！）以及“今天”的批次。                                                                                                         |                |
| batch_size         | 批处理的粒度。支持的值为 `hour`、`day`、`month` 和 `year`                                                                                                                                                                                                                                                                       |                |
| lookback           | 在最新的书签之前处理 X 批，以捕捉迟到的记录。                                                                                                                                                                                                                                                                                       | 1              |
| concurrent_batches | 覆盖 dbt 自动检测以同时运行批次（同时进行）。有关 [配置并行批次](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches) 的更多信息。设置为 true 会并行运行批次；设置为 false 会顺序（逐个）运行批次。                                                                                        |                |
##### Append 策略 {#append-strategy}

此策略取代了之前版本的 dbt-clickhouse 中的 `inserts_only` 设置。这种方法只是将新行附加到现有关系中。因此，重复的行不会被消除，并且没有临时或中间表。如果在数据中允许重复，或者通过增量查询的 WHERE 子句/过滤器将其排除，那么这是最快的方法。
##### insert_overwrite 策略（实验性） {#insert-overwrite-strategy}

> [重要]  
> 当前，insert_overwrite 策略在分布式物化中未完全功能。

执行以下步骤：

1. 创建一个与增量模型关系相同结构的暂存（临时）表： `CREATE TABLE <staging> AS <target>`。
2. 将仅新记录（由 `SELECT` 生成）插入暂存表。
3. 仅将暂存表中存在的新分区替换到目标表中。

这种方法具有以下优势：

- 它比默认策略更快，因为它不复制整个表。
- 它比其他策略更安全，因为它在 INSERT 操作成功完成之前不会修改原始表：如果中间发生失败，原始表不会被修改。
- 它实施了“分区不变性”的数据工程最佳实践，这简化了增量和并行数据处理、回滚等。

该策略要求在模型配置中设置 `partition_by`。忽略所有其他策略特定的模型配置参数。
### 物化: 物化视图（实验性） {#materialized-view}

`materialized_view` 物化应该是一个来自现有（源）表的 `SELECT`。适配器将创建一个目标表，使用模型名称，以及一个 ClickHouse 物化视图，名称为 `<model_name>_mv`。与 PostgreSQL 不同，ClickHouse 物化视图不是“静态”的（没有对应的 REFRESH 操作）。相反，它充当“插入触发器”，会根据定义的 `SELECT` “转换”在插入到源表的行中向目标表插入新行。有关如何使用此功能的介绍性示例，请参见 [测试文件](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)。

Clickhouse 提供了多个物化视图写入相同目标表的能力。为了支持这一点，在 dbt-clickhouse 中，您可以在模型文件中构建一个 `UNION`，使每个物化视图的 SQL 用形式 `--my_mv_name:begin` 和 `--my_mv_name:end` 的注释包装。

例如，以下代码将构建两个物化视图，它们都将数据写入模型的相同目标表。物化视图的名称将为 `<model_name>_mv1` 和 `<model_name>_mv2`：

```sql
--mv1:begin
select a,b,c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a,b,c from {{ source('raw', 'table_2') }}
--mv2:end
```

> 重要！
>
> 在更新包含多个物化视图（MVs）的模型时，特别是在重命名其中一个 MV 名称时，dbt-clickhouse 并不会自动删除旧的 MV。相反，您将遇到以下警告：
`警告 - 检测到表 <previous table name> 与模型名称 <your model name> 的模式相同，但在此运行中未找到。如果这是之前属于该模型的重命名 mv，请手动删除 (!!!)`
#### 数据追赶 {#data-catch-up}

目前，在创建物化视图（MV）时，目标表首先用历史数据填充，然后才创建 MV 本身。

换句话说，dbt-clickhouse 首先创建目标表，并根据为 MV 定义的查询预填充历史数据。仅在此步骤之后才创建 MV。

如果您希望在创建 MV 时不预填充历史数据，可以通过将追赶配置设置为 False 来禁用此行为：

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False
)}}
```
#### 可刷新的物化视图 {#refreshable-materialized-views}

要使用 [可刷新的物化视图](https://clickhouse.com/docs/en/materialized-view/refreshable-materialized-view)，请根据需要在您的 MV 模型中调整以下配置（所有这些配置必须设置在可刷新的配置对象内部）：

| 选项                | 描述                                                                                                                                                              | 是否必需 | 默认值       |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|--------------|
| refresh_interval     | 区间子句（必需）                                                                                                                                                   | 是       |              |
| randomize           | 随机化子句，将出现在 `RANDOMIZE FOR` 之后                                                                                                                     |          |              |
| append              | 如果设置为 `True`，每次刷新都会向表中插入行而不删除现有行。插入不是原子的，就像常规的 INSERT SELECT 一样。                                                                          |          | False        |
| depends_on          | 可刷新的 MV 的依赖关系列表。请按以下格式提供依赖关系 `{schema}.{view_name}`                                                                                     |          |              |
| depends_on_validation | 是否验证提供的依赖关系 `depends_on` 的存在。如果依赖项不包含模式，则在模式 `default` 上执行验证。                                                                             |          | False        |

可刷新的物化视图的配置示例：

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
#### 限制 {#limitations}

* 在 ClickHouse 中创建具有依赖关系的可刷新的物化视图（MV）时，如果指定的依赖项在创建时不存在，ClickHouse 不会抛出错误。相反，可刷新的 MV 将保持非活动状态，等待依赖项满足后才开始处理更新或刷新。此行为是设计使然，但如果所需的依赖项未及时处理，可能会导致数据可用性延迟。建议用户在创建可刷新的物化视图之前，确保所有依赖项已正确定义并存在。
* 目前，没有实际的 “dbt 关联” 在 MV 与其依赖项之间，因此创建顺序没有保证。
* 可刷新功能未经过测试，有多个 MV 指向同一目标模型。
### 物化: 字典（实验性） {#materialization-dictionary}

请参见测试
在 https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py 中的示例，了解如何实现 ClickHouse 字典的物化。
### 物化: 分布式表（实验性） {#materialization-distributed-table}

创建分布式表，步骤如下：

1. 创建临时视图，通过 SQL 查询获取正确的结构
2. 根据视图创建空的本地表
3. 基于本地表创建分布式表。
4. 数据插入分布式表，因此它在分片之间分配，而没有重复。

注意：
- dbt-clickhouse 查询现在自动包括设置 `insert_distributed_sync = 1`，以确保下游增量物化操作正确执行。这可能导致某些分布式表插入的运行速度比预期慢。
#### 分布式表模型示例 {#distributed-table-model-example}

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
#### 生成的迁移 {#distributed-table-generated-migrations}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = ReplacingMergeTree
    ORDER BY (id, created_at)
    SETTINGS index_granularity = 8192;

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```
### 物化: 分布式增量（实验性） {#materialization-distributed-incremental}

增量模型基于与分布式表相同的思路，主要困难在于正确处理所有增量策略。

1. _追加策略_ 仅将数据插入到分布式表中。
2. _删除+插入_ 策略创建分布式临时表，以处理每个分片上的所有数据。
3. _默认（遗留）策略_ 创建分布式临时和中间表，原因相同。

只有分片表会被替换，因为分布式表不会保留数据。分布式表仅在启用 full_refresh 模式或表结构可能发生变化时重新加载。
#### 生成的迁移 {#distributed-incremental-generated-migrations}

```sql
CREATE TABLE db.table_local on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = MergeTree
    SETTINGS index_granularity = 8192;

CREATE TABLE db.table on cluster cluster (
    `id` UInt64,
    `created_at` DateTime,
    `item` String
)
    ENGINE = Distributed ('cluster', 'db', 'table_local', cityHash64(id));
```
### 快照 {#snapshot}

dbt 快照允许记录对可变模型随时间变化的记录。这反过来允许对模型进行时间点查询，分析师可以“回顾过去”查看模型的先前状态。此功能由 ClickHouse 连接器支持，并使用以下语法进行配置：

`snapshots/<model_name>.sql` 中的配置块：
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

有关配置的更多信息，请查看 [快照配置](https://docs.getdbt.com/docs/build/snapshots#snapshot-configs) 参考页面。
### 合同和约束 {#contracts-and-constraints}

仅支持精确列类型合同。例如，具有 UInt32 列类型的合同将在模型返回 UInt64 或其他整数类型时失败。ClickHouse 还**仅**支持整个表/模型的 `CHECK` 约束。主键、外键、唯一和列级别的 CHECK 约束不受支持。
（请参见 ClickHouse 文档中的主键/排序键。）
### 额外的 ClickHouse 宏 {#additional-clickhouse-macros}
#### 模型物化实用宏 {#model-materialization-utility-macros}

包含以下宏以方便创建特定于 ClickHouse 的表和视图：

- `engine_clause` -- 使用 `engine` 模型配置属性分配 ClickHouse 表引擎。dbt-clickhouse 默认使用 `MergeTree` 引擎。
- `partition_cols` -- 使用 `partition_by` 模型配置属性分配 ClickHouse 分区键。默认情况下不分配分区键。
- `order_cols` -- 使用 `order_by` 模型配置分配 ClickHouse 的排序键。如果未指定，ClickHouse 将使用空元组()，表将无序。
- `primary_key_clause` -- 使用 `primary_key` 模型配置属性分配 ClickHouse 主键。默认情况下会设置主键，ClickHouse 将使用排序子句作为主键。
- `on_cluster_clause` -- 通过 `cluster` 配置文件属性为某些 dbt 操作添加 `ON CLUSTER` 子句：分布式物化、视图创建、数据库创建。
- `ttl_config` -- 使用 `ttl` 模型配置属性分配 ClickHouse 表的 TTL 表达式。默认情况下不分配 TTL。
#### s3Source 助手宏 {#s3source-helper-macro}

`s3source` 宏简化了直接从 S3 选择 ClickHouse 数据的过程，使用 ClickHouse S3 表函数。它通过从命名配置字典中填充 S3 表函数参数来实现（字典的名称必须以 `s3` 结尾）。宏首先在配置文件的 `vars` 中查找字典，然后在模型配置中查找。字典可以包含以下任何键，用于填充 S3 表函数的参数：

| 参数名称           | 描述                                                                                                                                                                                    |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bucket             | 桶的基本 URL，例如 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi`。如果未提供协议，则假定为 `https://`。                                                  |
| path               | 用于表查询的 S3 路径，例如 `/trips_4.gz`。支持 S3 通配符。                                                                                                                         |
| fmt                | 被引用 S3 对象的预期 ClickHouse 输入格式（例如 `TSV` 或 `CSVWithNames`）。                                                                                                         |
| structure          | 桶中数据的列结构，以名称/数据类型对的列表形式表示，例如 `['id UInt32', 'date DateTime', 'value String']`。如果未提供，ClickHouse 将推断结构。                                  |
| aws_access_key_id  | S3 访问密钥 ID。                                                                                                                                                                      |
| aws_secret_access_key | S3 秘密密钥。                                                                                                                                                                        |
| role_arn           | 用于安全访问 S3 对象的 ClickhouseAccess IAM 角色的 ARN。有关更多信息，请参见 [此文档](https://clickhouse.com/docs/en/cloud/security/secure-s3)。                            |
| compression        | 与 S3 对象一起使用的压缩方法。如果未提供，ClickHouse 将根据文件名尝试确定压缩类型。                                                                                                |

有关如何使用此宏的示例，请参见 [S3 测试文件](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py)。
#### 跨数据库宏支持 {#cross-database-macro-support}

dbt-clickhouse 支持现在包含在 `dbt Core` 中的大多数跨数据库宏，以下是例外情况：

* `split_part` SQL 函数在 ClickHouse 中使用 splitByChar 函数实现。此函数要求使用常量字符串作为 "split" 分隔符，因此用于此宏的 `delimeter` 参数将被解释为字符串，而不是列名。
* 类似地，ClickHouse 中的 `replace` SQL 函数要求 `old_chars` 和 `new_chars` 参数为常量字符串，因此在调用此宏时这些参数将被解释为字符串而不是列名。
