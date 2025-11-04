---
'description': '用于操作投影的文档'
'sidebar_label': 'PROJECTION'
'sidebar_position': 49
'slug': '/sql-reference/statements/alter/projection'
'title': '投影'
'doc_type': 'reference'
---

Projections store data in a format that optimizes query execution, this feature is useful for:
- 在不是主键的列上运行查询
- 预聚合列，这将减少计算和 IO

您可以为一个表定义一个或多个投影，并且在查询分析期间，将由 ClickHouse 选择数据扫描量最少的投影，而不会修改用户提供的查询。

:::note 磁盘使用情况

投影将内部创建一个新的隐藏表，这意味着将需要更多的 IO 和磁盘空间。
例如，如果投影定义了不同的主键，则原始表中的所有数据将会被重复。
:::

您可以在此 [页面](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections) 查看有关投影如何在内部工作的更多技术细节。

## 示例：未使用主键的过滤 {#example-filtering-without-using-primary-keys}

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
使用 `ALTER TABLE`，我们可以将投影添加到现有表中：
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
在查询时，ClickHouse 确定如果使用投影，将处理更少的数据，因为数据是按 `user_name` 排序的。
```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

要验证查询是否使用投影，我们可以查看 `system.query_log` 表。在 `projections` 字段中，我们可以找到所使用的投影名称，如果没有使用任何，则为空：
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
我们将执行第一个查询，使用 `GROUP BY` 和字段 `user_agent`，该查询将不会使用定义的投影，因为预聚合不匹配。
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

如前所述，我们可以查看 `system.query_log` 表。在 `projections` 字段中，我们可以找到所使用的投影名称，如果没有使用任何，则为空：
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## 带有 `_part_offset` 字段的正常投影 {#normal-projection-with-part-offset-field}

创建一个带有正常投影的表，该投影利用 `_part_offset` 字段：

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

### 使用 `_part_offset` 作为二级索引 {#normal-projection-secondary-index}

`_part_offset` 字段在合并和变更中保留其值，这使得它对于二级索引非常有价值。我们可以在查询中利用这一点：

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


# 操作投影

以下与 [projections](/engines/table-engines/mergetree-family/mergetree.md/#projections) 相关的操作是可用的：

## 添加投影 {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] )` - 向表元数据添加投影描述。

## 删除投影 {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - 从表元数据中删除投影描述，并从磁盘删除投影文件。作为 [mutation](/sql-reference/statements/alter/index.md#mutations) 实现。

## 物化投影 {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 该查询在分区 `partition_name` 中重建投影 `name`。作为 [mutation](/sql-reference/statements/alter/index.md#mutations) 实现。

## 清除投影 {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 从磁盘删除投影文件而不删除描述。作为 [mutation](/sql-reference/statements/alter/index.md#mutations) 实现。

命令 `ADD`、`DROP` 和 `CLEAR` 是轻量级的，因为它们仅更改元数据或删除文件。

此外，它们是可复制的，通过 ClickHouse Keeper 或 ZooKeeper 同步投影元数据。

:::note
投影操作仅支持使用 [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 引擎的表（包括 [replicated](/engines/table-engines/mergetree-family/replication.md) 变体）。
:::
