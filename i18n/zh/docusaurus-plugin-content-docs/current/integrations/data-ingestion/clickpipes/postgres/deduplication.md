---
'sidebar_label': '去重策略'
'description': '处理重复数据和已删除行。'
'slug': '/integrations/clickpipes/postgres/deduplication'
'title': '去重策略 (使用 CDC)'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

更新和删除从 Postgres 复制到 ClickHouse 的结果，在 ClickHouse 中由于其数据存储结构和复制过程而导致了重复行的出现。 本页内容涵盖了为什么会发生这种情况以及在 ClickHouse 中处理重复的策略。

## 数据如何被复制？ {#how-does-data-get-replicated}

### PostgreSQL 逻辑解码 {#PostgreSQL-logical-decoding}

ClickPipes 使用 [Postgres Logical Decoding](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication) 来实时消费在 Postgres 中发生的变化。 Postgres 中的逻辑解码过程使得像 ClickPipes 这样的客户端能够以人类可读的格式接收更改，即一系列的 INSERT、UPDATE 和 DELETE。

### ReplacingMergeTree {#replacingmergetree}

ClickPipes 使用 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 引擎将 Postgres 表映射到 ClickHouse。 ClickHouse 在处理仅追加的工作负载时表现最佳，并且不推荐频繁的 UPDATE。 这正是 ReplacingMergeTree 特别强大的地方。

在 ReplacingMergeTree 中，更新被建模为插入带有更高版本（`_peerdb_version`）的行，而删除则是带有更高版本并将 `_peerdb_is_deleted` 标记为 true 的插入。 ReplacingMergeTree 引擎在后台对数据进行去重/合并，并为给定主键（id）保留最新版本的行，从而高效处理作为版本插入的 UPDATE 和 DELETE。

以下是 ClickPipes 执行以在 ClickHouse 中创建表的 CREATE Table 语句示例。

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

### 说明示例 {#illustrative-example}

下面的示例介绍了使用 ClickPipes 在 PostgreSQL 和 ClickHouse 之间同步 `users` 表的基本示例。

<Image img={clickpipes_initial_load} alt="ClickPipes initial load" size="lg"/>

**步骤 1** 显示了 PostgreSQL 中 2 行的初始快照，并且 ClickPipes 正在将这 2 行的初始加载发送到 ClickHouse。 如您所见，这两行都原样复制到 ClickHouse。

**步骤 2** 显示了对 users 表的三种操作：插入新行、更新现有行和删除另一行。

**步骤 3** 显示 ClickPipes 如何将 INSERT、UPDATE 和 DELETE 操作作为版本插入复制到 ClickHouse。 UPDATE 作为 ID 为 2 的行的新版本出现，而 DELETE 作为 ID 为 1 的新版本出现，并标记为 true 使用 `_is_deleted`。 因此，与 PostgreSQL 相比，ClickHouse 具有三行额外的记录。

因此，运行简单的查询如 `SELECT count(*) FROM users;` 可能导致 ClickHouse 和 PostgreSQL 的结果不同。 根据 [ClickHouse merge documentation](/merges#replacing-merges)，过时的行版本在合并过程中最终会被丢弃。然而，这种合并的时机是不可预测的，这意味着 ClickHouse 中的查询可能在合并发生之前返回不一致的结果。

我们如何确保在 ClickHouse 和 PostgreSQL 中查询结果相同？

### 使用 FINAL 关键字去重 {#deduplicate-using-final-keyword}

在 ClickHouse 查询中去重数据的推荐方法是使用 [FINAL modifier.](/sql-reference/statements/select/from#final-modifier) 这确保只返回去重的行。

让我们看看如何将其应用于三个不同的查询。

_请注意以下查询中的 WHERE 子句，用于过滤已删除的行。_

- **简单计数查询**：计算帖子的数量。

这是您可以运行的最简单的查询，以检查同步是否正常。 这两个查询应该返回相同的计数。

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL where _peerdb_is_deleted=0;
```

- **简单聚合与 JOIN**：前 10 个积累了最多浏览量的用户。

这是对单个表的聚合示例。 在这里拥有重复项会严重影响总和函数的结果。

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

与其在查询中每个表名后添加 FINAL 修饰符，不如使用 [FINAL setting](/operations/settings/settings#final) 将其自动应用于查询中的所有表。

此设置可以在查询中单独应用或对整个会话进行设置。

```sql
-- Per query FINAL setting
SELECT count(*) FROM posts SETTINGS final = 1;

-- Set FINAL for the session
SET final = 1;
SELECT count(*) FROM posts; 
```

#### ROW 策略 {#row-policy}

隐藏冗余的 `_peerdb_is_deleted = 0` 过滤器的简单方法是使用 [ROW policy.](/docs/operations/access-rights#row-policy-management) 下面是一个创建行策略以从所有对表 votes 的查询中排除已删除行的示例。

```sql
-- Apply row policy to all users
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> 行策略适用于用户和角色列表。 在此示例中，它适用于所有用户和角色。 这可以调整为仅适用于特定用户或角色。

### 类似 Postgres 的查询 {#query-like-with-postgres}

将分析数据集从 PostgreSQL 迁移到 ClickHouse 通常需要修改应用查询，以适应数据处理和查询执行中的差异。

本节将探讨在保持原始查询不变的情况下去重数据的技术。

#### 视图 {#views}

[Views](/sql-reference/statements/create/view#normal-view) 是隐藏查询中 FINAL 关键字的好方法，因为它们不存储任何数据，并且在每次访问时仅从另一个表进行读取。

以下是为 ClickHouse 中我们数据库的每个表创建包含 FINAL 关键字和过滤已删除行的视图的示例。

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

然后，我们可以使用在 PostgreSQL 中使用的相同查询来查询这些视图。

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

另一种方法是使用 [Refreshable Materialized View](/materialized-view/refreshable-materialized-view)，它使您能够安排查询执行以去重并将结果存储在目标表中。 每次调度刷新时，目标表都会被最新的查询结果替换。

这种方法的主要优点是使用 FINAL 关键字的查询仅在刷新期间运行一次，消除了后续查询在目标表中使用 FINAL 的需要。

然而，缺点是目标表中的数据仅更新到最近一次刷新为止。 也就是说，对于许多用例，几分钟到几小时的刷新间隔可能是足够的。

```sql
-- Create deduplicated posts table 
CREATE TABLE deduplicated_posts AS posts;

-- Create the Materialized view and schedule to run every hour
CREATE MATERIALIZED VIEW deduplicated_posts_mv REFRESH EVERY 1 HOUR TO deduplicated_posts AS 
SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0 
```

之后，您可以正常查询表 `deduplicated_posts`。

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
