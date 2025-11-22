---
description: '投影操作文档'
sidebar_label: '投影'
sidebar_position: 49
slug: /sql-reference/statements/alter/projection
title: '投影（Projections）'
doc_type: 'reference'
---

投影以一种优化查询执行的格式存储数据，该功能在以下场景中非常有用：
- 在不属于主键的列上运行查询
- 对列进行预聚合，从而同时减少计算和 I/O

可以为一张表定义一个或多个投影。在查询分析阶段，ClickHouse 会在不修改用户提交查询的前提下，选择需要扫描数据量最少的投影。

:::note 磁盘使用情况

投影会在内部创建一个新的隐藏表，这意味着会需要更多的 I/O 和磁盘空间。
例如，如果投影定义了不同的主键，来自原始表的所有数据都会被复制一份。
:::

可以在此[页面](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections)了解有关投影内部工作机制的更多技术细节。



## 不使用主键进行过滤的示例 {#example-filtering-without-using-primary-keys}

创建表:

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

使用 `ALTER TABLE`,我们可以向现有表添加投影:

```sql
ALTER TABLE visits_order ADD PROJECTION user_name_projection (
SELECT
*
ORDER BY user_name
)

ALTER TABLE visits_order MATERIALIZE PROJECTION user_name_projection
```

插入数据:

```sql
INSERT INTO visits_order SELECT
    number,
    'test',
    1.5 * (number / 2),
    'Android'
FROM numbers(1, 100);
```

即使在原始表中 `user_name` 未定义为 `PRIMARY_KEY`,投影也能让我们快速按 `user_name` 进行过滤。
在查询时,ClickHouse 会判断使用投影将处理更少的数据,因为数据已按 `user_name` 排序。

```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

要验证查询是否使用了投影,我们可以查看 `system.query_log` 表。在 `projections` 字段中,如果使用了投影则显示投影名称,否则为空:

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


## 预聚合查询示例 {#example-pre-aggregation-query}

创建带有投影的表:

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

插入数据:

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

我们将执行第一个查询,使用 `GROUP BY` 对 `user_agent` 字段进行分组,此查询不会使用已定义的投影,因为预聚合条件不匹配。

```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

要使用投影,我们可以执行查询来选择部分或全部预聚合字段和 `GROUP BY` 字段。

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

如前所述,我们可以查看 `system.query_log` 表。在 `projections` 字段中,会显示所使用的投影名称,如果未使用任何投影则为空:

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


## 使用 `_part_offset` 字段的普通投影 {#normal-projection-with-part-offset-field}

创建一个使用 `_part_offset` 字段的普通投影表：

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

`_part_offset` 字段在合并和变更操作中保持其值不变，这使其在二级索引场景中非常有价值。我们可以在查询中利用这一特性：

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


# 投影操作

可以对[投影](/engines/table-engines/mergetree-family/mergetree.md/#projections)执行以下操作：



## 添加投影 {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] )` - 将投影描述添加到表的元数据中。


## DROP PROJECTION {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - 从表的元数据中删除投影描述,并从磁盘中删除投影文件。该操作以[变更(mutation)](/sql-reference/statements/alter/index.md#mutations)方式实现。


## 物化投影 {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 该查询在分区 `partition_name` 中重建投影 `name`。作为[变更操作](/sql-reference/statements/alter/index.md#mutations)实现。


## 清除投影 {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 从磁盘删除投影文件,但保留其定义。实现为[变更操作](/sql-reference/statements/alter/index.md#mutations)。

`ADD`、`DROP` 和 `CLEAR` 命令是轻量级操作,仅修改元数据或删除文件。

此外,这些操作会被复制,通过 ClickHouse Keeper 或 ZooKeeper 同步投影元数据。

:::note
投影操作仅支持 [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 引擎系列的表(包括[复制](/engines/table-engines/mergetree-family/replication.md)变体)。
:::
