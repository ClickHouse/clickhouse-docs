---
'slug': '/managing-data/drop_partition'
'sidebar_label': '删除分区'
'title': '删除分区'
'hide_title': false
'description': '页面描述删除分区'
---



## 背景 {#background}

在表最初定义时，通过 `PARTITION BY` 子句指定分区。此子句可以包含任何列上的 SQL 表达式，结果将定义一行数据被发送到哪个分区。

数据部分在磁盘上与每个分区逻辑关联，可以独立查询。以下示例中，我们通过使用表达式 `toYear(CreationDate)` 将 `posts` 表按年分区。随着数据行插入 ClickHouse，此表达式将针对每一行进行评估，并在存在的情况下将其路由到结果分区（如果该行是某年的第一行，则将创建该分区）。

```sql
 CREATE TABLE posts
(
        `Id` Int32 CODEC(Delta(4), ZSTD(1)),
        `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime64(3, 'UTC'),
...
        `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate)
PARTITION BY toYear(CreationDate)
```

请阅读设置分区表达式的部分 [如何设置分区表达式](/sql-reference/statements/alter/partition/#how-to-set-partition-expression)。

在 ClickHouse 中，用户应主要将分区视为数据管理功能，而不是查询优化技术。通过基于某个键逻辑分离数据，每个分区可以独立操作，例如进行删除。这允许用户在时间上高效地在 [存储层](/integrations/s3#storage-tiers) 之间移动分区，从而在集群中 [到期数据/高效删除]( /sql-reference/statements/alter/partition)。

## 删除分区 {#drop-partitions}

`ALTER TABLE ... DROP PARTITION` 提供了一种成本高效的方式来删除整个分区。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

此查询将该分区标记为非活动状态，并完全删除数据，约需 10 分钟。该查询是复制的——它会在所有副本上删除数据。

在下面的示例中，我们通过删除相关分区来移除 2008 年的帖子。

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'posts'

┌─partition─┐
│ 2008      │
│ 2009      │
│ 2010      │
│ 2011      │
│ 2012      │
│ 2013      │
│ 2014      │
│ 2015      │
│ 2016      │
│ 2017      │
│ 2018      │
│ 2019      │
│ 2020      │
│ 2021      │
│ 2022      │
│ 2023      │
│ 2024      │
└───────────┘

17 rows in set. Elapsed: 0.002 sec.

ALTER TABLE posts
(DROP PARTITION '2008')

0 rows in set. Elapsed: 0.103 sec.
```
