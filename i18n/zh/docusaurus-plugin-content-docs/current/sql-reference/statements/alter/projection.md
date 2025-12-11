---
description: '投影操作文档'
sidebar_label: '投影'
sidebar_position: 49
slug: /sql-reference/statements/alter/projection
title: '投影'
doc_type: 'reference'
---

投影会以一种优化查询执行的格式存储数据，在以下场景中非常有用：
- 在不属于主键的列上运行查询
- 对列进行预聚合，从而同时减少计算和 IO

你可以为一张表定义一个或多个投影。在查询分析阶段，ClickHouse 会在不修改用户所提供查询的前提下，自动选择需要扫描数据量最少的投影。

:::note 磁盘使用情况

投影会在内部创建一个新的隐藏表，这意味着需要更多的 IO 和磁盘空间。
例如，如果投影定义了不同的主键，则来自原始表的所有数据都会被复制一份。
:::

你可以在[此页面](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections)中查看更多关于投影内部工作机制的技术细节。

## 未使用主键的过滤示例 {#example-filtering-without-using-primary-keys}

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

## 预聚合查询示例 {#example-pre-aggregation-query}

创建包含 Projection 的表：

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

我们将基于字段 `user_agent` 执行第一个 `GROUP BY` 查询；由于预聚合条件不匹配，该查询不会使用已定义的投影。

```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

要使用该投影时，我们可以执行查询，从预聚合字段和 `GROUP BY` 字段中选择部分或全部列。

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

如前所述，我们可以查看 `system.query_log` 表。在 `projections` 字段中，可以看到所使用的投影名称；如果未使用投影，该字段则为空。

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## 带有 `_part_offset` 字段的常规投影 {#normal-projection-with-part-offset-field}

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

### 将 `_part_offset` 用作二级索引 {#normal-projection-secondary-index}

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

# 投影操作 {#manipulating-projections}

可以执行以下关于[投影](/engines/table-engines/mergetree-family/mergetree.md/#projections)的操作：

## ADD PROJECTION {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT &lt;COLUMN LIST EXPR&gt; [GROUP BY] [ORDER BY] )` - 在表的元数据中添加投影定义。

## DROP PROJECTION {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - 从表的元数据中移除投影描述，并从磁盘中删除投影文件。以[变更](/sql-reference/statements/alter/index.md#mutations)的形式实现。

## MATERIALIZE PROJECTION {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` —— 此查询会在分区 `partition_name` 中重建投影 `name`。其实现方式为一次[变更操作](/sql-reference/statements/alter/index.md#mutations)。

## CLEAR PROJECTION {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 在不删除其定义的情况下，从磁盘中删除投影文件。其实现方式为一种[变更](/sql-reference/statements/alter/index.md#mutations)。

命令 `ADD`、`DROP` 和 `CLEAR` 在某种意义上可以认为是轻量级的，因为它们只会更改元数据或删除文件。

此外，这些操作是可复制的，会通过 ClickHouse Keeper 或 ZooKeeper 同步投影元数据。

:::note
只有使用 [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 引擎（包括[复制](/engines/table-engines/mergetree-family/replication.md)引擎变体）的表才支持对投影的操作。
:::
