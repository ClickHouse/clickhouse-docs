---
'sidebar_label': '去重策略'
'description': '处理重复和删除的行。'
'slug': '/integrations/clickpipes/postgres/deduplication'
'title': '去重策略 (使用 CDC)'
'doc_type': 'guide'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

更新和删除从 Postgres 复制到 ClickHouse 导致 ClickHouse 中出现重复行，这是由于其数据存储结构和复制过程造成的。该页面涵盖了为什么会发生这种情况以及在 ClickHouse 中处理重复的策略。

## 数据如何被复制？ {#how-does-data-get-replicated}

### PostgreSQL 逻辑解码 {#PostgreSQL-logical-decoding}

ClickPipes 使用 [Postgres 逻辑解码](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication) 来消费在 Postgres 中发生的更改。Postgres 中的逻辑解码过程使得像 ClickPipes 这样的客户端能够以人类可读的格式接收更改，即一系列的 INSERT、UPDATE 和 DELETE。

### ReplacingMergeTree {#replacingmergetree}

ClickPipes 使用 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 引擎将 Postgres 表映射到 ClickHouse。ClickHouse 在处理仅追加工作负载时表现最好，并且不建议频繁的 UPDATE。这也是 ReplacingMergeTree 特别强大的地方。

使用 ReplacingMergeTree，更新被建模为带有新版本（`_peerdb_version`）的行插入，而删除则是带有新版本并且 `_peerdb_is_deleted` 标记为 true 的插入。ReplacingMergeTree 引擎在后台对数据进行去重复/合并，并为给定主键（id）保留最新版本的行，从而实现对 UPDATE 和 DELETE 作为版本化插入的有效处理。

下面是 ClickPipes 执行的 CREATE Table 语句的示例，用于在 ClickHouse 中创建表。

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

### 说明性示例 {#illustrative-example}

下面的插图展示了在 PostgreSQL 和 ClickHouse 之间使用 ClickPipes 同步 `users` 表的基本示例。

<Image img={clickpipes_initial_load} alt="ClickPipes initial load" size="lg"/>

**步骤 1** 显示了 PostgreSQL 中 2 行的初始快照，以及 ClickPipes 将这 2 行初始加载到 ClickHouse。正如您所观察到的，两行被原样复制到 ClickHouse。

**步骤 2** 显示了对 users 表的三项操作：插入一行新数据，更新一行现有数据，以及删除另一行。

**步骤 3** 显示了 ClickPipes 如何将 INSERT、UPDATE 和 DELETE 操作作为版本化插入复制到 ClickHouse。UPDATE 作为 ID 为 2 的行的新版本出现，而 DELETE 作为 ID 为 1 的新版本出现，并使用 `_is_deleted` 标记为 true。因此，ClickHouse 相对于 PostgreSQL 多出了三条行。

结果，运行简单查询 `SELECT count(*) FROM users;` 可能在 ClickHouse 和 PostgreSQL 中产生不同的结果。根据 [ClickHouse 合并文档](/merges#replacing-merges)，过时的行版本最终会在合并过程中被丢弃。然而，这一合并的时机无法预测，意味着在发生合并之前，ClickHouse 中的查询可能返回不一致的结果。

我们如何确保 ClickHouse 和 PostgreSQL 中查询结果相同？

### 使用 FINAL 关键字进行去重 {#deduplicate-using-final-keyword}

在 ClickHouse 查询中去重数据的推荐方式是使用 [FINAL 修饰符](/sql-reference/statements/select/from#final-modifier)。这确保仅返回去重后的行。

让我们看一下如何将其应用到三个不同的查询中。

_请注意以下查询中的 WHERE 子句，用于过滤掉已删除的行。_

- **简单计数查询**：计算帖子数量。

这是您可以运行的最简单的查询，用于检查同步是否正常。两个查询应返回相同的计数。

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL WHERE _peerdb_is_deleted=0;
```

-  **带 JOIN 的简单聚合**：前 10 个获取最多查看次数的用户。

这是对单个表进行聚合的示例。这里出现重复会极大影响 sum 函数的结果。

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

您可以使用 [FINAL 设置](/operations/settings/settings#final) 自动将 FINAL 修饰符应用于查询中所有表，而无需将其添加到查询中的每个表名称。

此设置可以对每个查询或对整个会话应用。

```sql
-- Per query FINAL setting
SELECT count(*) FROM posts SETTINGS FINAL = 1;

-- Set FINAL for the session
SET final = 1;
SELECT count(*) FROM posts; 
```

#### 行策略 {#row-policy}

隐藏冗余的 `_peerdb_is_deleted = 0` 过滤器的一种简单方法是使用 [行策略](/docs/operations/access-rights#row-policy-management)。下面是创建行策略的示例，以在 votes 表上的所有查询中排除已删除的行。

```sql
-- Apply row policy to all users
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> 行策略应用于用户和角色的列表。在这个例子中，它应用于所有用户和角色。这可以调整为仅针对特定用户或角色。

### 与 Postgres 类似的查询 {#query-like-with-postgres}

将分析数据集从 PostgreSQL 迁移到 ClickHouse 通常需要修改应用程序查询，以考虑数据处理和查询执行的差异。

本节将探讨在不更改原始查询的情况下去重数据的技术。

#### 视图 {#views}

[视图](/sql-reference/statements/create/view#normal-view) 是隐藏查询中的 FINAL 关键字的好方法，因为它们不存储任何数据，只是在每次访问时从另一个表读取。

下面是创建我们的 ClickHouse 数据库中每个表的视图的示例，带有 FINAL 关键字和已删除行的过滤器。

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

然后，我们可以使用在 PostgreSQL 中使用的相同查询来查询视图。

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

#### 可刷新的物化视图 {#refreshable-material-view}

另一种方法是使用 [可刷新的物化视图](/materialized-view/refreshable-materialized-view)，这使您能够安排查询执行以去重行并将结果存储在目标表中。每次安排刷新的时候，目标表都用最新的查询结果替代。

此方法的关键优势在于使用 FINAL 关键字的查询在刷新过程中仅运行一次，从而消除了对目标表后续查询使用 FINAL 的需要。

然而，缺点是目标表中的数据仅与最近的刷新保持同步。也就是说，对于许多用例，几分钟到几小时的刷新间隔可能足够。

```sql
-- Create deduplicated posts table 
CREATE TABLE deduplicated_posts AS posts;

-- Create the Materialized view and schedule to run every hour
CREATE MATERIALIZED VIEW deduplicated_posts_mv REFRESH EVERY 1 HOUR TO deduplicated_posts AS 
SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0 
```

然后，您可以正常查询表 `deduplicated_posts`。

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
