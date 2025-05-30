---
'sidebar_label': '去重策略'
'description': '处理重复和已删除的行。'
'slug': '/integrations/clickpipes/postgres/deduplication'
'title': '去重策略 (使用 CDC)'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

更新和删除从 Postgres 复制到 ClickHouse 的操作由于其数据存储结构和复制过程而导致 ClickHouse 中出现重复行。本页面介绍了为什么会发生这种情况以及在 ClickHouse 中处理重复项的策略。

## 数据是如何被复制的？ {#how-does-data-get-replicated}

### PostgreSQL 逻辑解码 {#PostgreSQL-logical-decoding}

ClickPipes 使用 [Postgres 逻辑解码](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication) 来实时消费在 Postgres 中发生的变化。Postgres 中的逻辑解码过程使得像 ClickPipes 这样的客户端能够以人类可读的格式接收变化，即一系列的 INSERT、UPDATE 和 DELETE。

### ReplacingMergeTree {#replacingmergetree}

ClickPipes 将 Postgres 表映射到 ClickHouse，使用 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 引擎。ClickHouse 在仅追加的工作负载中表现最佳，不建议频繁的 UPDATE 操作。这就是 ReplacingMergeTree 特别强大的地方。

使用 ReplacingMergeTree 时，更新被建模为行的插入，其具有更新版本 (`_peerdb_version`) ，而删除则作为具有更新版本且 `_peerdb_is_deleted` 标记为 true 的插入。ReplacingMergeTree 引擎在后台去重/合并数据，并保留给定主键（id）的最新行版本，从而高效处理作为版本化插入的 UPDATE 和 DELETE 操作。

下面是由 ClickPipes 执行的 CREATE Table 语句的示例，用于在 ClickHouse 中创建表。

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

下面的示例演示了使用 ClickPipes 在 PostgreSQL 和 ClickHouse 之间同步表 `users` 的基本过程。

<Image img={clickpipes_initial_load} alt="ClickPipes initial load" size="lg"/>

**步骤 1** 显示了 PostgreSQL 和 ClickPipes 中的 2 行的初始快照，并将这 2 行初始加载到 ClickHouse。正如您所观察到的，两行都被按原样复制到 ClickHouse。

**步骤 2** 显示了在 users 表上的三种操作：插入新行、更新现有行和删除另一行。

**步骤 3** 显示了 ClickPipes 如何将 INSERT、UPDATE 和 DELETE 操作复制到 ClickHouse 作为版本化插入。UPDATE 作为 ID 为 2 的行的新版本出现，而 DELETE 作为 ID 为 1 的新版本出现，此版本使用 `_is_deleted` 标记为 true。因此，ClickHouse 的行数比 PostgreSQL 多出三行。

因此，执行简单查询如 `SELECT count(*) FROM users;` 可能会在 ClickHouse 和 PostgreSQL 中产生不同的结果。根据 [ClickHouse 合并文档](/merges#replacing-merges)，过时的行版本最终会在合并过程中被丢弃。然而，这个合并的时机是不可预测的，这意味着 ClickHouse 中的查询可能会在合并发生之前返回不一致的结果。

我们如何确保 ClickHouse 和 PostgreSQL 中的查询结果相同？

### 使用 FINAL 关键字去重 {#deduplicate-using-final-keyword}

在 ClickHouse 查询中去重数据的推荐方式是使用 [FINAL 修饰符.](/sql-reference/statements/select/from#final-modifier) 这确保仅返回去重后的行。

让我们看看如何将其应用于三个不同的查询。

_请注意以下查询中的 WHERE 子句，用于过滤掉已删除的行。_

- **简单计数查询**：计算帖子数量。

这是您可以运行的最简单的查询，以检查同步是否顺利。两个查询应返回相同的计数。

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL where _peerdb_is_deleted=0;
```

- **带 JOIN 的简单聚合**：累计最多浏览量的前 10 个用户。

这是对单个表的聚合示例。在这里出现重复项将大大影响总和函数的结果。

```sql
-- PostgreSQL 
SELECT
    sum(p.viewcount) AS viewcount,
    p.owneruserid as user_id,
    u.displayname as display_name
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

您可以使用 [FINAL 设置](/operations/settings/settings#final) 自动将其应用于查询中的所有表，而不是将 FINAL 修饰符添加到查询中的每个表名。

此设置可以根据每个查询或整个会话来应用。

```sql
-- Per query FINAL setting
SELECT count(*) FROM posts SETTINGS final = 1;

-- Set FINAL for the session
SET final = 1;
SELECT count(*) FROM posts; 
```

#### 行策略 {#row-policy}

隐藏冗余的 `_peerdb_is_deleted = 0` 过滤器的简单方法是使用 [ROW 策略.](/docs/operations/access-rights#row-policy-management) 下面是一个创建行策略的示例，以从表投票的所有查询中排除已删除的行。

```sql
-- Apply row policy to all users
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> 行策略适用于用户和角色列表。在这个例子中，它适用于所有用户和角色。这可以调整为仅适用于特定用户或角色。

### 像与 Postgres 一样查询 {#query-like-with-postgres}

将分析数据集从 PostgreSQL 迁移到 ClickHouse 通常需要修改应用程序查询以考虑数据处理和查询执行的差异。

本节将探讨在保持原始查询不变的同时去重数据的技术。

#### 视图 {#views}

[视图](/sql-reference/statements/create/view#normal-view) 是隐藏查询中的 FINAL 关键字的好方法，因为它们不存储任何数据，而是每次访问时从另一个表中读取。

下面是为 ClickHouse 中的数据库中每个表创建视图的示例，带有 FINAL 关键字和删除行的过滤器。

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

然后，我们可以使用在 PostgreSQL 中使用的相同查询查询这些视图。

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

另一种方法是使用 [可刷新的物化视图](/materialized-view/refreshable-materialized-view)，该视图可以让您安排查询执行，以去重行并将结果存储在目标表中。每次安排的刷新后，目标表将被最新的查询结果替换。

此方法的关键优势在于，使用 FINAL 关键字的查询在刷新过程中只运行一次，这消除了对目标表上后续查询使用 FINAL 的需求。

然而，缺点是目标表中的数据仅与最近的刷新保持同步。也就是说，对于许多用例，几分钟到几个小时的刷新间隔可能就足够了。

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
