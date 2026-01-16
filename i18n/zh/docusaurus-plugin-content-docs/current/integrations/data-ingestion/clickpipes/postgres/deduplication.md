---
sidebar_label: '去重策略'
description: '处理重复数据和已删除的行。'
slug: /integrations/clickpipes/postgres/deduplication
title: '去重策略（使用 CDC）'
keywords: ['deduplication', 'postgres', 'clickpipes', 'replacingmergetree', 'final']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

从 Postgres 复制到 ClickHouse 的更新和删除操作，会由于 ClickHouse 的数据存储结构和复制过程而在 ClickHouse 中产生重复行。本页说明为何会出现这种情况，以及在 ClickHouse 中用于处理重复数据的策略。

## 数据是如何复制的？ \\{#how-does-data-get-replicated\\}

### PostgreSQL 逻辑解码 \\{#PostgreSQL-logical-decoding\\}

ClickPipes 使用 [Postgres Logical Decoding](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication) 来读取 Postgres 中发生的变更。Postgres 中的 Logical Decoding 过程使得像 ClickPipes 这样的客户端能够以人类可读的格式接收变更，即一系列 INSERT、UPDATE 和 DELETE 操作。

### ReplacingMergeTree \\{#replacingmergetree\\}

ClickPipes 使用 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 引擎将 Postgres 表映射到 ClickHouse。ClickHouse 在仅追加写入（append-only）类型的工作负载下性能最佳，并且不建议频繁执行 UPDATE 操作。这正是 ReplacingMergeTree 发挥强大作用的典型场景。

使用 ReplacingMergeTree 时，更新会被建模为插入一条具有更高版本号（`_peerdb_version`）的新行，而删除则是插入一条具有更高版本号且 `_peerdb_is_deleted` 标记为 true 的新行。ReplacingMergeTree 引擎会在后台对数据进行去重/合并，并为给定主键（id）保留该行的最新版本，从而能够高效地将 UPDATE 和 DELETE 作为带版本的插入来处理。

下面是 ClickPipes 在 ClickHouse 中创建表时执行的一个 CREATE TABLE 语句示例。

```sql
CREATE TABLE users
(
    `id` Int32,
    `reputation` String,
    `creationdate` DateTime64(6),
    `displayname` String,
    `lastaccessdate` DateTime64(6),
    `aboutme` String,
    `views` Int32,
    `upvotes` Int32,
    `downvotes` Int32,
    `websiteurl` String,
    `location` String,
    `accountid` Int32,
    `_peerdb_synced_at` DateTime64(9) DEFAULT now64(),
    `_peerdb_is_deleted` Int8,
    `_peerdb_version` Int64
)
ENGINE = ReplacingMergeTree(_peerdb_version)
PRIMARY KEY id
ORDER BY id;
```


### 示例说明 \\{#illustrative-example\\}

下图演示了一个基础示例：使用 ClickPipes 在 PostgreSQL 与 ClickHouse 之间同步 `users` 表。

<Image img={clickpipes_initial_load} alt="ClickPipes 初始加载" size="lg" />

**步骤 1** 展示了 PostgreSQL 中 2 行数据的初始快照，以及 ClickPipes 将这 2 行数据首次加载到 ClickHouse 的过程。可以看到，这两行数据被原样复制到了 ClickHouse 中。

**步骤 2** 展示了对 `users` 表的三种操作：插入新行、更新已有行以及删除另一行。

**步骤 3** 展示了 ClickPipes 如何将这些 INSERT、UPDATE 和 DELETE 操作以带版本的插入形式复制到 ClickHouse。UPDATE 操作会作为 ID 为 2 的新版本行出现，而 DELETE 操作会作为 ID 为 1 的新版本行出现，并通过 `_is_deleted` 标记为 true。正因如此，ClickHouse 中比 PostgreSQL 多出三行数据。

因此，执行类似 `SELECT count(*) FROM users;` 这样的简单查询时，在 ClickHouse 和 PostgreSQL 中可能得到不同的结果。根据 [ClickHouse 合并文档](/merges#replacing-merges) 的说明，过时的行版本最终会在合并过程中被丢弃。然而，这个合并发生的时间是不可预测的，这意味着在合并发生之前，ClickHouse 中的查询结果可能会不一致。

我们如何才能保证在 ClickHouse 和 PostgreSQL 中获得相同的查询结果？

### 使用 FINAL 关键字去重 \\{#deduplicate-using-final-keyword\\}

在 ClickHouse 查询中，推荐的去重方式是使用 [FINAL 修饰符。](/sql-reference/statements/select/from#final-modifier) 这可以确保只返回去重后的行。

下面我们来看如何将其应用于三种不同的查询。

*请注意以下查询中的 WHERE 子句，用于过滤被标记为删除的行。*

* **简单计数查询**：统计帖子数量。

这是用来检查同步是否正常进行的最简单查询。这两个系统中的查询都应该返回相同的计数结果。

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL WHERE _peerdb_is_deleted=0;
```

* **带有 JOIN 的简单聚合**：累计浏览量最高的前 10 位用户。

这是在单个表上的聚合示例。如果这里存在重复行，会极大影响 sum 函数的结果。

```sql
-- PostgreSQL 
SELECT
    sum(p.viewcount) AS viewcount,
    p.owneruserid AS user_id,
    u.displayname AS display_name
FROM posts p
LEFT JOIN users u ON u.id = p.owneruserid
-- highlight-next-line
WHERE p.owneruserid > 0
GROUP BY user_id, display_name
ORDER BY viewcount DESC
LIMIT 10;

-- ClickHouse 
SELECT
    sum(p.viewcount) AS viewcount,
    p.owneruserid AS user_id,
    u.displayname AS display_name
FROM posts AS p
FINAL
LEFT JOIN users AS u
FINAL ON (u.id = p.owneruserid) AND (u._peerdb_is_deleted = 0)
-- highlight-next-line
WHERE (p.owneruserid > 0) AND (p._peerdb_is_deleted = 0)
GROUP BY
    user_id,
    display_name
ORDER BY viewcount DESC
LIMIT 10
```


#### FINAL 设置 \\{#final-setting\\}

与其在查询中为每个表名都添加 FINAL 修饰符，不如使用 [FINAL 设置](/operations/settings/settings#final)，将其自动应用到查询中的所有表。

此设置既可以按单个查询应用，也可以作用于整个会话。

```sql
-- Per query FINAL setting
SELECT count(*) FROM posts SETTINGS FINAL = 1;

-- Set FINAL for the session
SET final = 1;
SELECT count(*) FROM posts; 
```


#### 行策略（ROW policy） \\{#row-policy\\}

隐藏多余的 `_peerdb_is_deleted = 0` 过滤条件的一种简便方法是使用[行策略](/docs/operations/access-rights#row-policy-management)。下面是一个示例，演示如何创建行策略，使对 votes 表的所有查询自动排除已删除的行。

```sql
-- Apply row policy to all users
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> 行策略会应用到一组用户和角色。在本例中，它应用于所有用户和角色。也可以将其调整为仅应用于特定用户或角色。


### 使用类似 Postgres 的查询 \\{#query-like-with-postgres\\}

将分析型数据集从 PostgreSQL 迁移到 ClickHouse 时，通常需要修改应用的查询语句，以适配两者在数据处理和查询执行方面的差异。

本节将探讨在保持原有查询不变的情况下，对数据进行去重的技术。

#### 视图 \\{#views\\}

[视图](/sql-reference/statements/create/view#normal-view) 是在查询中隐藏 FINAL 关键字的一种很好方式，因为视图本身不存储任何数据，而是在每次访问时从另一张表中读取数据。

下面是一个示例，展示如何在 ClickHouse 中为数据库中的每张表创建一个包含 FINAL 关键字并过滤已删除行的视图。

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

然后，我们可以像在 PostgreSQL 中那样，使用相同的查询来查询这些视图。

```sql
-- Most viewed posts
SELECT
    sum(viewcount) AS viewcount,
    owneruserid
FROM posts_view
WHERE owneruserid > 0
GROUP BY owneruserid
ORDER BY viewcount DESC
LIMIT 10
```


#### 可刷新的物化视图 \\{#refreshable-material-view\\}

另一种方法是使用[可刷新的物化视图](/materialized-view/refreshable-materialized-view)，它允许你调度执行查询，对行进行去重，并将结果存储到目标表中。每次按计划刷新时，目标表都会被最新的查询结果替换。

此方法的主要优势在于，使用 `FINAL` 关键字的查询只在刷新时执行一次，后续对目标表的查询无需再使用 `FINAL`。

然而，其缺点是目标表中的数据只能更新到最近一次刷新的时间点。尽管如此，对于许多使用场景而言，从几分钟到几小时不等的刷新间隔通常已经足够。

```sql
-- Create deduplicated posts table 
CREATE TABLE deduplicated_posts AS posts;

-- Create the Materialized view and schedule to run every hour
CREATE MATERIALIZED VIEW deduplicated_posts_mv REFRESH EVERY 1 HOUR TO deduplicated_posts AS 
SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0 
```

然后即可正常查询 `deduplicated_posts` 表。

```sql
SELECT
    sum(viewcount) AS viewcount,
    owneruserid
FROM deduplicated_posts
WHERE owneruserid > 0
GROUP BY owneruserid
ORDER BY viewcount DESC
LIMIT 10;
```
