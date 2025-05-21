---
'description': 'Documentation for Manipulating Projections'
'sidebar_label': 'PROJECTION'
'sidebar_position': 49
'slug': '/sql-reference/statements/alter/projection'
'title': 'Projections'
---



Projections 将数据存储在优化查询执行的格式中，此特性适用于：
- 在不是主键的一列上运行查询
- 预聚合列，这将减少计算和 IO

您可以为一个表定义一个或多个 Projections，在查询分析期间，ClickHouse 将选择扫描数据最少的 Projection，而无需修改用户提供的查询。

:::note 磁盘使用情况

Projections 将在内部创建一个新的隐藏表，这意味着需要更多的 IO 和磁盘空间。
例如，如果 Projection 定义了不同的主键，原始表中的所有数据将被重复。
:::

您可以在此 [页面](https://clickhouse.com/docs/en/guides/best-practices/sparse-primary-indexes/#option-3-projections) 查看有关 Projections 如何在内部工作更多的技术细节。

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
使用 `ALTER TABLE`，我们可以将 Projection 添加到现有表中：
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

即使在原始表中 `user_name` 没有被定义为 `PRIMARY_KEY`，Projection 也将允许我们快速按 `user_name` 进行过滤。
在查询时，ClickHouse 确定如果使用 Projection，将处理更少的数据，因为数据是按 `user_name` 排序的。
```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

要验证查询是否使用了 Projection，我们可以查看 `system.query_log` 表。在 `projections` 字段中，我们会看到所使用的 Projection 名称，如果没有使用，则为空：
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## 示例：预聚合查询 {#example-pre-aggregation-query}

创建带有 Projection 的表：
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
我们将执行第一次使用 `GROUP BY` 的查询，使用字段 `user_agent`，由于预聚合不匹配，此查询将不会使用定义的 Projection。
```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

要使用 Projection，我们可以执行查询，选择部分或全部的预聚合和 `GROUP BY` 字段。
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

如前所述，我们可以查看 `system.query_log` 表。在 `projections` 字段中，我们会看到所使用的 Projection 名称，如果没有使用，则为空：
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## 正常 Projection 和 `_part_offset` 字段 {#normal-projection-with-part-offset-field}

创建一个使用 `_part_offset` 字段的正常 Projection 的表：

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

### 使用 `_part_offset` 作为次级索引 {#normal-projection-secondary-index}

`_part_offset` 字段在合并和变更中保持其值，使其对次级索引非常有价值。我们可以在查询中利用这一点：

```sql
SELECT
    count()
FROM events
WHERE (_part, _part_offset) IN (
    SELECT _part, _part_offset
    FROM events
    WHERE user_id = 42
)
```


# 操作 Projections

以下操作与 [projections](/engines/table-engines/mergetree-family/mergetree.md/#projections) 相关：

## ADD PROJECTION {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] )` - 将 Projection 描述添加到表元数据。

## DROP PROJECTION {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - 从表元数据中移除 Projection 描述并删除磁盘上的 Projection 文件。作为 [mutation](/sql-reference/statements/alter/index.md#mutations) 实现。

## MATERIALIZE PROJECTION {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 查询在 `partition_name` 中重建 Projection `name`。作为 [mutation](/sql-reference/statements/alter/index.md#mutations) 实现。

## CLEAR PROJECTION {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 删除磁盘上的 Projection 文件而不移除描述。作为 [mutation](/sql-reference/statements/alter/index.md#mutations) 实现。

命令 `ADD`、`DROP` 和 `CLEAR` 是轻量级的，因为它们只更改元数据或删除文件。

此外，它们是被复制的，通过 ClickHouse Keeper 或 ZooKeeper 同步 Projection 元数据。

:::note
Projection 操作仅支持具有 [`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) 引擎的表（包括 [replicated](/engines/table-engines/mergetree-family/replication.md) 变体）。
:::
