---
sidebar_label: '功能和配置'
slug: /integrations/dbt/features-and-configurations
sidebar_position: 2
description: '用于将 dbt 与 ClickHouse 结合使用的功能'
keywords: ['clickhouse', 'dbt', 'features']
title: '功能和配置'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 功能和配置 {#features-and-configurations}

<ClickHouseSupportedBadge/>

本节将介绍在 ClickHouse 中使用 dbt 时可用的一些功能。

<TOCInline toc={toc}  maxHeadingLevel={3} />

## Profile.yml 配置 {#profile-yml-configurations}

要使用 dbt 连接到 ClickHouse，需在 `profiles.yml` 文件中添加一个 [profile](https://docs.getdbt.com/docs/core/connect-data-platform/connection-profiles)。ClickHouse 的 profile 遵循以下语法：

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
      port: [8123]  # 若未设置,根据 secure 和 driver 设置默认为 8123、8443、9000 或 9440 
      user: [default] # 执行所有数据库操作的用户
      password: [<empty string>] # 用户密码
      cluster: [<empty string>] # 若设置,某些 DDL/表操作将使用此集群通过 `ON CLUSTER` 子句执行。分布式物化需要此设置。详见下文 ClickHouse 集群部分。
      verify: [True] # 使用 TLS/SSL 时验证 TLS 证书
      secure: [False] # 使用 TLS(native 协议)或 HTTPS(http 协议)
      client_cert: [null] # .pem 格式 TLS 客户端证书的路径
      client_cert_key: [null] # TLS 客户端证书私钥的路径
      retries: [1] # 重试"可重试"数据库异常(如 503 'Service Unavailable' 错误)的次数
      compression: [<empty string>] # 若为真值则使用 gzip 压缩(http),或指定 native 连接的压缩类型
      connect_timeout: [10] # 建立 ClickHouse 连接的超时时间(秒)
      send_receive_timeout: [300] # 从 ClickHouse 服务器接收数据的超时时间(秒)
      cluster_mode: [False] # 使用专为优化 Replicated 数据库操作设计的特定设置(推荐用于 ClickHouse Cloud)
      use_lw_deletes: [False] # 使用 `delete+insert` 策略作为默认增量策略。
      check_exchange: [True] # 验证 ClickHouse 是否支持原子 EXCHANGE TABLES 命令。(大多数 ClickHouse 版本无需此项)
      local_suffix: [_local] # 分布式物化中分片本地表的表后缀。
      local_db_prefix: [<empty string>] # 分布式物化中分片本地表的数据库前缀。若为空,则使用与分布式表相同的数据库。
      allow_automatic_deduplication: [False] # 为 Replicated 表启用 ClickHouse 自动去重
      tcp_keepalive: [False] # 仅限 Native 客户端,指定 TCP keepalive 配置。自定义 keepalive 设置格式为 [idle_time_sec, interval_sec, probes]。
      custom_settings: [{}] # 连接的自定义 ClickHouse 设置字典/映射 - 默认为空。
      database_engine: '' # 创建新 ClickHouse 模式(数据库)时使用的数据库引擎。若未设置(默认),新数据库将使用默认 ClickHouse 数据库引擎(通常为 Atomic)。
      threads: [1] # 运行查询时使用的线程数。将其设置为大于 1 之前,请务必阅读[读后写一致性](#read-after-write-consistency)部分。
      
      # Native (clickhouse-driver) 连接设置
      sync_request_timeout: [5] # 服务器 ping 超时时间
      compress_block_size: [1048576] # 启用压缩时的压缩块大小
```


### 模式与数据库 {#schema-vs-database}

dbt 模型关系标识符 `database.schema.table` 与 ClickHouse 不兼容，因为 ClickHouse 不支持 `schema`。
因此我们采用简化形式 `schema.table`，其中 `schema` 实际上就是 ClickHouse 的数据库。不推荐使用 `default` 数据库。

### SET 语句警告 {#set-statement-warning}

在许多环境中，使用 SET 语句在所有 dbt 查询中持久化 ClickHouse 设置并不可靠，并可能导致意外失败。对于通过负载均衡器使用 HTTP 连接并将查询分发到多个节点的场景（例如 ClickHouse Cloud），这一点尤为明显；在某些情况下，这种问题在原生 ClickHouse 连接中也可能出现。因此，我们建议将所有必需的 ClickHouse 设置配置在 dbt profile 的 "custom_settings" 属性中，作为最佳实践，而不是依赖在 pre-hook 中执行 "SET" 语句（尽管偶尔会有这种建议）。

### 设置 `quote_columns` {#setting-quote_columns}

为避免出现警告，请务必在 `dbt_project.yml` 中明确设置 `quote_columns` 的值。更多信息请参阅[有关 `quote_columns` 的文档](https://docs.getdbt.com/reference/resource-configs/quote_columns)。

```yaml
seeds:
  +quote_columns: false  #若 CSV 列标题含有空格,则设为 `true`
```


### 关于 ClickHouse 集群 {#about-the-clickhouse-cluster}

在使用 ClickHouse 集群时，需要考虑两点：

* 设置 `cluster` 参数。
* 确保写入后的读取一致性，尤其是在使用多个 `threads` 时。

#### 集群设置 {#cluster-setting}

配置文件中的 `cluster` 参数允许 dbt-clickhouse 在 ClickHouse 集群上运行。若在配置文件中设置了 `cluster`，则**所有模型默认都会使用 `ON CLUSTER` 子句进行创建**——使用 **Replicated** 引擎的模型除外。这包括：

* 数据库创建
* 视图物化
* 表和增量物化
* Distributed 物化

Replicated 引擎**不会**包含 `ON CLUSTER` 子句，因为它们被设计为在内部管理复制。

若要针对某个特定模型**不使用**基于集群的创建方式，请添加 `disable_on_cluster` 配置：

```sql
{{ config(
        engine='MergeTree',
        materialized='table',
        disable_on_cluster='true'
    )
}}

```

使用非复制引擎的 table 和 incremental 物化不会受到 `cluster` 设置的影响（模型只会在当前连接的节点上创建）。

**兼容性**

如果某个模型是在没有 `cluster` 设置的情况下创建的，dbt-clickhouse 会识别这一情况，并在对该模型执行所有 DDL/DML 时不使用 `on cluster` 子句。


#### 写后读一致性 {#read-after-write-consistency}

dbt 依赖写入后读取（read-after-insert）的一致性模型。如果无法保证所有操作都发送到同一个副本，那么对于具有多个副本的 ClickHouse 集群，这种一致性模型就不兼容。在你日常使用 dbt 的过程中，可能不会遇到问题，但可以根据集群情况采用一些策略来保证这一点：

- 如果你使用的是 ClickHouse Cloud 集群，只需在 profile 的 `custom_settings` 属性中设置 `select_sequential_consistency: 1`。你可以在[此处](/operations/settings/settings#select_sequential_consistency)找到关于该设置的更多信息。
- 如果你使用的是自托管集群，请确保所有 dbt 请求都发送到同一个 ClickHouse 副本。如果其前面有负载均衡器，尝试使用 `replica aware routing` / `sticky sessions` 等机制，以始终访问同一副本。在 ClickHouse Cloud 之外的集群中添加设置 `select_sequential_consistency = 1`[是不推荐的](/operations/settings/settings#select_sequential_consistency)。

## 功能概览 {#general-information-about-features}

### 通用模型配置 {#general-model-configurations}

下表展示了一些可用物化类型所共享的配置。有关 dbt 模型通用配置的详细信息，请参阅 [dbt 文档](https://docs.getdbt.com/category/general-configs)：

| Option             | Description                                                                                                                         | Default if any |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| engine             | 在创建表时使用的表引擎（表类型）                                                                                                                    | `MergeTree()`  |
| order_by           | 由列名或任意表达式组成的元组。这可以创建一个较小的稀疏索引，用于更快速地查找数据。                                                                                           | `tuple()`      |
| partition_by       | 分区是根据指定条件对表中记录进行的逻辑组合。分区键可以是基于表列的任意表达式。                                                                                             |                |
| primary_key        | 与 order_by 类似，是 ClickHouse 的主键表达式。如果未指定，ClickHouse 将使用 order_by 表达式作为主键。                                                        |                |
| settings           | “TABLE” 级别设置的映射/字典，将在诸如 `CREATE TABLE` 的 DDL 语句中与此模型一起使用                                                                            |                |
| query_settings     | ClickHouse 用户级别设置的映射/字典，将在与此模型相关的 `INSERT` 或 `DELETE` 语句中使用                                                                         |                |
| ttl                | 与表一起使用的 TTL 表达式。TTL 表达式是一个字符串，用于为该表指定 TTL。                                                                                          |                |
| indexes            | 要创建的[数据跳过索引列表](/optimize/skipping-indexes)。详细信息参见[关于数据跳过索引](#data-skipping-indexes)。                                                             |                |
| sql_security       | 在执行视图底层查询时要使用的 ClickHouse 用户。[可接受的取值](/sql-reference/statements/create/view#sql_security)：`definer`、`invoker`。                              |                |
| definer            | 如果 `sql_security` 设置为 `definer`，则必须在 `definer` 子句中指定某个已存在的用户或 `CURRENT_USER`。                                                       |                |
| projections        | 要创建的[投影（projections）列表](/data-modeling/projections)。详细信息参见[关于投影](#projections)。                                                     |                |

#### 关于数据跳过索引 {#data-skipping-indexes}

数据跳过索引仅适用于 `table` 物化方式。要为表添加数据跳过索引列表，请使用 `indexes` 配置：

```sql
{{ config(
        materialized='table',
        indexes=[{
          'name': 'your_index_name',
          'definition': 'your_column TYPE minmax GRANULARITY 2'
        }]
) }}
```


#### 关于投影 {#projections}

你可以通过 `projections` 配置为 `table` 和 `distributed_table` 物化方式添加[投影](/data-modeling/projections)：

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

**注意**：对于分布式表，投影会应用到 `_local` 表，而不是应用到分布式代理表。


### 支持的表引擎 {#supported-table-engines}

| 类型                     | 详情                                                                                                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MergeTree (默认)         | [https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/)                   |
| HDFS                   | [https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs](https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs)                                       |
| MaterializedPostgreSQL | [https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql](https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql) |
| S3                     | [https://clickhouse.com/docs/en/engines/table-engines/integrations/s3](https://clickhouse.com/docs/en/engines/table-engines/integrations/s3)                                           |
| EmbeddedRocksDB        | [https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb](https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb)               |
| Hive                   | [https://clickhouse.com/docs/en/engines/table-engines/integrations/hive](https://clickhouse.com/docs/en/engines/table-engines/integrations/hive)                                       |

**注意**：对于 materialized view，所有 *MergeTree 引擎均受支持。

### 实验性支持的表引擎 {#experimental-supported-table-engines}

| 类型                | 详情                                                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Distributed Table | [https://clickhouse.com/docs/en/engines/table-engines/special/distributed](https://clickhouse.com/docs/en/engines/table-engines/special/distributed)。 |
| Dictionary        | [https://clickhouse.com/docs/en/engines/table-engines/special/dictionary](https://clickhouse.com/docs/en/engines/table-engines/special/dictionary)    |

如果您在使用上述任一引擎时，通过 dbt 连接 ClickHouse 遇到问题，请在[此处](https://github.com/ClickHouse/dbt-clickhouse/issues)提交 issue。

### 关于模型设置的说明 {#a-note-on-model-settings}

ClickHouse 有多种类型/级别的“设置（settings）”。在上面的模型配置中，其中两类是可配置的。`settings` 指的是在 `CREATE TABLE/VIEW` 这类 DDL 语句中使用的 `SETTINGS` 子句，因此通常是特定于某个 ClickHouse 表引擎的设置。新的
`query_settings` 用于在模型物化（包括增量物化）时，为所使用的 `INSERT` 和 `DELETE` 查询添加 `SETTINGS` 子句。
ClickHouse 中有数百个设置，而且并不总是很清楚哪些是“表”级设置，哪些是“用户”级设置（尽管后者通常可以在 `system.settings` 表中查看）。通常推荐使用默认值，若要使用这些属性，应进行充分的调研和测试。

### 列配置 {#column-configuration}

> ***注意：*** 下列列配置选项要求启用并强制执行[模型契约（model contracts）](https://docs.getdbt.com/docs/collaborate/govern/model-contracts)。

| 选项 | 描述 | 默认值（如有） |
|------|------|----------------|
| codec | 一个字符串，表示在列的 DDL 中传递给 `CODEC()` 的参数列表。例如：`codec: "Delta, ZSTD"` 会被编译为 `CODEC(Delta, ZSTD)`。 | |
| ttl   | 一个字符串，表示[生存时间（TTL）表达式](https://clickhouse.com/docs/guides/developer/ttl)，用于在列的 DDL 中定义 TTL 规则。例如：`ttl: ts + INTERVAL 1 DAY` 会被编译为 `TTL ts + INTERVAL 1 DAY`。 | |

#### Schema 配置示例 {#example-of-schema-configuration}

```yaml
models:
  - name: table_column_configs
    description: '测试列级别配置'
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


#### 添加复杂类型 {#adding-complex-types}

dbt 会通过分析用于创建模型的 SQL，自动推断每一列的数据类型。然而，在某些情况下，此过程可能无法准确确定数据类型，进而与契约中 `data_type` 属性指定的类型产生冲突。为了解决这一问题，我们建议在模型 SQL 中使用 `CAST()` 函数显式指定所需类型。例如：

```sql
{{
    config(
        materialized="materialized_view",
        engine="AggregatingMergeTree",
        order_by=["event_type"],
    )
}}

select
  -- event_type 可能会被推断为 String 类型,但我们可能更希望使用 LowCardinality(String):
  CAST(event_type, 'LowCardinality(String)') as event_type,
  -- countState() 可能会被推断为 `AggregateFunction(count)`,但我们可能更希望更改所用参数的类型:
  CAST(countState(), 'AggregateFunction(count, UInt32)') as response_count, 
  -- maxSimpleState() 可能会被推断为 `SimpleAggregateFunction(max, String)`,但我们可能也更希望更改所用参数的类型:
  CAST(maxSimpleState(event_type), 'SimpleAggregateFunction(max, LowCardinality(String))') as max_event_type
from {{ ref('user_events') }}
group by event_type
```


## 功能 {#features}

### 物化类型：view {#materialization-view}

可以将 dbt 模型创建为 [ClickHouse view](/sql-reference/table-functions/view/)，
并使用以下语法进行配置：

项目文件（`dbt_project.yml`）：

```yaml
models:
  <resource-path>:
    +materialized: view
```

或者配置块（`models/<model_name>.sql`）：

```python
{{ config(materialized = "view") }}
```


### 物化：table {#materialization-table}

可以将 dbt 模型物化为 [ClickHouse 表](/operations/system-tables/tables/)，并使用以下语法进行配置：

项目文件（`dbt_project.yml`）：

```yaml
models:
  <resource-path>:
    +materialized: table
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
```

或者配置块（`models/<model_name>.sql`）：

```python
{{ config(
    materialized = "table",
    engine = "<引擎类型>",
    order_by = [ "<列名>", ... ],
    partition_by = [ "<列名>", ... ],
      ...
    ]
) }}
```


### 物化方式：增量（incremental） {#materialization-incremental}

每次执行 dbt 时，表模型都会被重新构建。对于较大的结果集或复杂的转换，这可能不可行且代价极高。为了解决这一问题并减少构建时间，可以将 dbt 模型创建为 ClickHouse 增量表，并使用以下语法进行配置：

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

或者在 `models/<model_name>.sql` 中使用配置块：

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


#### 配置 {#incremental-configurations}

针对此物化类型的特定配置如下所示：

| Option                   | Description                                                                                                                                                               | Required?                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `unique_key`             | 唯一标识行的列名元组。有关唯一性约束的更多详细信息，请参见[此处](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional)。                                                  | 必填。如果未提供，已变更的行会被重复添加到增量表中。 |
| `inserts_only`           | 已弃用，推荐改用行为相同的 `append` 增量 `strategy`。如果对增量模型设置为 True，则增量更新会直接插入目标表，而不会创建中间表。如果设置了 `inserts_only`，则会忽略 `incremental_strategy`。                                             | 可选（默认：`False`）             |
| `incremental_strategy`   | 用于增量物化的策略。支持 `delete+insert`、`append`、`insert_overwrite` 或 `microbatch`。有关各策略的更多详细信息，请参见[此处](/integrations/dbt/features-and-configurations#incremental-model-strategies)。 | 可选（默认：&#39;default&#39;）   |
| `incremental_predicates` | 需要应用于增量物化的附加条件（仅适用于 `delete+insert` 策略）                                                                                                                                   | 可选                         |                      

#### 增量模型策略 {#incremental-model-strategies}

`dbt-clickhouse` 支持三种增量模型策略。

##### 默认（传统）策略 {#default-legacy-strategy}

一直以来，ClickHouse 仅以异步 “mutations” 的形式，对更新和删除提供了有限支持。
为了模拟预期的 dbt 行为，
dbt-clickhouse 默认会创建一个新的临时表，该表包含所有未受影响（未删除、未更改）的“旧”
记录，以及所有新增或更新的记录，
然后将此临时表与现有的增量模型关系进行交换。这是唯一一种在操作完成之前如果出现问题仍能保留原始关系的策略；但是，由于它需要对原始表进行完整拷贝，因此执行开销较大且速度较慢。

##### Delete+Insert 策略 {#delete-insert-strategy}

ClickHouse 在 22.8 版本中新增了实验性功能 “lightweight deletes（轻量级删除）”。与 `ALTER TABLE ... DELETE`
操作相比，轻量级删除要快得多，因为它不需要重写 ClickHouse 的 data parts。增量策略 `delete+insert`
使用轻量级删除来实现
比“传统（legacy）”策略性能显著更好的增量物化。然而，使用该策略时有一些重要注意事项：

- 必须在 ClickHouse 服务器上通过设置
  `allow_experimental_lightweight_delete=1` 来启用轻量级删除，或者
  必须在你的 profile 中设置 `use_lw_deletes=true`（这将在你的 dbt 会话中启用该设置）
- 轻量级删除目前已可用于生产环境，但在 23.3 之前的 ClickHouse 版本中可能存在性能或其他问题。
- 此策略直接在受影响的表/关系上操作（不会创建任何中间或临时表），
  因此如果在操作过程中出现问题，
  增量模型中的数据很可能会处于无效状态
- 使用轻量级删除时，dbt-clickhouse 会启用设置 `allow_nondeterministic_mutations`。在极少数情况下，
  使用非确定性的 `incremental_predicates`
  可能会导致更新/删除记录出现竞争条件（以及相关的 ClickHouse 日志消息）。
  为了确保结果一致，
  增量谓词应只包含对在增量物化期间不会被修改的数据的子查询。

##### Microbatch 策略（需要 dbt-core >= 1.9） {#microbatch-strategy}

增量策略 `microbatch` 自 dbt-core 1.9 版本起提供，用于高效处理大规模
时序数据转换。在 dbt-clickhouse 中，它基于现有的 `delete_insert`
增量策略，通过根据 `event_time` 和
`batch_size` 模型配置，将增量拆分为预定义的时序批次。

除了处理大规模转换之外，microbatch 还提供以下能力：

- [重新处理失败批次](https://docs.getdbt.com/docs/build/incremental-microbatch#retry)。
- 自动检测[并行批次执行](https://docs.getdbt.com/docs/build/parallel-batch-execution)。
- 免去在[回填](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills)中编写复杂条件逻辑的需求。

有关 microbatch 的详细用法，请参考[官方文档](https://docs.getdbt.com/docs/build/incremental-microbatch)。

###### 可用的 Microbatch 配置 {#available-microbatch-configurations}

| Option             | Description                                                                                                                                                                                                                                                                                                                                | Default if any |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| event_time         | 指示“该行发生时间”的列。对于 microbatch 模型以及所有需要被过滤的直接父模型，这是必需的。                                                                                                                                                                                                                                                 |                |
| begin              | microbatch 模型的“时间起点”。这是任何初始或全量刷新构建的起始点。例如，对按日粒度的 microbatch 模型在 2024-10-01 运行且 begin = '2023-10-01 时，将处理 366 个批次（这是闰年！）外加“今天”的批次。                                                                                                  |                |
| batch_size         | 批次的粒度。支持的值包括 `hour`、`day`、`month` 和 `year`。                                                                                                                                                                                                                                                                                |                |
| lookback           | 在最新书签之前额外处理 X 个批次，以捕获延迟到达的记录。                                                                                                                                                                                                                                                                                    | 1              |
| concurrent_batches | 覆盖 dbt 对并发（同时）运行批次的自动检测。详细内容参见[配置并发批次](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches)。设置为 true 时，批次将并发（并行）运行；设置为 false 时，批次将按顺序（一个接一个）运行。                                          |                |

##### Append 策略 {#append-strategy}

此策略替代了早期 dbt-clickhouse 版本中的 `inserts_only` 设置。该策略仅将新行追加到
现有关系中。
因此不会去重，也不会创建临时或中间表。如果数据中允许存在重复，
或重复已由增量查询的 WHERE 子句/过滤条件排除，则这是最快的策略。

##### insert_overwrite 策略（实验性） {#insert-overwrite-strategy}

> [重要]  
> 目前，insert_overwrite 策略尚未在分布式物化中完全可用。

执行以下步骤：

1. 创建一个与增量模型关联关系具有相同结构的暂存（临时）表：
   `CREATE TABLE <staging> AS <target>`。
2. 仅将新的记录（由 `SELECT` 产生）插入到暂存表中。
3. 仅将新的分区（存在于暂存表中的分区）替换到目标表中。

此方法具有以下优点：

- 比默认策略更快，因为它不会复制整个表。
- 比其他策略更安全，因为在 INSERT 操作成功完成之前，它不会修改原始表：如果中间发生失败，原始表不会被修改。
- 实现了“分区不可变性”的数据工程最佳实践，这简化了增量和并行数据处理、回滚等操作。

该策略要求在模型配置中设置 `partition_by`，并会忽略模型配置中所有其他特定于策略的参数。

### 物化：materialized&#95;view（实验性） {#materialized-view}

`materialized_view` 物化应为对现有（源）表的 `SELECT`。适配器会创建一个名称为模型名的目标表，
以及一个名为 `<model_name>_mv` 的 ClickHouse MATERIALIZED VIEW。与 PostgreSQL 不同，ClickHouse 的物化视图不是“静态的”（且
没有对应的 REFRESH 操作）。相反，它充当“插入触发器”，在向源表插入行时，会使用在视图定义中指定的 `SELECT`
“转换”将新行插入目标表。参见该[测试文件](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)
以获取如何使用此功能的入门示例。

ClickHouse 支持由多个物化视图向同一目标表写入记录。为了在 dbt-clickhouse 中支持这一点，你可以在模型文件中构造一个 `UNION`，使每个物化视图的 SQL 都被形如 `--my_mv_name:begin` 和 `--my_mv_name:end` 的注释包裹。

例如，以下内容将构建两个物化视图，它们都向模型的同一个目标表写入数据。物化视图的名称形式为 `<model_name>_mv1` 和 `<model_name>_mv2`：

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
> 当更新包含多个物化视图（MV）的模型时，尤其是在重命名某个 MV 时，
> dbt-clickhouse 不会自动删除旧的 MV。相反，
> 你将会看到如下警告信息：
> `Warning - Table <previous table name> was detected with the same pattern as model name <your model name> but was not found in this run. In case it is a renamed mv that was previously part of this model, drop it manually (!!!) `


#### 数据补齐 {#data-catch-up}

目前，在创建物化视图（MV）时，目标表会先使用历史数据进行填充，然后才创建 MV 本身。

换句话说，dbt-clickhouse 会先创建目标表，并根据为该 MV 定义的查询预加载历史数据。只有在这一步完成后，才会创建 MV。

如果你不希望在创建 MV 时预加载历史数据，可以通过将 catch-up 配置设置为 False 来禁用此行为：

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False
)}}
```


#### 可刷新 materialized view {#refreshable-materialized-views}

要使用 [Refreshable Materialized View](/materialized-view/refreshable-materialized-view)，
请在你的 MV 模型中按需调整以下配置（所有这些配置都应在一个 refreshable 配置对象中进行设置）：

| Option                        | Description                                                                | Required | Default Value |
| ----------------------------- | -------------------------------------------------------------------------- | -------- | ------------- |
| refresh&#95;interval          | interval 子句（必填）                                                            | Yes      |               |
| randomize                     | 随机化子句，将出现在 `RANDOMIZE FOR` 之后。                                             |          |               |
| append                        | 如果设置为 `True`，每次刷新会向表中插入行，而不会删除现有行。该插入不是原子的，与常规的 INSERT SELECT 一样。          |          | False         |
| depends&#95;on                | 可刷新物化视图的依赖项列表。请按以下格式提供依赖项：`{schema}.{view_name}`                           |          |               |
| depends&#95;on&#95;validation | 是否校验 `depends_on` 中提供的依赖项是否存在。如果某个依赖项未包含 schema，则在 `default` schema 上执行校验。 |          | False         |

可刷新物化视图的配置示例：

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

* 在 ClickHouse 中创建具有依赖项的可刷新的物化视图（MV）时，如果在创建时指定的依赖项不存在，ClickHouse 不会抛出错误。
  相反，该可刷新 MV 会保持在未激活状态，等待依赖项被满足之后，才会开始处理更新或刷新。
  这一行为是按设计实现的，但如果所需依赖项未能及时满足，可能会导致数据可用性延迟。
  建议用户在创建可刷新的物化视图之前，确保所有依赖项都已正确定义且已存在。
* 截至目前，MV 与其依赖项之间并没有真正的 “dbt 链接（dbt linkage）”，因此无法保证创建顺序。
* 尚未对多个 MV 指向同一目标模型场景下的可刷新特性进行测试。

### 物化：dictionary（实验性） {#materialization-dictionary}

请参阅
[https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py)
中的测试用例，
以了解如何为 ClickHouse 字典
实现物化的示例。

### 物化：distributed&#95;table（实验性） {#materialization-distributed-table}

通过以下步骤创建 Distributed 表：

1. 使用 SQL 查询创建临时视图以获取正确的结构
2. 基于该视图创建空的本地表
3. 基于本地表创建 Distributed 表
4. 将数据插入 Distributed 表，从而在分片之间分发数据且不发生重复。

注意：

* 为了确保下游增量物化操作能够正确执行，dbt-clickhouse 查询现在会自动包含设置 `insert_distributed_sync = 1`。
  这可能会导致某些 Distributed 表插入操作比预期更慢。

#### Distributed 表模型示例 {#distributed-table-model-example}

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


#### 生成的迁移脚本 {#distributed-table-generated-migrations}

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


#### 配置 {#distributed-table-configurations}

下面列出了此物化类型特有的配置：

| Option                 | Description                                                                                                                                                                                                                                                                                                          | Default if any |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| sharding_key           | 分片键在向分布式引擎表插入数据时决定目标服务器。分片键可以是随机值，也可以是哈希函数的输出。                                                                                                                                                                                                                      | `rand()`)      |

### materialization: distributed&#95;incremental（实验性） {#materialization-distributed-incremental}

基于与 Distributed 表相同理念的增量模型，主要难点在于要正确处理所有增量策略。

1. *Append 策略* 只是将数据插入到 Distributed 表中。
2. *Delete+Insert 策略* 会创建一个分布式临时表，以便在每个分片上处理所有数据。
3. *Default（Legacy）策略* 出于相同原因会创建分布式临时表和中间表。

只会替换各分片上的本地表，因为 Distributed 表本身不存储数据。
Distributed 表仅在启用 full&#95;refresh 模式或表结构可能发生变化时才会重新加载。

#### 分布式增量模型示例 {#distributed-incremental-model-example}

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


#### 自动生成的迁移 {#distributed-incremental-generated-migrations}

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


### 快照 {#snapshot}

dbt 快照允许对可变模型随时间发生的变更进行记录。这样一来，就可以在模型上执行按时间点的查询，使分析人员能够“回到过去”查看模型之前的状态。ClickHouse 连接器支持此功能，并可通过以下语法进行配置：

在 `snapshots/<model_name>.sql` 中的配置块：

```python
{{
   config(
     schema = "<架构名称>",
     unique_key = "<列名>",
     strategy = "<策略>",
     updated_at = "<更新时间列名>",
   )
}}
```

关于配置的更多信息，请参阅 [snapshot configs](https://docs.getdbt.com/docs/build/snapshots#snapshot-configs) 参考文档页面。


### 合约与约束 {#contracts-and-constraints}

仅支持对列类型进行精确匹配的合约。例如，如果合约中列类型为 UInt32，而模型返回 UInt64 或其他整数类型，则会报错失败。
ClickHouse *仅* 支持在整个表/模型级别使用 `CHECK` 约束。不支持主键、外键、唯一键以及列级别的 `CHECK` 约束。
（参见 ClickHouse 关于 primary/ORDER BY 键的文档。）

### 其他 ClickHouse 宏 {#additional-clickhouse-macros}

#### 模型物化辅助宏 {#model-materialization-utility-macros}

包含以下宏，用于简化创建 ClickHouse 特定的表和视图：

* `engine_clause` -- 使用 `engine` 模型配置属性来指定 ClickHouse 表引擎。dbt-clickhouse
  默认使用 `MergeTree` 引擎。
* `partition_cols` -- 使用 `partition_by` 模型配置属性来指定 ClickHouse 分区键。
  默认不指定分区键。
* `order_cols` -- 使用 `order_by` 模型配置来指定 ClickHouse ORDER BY/排序键。如果未指定，
  ClickHouse 将使用空元组 ()，表将保持未排序状态。
* `primary_key_clause` -- 使用 `primary_key` 模型配置属性来指定 ClickHouse 主键。
  默认情况下会设置主键，ClickHouse 将使用 ORDER BY 子句作为主键。
* `on_cluster_clause` -- 使用 `cluster` 配置文件（profile）属性，为某些 dbt 操作添加 `ON CLUSTER` 子句：
  分布式物化、视图创建、数据库创建。
* `ttl_config` -- 使用 `ttl` 模型配置属性来指定 ClickHouse 表的 TTL 表达式。
  默认不设置 TTL。

#### s3Source 辅助 macro {#s3source-helper-macro}

`s3source` macro 简化了使用 ClickHouse S3 表函数直接从 S3 中查询 ClickHouse 数据的过程。其工作原理是
从一个命名配置字典中填充 S3 表函数的参数（该字典的名称必须以 `s3` 结尾）。macro 会首先在 profile 的 `vars`
中查找该字典，然后在模型配置中查找。该字典可以包含以下任意键，用于填充 S3 表函数的参数：

| 参数名称               | 描述                                                                                                                                                                                         |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| bucket                | bucket 的基础 URL，例如 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi`。如果未提供协议，则默认使用 `https://`。                                                         |
| path                  | 用于表查询的 S3 路径，例如 `/trips_4.gz`。支持 S3 通配符。                                                                                                                                   |
| fmt                   | 被引用 S3 对象的预期 ClickHouse 输入格式（例如 `TSV` 或 `CSVWithNames`）。                                                                                                                   |
| structure             | bucket 中数据的列结构，表示为 name/datatype 对的列表，例如 `['id UInt32', 'date DateTime', 'value String']`。如果未提供，ClickHouse 将自动推断结构。        |
| aws_access_key_id     | S3 访问密钥 ID（access key id）。                                                                                                                                                            |
| aws_secret_access_key | S3 私密访问密钥（secret key）。                                                                                                                                                              |
| role_arn              | 用于安全访问 S3 对象的 ClickHouseAccess IAM 角色的 ARN。更多信息请参阅此[文档](/cloud/data-sources/secure-s3)。                                                     |
| compression           | S3 对象使用的压缩方式。如果未提供，ClickHouse 将尝试根据文件名来识别压缩方式。                                                                                                              |

请参阅
[S3 测试文件](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py)
以了解如何使用此 macro 的示例。

#### 跨数据库 macro 支持 {#cross-database-macro-support}

dbt-clickhouse 支持 `dbt Core` 中大多数跨数据库 macro，但有以下例外：

* `split_part` SQL 函数在 ClickHouse 中是通过 `splitByChar` 函数实现的。该函数要求使用常量字符串作为“拆分”分隔符，因此用于此 macro 的 `delimeter` 参数将被解释为字符串，而不是列名。
* 类似地，ClickHouse 中的 `replace` SQL 函数要求 `old_chars` 和 `new_chars` 参数为常量字符串，因此在调用此 macro 时，这些参数将被解释为字符串，而不是列名。

## Catalog 支持 {#catalog-support}

### dbt Catalog 集成状态 {#dbt-catalog-integration-status}

dbt Core v1.10 引入了 catalog 集成支持，允许适配器将模型物化到由 Apache Iceberg 等开放表格式管理的外部 catalog 中。**该特性目前尚未在 dbt-clickhouse 中原生实现。** 可以在 [GitHub issue #489](https://github.com/ClickHouse/dbt-clickhouse/issues/489) 中关注该特性的实现进展。

### ClickHouse Catalog 支持 {#clickhouse-catalog-support}

ClickHouse 最近增加了对 Apache Iceberg 表和数据目录的原生支持。大多数特性目前仍处于 `experimental` 状态，但只要使用较新的 ClickHouse 版本，就可以开始使用它们。

* 你可以使用 ClickHouse 通过 [Iceberg table engine](/engines/table-engines/integrations/iceberg) 和 [iceberg table function](/sql-reference/table-functions/iceberg)，对存储在对象存储（S3、Azure Blob Storage、Google Cloud Storage）中的 **Iceberg 表进行查询**。

* 此外，ClickHouse 提供了 [DataLakeCatalog database engine](/engines/database-engines/datalakecatalog)，用于 **连接外部数据目录**，包括 AWS Glue Catalog、Databricks Unity Catalog、Hive Metastore 和 REST Catalog。这使你能够直接从外部目录中查询开放表格式的数据（Iceberg、Delta Lake），而无需进行数据复制。

### 使用 Iceberg 和 Catalog 的替代方案 {#workarounds-iceberg-catalogs}

如果你已经在 ClickHouse 集群中通过上述工具定义了 Iceberg 表或 Catalog，就可以在 dbt 项目中读取这些数据。你可以利用 dbt 中的 `source` 功能，在 dbt 项目里引用这些表。比如，如果你想访问 REST Catalog 中的表，可以：

1. **创建一个指向外部 Catalog 的数据库：**

```sql
-- REST Catalog 示例
SET allow_experimental_database_iceberg = 1;

CREATE DATABASE iceberg_catalog
ENGINE = DataLakeCatalog('http://rest:8181/v1', 'admin', 'password')
SETTINGS 
    catalog_type = 'rest', 
    storage_endpoint = 'http://minio:9000/lakehouse', 
    warehouse = 'demo'
```

2. **在 dbt 中将 catalog 数据库及其表定义为数据源：** 请确保这些表已经在 ClickHouse 中存在

```yaml
version: 2

sources:
  - name: external_catalog
    database: iceberg_catalog
    tables:
      - name: orders
      - name: customers
```

3. **在 dbt 模型中使用这些 catalog 表：**

```sql
SELECT 
    o.order_id,
    c.customer_name,
    o.order_date
FROM {{ source('external_catalog', 'orders') }} o
INNER JOIN {{ source('external_catalog', 'customers') }} c
    ON o.customer_id = c.customer_id
```


### 关于这些变通方案的说明 {#benefits-workarounds}

这些变通方案的优点包括：

* 你可以立即访问不同类型的外部表和外部 catalog，而无需等待 dbt 原生 catalog 集成。
* 当原生 catalog 支持推出后，你将拥有一条无缝的迁移路径。

但目前也存在一些限制：

* **需要手动配置：** 必须先在 ClickHouse 中手动创建 Iceberg 表和 catalog 数据库，然后才能在 dbt 中引用。
* **缺少 catalog 级别的 DDL：** dbt 无法管理 catalog 级别的操作，例如在外部 catalog 中创建或删除 Iceberg 表。因此，你目前无法通过 dbt 连接器来创建它们。未来可能会支持使用 Iceberg() 引擎创建表。
* **写入操作受限：** 目前对 Iceberg/Data Catalog 表的写入能力有限。请查阅 ClickHouse 文档以了解当前可用的选项。