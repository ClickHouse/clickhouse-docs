---
description: '投影操作文档'
sidebar_label: 'PROJECTION'
sidebar_position: 49
slug: /sql-reference/statements/alter/projection
title: '投影'
doc_type: 'reference'
---

本文将介绍什么是投影、如何使用投影，并说明多种用于操作投影的选项。

## 投影概述 \{#overview\}

投影会以一种优化查询执行的格式存储数据，在以下场景中非常有用：

- 在不属于主键的列上运行查询
- 对列进行预聚合，从而同时减少计算和 IO

你可以为一张表定义一个或多个投影。在查询分析阶段，ClickHouse 会在不修改用户所提供查询的前提下，自动选择需要扫描数据量最少的投影。

:::note[磁盘使用情况]
投影会在内部创建一个新的隐藏表，这意味着需要更多的 IO 和磁盘空间。
例如，如果投影定义了不同的主键，则来自原始表的所有数据都会被复制一份。
:::

你可以在[此页面](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections)中查看更多关于投影内部工作机制的技术细节。

## 使用投影 \{#examples\}

### 未使用主键的过滤示例 \{#example-filtering-without-using-primary-keys\}

创建表：

```sql
CREATE TABLE visits_order
(
   `user_id` UInt64,
   `user_name` String,
   `pages_visited` Nullable(Float64),
   `user_agent` String
)
ENGINE = MergeTree()
PRIMARY KEY user_agent
```

使用 `ALTER TABLE`，我们可以向现有表添加该 Projection：

```sql
ALTER TABLE visits_order ADD PROJECTION user_name_projection (
SELECT
*
ORDER BY user_name
)

ALTER TABLE visits_order MATERIALIZE PROJECTION user_name_projection
```

写入数据：

```sql
INSERT INTO visits_order SELECT
    number,
    'test',
    1.5 * (number / 2),
    'Android'
FROM numbers(1, 100);
```

该 Projection 使我们即使在原始表中未将 `user_name` 定义为 `PRIMARY_KEY`，也能快速按 `user_name` 进行过滤。
在查询时，ClickHouse 会判断如果使用该 Projection，可以处理更少的数据，因为数据是按 `user_name` 排序的。

```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

要验证某个查询是否使用了投影，我们可以查看 `system.query_log` 表。在 `projections` 字段中，会显示所使用的投影名称；如果未使用任何投影，该字段则为空：

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


### 预聚合查询示例 \{#example-pre-aggregation-query\}

创建包含 PROJECTION `projection_visits_by_user` 的表：

```sql
CREATE TABLE visits
(
   `user_id` UInt64,
   `user_name` String,
   `pages_visited` Nullable(Float64),
   `user_agent` String,
   PROJECTION projection_visits_by_user
   (
       SELECT
           user_agent,
           sum(pages_visited)
       GROUP BY user_id, user_agent
   )
)
ENGINE = MergeTree()
ORDER BY user_agent
```

插入数据：

```sql
INSERT INTO visits SELECT
    number,
    'test',
    1.5 * (number / 2),
    'Android'
FROM numbers(1, 100);
```

```sql
INSERT INTO visits SELECT
    number,
    'test',
    1. * (number / 2),
   'IOS'
FROM numbers(100, 500);
```

执行第一条使用字段 `user_agent` 的 `GROUP BY` 查询。
此查询不会使用已定义的投影，因为其与预聚合条件不匹配。

```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

要使用该 PROJECTION，可以执行查询，从预聚合结果和 `GROUP BY` 字段中选择部分或全部内容：

```sql
SELECT
    user_agent
FROM visits
WHERE user_id > 50 AND user_id < 150
GROUP BY user_agent
```

```sql
SELECT
    user_agent,
    sum(pages_visited)
FROM visits
GROUP BY user_agent
```

如前所述，你可以查看 `system.query_log` 表来判断是否使用了投影。
`projections` 字段显示所使用投影的名称。
如果未使用任何投影，该字段将为空：

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


### 带有 `_part_offset` 字段的常规投影 \{#normal-projection-with-part-offset-field\}

创建一个带有常规投影并使用 `_part_offset` 字段的表：

```sql
CREATE TABLE events
(
    `event_time` DateTime,
    `event_id` UInt64,
    `user_id` UInt64,
    `huge_string` String,
    PROJECTION order_by_user_id
    (
        SELECT
            _part_offset
        ORDER BY user_id
    )
)
ENGINE = MergeTree()
ORDER BY (event_id);
```

插入一些示例数据：

```sql
INSERT INTO events SELECT * FROM generateRandom() LIMIT 100000;
```


#### 将 `_part_offset` 用作二级索引 \{#normal-projection-secondary-index\}

`_part_offset` 字段在合并和变更操作过程中会保留其值，因此非常适合作为二级索引使用。我们可以在查询中加以利用：

```sql
SELECT
    count()
FROM events
WHERE _part_starting_offset + _part_offset IN (
    SELECT _part_starting_offset + _part_offset
    FROM events
    WHERE user_id = 42
)
SETTINGS enable_shared_storage_snapshot_in_query = 1
```


## 投影操作 \{#manipulating-projections\}

可以执行以下关于[投影](/engines/table-engines/mergetree-family/mergetree.md/#projections)的操作：

### ADD PROJECTION \{#add-projection\}

使用下面的语句向表的元数据中添加投影定义：

```sql
ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] ) [WITH SETTINGS ( setting_name1 = setting_value1, setting_name2 = setting_value2, ...)]
```


#### `WITH SETTINGS` 子句 \{#with-settings\}

`WITH SETTINGS` 定义了**投影级别设置**，用于自定义该投影如何存储数据（例如 `index_granularity` 或 `index_granularity_bytes`）。
这些设置与 **MergeTree 表设置** 直接对应，但**仅应用于此投影**。

示例：

```sql
ALTER TABLE t
ADD PROJECTION p (
    SELECT x ORDER BY x
) WITH SETTINGS (
    index_granularity = 4096,
    index_granularity_bytes = 1048576
);
```

PROJECTION 的设置会覆盖该 PROJECTION 实际生效的表设置，但需遵守校验规则（例如，无效或不兼容的覆盖将被拒绝）。


### DROP PROJECTION \{#drop-projection\}

使用如下语句从表的元数据中移除投影定义，并从磁盘中删除投影文件。
其实现方式为一种[变更](/sql-reference/statements/alter/index.md#mutations)操作。

```sql
ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name
```


### MATERIALIZE PROJECTION \{#materialize-projection\}

此语句会在分区 `partition_name` 中重建投影 `name`。其实现方式为一次[变更操作](/sql-reference/statements/alter/index.md#mutations)。

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]
```


### CLEAR PROJECTION \{#clear-projection\}

使用以下语句在不删除其定义的情况下，从磁盘中删除投影文件。
其实现方式为一种[变更](/sql-reference/statements/alter/index.md#mutations)操作。

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]
```

命令 `ADD`、`DROP` 和 `CLEAR` 在某种意义上是轻量级操作，因为它们只会更改元数据或删除文件。
此外，这些操作是可复制的，会通过 ClickHouse Keeper 或 ZooKeeper 同步投影元数据。

:::note
只有使用 [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 引擎（包括其[复制](/engines/table-engines/mergetree-family/replication.md)变体）的表才支持对投影的操作。
:::


### 控制 PROJECTION 合并行为 \{#control-projections-merges\}

当你执行查询时，ClickHouse 会在从原始表或其某个 PROJECTION 中读取数据之间进行选择。
是否从原始表或其某个 PROJECTION 读取数据，会针对每一个表的分区片段单独做出决策。
ClickHouse 通常会尽可能少地读取数据，并使用一些技巧来识别最合适的分区片段，例如对某个分区片段的主键进行采样。
在某些情况下，源表的分区片段没有对应的 PROJECTION 分区片段。
例如，这可能是因为在 SQL 中为表创建 PROJECTION 默认是“惰性”的——它只影响新插入的数据，而保持现有分区片段不变。

由于某个 PROJECTION 已经包含预计算的聚合值，ClickHouse 会尝试从相应的 PROJECTION 分区片段中读取，以避免在查询运行时再次进行聚合。
如果某个具体的分区片段缺少对应的 PROJECTION 分区片段，则查询执行会回退到使用原始分区片段。

但是，如果原始表中的行因较为复杂的数据分区片段后台合并而以较为复杂的方式发生变化，会发生什么？
例如，假设该表使用 `ReplacingMergeTree` 表引擎存储。
如果在合并过程中在多个输入分区片段中检测到相同的行，则只会保留最新的行版本（来自最近插入的分区片段），而所有较旧的版本都会被丢弃。

类似地，如果该表使用 `AggregatingMergeTree` 表引擎存储，合并操作可以将输入分区片段中具有相同主键值的行折叠为单行，以更新部分聚合状态。

在 ClickHouse v24.8 之前，PROJECTION 分区片段要么悄然与主表数据不同步，要么某些操作（如更新和删除）根本无法执行，因为如果表存在 PROJECTION，数据库会自动抛出异常。

从 v24.8 开始，一个新的表级设置 [`deduplicate_merge_projection_mode`](/operations/settings/merge-tree-settings#deduplicate_merge_projection_mode) 用于控制当上述较为复杂的后台合并操作发生在原始表的分区片段中时的行为。

删除变更（delete mutations）是另一种在原始表分区片段中删除行的分区片段合并操作示例。自 v24.7 起，我们还提供了一个设置，用于控制由轻量级删除触发的删除变更的行为：[`lightweight_mutation_projection_mode`](/operations/settings/merge-tree-settings#deduplicate_merge_projection_mode)。

下面是 `deduplicate_merge_projection_mode` 和 `lightweight_mutation_projection_mode` 两个设置可能的取值：

- `throw`（默认）：抛出异常，防止 PROJECTION 分区片段与主表数据发生不同步。
- `drop`：丢弃受影响的 PROJECTION 表分区片段。对于受影响的 PROJECTION 分区片段，查询将回退到原始表分区片段。
- `rebuild`：重建受影响的 PROJECTION 分区片段，以保持与原始表分区片段中的数据一致。

## 另请参阅 \{#see-also\}

- ["在合并过程中控制 Projections"（博客文章）](https://clickhouse.com/blog/clickhouse-release-24-08#control-of-projections-during-merges)
- ["Projections"（指南)](/data-modeling/projections#using-projections-to-speed-up-UK-price-paid)
- ["Materialized Views 与 Projections 对比"](https://clickhouse.com/docs/managing-data/materialized-views-versus-projections)