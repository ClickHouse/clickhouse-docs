import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

更新和删除从 Postgres 复制到 ClickHouse 会导致 ClickHouse 出现重复行，这与其数据存储结构和复制过程有关。本页面涵盖了此现象的原因以及在 ClickHouse 中处理重复项的策略。

## 数据是如何被复制的？ {#how-does-data-get-replicated}

### PostgreSQL 逻辑解码 {#PostgreSQL-logical-decoding}

ClickPipes 使用 [Postgres Logical Decoding](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication) 来消费 Postgres 中发生的更改。Postgres 中的逻辑解码过程使得如 ClickPipes 这样的客户端能够以人类可读的格式接收更改，即一系列的 INSERT、UPDATE 和 DELETE。

### ReplacingMergeTree {#replacingmergetree}

ClickPipes 使用 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 引擎将 Postgres 表映射到 ClickHouse。ClickHouse 在仅追加的负载下表现最佳，并不推荐频繁的 UPDATE 操作。在这方面，ReplacingMergeTree 尤为强大。

使用 ReplacingMergeTree，更新被建模为带有较新版本（`_peerdb_version`）的行插入，而删除则是带有较新版本并将 `_peerdb_is_deleted` 标记为 true 的插入。ReplacingMergeTree 引擎在后台去重/合并数据，并保留给定主键（id）的行的最新版本，从而实现对 UPDATE 和 DELETE 的高效版本化插入处理。

下面是 ClickPipes 执行的 CREATE Table 语句示例，用于在 ClickHouse 中创建表。

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

下面的图示演示了使用 ClickPipes 在 PostgreSQL 和 ClickHouse 之间同步 `users` 表的基本示例。

<Image img={clickpipes_initial_load} alt="ClickPipes initial load" size="lg"/>

**步骤 1** 显示了 PostgreSQL 中两个行的初始快照，以及 ClickPipes 执行这两个行的初始加载到 ClickHouse。当你观察时，可以看到这两行被原样复制到 ClickHouse。

**步骤 2** 显示了针对用户表的三项操作：插入新行、更新现有行和删除另一行。

**步骤 3** 显示 ClickPipes 如何将 INSERT、UPDATE 和 DELETE 操作作为版本化插入复制到 ClickHouse。UPDATE 作为 ID 为 2 的行的新版本出现，而 DELETE 作为 ID 为 1 的新版本出现，并使用 `_is_deleted` 标记为 true。因此，ClickHouse 比 PostgreSQL 多出三行。

因此，运行一个简单的查询，比如 `SELECT count(*) FROM users;` 可能会在 ClickHouse 和 PostgreSQL 中产生不同的结果。根据 [ClickHouse 合并文档](/merges#replacing-merges)，过时的行版本最终会在合并过程中被丢弃。然而，这一合并的时机是不可预测的，这意味着在合并发生之前，ClickHouse 中的查询可能会返回不一致的结果。

我们如何确保 ClickHouse 和 PostgreSQL 中的查询结果一致？

### 使用 FINAL 关键字去重 {#deduplicate-using-final-keyword}

在 ClickHouse 查询中去重的推荐方法是使用 [FINAL 修饰符](/sql-reference/statements/select/from#final-modifier)。这确保仅返回去重后的行。

让我们来看一下如何将其应用于三个不同的查询。

_请注意以下查询中的 WHERE 子句，用于过滤已删除的行。_

- **简单计数查询**：计算文章的数量。

这是您可以运行的最简单的查询，以检查同步是否顺利。两个查询应返回相同的计数。

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL where _peerdb_is_deleted=0;
```

- **带 JOIN 的简单聚合**：访问量最多的前 10 名用户。

这是对单个表的聚合示例。这里的重复项会严重影响 sum 函数的结果。

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

您可以使用 [FINAL 设置](/operations/settings/settings#final)，而不是将 FINAL 修饰符添加到查询中的每个表名，以自动应用其到查询中的所有表。

此设置可以在每个查询或整个会话中应用。

```sql
-- Per query FINAL setting
SELECT count(*) FROM posts SETTINGS final = 1;

-- Set FINAL for the session
SET final = 1;
SELECT count(*) FROM posts; 
```

#### ROW 策略 {#row-policy}

隐藏冗余 `_peerdb_is_deleted = 0` 过滤器的一种简单方法是使用 [ROW 策略](/docs/operations/access-rights#row-policy-management)。下面是一个示例，它创建了一条行策略，以排除 votes 表中的已删除行的查询。

```sql
-- Apply row policy to all users
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> 行策略应用于用户和角色的列表。在此示例中，它应用于所有用户和角色。这可以调整为仅适用于特定用户或角色。

### 像 Postgres 一样查询 {#query-like-with-postgres}

将分析数据集从 PostgreSQL 迁移到 ClickHouse 时，通常需要修改应用程序查询以考虑数据处理和查询执行的差异。

本节将探讨在保持原始查询不变的情况下去重数据的技术。

#### 视图 {#views}

[视图](/sql-reference/statements/create/view#normal-view) 是隐藏查询中 FINAL 关键字的绝佳方法，因为它们不存储任何数据，而是在每次访问时从另一个表执行读取。

下面是创建 ClickHouse 数据库中每个表的视图的示例，并使用 FINAL 关键字和已删除行的过滤器。

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

然后，我们可以使用与在 PostgreSQL 中使用的相同查询查询这些视图。

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

另一种方法是使用 [可刷新的物化视图](/materialized-view/refreshable-materialized-view)，它使您能够为去重行调度查询执行并将结果存储在目标表中。每次调度刷新时，目标表都会替换为最新的查询结果。

这种方法的主要优势是，使用 FINAL 关键字的查询仅在刷新期间运行一次，消除了对目标表上后续查询使用 FINAL 的需要。

但是，缺点是目标表中的数据仅更新到最近一次刷新为止。也就是说，针对许多用例，几分钟到数小时的刷新间隔可能足够。

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
