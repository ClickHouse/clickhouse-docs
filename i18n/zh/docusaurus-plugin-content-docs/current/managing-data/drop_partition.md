---
'slug': '/managing-data/drop_partition'
'sidebar_label': 'Drop Partition'
'title': '删除分区'
'hide_title': false
'description': '页面描述 drop partitions'
---

## 背景 {#background}

在通过 `PARTITION BY` 子句最初定义表时，可以指定分区。该子句可以包含任何列的 SQL 表达式，其结果将定义行发送到哪个分区。

数据片段在磁盘上与每个分区逻辑上关联，并且可以单独查询。以下示例中，我们使用表达式 `toYear(CreationDate)` 按年对 `posts` 表进行分区。当行插入到 ClickHouse 时，将对每行评估该表达式，并在结果分区存在时将其路由到该分区（如果该行是某年的第一行，则该分区将被创建）。

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

阅读关于设置分区表达式的章节 [如何设置分区表达式](/sql-reference/statements/alter/partition/#how-to-set-partition-expression)。

在 ClickHouse 中，用户应主要将分区视为数据管理特性，而不是查询优化技术。通过基于键逻辑地分离数据，每个分区可以独立操作，例如删除。这允许用户在时间或 [过期数据/高效从集群中删除](/sql-reference/statements/alter/partition) 的情况下高效地在 [存储层级](/integrations/s3#storage-tiers) 之间移动分区及其子集。

## 删除分区 {#drop-partitions}

`ALTER TABLE ... DROP PARTITION` 提供了一种成本高效的方式来删除整个分区。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

此查询将该分区标记为非活动并完全删除数据，约需 10 分钟。该查询是复制的——它在所有副本上删除数据。

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
