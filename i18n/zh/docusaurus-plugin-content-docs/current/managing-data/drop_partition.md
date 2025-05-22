---
'slug': '/managing-data/drop_partition'
'sidebar_label': '删除分区'
'title': '删除分区'
'hide_title': false
'description': '描述删除分区的页面'
---

## 背景 {#background}

在通过 `PARTITION BY` 子句初始定义表时，指定了分区。该子句可以包含对任何列的 SQL 表达式，其结果将定义一行被发送到哪个分区。

数据部分在磁盘上与每个分区逻辑上相关联，并可以单独查询。在下面的示例中，我们使用表达式 `toYear(CreationDate)` 按年份对 `posts` 表进行分区。当行被插入到 ClickHouse 时，该表达式将针对每一行进行评估，并在结果分区存在时将其路由到该分区（如果该行是某一年的第一行，则将创建该分区）。

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

阅读关于设置分区表达式的部分 [如何设置分区表达式](/sql-reference/statements/alter/partition/#how-to-set-partition-expression)。

在 ClickHouse 中，用户应主要将分区视为一种数据管理功能，而不是查询优化技术。通过基于键逻辑地分隔数据，每个分区可以独立操作，例如删除。这使用户能够有效地在时间或 [过期数据/有效地从集群中删除](/sql-reference/statements/alter/partition)之间移动分区和相应的子集 [存储层](/integrations/s3#storage-tiers)。

## 删除分区 {#drop-partitions}

`ALTER TABLE ... DROP PARTITION` 提供了一种具成本效益的方法来删除整个分区。

```sql
ALTER TABLE table_name [ON CLUSTER cluster] DROP PARTITION|PART partition_expr
```

此查询将分区标记为非活动状态，并完全删除数据，大约在 10分钟内完成。该查询是复制的 – 它在所有副本上删除数据。

在下面的示例中，我们通过删除相关分区来移除2008年的帖子。 

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
