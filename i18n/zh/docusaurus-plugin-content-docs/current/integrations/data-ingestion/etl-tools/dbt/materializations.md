---
sidebar_label: '物化类型'
slug: /integrations/dbt/materializations
sidebar_position: 3
description: '可用物化类型及其配置'
keywords: ['ClickHouse', 'dbt', '物化类型', 'materialized view', '增量']
title: '物化类型'
doc_type: 'guide'
---

import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 物化 \{#materializations\}

<ClickHouseSupportedBadge/>

本节介绍 dbt-clickhouse 中所有可用的物化类型，包括实验性特性。

<TOCInline toc={toc}  maxHeadingLevel={3} />

## 通用物化配置 \{#general-materialization-configurations\}

下表展示了一些可用物化方式共享的配置项。有关 dbt 模型通用配置的详细信息，请参阅 [dbt 文档](https://docs.getdbt.com/category/general-configs)：

| Option         | Description                                                                                                                                                                      | Default if any |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| engine         | 创建表时要使用的表引擎（表类型）                                                                                                                                                 | `MergeTree()`  |
| order_by       | 由列名或任意表达式组成的元组。通过它可以创建一个小型稀疏索引，用于更快地查找数据。                                                                                               | `tuple()`      |
| partition_by   | 分区是根据指定条件对表中记录进行的逻辑分组。分区键可以是来自表列的任意表达式。                                                                                                   |                |
| primary_key    | 与 order_by 类似的 ClickHouse 主键表达式。如果未指定，ClickHouse 将使用 order_by 表达式作为主键。                                                                               |                |
| settings       | 一个包含 "TABLE" 设置的映射/字典，用于在与此模型对应的 'CREATE TABLE' 等 DDL 语句中使用                                                                                          |                |
| query_settings | 一个包含 ClickHouse 用户级设置的映射/字典，用于在与此模型对应的 `INSERT` 或 `DELETE` 语句中使用                                                                                  |                |
| ttl            | 用于该表的生存时间（TTL）表达式。TTL 表达式是一个字符串，用于为表指定生存时间（TTL）。                                                                                           |                |
| sql_security   | 执行该 VIEW 的底层查询时要使用的 ClickHouse 用户。[可接受的值](/sql-reference/statements/create/view#sql_security)：`definer`、`invoker`。                                       |                |
| definer        | 如果 `sql_security` 设置为 `definer`，则必须在 `definer` 子句中指定任意现有用户或 `CURRENT_USER`。                                                                                |                |

### 支持的表引擎 \{#supported-table-engines\}

| 类型                   | 详情                                                                                      |
|------------------------|-------------------------------------------------------------------------------------------|
| MergeTree (default)    | https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree/.         |
| HDFS                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hdfs                    |
| MaterializedPostgreSQL | https://clickhouse.com/docs/en/engines/table-engines/integrations/materialized-postgresql |
| S3                     | https://clickhouse.com/docs/en/engines/table-engines/integrations/s3                      |
| EmbeddedRocksDB        | https://clickhouse.com/docs/en/engines/table-engines/integrations/embedded-rocksdb        |
| Hive                   | https://clickhouse.com/docs/en/engines/table-engines/integrations/hive                    |

**注意**：对于 materialized view，支持所有 *MergeTree 引擎。

#### 实验性支持的表引擎 \{#experimental-supported-table-engines\}

| 类型              | 详情                                                                     |
|-------------------|---------------------------------------------------------------------------|
| 分布式表          | https://clickhouse.com/docs/en/engines/table-engines/special/distributed |
| 字典              | https://clickhouse.com/docs/en/engines/table-engines/special/dictionary   |

如果你在使用 dbt 通过上述任一引擎连接 ClickHouse 时遇到问题，请在[这里](https://github.com/ClickHouse/dbt-clickhouse/issues)提交 issue。

### 关于模型设置的说明 \{#a-note-on-model-settings\}

ClickHouse 有多种类型和层级的“settings”。在上面的模型配置中，其中有两类是可配置的。`settings` 指的是在 `CREATE TABLE/VIEW` 这类 DDL 语句中使用的 `SETTINGS`
子句，因此通常是特定于某个 ClickHouse 表引擎的设置。新的
`query_settings` 用于在模型物化所使用的 `INSERT` 和 `DELETE` 查询中添加 `SETTINGS` 子句（包括增量物化）。
ClickHouse 有上百个 settings，并不总是很清楚哪些是“表”设置，哪些是“用户”
设置（尽管后者通常可以在 `system.settings` 表中找到）。一般建议使用默认值，对这些属性的任何自定义使用都应经过充分研究与测试。

### 列配置 \{#column-configuration\}

> **_注意：_** 下列列配置选项要求已启用并强制执行[模型契约](https://docs.getdbt.com/docs/collaborate/govern/model-contracts)。

| 选项 | 说明                                                                                                                                                         | 默认值（如有） |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| codec  | 一个字符串，由传递给列的 DDL 中 `CODEC()` 的参数构成。例如：`codec: "Delta, ZSTD"` 将被编译为 `CODEC(Delta, ZSTD)`。    |    
| ttl    | 一个由[生存时间 (TTL) 表达式](https://clickhouse.com/docs/guides/developer/ttl)构成的字符串，用于在列的 DDL 中定义生存时间 (TTL) 规则。例如：`ttl: ts + INTERVAL 1 DAY` 将被编译为 `TTL ts + INTERVAL 1 DAY`。 |

#### Schema 配置示例 \{#example-of-schema-configuration\}

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

dbt 会通过分析用于创建模型的 SQL 自动推断每个列的数据类型。然而，在某些情况下，这一过程可能无法准确确定数据类型，从而与契约中 `data_type` 属性指定的类型不一致。为了解决这一问题，我们建议在模型 SQL 中使用 `CAST()` 函数显式指定所需的类型。例如：

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


## 物化：view \{#materialization-view\}

可以将 dbt 模型创建为 [ClickHouse 视图](/sql-reference/table-functions/view/)，
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


## 物化方式：表 \{#materialization-table\}

可以将 dbt 模型物化为一个 [ClickHouse 表](/operations/system-tables/tables/)，并使用以下语法进行配置：

项目文件（`dbt_project.yml`）：

```yaml
models:
  <resource-path>:
    +materialized: table
    +order_by: [ <column-name>, ... ]
    +engine: <engine-type>
    +partition_by: [ <column-name>, ... ]
```

或者在配置块中定义（`models/<model_name>.sql`）：

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


### 数据跳过索引 \{#data-skipping-indexes\}

可以通过 `indexes` 配置为 `table` 物化添加 [数据跳过索引](/optimize/skipping-indexes)：

```sql
{{ config(
        materialized='table',
        indexes=[{
          'name': 'your_index_name',
          'definition': 'your_column TYPE minmax GRANULARITY 2'
        }]
) }}
```


### 投影 \{#projections\}

您可以使用 `projections` 配置为 `table` 和 `distributed_table` 物化视图添加[投影](/data-modeling/projections)：

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

**注意**：对于分布式表，PROJECTION 会应用到 `_local` 表，而不是分布式代理表。


## 物化方式：增量（incremental） \{#materialization-incremental\}

在每次执行 dbt 时，都会重新构建表模型。对于较大的结果集或复杂转换，这可能不可行且成本极高。为了解决这一问题并缩短构建时间，可以将 dbt 模型创建为增量 ClickHouse 表，并使用以下语法进行配置：

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

或者在 `models/<model_name>.sql` 中使用 config 配置块：

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


### 配置 \{#incremental-configurations\}

针对此物化类型的特定配置如下所示：

| Option                   | Description                                                                                                                                                                                                                                                       | Required?                                                                            |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `unique_key`             | 唯一标识行的列名元组。有关唯一性约束的更多详情，请参见[此处](https://docs.getdbt.com/docs/build/incremental-models#defining-a-unique-key-optional)。                                                                                       | 必需。如果未提供，已修改的行会被两次添加到增量表中。 |
| `inserts_only`           | 已弃用，推荐改用工作方式相同的 `append` 增量 `strategy`。如果在增量模型中将其设为 True，增量更新将直接插入目标表，而不会创建中间表。如果设置了 `inserts_only`，则会忽略 `incremental_strategy`。 | 可选（默认值：`False`）                                                          |
| `incremental_strategy`   | 用于增量物化的策略。支持 `delete+insert`、`append`、`insert_overwrite` 或 `microbatch`。有关策略的更多详情，请参见[此处](#incremental-model-strategies)。 | 可选（默认值：`default`）                                                        |
| `incremental_predicates` | 要应用于增量物化的附加条件（仅适用于 `delete+insert` 策略）。                                                                                                                                                                                    | 可选                      

### 增量模型策略 \{#incremental-model-strategies\}

`dbt-clickhouse` 提供三种增量模型策略。

#### 默认（旧版）策略 \{#default-legacy-strategy\}

从历史上看，ClickHouse 对更新和删除的支持一直比较有限，只能通过异步的“mutation”来实现。
为了模拟预期的 dbt 行为，
dbt-clickhouse 默认会创建一个新的临时表，其中包含所有未受影响的（未删除、未更改）“旧”
记录，以及所有新增或更新的记录，
然后将这个临时表与现有的增量模型 relation 进行交换或替换。这是唯一一种在操作完成之前一旦出现问题
仍能保留原始 relation 的策略；然而，由于它需要对原始表进行完整拷贝，执行成本可能非常高且执行速度较慢。

#### Delete+Insert 策略 \{#delete-insert-strategy\}

ClickHouse 在 22.8 版本中引入了实验性特性 “lightweight deletes（轻量级删除）”。轻量级删除相比
ALTER TABLE ... DELETE
操作要快得多，因为它不需要重写 ClickHouse 的数据分区片段。增量策略 `delete+insert`
利用轻量级删除来实现
相比“传统（legacy）”策略性能显著更好的增量物化（materialization）。但是，在使用该策略时有一些重要注意事项：

- 必须在你的 ClickHouse 服务器上通过设置
  `allow_experimental_lightweight_delete=1` 启用轻量级删除，或者
  在你的 profile 中设置 `use_lw_deletes=true`（这会为你的 dbt 会话启用该设置）
- 轻量级删除现在已经可以用于生产环境，但在 23.3 之前的 ClickHouse 版本中可能会出现性能或其他问题。
- 该策略会直接作用于受影响的表 / relation（而不会创建任何中间或临时表），
  因此如果在操作过程中出现问题，
  增量模型中的数据很可能会处于无效状态
- 当使用轻量级删除时，dbt-clickhouse 会启用设置 `allow_nondeterministic_mutations`。在某些非常
  罕见的情况下，如果使用了非确定性的 incremental_predicates，
  这可能会导致更新/删除项出现竞争条件（以及 ClickHouse 日志中相应的日志消息）。
  为了确保结果一致，
  增量谓词应只包含对在增量物化期间不会被修改的数据的子查询。

#### 微批策略（需要 dbt-core >= 1.9） \{#microbatch-strategy\}

增量策略 `microbatch` 自 dbt-core 1.9 版本起就是一项特性，旨在高效处理大规模时间序列数据转换。在 dbt-clickhouse 中，它构建在现有的 `delete_insert` 增量策略之上，通过基于 `event_time` 和 `batch_size` 模型配置，将增量拆分为预定义的、按时间序列划分的批次来实现。

除处理大规模转换之外，微批还提供了以下能力：

- [重新处理失败批次](https://docs.getdbt.com/docs/build/incremental-microbatch#retry)。
- 自动检测[并行批次执行](https://docs.getdbt.com/docs/build/parallel-batch-execution)。
- 消除在[回填](https://docs.getdbt.com/docs/build/incremental-microbatch#backfills)中对复杂条件逻辑的需求。

有关微批的详细用法，请参考[官方文档](https://docs.getdbt.com/docs/build/incremental-microbatch)。

##### 可用的微批配置 \{#available-microbatch-configurations\}

| Option             | Description                                                                                                                                                                                                                                                                                                                                | Default if any     |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|
| event_time         | 表示“该行发生时间”的列。对于你的微批模型以及任何需要按时间过滤的直接父模型，此列都是必需的。                                                                                                                                                                                                                                                 |                    |
| begin              | 微批模型的“时间起点”。这是任何初次构建或全量刷新（full-refresh）构建的起始时间点。例如，对于一个按天粒度的微批模型，在 2024-10-01 运行且 begin = '2023-10-01 时，将会处理 366 个批次（这是闰年！）外加“今天”的批次。                                                                                                                             |                    |
| batch_size         | 批次的粒度。支持的取值为 `hour`、`day`、`month` 和 `year`。                                                                                                                                                                                                                                                                                 |                    |
| lookback           | 在最新书签（bookmark）之前额外处理 X 个批次，以捕获延迟到达的记录。                                                                                                                                                                                                                                                                         | 1                  |
| concurrent_batches | 覆盖 dbt 对并发（同时）运行批次的自动检测行为。详细参见[配置并发批次](https://docs.getdbt.com/docs/build/incremental-microbatch#configure-concurrent_batches)。设置为 true 时，将并发（并行）运行批次；设置为 false 时，将顺序（一个接一个）运行批次。                                                                                                   |                    |

#### 追加策略 \{#append-strategy\}

该策略替代了先前版本 dbt-clickhouse 中的 `inserts_only` 设置。此方法只是简单地将新行追加到现有关系中。
因此不会去除重复行，也不会创建临时或中间表。如果数据中允许存在重复行，或通过增量查询的 WHERE 子句或过滤条件排除了重复行，这是最快的策略。

#### insert_overwrite 策略（实验性） \{#insert-overwrite-strategy\}

> [IMPORTANT]  
> 目前，insert_overwrite 策略在分布式物化场景下尚未完全可用。

执行以下步骤：

1. 使用与增量模型关联关系相同结构创建一个 staging（临时）表：  
   `CREATE TABLE <staging> AS <target>`。
2. 将仅包含新记录（由 `SELECT` 产生）的数据插入到 staging 表中。
3. 仅将新分区（存在于 staging 表中的分区）替换到目标表中。

这种方法具有以下优点：

- 比默认策略更快，因为它不会复制整张表。
- 比其他策略更安全，因为在 INSERT 操作成功完成之前，它不会修改原始表：如果在中间步骤失败，原始表不会被修改。
- 实现了“分区不可变性”的数据工程最佳实践，从而简化增量和并行数据处理、回滚等操作。

该策略要求在模型配置中设置 `partition_by`，并会忽略模型配置中所有其他特定于策略的参数。

## 物化方式：materialized_view \{#materialized-view\}

`materialized_view` 物化方式会创建一个 ClickHouse [materialized view](/sql-reference/statements/create/view#materialized-view)，其充当插入触发器，自动将来自源表的新行进行转换并插入到目标表中。这是 dbt-clickhouse 中最强大的物化方式之一。

由于内容较多，该物化方式有其专门的页面。**[前往 Materialized Views 指南](/integrations/dbt/materialized-views)** 查看完整文档。

## 物化：dictionary（实验性） \{#materialization-dictionary\}

请参阅
https://github.com/ClickHouse/dbt-clickhouse/blob/main/tests/integration/adapter/dictionary/test_dictionary.py 中的测试，
以了解如何为 ClickHouse 字典
实现物化的示例

## 物化：distributed_table（实验性） \{#materialization-distributed-table\}

通过以下步骤创建分布式表：

1. 使用 SQL 查询创建临时视图，以获得正确的表结构
2. 基于视图创建空的本地表
3. 基于本地表创建分布式表
4. 将数据插入分布式表，从而实现跨分片分布且不会产生重复数据。

注意：

- 为确保下游增量物化操作能够正确执行，dbt-clickhouse 现在会在查询中自动包含设置项 `insert_distributed_sync = 1`。这可能会导致某些分布式表的插入操作比预期运行得更慢。

### 分布式表模型示例 \{#distributed-table-model-example\}

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


### 自动生成的迁移 \{#distributed-table-generated-migrations\}

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


### 配置 \{#distributed-table-configurations\}

针对该物化类型的特定配置如下：

| Option                 | Description                                                                                                                                                                                                                                                                                                          | Default if any |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| sharding_key           | 分片键用于在向 Distributed 引擎表插入数据时确定目标服务器。分片键可以是随机值，也可以是哈希函数的输出                                                                                                                                                                                                                      | `rand()`)      |

## materialization: distributed_incremental（实验性） \{#materialization-distributed-incremental\}

该增量模型与分布式表的设计理念相同，主要难点在于要正确处理所有增量策略。

1. _Append 策略_ 只向分布式表追加数据。
2. _Delete+Insert 策略_ 会创建分布式临时表，以便在每个分片上处理全部数据。
3. _Default（旧版）策略_ 出于同样的原因会创建分布式临时表和中间表。

只有分片上的表会被替换，因为分布式表本身不保存数据。
只有在启用 `full_refresh` 模式或表结构可能发生变化时，分布式表才会重新加载。

### 分布式增量模型示例 \{#distributed-incremental-model-example\}

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


### 自动生成的迁移 \{#distributed-incremental-generated-migrations\}

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


## Snapshot \{#snapshot\}

dbt snapshots 允许对可变模型随时间发生的变更进行记录。这样一来，就可以对模型执行时点查询，使分析人员能够“回溯”到模型之前的状态。ClickHouse 连接器支持此功能，并可使用以下语法进行配置：

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

如需了解更多配置相关信息，请参阅 [snapshot configs](https://docs.getdbt.com/docs/build/snapshots#snapshot-configs) 参考页面。


## 契约和约束 \{#contracts-and-constraints\}

只支持精确匹配列类型的契约。例如，如果契约中指定的列类型为 UInt32，而模型返回的是 UInt64 或其他整数类型，则会失败。
ClickHouse 还 _只_ 支持作用于整个表/模型的 `CHECK` 约束。不支持主键、外键、唯一约束以及列级 `CHECK` 约束。
（参见 ClickHouse 关于主键和 ORDER BY 键的文档。）