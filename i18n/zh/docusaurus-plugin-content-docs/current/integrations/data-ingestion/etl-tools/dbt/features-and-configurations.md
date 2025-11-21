---
sidebar_label: '功能和配置'
slug: /integrations/dbt/features-and-configurations
sidebar_position: 2
description: '将 dbt 与 ClickHouse 结合使用的功能'
keywords: ['clickhouse', 'dbt', 'features']
title: '功能和配置'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 功能与配置

<ClickHouseSupportedBadge/>

本节将介绍在 ClickHouse 中使用 dbt 时可用的一些功能及其相关文档。

<TOCInline toc={toc}  maxHeadingLevel={3} />



## Profile.yml 配置 {#profile-yml-configurations}

要从 dbt 连接到 ClickHouse,您需要在 `profiles.yml` 文件中添加一个 [profile](https://docs.getdbt.com/docs/core/connect-data-platform/connection-profiles)。ClickHouse profile 遵循以下语法:

```yaml
your_profile_name:
  target: dev
  outputs:
    dev:
      type: clickhouse

      # 可选
      schema: [default] # 用于 dbt 模型的 ClickHouse 数据库
      driver: [http] # http 或 native。如果未设置,将根据端口设置自动确定
      host: [localhost]
      port: [8123] # 如果未设置,根据 secure 和 driver 设置默认为 8123、8443、9000 或 9440
      user: [default] # 用于所有数据库操作的用户
      password: [<empty string>] # 用户密码
      cluster: [<empty string>] # 如果设置,某些 DDL/表操作将使用此集群通过 `ON CLUSTER` 子句执行。分布式物化需要此设置才能工作。有关更多详细信息,请参阅下面的 ClickHouse 集群部分。
      verify: [True] # 如果使用 TLS/SSL,验证 TLS 证书
      secure: [False] # 使用 TLS(native 协议)或 HTTPS(http 协议)
      client_cert: [null] # .pem 格式的 TLS 客户端证书路径
      client_cert_key: [null] # TLS 客户端证书私钥的路径
      retries: [1] # 重试"可重试"数据库异常(例如 503 'Service Unavailable' 错误)的次数
      compression: [<empty string>] # 如果为真值则使用 gzip 压缩(http),或用于 native 连接的压缩类型
      connect_timeout: [10] # 建立到 ClickHouse 连接的超时时间(秒)
      send_receive_timeout: [300] # 从 ClickHouse 服务器接收数据的超时时间(秒)
      cluster_mode: [False] # 使用专为改善 Replicated 数据库操作而设计的特定设置(推荐用于 ClickHouse Cloud)
      use_lw_deletes: [False] # 使用 `delete+insert` 策略作为默认增量策略。
      check_exchange: [True] # 验证 ClickHouse 是否支持原子 EXCHANGE TABLES 命令。(大多数 ClickHouse 版本不需要)
      local_suffix: [_local] # 用于分布式物化的分片上本地表的表后缀。
      local_db_prefix: [<empty string>] # 用于分布式物化的分片上本地表的数据库前缀。如果为空,则使用与分布式表相同的数据库。
      allow_automatic_deduplication: [False] # 为 Replicated 表启用 ClickHouse 自动去重
      tcp_keepalive: [False] # 仅限 Native 客户端,指定 TCP keepalive 配置。将自定义 keepalive 设置指定为 [idle_time_sec, interval_sec, probes]。
      custom_settings: [{}] # 用于连接的自定义 ClickHouse 设置的字典/映射 - 默认为空。
      database_engine: "" # 创建新 ClickHouse schema(数据库)时使用的数据库引擎。如果未设置(默认),新数据库将使用默认的 ClickHouse 数据库引擎(通常是 Atomic)。
      threads: [1] # 运行查询时使用的线程数。在将其设置为大于 1 的数字之前,请务必阅读[写后读一致性](#read-after-write-consistency)部分。

      # Native (clickhouse-driver) 连接设置
      sync_request_timeout: [5] # 服务器 ping 的超时时间
      compress_block_size: [1048576] # 如果启用压缩,压缩块大小
```

### Schema 与 Database {#schema-vs-database}

dbt 模型关系标识符 `database.schema.table` 与 ClickHouse 不兼容,因为 ClickHouse 不支持 `schema`。
因此我们使用简化的方法 `schema.table`,其中 `schema` 是 ClickHouse 数据库。不建议使用 `default` 数据库。

### SET 语句警告 {#set-statement-warning}

在许多环境中,使用 SET 语句在所有 dbt 查询中持久化 ClickHouse 设置并不可靠,可能会导致意外失败。当通过负载均衡器使用 HTTP 连接将查询分布到多个节点时(例如 ClickHouse Cloud),这一点尤其明显,尽管在某些情况下,native ClickHouse 连接也可能发生这种情况。因此,我们建议将任何所需的 ClickHouse 设置配置在 dbt profile 的 "custom_settings" 属性中作为最佳实践,而不是依赖于偶尔建议的 pre-hook "SET" 语句。

### 设置 `quote_columns` {#setting-quote_columns}


为防止出现警告,请确保在 `dbt_project.yml` 中明确设置 `quote_columns` 的值。有关更多信息,请参阅 [quote_columns 文档](https://docs.getdbt.com/reference/resource-configs/quote_columns)。

```yaml
seeds:
  +quote_columns: false #如果 CSV 列标题中包含空格,则设置为 `true`
```

### 关于 ClickHouse 集群 {#about-the-clickhouse-cluster}

使用 ClickHouse 集群时,需要考虑两个方面:

- 设置 `cluster` 配置。
- 确保写后读一致性,特别是在使用多个 `threads` 时。

#### 集群设置 {#cluster-setting}

配置文件中的 `cluster` 设置使 dbt-clickhouse 能够针对 ClickHouse 集群运行。如果在配置文件中设置了 `cluster`,则默认情况下**所有模型都将使用 `ON CLUSTER` 子句创建**——使用 **Replicated** 引擎的模型除外。这包括:

- 数据库创建
- 视图物化
- 表和增量物化
- 分布式物化

Replicated 引擎**不会**包含 `ON CLUSTER` 子句,因为它们被设计为在内部管理复制。

要为特定模型**选择退出**基于集群的创建,请添加 `disable_on_cluster` 配置:

```sql
{{ config(
        engine='MergeTree',
        materialized='table',
        disable_on_cluster='true'
    )
}}

```

使用非复制引擎的表和增量物化不会受到 `cluster` 设置的影响(模型仅会在连接的节点上创建)。

**兼容性**

如果模型在创建时未设置 `cluster`,dbt-clickhouse 将检测到这种情况,并在该模型的所有 DDL/DML 操作中不使用 `on cluster` 子句。

#### 写后读一致性 {#read-after-write-consistency}

dbt 依赖于插入后读一致性模型。如果无法保证所有操作都发送到同一副本,这与具有多个副本的 ClickHouse 集群不兼容。在日常使用 dbt 时可能不会遇到问题,但根据集群的不同,有一些策略可以确保这一保证:

- 如果您使用的是 ClickHouse Cloud 集群,只需在配置文件的 `custom_settings` 属性中设置 `select_sequential_consistency: 1`。有关此设置的更多信息,请参阅[此处](https://clickhouse.com/docs/operations/settings/settings#select_sequential_consistency)。
- 如果您使用的是自托管集群,请确保所有 dbt 请求都发送到同一个 ClickHouse 副本。如果在其上层有负载均衡器,请尝试使用某种 `副本感知路由`/`粘性会话` 机制,以便始终访问同一副本。在 ClickHouse Cloud 之外的集群中添加 `select_sequential_consistency = 1` 设置[不推荐](https://clickhouse.com/docs/operations/settings/settings#select_sequential_consistency)。


## 功能概述 {#general-information-about-features}

### 通用表配置 {#general-table-configurations}

| 选项         | 描述                                                                                                                                                                                                   | 默认值（如有） |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| engine         | 创建表时使用的表引擎（表类型）                                                                                                                                                  | `MergeTree()`  |
| order_by       | 列名或任意表达式的元组。用于创建小型稀疏索引以加快数据查找速度。                                                                                 | `tuple()`      |
| partition_by   | 分区是按指定条件对表中记录进行的逻辑组合。分区键可以是表列的任意表达式。                                                          |                |
| sharding_key   | 分片键决定向分布式引擎表插入数据时的目标服务器。分片键可以是随机值或哈希函数的输出                                                | `rand()`)      |
| primary_key    | 与 order_by 类似，是 ClickHouse 主键表达式。如果未指定，ClickHouse 将使用 order by 表达式作为主键                                                                          |                |
| unique_key     | 唯一标识行的列名元组。用于增量模型的更新操作。                                                                                                                |                |
| settings       | 用于此模型的 DDL 语句（如 'CREATE TABLE'）的"TABLE"设置映射/字典                                                                                                         |                |
| query_settings | 与此模型配合使用的 `INSERT` 或 `DELETE` 语句的 ClickHouse 用户级设置映射/字典                                                                             |                |
| ttl            | 用于表的 TTL 表达式。TTL 表达式是用于指定表 TTL 的字符串。                                                                                 |                |
| indexes        | 要创建的[数据跳过索引](/optimize/skipping-indexes)列表。详见下文。                                                                                                    |                |
| sql_security   | 允许您指定执行视图底层查询时使用的 ClickHouse 用户。`SQL SECURITY` [有两个合法值](/sql-reference/statements/create/view#sql_security)：`definer` 和 `invoker`。 |                |
| definer        | 如果 `sql_security` 设置为 `definer`，则必须在 `definer` 子句中指定任意现有用户或 `CURRENT_USER`。                                                                                      |                |
| projections    | 要创建的[投影](/data-modeling/projections)列表。详见[关于投影](#projections)。                                                                                       |                |

#### 关于数据跳过索引 {#data-skipping-indexes}

数据跳过索引仅适用于 `table` 物化类型。要向表添加数据跳过索引列表，请使用 `indexes` 配置：

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

您可以使用 `projections` 配置向 `table` 和 `distributed_table` 物化类型添加[投影](/data-modeling/projections)：

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

**注意**：对于分布式表，投影应用于 `_local` 表，而非分布式代理表。

### 支持的表引擎 {#supported-table-engines}

| 类型                   | 详情                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| MergeTree（默认）    | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB        | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |

### 实验性支持的表引擎 {#experimental-supported-table-engines}


| 类型              | 详细信息                                                                   |
| ----------------- | ------------------------------------------------------------------------- |
| 分布式表 | https://clickhouse.com/docs/en/engines/table-engines/special/distributed. |
| 字典        | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

如果您在使用上述引擎从 dbt 连接到 ClickHouse 时遇到问题,请在[此处](https://github.com/ClickHouse/dbt-clickhouse/issues)报告问题。

### 关于模型设置的说明 {#a-note-on-model-settings}

ClickHouse 具有多种类型/级别的"设置"。在上述模型配置中,其中两种类型是可配置的。`settings` 指的是在 `CREATE TABLE/VIEW` 类型的 DDL 语句中使用的 `SETTINGS` 子句,因此这通常是特定于 ClickHouse 表引擎的设置。新的 `query_settings` 用于向用于模型物化(包括增量物化)的 `INSERT` 和 `DELETE` 查询添加 `SETTINGS` 子句。ClickHouse 有数百个设置,并不总是能清楚区分哪个是"表"设置,哪个是"用户"设置(尽管后者通常可在 `system.settings` 表中找到)。一般来说,建议使用默认值,任何对这些属性的使用都应经过仔细研究和测试。

### 列配置 {#column-configuration}

> **_注意:_** 以下列配置选项需要强制执行[模型契约](https://docs.getdbt.com/docs/collaborate/govern/model-contracts)。

| 选项 | 描述                                                                                                                                                                                                                                    | 默认值(如有) |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| codec  | 由传递给列 DDL 中 `CODEC()` 的参数组成的字符串。例如:`codec: "Delta, ZSTD"` 将被编译为 `CODEC(Delta, ZSTD)`。                                                                                        |
| ttl    | 由 [TTL(生存时间)表达式](https://clickhouse.com/docs/guides/developer/ttl)组成的字符串,用于在列的 DDL 中定义 TTL 规则。例如:`ttl: ts + INTERVAL 1 DAY` 将被编译为 `TTL ts + INTERVAL 1 DAY`。 |

#### 模式配置示例 {#example-of-schema-configuration}

```yaml
models:
  - name: table_column_configs
    description: "测试列级配置"
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

dbt 通过分析用于创建模型的 SQL 自动确定每列的数据类型。但是,在某些情况下,此过程可能无法准确确定数据类型,从而导致与契约 `data_type` 属性中指定的类型发生冲突。为解决此问题,我们建议在模型 SQL 中使用 `CAST()` 函数显式定义所需的类型。例如:

```sql
{{
    config(
        materialized="materialized_view",
        engine="AggregatingMergeTree",
        order_by=["event_type"],
    )
}}

select
  -- event_type 可能被推断为 String,但我们可能更希望使用 LowCardinality(String):
  CAST(event_type, 'LowCardinality(String)') as event_type,
  -- countState() 可能被推断为 `AggregateFunction(count)`,但我们可能更希望更改所使用参数的类型:
  CAST(countState(), 'AggregateFunction(count, UInt32)') as response_count,
  -- maxSimpleState() 可能被推断为 `SimpleAggregateFunction(max, String)`,但我们可能也更希望更改所使用参数的类型:
  CAST(maxSimpleState(event_type), 'SimpleAggregateFunction(max, LowCardinality(String))') as max_event_type
from {{ ref('user_events') }}
group by event_type
```


## 功能特性 {#features}

### 物化方式：视图 {#materialization-view}

dbt 模型可以创建为 [ClickHouse 视图](https://clickhouse.com/docs/en/sql-reference/table-functions/view/)，并使用以下语法进行配置：

项目文件 (`dbt_project.yml`)：

```yaml
models:
  <resource-path>:
    +materialized: view
```

或配置块 (`models/<model_name>.sql`)：

```python
{{ config(materialized = "view") }}
```

### 物化方式：表 {#materialization-table}

dbt 模型可以创建为 [ClickHouse 表](https://clickhouse.com/docs/en/operations/system-tables/tables/)，并使用以下语法进行配置：

项目文件 (`dbt_project.yml`)：

```yaml
models:
  <resource-path>:
    +materialized: table
    +order_by: [<column-name>, ...]
    +engine: <engine-type>
    +partition_by: [<column-name>, ...]
```

或配置块 (`models/<model_name>.sql`)：

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

### 物化方式：增量 {#materialization-incremental}

表模型将在每次 dbt 执行时重新构建。对于较大的结果集或复杂的转换操作，这可能不可行且成本极高。为了应对这一挑战并缩短构建时间，可以将 dbt 模型创建为增量 ClickHouse 表，并使用以下语法进行配置：

在 `dbt_project.yml` 中定义模型：

```yaml
models:
  <resource-path>:
    +materialized: incremental
    +order_by: [<column-name>, ...]
    +engine: <engine-type>
    +partition_by: [<column-name>, ...]
    +unique_key: [<column-name>, ...]
    +inserts_only: [True|False]
```

或在 `models/<model_name>.sql` 中配置块：

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

#### 配置项 {#configurations}

此物化类型的特定配置项如下所示：

| 选项                   | 描述                                                                                                                                                                                                                                                                                                            | 是否必需？                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `unique_key`             | 唯一标识行的列名元组。有关唯一性约束的更多详细信息，请参见[此处](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional)。                                                                                                                     | 必需。如果未提供，修改的行将被重复添加到增量表中。 |
| `inserts_only`           | 已弃用，改用 `append` 增量 `strategy`，其操作方式相同。如果为增量模型设置为 True，增量更新将直接插入到目标表中，而不创建中间表。如果设置了 `inserts_only`，则忽略 `incremental_strategy`。 | 可选（默认值：`False`）                                                          |
| `incremental_strategy`   | 用于增量物化的策略。支持 `delete+insert`、`append`、`insert_overwrite` 或 `microbatch`。有关策略的更多详细信息，请参见[此处](/integrations/dbt/features-and-configurations#incremental-model-strategies)。                                                        | 可选（默认值：'default'）                                                        |
| `incremental_predicates` | 应用于增量物化的附加条件（仅适用于 `delete+insert` 策略）                                                                                                                                                                                                       | 可选                                                                             |

#### 增量模型策略 {#incremental-model-strategies}

`dbt-clickhouse` 支持三种增量模型策略。

##### 默认（传统）策略 {#default-legacy-strategy}

历史上，ClickHouse 仅以异步"变更"（mutations）的形式对更新和删除提供有限的支持。
为了模拟预期的 dbt 行为，
dbt-clickhouse 默认创建一个新的临时表，其中包含所有未受影响（未删除、未更改）的"旧"记录，以及任何新记录或更新的记录，
然后将此临时表与现有的增量模型关系进行交换或替换。这是唯一一种在操作完成前出现问题时能够保留原始关系的策略；
但是，由于它涉及原始表的完整副本，因此执行起来可能相当昂贵且缓慢。

##### Delete+Insert 策略 {#delete-insert-strategy}


ClickHouse 在 22.8 版本中添加了"轻量级删除"作为实验性功能。轻量级删除比 ALTER TABLE ... DELETE 操作快得多,因为它们不需要重写 ClickHouse 数据部分。增量策略 `delete+insert` 利用轻量级删除来实现增量物化,其性能明显优于"传统"策略。但是,使用此策略有一些重要注意事项:

- 必须在您的 ClickHouse 服务器上使用设置 `allow_experimental_lightweight_delete=1` 启用轻量级删除,或者您必须在配置文件中设置 `use_lw_deletes=true`(这将为您的 dbt 会话启用该设置)
- 轻量级删除现已可用于生产环境,但在 23.3 之前的 ClickHouse 版本上可能存在性能和其他问题。
- 此策略直接在受影响的表/关系上操作(不创建任何中间表或临时表),因此如果操作期间出现问题,增量模型中的数据可能处于无效状态
- 使用轻量级删除时,dbt-clickhouse 会启用设置 `allow_nondeterministic_mutations`。在某些非常罕见的情况下,使用非确定性 incremental_predicates 可能会导致更新/删除项的竞态条件(以及 ClickHouse 日志中的相关日志消息)。为确保结果一致,增量谓词应仅包含对在增量物化期间不会被修改的数据的子查询。

##### 微批次策略(需要 dbt-core >= 1.9){#microbatch-strategy}

增量策略 `microbatch` 自 1.9 版本起成为 dbt-core 的一项功能,旨在高效处理大型时间序列数据转换。在 dbt-clickhouse 中,它基于现有的 `delete_insert` 增量策略,根据 `event_time` 和 `batch_size` 模型配置将增量拆分为预定义的时间序列批次。

除了处理大型转换外,微批次还提供以下能力:

- [重新处理失败的批次](https://docs.getdbt.com/docs/build/incremental-microbatch#retry)。
- 自动检测[并行批次执行](https://docs.getdbt.com/docs/build/parallel-batch-execution)。
- 消除[回填](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills)中复杂条件逻辑的需求。

有关微批次的详细使用方法,请参阅[官方文档](https://docs.getdbt.com/docs/build/incremental-microbatch)。

###### 可用的微批次配置 {#available-microbatch-configurations}

| 选项               | 描述                                                                                                                                                                                                                                                                                                                                       | 默认值(如有)   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| event_time         | 指示"该行发生在什么时间"的列。对于您的微批次模型和任何应被过滤的直接父级都是必需的。                                                                                                                                                                                                                 |                |
| begin              | 微批次模型的"时间起点"。这是任何初始构建或完全刷新构建的起始点。例如,在 2024-10-01 运行的日粒度微批次模型,如果 begin = '2023-10-01,将处理 366 个批次(这是闰年!)加上"今天"的批次。                                                       |                |
| batch_size         | 批次的粒度。支持的值为 `hour`、`day`、`month` 和 `year`                                                                                                                                                                                                                                   |                |
| lookback           | 处理最新书签之前的 X 个批次以捕获延迟到达的记录。                                                                                                                                                                                                                                           | 1              |
| concurrent_batches | 覆盖 dbt 的自动检测以并发(同时)运行批次。阅读更多关于[配置并发批次](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches)的信息。设置为 true 则并发(并行)运行批次。false 则顺序运行批次(一个接一个)。 |                |

##### 追加策略 {#append-strategy}

此策略替代了 dbt-clickhouse 早期版本中的 `inserts_only` 设置。此方法只是将新行追加到现有关系中。因此不会消除重复行,也没有临时表或中间表。如果数据中允许重复或通过增量查询 WHERE 子句/过滤器排除重复,这是最快的方法。

##### insert_overwrite 策略(实验性){#insert-overwrite-strategy}

> [重要]  
> 目前,insert_overwrite 策略在分布式物化中尚未完全正常工作。

执行以下步骤:


1. 创建一个与增量模型关系具有相同结构的暂存(临时)表:
   `CREATE TABLE <staging> AS <target>`。
2. 仅将新记录(由 `SELECT` 生成)插入到暂存表中。
3. 仅将新分区(存在于暂存表中)替换到目标表中。

此方法具有以下优势:

- 它比默认策略更快,因为它不会复制整个表。
- 它比其他策略更安全,因为在 INSERT 操作成功完成之前不会修改原始表:
  如果发生中间故障,原始表不会被修改。
- 它实现了"分区不可变性"数据工程最佳实践,简化了增量和并行数据
  处理、回滚等操作。

该策略要求在模型配置中设置 `partition_by`。忽略模型配置中所有其他特定于策略的
参数。

### 物化: materialized_view (实验性) {#materialized-view}

`materialized_view` 物化应该是从现有(源)表进行的 `SELECT`。适配器将创建一个
以模型名称命名的目标表
以及一个名为 `<model_name>_mv` 的 ClickHouse MATERIALIZED VIEW。与 PostgreSQL 不同,ClickHouse 物化视图
不是"静态的"(并且没有
相应的 REFRESH 操作)。相反,它充当"插入触发器",当向源表插入行时,会使用视图定义中定义的 `SELECT`
"转换"将新行插入到目标表中。请参阅[测试文件](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/materialized_view/test_materialized_view.py)
以获取如何使用此功能的入门示例。

ClickHouse 提供了让多个物化视图向同一目标表写入记录的能力。为了
在 dbt-clickhouse 中支持此功能,您可以在模型文件中构造一个 `UNION`,使每个
物化视图的 SQL 都用 `--my_mv_name:begin` 和 `--my_mv_name:end` 形式的注释包装。

例如,以下代码将构建两个物化视图,它们都将数据写入模型的同一目标表。
物化视图的名称将采用 `<model_name>_mv1` 和 `<model_name>_mv2` 的形式:

```sql
--mv1:begin
select a,b,c from {{ source('raw', 'table_1') }}
--mv1:end
union all
--mv2:begin
select a,b,c from {{ source('raw', 'table_2') }}
--mv2:end
```

> 重要提示!
>
> 当更新具有多个物化视图(MV)的模型时,特别是在重命名其中一个 MV 名称时,
> dbt-clickhouse 不会自动删除旧的 MV。相反,
> 您将遇到以下警告:
> `Warning - Table <previous table name> was detected with the same pattern as model name <your model name> but was not found in this run. In case it is a renamed mv that was previously part of this model, drop it manually (!!!) `

#### 数据回填 {#data-catch-up}

目前,在创建物化视图(MV)时,目标表首先会填充历史数据,然后才创建 MV 本身。

换句话说,dbt-clickhouse 首先创建目标表,并根据为 MV 定义的查询预加载历史数据。只有在此步骤之后才会创建 MV。

如果您不希望在创建 MV 期间预加载历史数据,可以通过将 catchup 配置设置为 False 来禁用此行为:

```python
{{config(
    materialized='materialized_view',
    engine='MergeTree()',
    order_by='(id)',
    catchup=False
)}}
```

#### 可刷新物化视图 {#refreshable-materialized-views}

要使用[可刷新物化视图](https://clickhouse.com/docs/en/materialized-view/refreshable-materialized-view),
请根据需要在您的 MV 模型中调整以下配置(所有这些配置都应该在
refreshable 配置对象内设置):


| 选项                | 描述                                                                                                                                                              | 必需 | 默认值 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------- |
| refresh_interval      | 间隔子句(必需)                                                                                                                                           | 是      |               |
| randomize             | 随机化子句,将出现在 `RANDOMIZE FOR` 之后                                                                                                              |          |               |
| append                | 如果设置为 `True`,每次刷新会向表中插入行而不删除现有行。插入操作不是原子性的,就像常规的 INSERT SELECT 一样。                  |          | False         |
| depends_on            | 可刷新物化视图的依赖项列表。请按以下格式提供依赖项:`{schema}.{view_name}`                                               |          |               |
| depends_on_validation | 是否验证 `depends_on` 中提供的依赖项是否存在。如果依赖项不包含 schema,则在 `default` schema 上进行验证 |          | False         |

可刷新物化视图的配置示例:

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

- 在 ClickHouse 中创建具有依赖项的可刷新物化视图(MV)时,如果在创建时指定的依赖项不存在,ClickHouse 不会抛出错误。
  相反,可刷新物化视图将保持非活动状态,等待依赖项得到满足后才开始处理更新或刷新。
  这种行为是设计使然,但如果未及时处理所需的依赖项,可能会导致数据可用性延迟。
  建议用户在创建可刷新物化视图之前确保所有依赖项都已正确定义并存在。
- 目前,物化视图与其依赖项之间没有实际的"dbt 关联",因此无法保证创建顺序。
- 可刷新功能尚未在多个物化视图指向同一目标模型的情况下进行测试。

### 物化:字典(实验性) {#materialization-dictionary}

有关如何为 ClickHouse 字典实现物化的示例,请参阅 https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py 中的测试

### 物化:分布式表(实验性) {#materialization-distributed-table}

分布式表按以下步骤创建:

1. 使用 SQL 查询创建临时视图以获取正确的结构
2. 基于视图创建空的本地表
3. 基于本地表创建分布式表
4. 数据插入到分布式表中,因此数据会分布在各个分片上而不会重复

注意事项:

- dbt-clickhouse 查询现在会自动包含设置 `insert_distributed_sync = 1`,以确保下游增量物化操作正确执行。
  这可能会导致某些分布式表插入操作的运行速度比预期慢。

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

### 物化:分布式增量(实验性) {#materialization-distributed-incremental}

增量模型基于与分布式表相同的思想,主要难点是正确处理所有增量策略。

1. _追加策略_ 只是将数据插入到分布式表中。
2. _删除+插入策略_ 创建分布式临时表以处理每个分片上的所有数据。
3. _默认(传统)策略_ 出于同样的原因创建分布式临时表和中间表。

仅替换分片表,因为分布式表不保存数据。
分布式表仅在启用 full_refresh 模式或表结构可能已更改时才会重新加载。

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

dbt 快照功能允许记录可变模型随时间的变化。这使得可以对模型进行时间点查询,分析人员可以"回溯"查看模型的历史状态。ClickHouse 连接器支持此功能,使用以下语法进行配置:

`snapshots/<model_name>.sql` 中的配置块:

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

有关配置的更多信息,请参阅[快照配置](https://docs.getdbt.com/docs/build/snapshots#snapshot-configs)参考页面。

### 契约和约束 {#contracts-and-constraints}

仅支持精确的列类型契约。例如,如果模型返回 UInt64 或其他整数类型,则具有 UInt32 列类型的契约将失败。
ClickHouse 也_仅_支持对整个表/模型的 `CHECK` 约束。不支持主键、外键、唯一约束和列级 CHECK 约束。
(请参阅 ClickHouse 关于主键/排序键的文档。)

### 其他 ClickHouse 宏 {#additional-clickhouse-macros}

#### 模型物化实用宏 {#model-materialization-utility-macros}

以下宏用于便于创建 ClickHouse 特定的表和视图:

- `engine_clause` -- 使用 `engine` 模型配置属性来指定 ClickHouse 表引擎。dbt-clickhouse 默认使用 `MergeTree` 引擎。
- `partition_cols` -- 使用 `partition_by` 模型配置属性来指定 ClickHouse 分区键。默认情况下不指定分区键。
- `order_cols` -- 使用 `order_by` 模型配置来指定 ClickHouse 排序键。如果未指定,ClickHouse 将使用空元组 tuple(),表将不排序
- `primary_key_clause` -- 使用 `primary_key` 模型配置属性来指定 ClickHouse 主键。默认情况下,主键已设置,ClickHouse 将使用排序子句作为主键。
- `on_cluster_clause` -- 使用 `cluster` 配置文件属性向某些 dbt 操作添加 `ON CLUSTER` 子句:分布式物化、视图创建、数据库创建。
- `ttl_config` -- 使用 `ttl` 模型配置属性来指定 ClickHouse 表 TTL 表达式。默认情况下不指定 TTL。

#### s3Source 辅助宏 {#s3source-helper-macro}

`s3source` 宏简化了使用 ClickHouse S3 表函数直接从 S3 选择数据的过程。它通过从命名配置字典(字典名称必须以 `s3` 结尾)填充 S3 表函数参数来工作。该宏首先在配置文件 `vars` 中查找字典,然后在模型配置中查找。字典可以包含以下任何用于填充 S3 表函数参数的键:


| 参数名称              | 描述                                                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bucket                | 存储桶基础 URL,例如 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi`。如果未提供协议,则默认使用 `https://`。                                        |
| path                  | 用于表查询的 S3 路径,例如 `/trips_4.gz`。支持 S3 通配符。                                                                                                  |
| fmt                   | 引用的 S3 对象所需的 ClickHouse 输入格式(例如 `TSV` 或 `CSVWithNames`)。                                                                                        |
| structure             | 存储桶中数据的列结构,以名称/数据类型对列表的形式表示,例如 `['id UInt32', 'date DateTime', 'value String']`。如果未提供,ClickHouse 将自动推断结构。 |
| aws_access_key_id     | S3 访问密钥 ID。                                                                                                                                                                       |
| aws_secret_access_key | S3 密钥。                                                                                                                                                                          |
| role_arn              | 用于安全访问 S3 对象的 ClickhouseAccess IAM 角色的 ARN。有关更多信息,请参阅此[文档](https://clickhouse.com/docs/en/cloud/security/secure-s3)。    |
| compression           | S3 对象使用的压缩方法。如果未提供,ClickHouse 将尝试根据文件名确定压缩方式。                                                   |

有关如何使用此宏的示例,请参阅 [S3 测试文件](https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/clickhouse/test_clickhouse_s3.py)。

#### 跨数据库宏支持 {#cross-database-macro-support}

dbt-clickhouse 支持 `dbt Core` 中现已包含的大多数跨数据库宏,但有以下例外:

- `split_part` SQL 函数在 ClickHouse 中使用 splitByChar 函数实现。此函数要求对"分割"分隔符使用常量字符串,因此此宏使用的 `delimeter` 参数将被解释为字符串,而不是列名
- 同样,ClickHouse 中的 `replace` SQL 函数要求 `old_chars` 和 `new_chars` 参数为常量字符串,因此在调用此宏时,这些参数将被解释为字符串而不是列名。
