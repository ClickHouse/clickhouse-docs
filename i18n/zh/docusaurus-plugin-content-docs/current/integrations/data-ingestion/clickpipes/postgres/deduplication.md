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

由于 ClickHouse 的数据存储结构以及复制机制，从 Postgres 复制到 ClickHouse 的更新和删除操作会在 ClickHouse 中产生重复行。本页介绍导致这种情况发生的原因，以及在 ClickHouse 中用于处理重复数据的策略。


## 数据是如何进行复制的？ \{#how-does-data-get-replicated\}

### PostgreSQL 逻辑解码 \{#PostgreSQL-logical-decoding\}

ClickPipes 使用 [Postgres Logical Decoding](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication) 来读取 Postgres 中发生的变更。Postgres 中的 logical decoding 过程使得像 ClickPipes 这样的客户端能够以人类可读的格式接收变更，即一系列 INSERT、UPDATE 和 DELETE 操作。

### ReplacingMergeTree \{#replacingmergetree\}

ClickPipes 使用 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 引擎将 Postgres 表映射到 ClickHouse。ClickHouse 在追加写（append-only）负载下性能最佳，因此不建议频繁执行 UPDATE 操作。这正是 ReplacingMergeTree 尤其强大的用武之处。

使用 ReplacingMergeTree 时，更新会被表示为插入一条具有更高版本（`_peerdb_version`）的行，而删除则表示为插入一条具有更高版本且将 `_peerdb_is_deleted` 标记为 true 的行。ReplacingMergeTree 引擎会在后台对数据进行去重和合并，并为给定主键（id）保留该行的最新版本，从而以版本化插入的方式高效处理 UPDATE 和 DELETE 操作。

下面是一个由 ClickPipes 执行的 CREATE TABLE 语句示例，用于在 ClickHouse 中创建该表。

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


### 示例说明 \{#illustrative-example\}

下图演示了使用 ClickPipes 在 PostgreSQL 和 ClickHouse 之间同步 `users` 表的一个基础示例。

<Image img={clickpipes_initial_load} alt="ClickPipes 初始加载" size="lg"/>

**步骤 1** 显示的是 PostgreSQL 中 2 行数据的初始快照，以及 ClickPipes 将这 2 行数据初始加载到 ClickHouse 的过程。可以看到，这两行都被原样复制到了 ClickHouse 中。

**步骤 2** 显示了对 users 表的三个操作：插入一行新数据、更新一行已有数据，以及删除另一行数据。

**步骤 3** 展示了 ClickPipes 如何将这些 INSERT、UPDATE 和 DELETE 操作以版本化插入的方式复制到 ClickHouse。UPDATE 表现为 ID 为 2 的行的新版本，而 DELETE 表现为 ID 为 1 的新版本，并通过 `_is_deleted` 标记为 true。因此，ClickHouse 中比 PostgreSQL 多出三行数据。

因此，运行类似 `SELECT count(*) FROM users;` 这样简单的查询时，ClickHouse 和 PostgreSQL 中的结果可能会有所不同。根据[ClickHouse 合并文档](/merges#replacing-merges)的说明，过期的行版本最终会在合并过程中被丢弃。然而，这一合并发生的时间是不可预测的，这意味着在合并发生之前，ClickHouse 中的查询结果可能会不一致。

我们如何才能确保在 ClickHouse 和 PostgreSQL 中得到完全一致的查询结果？

### 使用 FINAL 关键字进行去重 \{#deduplicate-using-final-keyword\}

在 ClickHouse 查询中，推荐的去重方式是使用 [FINAL 修饰符](/sql-reference/statements/select/from#final-modifier)。这可以确保只返回去重后的行。

让我们来看一下如何将它应用到三种不同的查询中。

*注意以下查询中的 WHERE 子句，用于过滤被删除的行。*

* **简单计数查询**：统计帖子数量。

这是可以运行的最简单查询，用于检查同步是否正确完成。两个查询应该返回相同的计数结果。

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL WHERE _peerdb_is_deleted=0;
```

* **带有 JOIN 的简单聚合**：累计浏览次数最多的前 10 个用户。

这是一个对单表进行聚合的示例。如果这里存在重复数据，将会严重影响 `sum` 函数结果的准确性。

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


#### FINAL 设置项 \{#final-setting\}

与其在查询中为每个表名单独添加 FINAL 修饰符，你可以使用 [FINAL 设置项](/operations/settings/settings#final)，将其自动应用到查询中的所有表。

此设置项可以针对单个查询生效，也可以作用于整个会话。

```sql
-- Per query FINAL setting
SELECT count(*) FROM posts SETTINGS FINAL = 1;

-- Set FINAL for the session
SET final = 1;
SELECT count(*) FROM posts; 
```


#### ROW policy \{#row-policy\}

隐藏多余的 `_peerdb_is_deleted = 0` 过滤条件的一个简单方法是使用 [ROW policy](/docs/operations/access-rights#row-policy-management)。下面是一个示例，演示如何创建一个 ROW policy，在对 votes 表的所有查询中排除已删除的行。

```sql
-- Apply row policy to all users
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> 行级策略会应用到一组用户和角色上。在本示例中，它适用于所有用户和角色。也可以将其调整为仅适用于特定用户或角色。


### 像在 Postgres 中一样查询 \{#query-like-with-postgres\}

将分析型数据集从 PostgreSQL 迁移到 ClickHouse 时，通常需要修改应用程序中的查询，以适应两者在数据处理和查询执行方式上的差异。

本节将介绍在保持原有查询不变的前提下，对数据进行去重的技术。

#### 视图 \{#views\}

[Views](/sql-reference/statements/create/view#normal-view) 是在查询中隐藏 FINAL 关键字的一种很好方式，因为它们本身不存储任何数据，只是在每次访问时简单地从另一张表中读取数据。

下面是在 ClickHouse 中为我们数据库的每张表创建视图的示例，这些视图使用 FINAL 关键字，并过滤掉已删除的行。

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


#### 可刷新materialized view \{#refreshable-material-view\}

另一种方法是使用[可刷新materialized view](/materialized-view/refreshable-materialized-view)，通过定期调度执行查询，对行进行去重，并将结果写入目标表。每次按计划刷新时，目标表都会被最新的查询结果替换。

这种方法的主要优势在于，包含 FINAL 关键字的查询仅在刷新时执行一次，此后针对目标表的查询无需再使用 FINAL。

不过，其缺点是目标表中的数据只能保证与最近一次刷新时的数据保持一致。对于许多使用场景而言，从几分钟到几小时不等的刷新间隔通常已经足够。

```sql
-- Create deduplicated posts table 
CREATE TABLE deduplicated_posts AS posts;

-- Create the Materialized view and schedule to run every hour
CREATE MATERIALIZED VIEW deduplicated_posts_mv REFRESH EVERY 1 HOUR TO deduplicated_posts AS 
SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0 
```

然后即可像往常一样对表 `deduplicated_posts` 进行查询。

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
