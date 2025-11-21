---
sidebar_label: '去重策略'
description: '处理重复和已删除的行。'
slug: /integrations/clickpipes/postgres/deduplication
title: '去重策略（使用 CDC）'
keywords: ['deduplication', 'postgres', 'clickpipes', 'replacingmergetree', 'final']
doc_type: 'guide'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

从 Postgres 复制到 ClickHouse 的更新和删除操作，会由于 ClickHouse 的数据存储结构以及复制机制而在 ClickHouse 中产生重复行。本文说明出现这一情况的原因，并介绍在 ClickHouse 中处理重复数据的策略。


## 数据如何进行复制? {#how-does-data-get-replicated}

### PostgreSQL 逻辑解码 {#PostgreSQL-logical-decoding}

ClickPipes 使用 [Postgres 逻辑解码](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication)来捕获 Postgres 中发生的变更。Postgres 中的逻辑解码过程使 ClickPipes 等客户端能够以人类可读的格式接收变更,即一系列 INSERT、UPDATE 和 DELETE 操作。

### ReplacingMergeTree {#replacingmergetree}

ClickPipes 使用 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 引擎将 Postgres 表映射到 ClickHouse。ClickHouse 在仅追加工作负载下性能最佳,不建议频繁执行 UPDATE 操作。这正是 ReplacingMergeTree 特别强大的地方。

使用 ReplacingMergeTree 时,更新操作被建模为插入具有更新版本(`_peerdb_version`)的行,而删除操作则是插入具有更新版本且 `_peerdb_is_deleted` 标记为 true 的行。ReplacingMergeTree 引擎在后台对数据进行去重/合并,并保留给定主键(id)的最新版本行,从而能够高效地将 UPDATE 和 DELETE 操作作为版本化插入来处理。

以下是 ClickPipes 在 ClickHouse 中创建表时执行的 CREATE Table 语句示例。

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

### 示例说明 {#illustrative-example}

下图展示了使用 ClickPipes 在 PostgreSQL 和 ClickHouse 之间同步 `users` 表的基本示例。

<Image img={clickpipes_initial_load} alt='ClickPipes 初始加载' size='lg' />

**步骤 1** 显示了 PostgreSQL 中 2 行的初始快照,以及 ClickPipes 将这 2 行初始加载到 ClickHouse 的过程。如您所见,两行数据原样复制到 ClickHouse。

**步骤 2** 显示了对 users 表的三个操作:插入新行、更新现有行以及删除另一行。

**步骤 3** 显示了 ClickPipes 如何将 INSERT、UPDATE 和 DELETE 操作作为版本化插入复制到 ClickHouse。UPDATE 操作表现为 ID 为 2 的行的新版本,而 DELETE 操作表现为 ID 为 1 的新版本,其 `_is_deleted` 标记为 true。因此,ClickHouse 比 PostgreSQL 多出三行数据。

因此,运行像 `SELECT count(*) FROM users;` 这样的简单查询可能会在 ClickHouse 和 PostgreSQL 中产生不同的结果。根据 [ClickHouse 合并文档](/merges#replacing-merges),过时的行版本最终会在合并过程中被丢弃。然而,合并的时机是不可预测的,这意味着在合并发生之前,ClickHouse 中的查询可能会返回不一致的结果。

我们如何确保在 ClickHouse 和 PostgreSQL 中获得相同的查询结果?

### 使用 FINAL 关键字去重 {#deduplicate-using-final-keyword}

在 ClickHouse 查询中去重数据的推荐方法是使用 [FINAL 修饰符](/sql-reference/statements/select/from#final-modifier)。这可以确保只返回去重后的行。

让我们看看如何将其应用于三种不同的查询。

_请注意以下查询中的 WHERE 子句,用于过滤已删除的行。_

- **简单计数查询**:统计帖子数量。

这是您可以运行的最简单的查询,用于检查同步是否正常。两个查询应返回相同的计数。

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse
SELECT count(*) FROM posts FINAL WHERE _peerdb_is_deleted=0;
```

- **带 JOIN 的简单聚合**:累计浏览量最多的前 10 名用户。

这是单表聚合的示例。此处存在重复数据会极大地影响求和函数的结果。


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

#### FINAL 设置 {#final-setting}

除了在查询中为每个表名添加 FINAL 修饰符,您还可以使用 [FINAL 设置](/operations/settings/settings#final)将其自动应用于查询中的所有表。

此设置可以按查询应用,也可以应用于整个会话。

```sql
-- 按查询设置 FINAL
SELECT count(*) FROM posts SETTINGS FINAL = 1;

-- 为会话设置 FINAL
SET final = 1;
SELECT count(*) FROM posts;
```

#### 行策略 {#row-policy}

隐藏冗余的 `_peerdb_is_deleted = 0` 过滤器的一个简单方法是使用[行策略](/docs/operations/access-rights#row-policy-management)。以下示例创建了一个行策略,用于从 votes 表的所有查询中排除已删除的行。

```sql
-- 将行策略应用于所有用户
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> 行策略应用于用户和角色列表。在此示例中,它应用于所有用户和角色。可以调整为仅应用于特定用户或角色。

### 像使用 PostgreSQL 一样查询 {#query-like-with-postgres}

将分析数据集从 PostgreSQL 迁移到 ClickHouse 通常需要修改应用程序查询,以适应数据处理和查询执行方面的差异。

本节将探讨在保持原始查询不变的情况下对数据进行去重的技术。

#### 视图 {#views}

[视图](/sql-reference/statements/create/view#normal-view)是从查询中隐藏 FINAL 关键字的好方法,因为它们不存储任何数据,只是在每次访问时从另一个表执行读取操作。

以下是在 ClickHouse 中为数据库的每个表创建视图的示例,使用 FINAL 关键字并过滤已删除的行。

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

然后,我们可以使用与在 PostgreSQL 中相同的查询来查询这些视图。

```sql
-- 浏览次数最多的帖子
SELECT
    sum(viewcount) AS viewcount,
    owneruserid
FROM posts_view
WHERE owneruserid > 0
GROUP BY owneruserid
ORDER BY viewcount DESC
LIMIT 10
```

#### 可刷新物化视图 {#refreshable-material-view}

另一种方法是使用[可刷新物化视图](/materialized-view/refreshable-materialized-view),它允许您调度查询执行以对行进行去重并将结果存储在目标表中。每次按计划刷新时,目标表都会被最新的查询结果替换。

此方法的主要优势在于,使用 FINAL 关键字的查询仅在刷新期间运行一次,从而无需在目标表的后续查询中使用 FINAL。

然而,缺点是目标表中的数据仅与最近一次刷新时一样新。话虽如此,对于许多使用场景,几分钟到几小时的刷新间隔可能已经足够。

```sql
-- 创建去重后的 posts 表
CREATE TABLE deduplicated_posts AS posts;

-- 创建物化视图并调度为每小时运行一次
CREATE MATERIALIZED VIEW deduplicated_posts_mv REFRESH EVERY 1 HOUR TO deduplicated_posts AS
SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0
```

然后,您可以正常查询 `deduplicated_posts` 表。


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
