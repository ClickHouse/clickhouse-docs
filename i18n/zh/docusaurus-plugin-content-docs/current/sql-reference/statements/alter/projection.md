---
slug: /sql-reference/statements/alter/projection
sidebar_position: 49
sidebar_label: PROJECTION
title: '投影'
---

投影以优化查询执行的格式存储数据，该功能对于以下情况非常有用：
- 在不属于主键的列上运行查询
- 预聚合列，这将减少计算和IO

您可以为一个表定义一个或多个投影，在查询分析期间，ClickHouse将选择扫描数据最少的投影，而不会修改用户提供的查询。

:::note 磁盘使用

投影将在内部创建一个新的隐藏表，这意味着将需要更多的IO和磁盘空间。
例如，如果投影定义了不同的主键，则原始表中的所有数据将被复制。
:::

您可以在这个 [页面](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections) 查看有关投影如何在内部工作的更多技术细节。

## 示例：不使用主键的过滤 {#example-filtering-without-using-primary-keys}

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
使用 `ALTER TABLE`，我们可以向现有表添加投影：
```sql
ALTER TABLE visits_order ADD PROJECTION user_name_projection (
SELECT
*
ORDER BY user_name
)

ALTER TABLE visits_order MATERIALIZE PROJECTION user_name_projection
```
插入数据：
```sql
INSERT INTO visits_order SELECT
    number,
    'test',
    1.5 * (number / 2),
    'Android'
FROM numbers(1, 100);
```

投影将允许我们快速按 `user_name` 进行过滤，即使在原始表中 `user_name` 并未定义为 `PRIMARY_KEY`。
在查询时，ClickHouse 确定如果使用该投影，将处理更少的数据，因为数据是按 `user_name` 排序的。
```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

要验证查询是否使用了投影，我们可以查看 `system.query_log` 表。在 `projections` 字段中，我们可以看到所使用的投影名称，或者如果没有使用则为空：
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## 示例：预聚合查询 {#example-pre-aggregation-query}

使用投影创建表：
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
我们将执行一个第一次使用 `GROUP BY` 的查询，使用 `user_agent` 字段，该查询将不使用定义的投影，因为预聚合不匹配。
```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

要使用投影，我们可以执行选择部分或全部预聚合和 `GROUP BY` 字段的查询。
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

如前所述，我们可以查看 `system.query_log` 表。在 `projections` 字段中，我们可以看到所使用的投影名称，或者如果没有使用则为空：
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


# 操作投影

以下操作适用于 [投影](/engines/table-engines/mergetree-family/mergetree.md/#projections)：

## ADD PROJECTION {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] )` - 向表元数据添加投影描述。

## DROP PROJECTION {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - 从表元数据中删除投影描述并从磁盘删除投影文件。实现为 [突变](/sql-reference/statements/alter/index.md#mutations)。

## MATERIALIZE PROJECTION {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 查询在分区 `partition_name` 中重建投影 `name`。实现为 [突变](/sql-reference/statements/alter/index.md#mutations)。

## CLEAR PROJECTION {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 从磁盘删除投影文件而不删除描述。实现为 [突变](/sql-reference/statements/alter/index.md#mutations)。

`ADD`、`DROP`和 `CLEAR` 命令是轻量级的，因为它们仅更改元数据或删除文件。

此外，它们是复制的，通过 ClickHouse Keeper 或 ZooKeeper 同步投影元数据。

:::note
仅支持对具有 [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 引擎的表（包括 [复制的](/engines/table-engines/mergetree-family/replication.md) 变体）进行投影操作。
:::
