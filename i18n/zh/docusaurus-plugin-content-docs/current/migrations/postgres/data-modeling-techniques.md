---
slug: /migrations/postgresql/data-modeling-techniques
title: 数据建模技术
description: 从 PostgreSQL 迁移到 ClickHouse 的数据建模
keywords: [postgres, postgresql, migrate, migration, data modeling]
---

import postgres_partitions from '@site/static/images/migrations/postgres-partitions.png';
import postgres_projections from '@site/static/images/migrations/postgres-projections.png';

> 这是关于从 PostgreSQL 迁移到 ClickHouse 的指南的 **第 3 部分**。这部分内容可以视为入门，旨在帮助用户部署一个遵循 ClickHouse 最佳实践的初始功能系统。它避免了复杂主题，并且不会导致完全优化的架构；相反，它为用户建立生产系统和学习提供了坚实的基础。

我们建议从 Postgres 迁移的用户阅读 [ClickHouse 中的数据建模指南](/data-modeling/schema-design)。本指南使用相同的 Stack Overflow 数据集，并探索多种使用 ClickHouse 特性的方式。

## 分区 {#partitions}

Postgres 用户将熟悉表分区的概念，通过将表划分为较小、更易管理的部分称为分区，以增强大型数据库的性能和可管理性。可以通过在指定列（例如日期）上使用范围、定义列表或通过键进行哈希来实现这种分区。这允许管理员根据特定标准（如日期范围或地理位置）组织数据。分区通过启用更快的数据访问（通过分区修剪）和更高效的索引来提高查询性能。它还通过允许对单个分区进行操作（而不是整个表）来帮助备份和数据清理等维护任务。此外，分区可以显著提高 PostgreSQL 数据库的可扩展性，通过在多个分区之间分配负载。

在 ClickHouse 中，分区是在通过 `PARTITION BY` 子句初始定义表时指定的。此子句可以包含任意列的 SQL 表达式，其结果将定义行发送到哪个分区。

<br />

<img src={postgres_partitions} class="image" alt="PostgreSQL 分区到 ClickHouse 分区" style={{width: '600px'}} />

<br />

数据部分在磁盘上与每个分区逻辑关联，并可以单独查询。如下例所示，我们使用表达式 `toYear(CreationDate)` 根据年份对 `posts` 表进行分区。当行被插入 ClickHouse 时，该表达式将针对每行进行评估，并在存在的情况下路由到相应的分区（如果该行是某年的首行，则会创建该分区）。

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

## 分区的应用 {#applications-of-partitions}

ClickHouse 中的分区具有与 Postgres 类似的应用，但有一些微妙的差异。具体来说：

- **数据管理** - 在 ClickHouse 中，用户应主要考虑将分区视为数据管理功能，而不是查询优化技术。通过根据键逻辑上分离数据，可以独立操作每个分区，例如删除。这允许用户在 [存储层](/integrations/s3#storage-tiers) 之间高效移动分区（及其子集），以及 [过期数据/高效从集群中删除](/sql-reference/statements/alter/partition)。例如，下面我们删除 2008 年的帖子。

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'posts'

┌─partition─┐
│ 2008  	│
│ 2009  	│
│ 2010  	│
│ 2011  	│
│ 2012  	│
│ 2013  	│
│ 2014  	│
│ 2015  	│
│ 2016  	│
│ 2017  	│
│ 2018  	│
│ 2019  	│
│ 2020  	│
│ 2021  	│
│ 2022  	│
│ 2023  	│
│ 2024  	│
└───────────┘

17 rows in set. Elapsed: 0.002 sec.

	ALTER TABLE posts
	(DROP PARTITION '2008')

Ok.

0 rows in set. Elapsed: 0.103 sec.
```

- **查询优化** - 虽然分区可以帮助提升查询性能，但这在很大程度上依赖于访问模式。如果查询仅针对少数几个分区（理想情况下是一个），则性能可能得到改善。通常只有在分区键不在主键中且您正在根据它进行过滤时，这才有用。然而，需要覆盖多个分区的查询可能执行性能不及不使用分区（因为分区可能导致有更多部分）。如果分区键已经是主键中的早期条目，目标单个分区的好处将更不明显或根本不存在。如果每个分区的值都是唯一的，分区也可以用于 [优化 GROUP BY 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)。然而，通常情况下，用户应确保主键得到优化，并且仅在访问模式访问特定的可预测子集时，才考虑将分区作为查询优化技术，例如按天分区，且大多数查询发生在最后一天。

## 分区的建议 {#recommendations-for-partitions}

用户应将分区视为数据管理技术。它在处理时间序列数据时，特别适合在需要从集群中过期数据时，例如，最旧的分区可以 [简单地删除](/sql-reference/statements/alter/partition#drop-partitionpart)。

**重要：** 确保您的分区键表达式不会导致高基数集，即应避免创建超过 100 个分区。例如，不要根据高基数列（如客户端标识符或名称）对数据进行分区。相反，将客户端标识符或名称设置为 `ORDER BY` 表达式中的第一列。

> 在内部，ClickHouse [为插入的数据创建分区](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。随着更多数据的插入，部分数量会增加。为了防止部分过多，从而降低查询性能（需要读取更多文件），部分在后台异步过程中合并。如果部分数量超过预配置的限制，则 ClickHouse 会在插入时抛出异常 - 作为“部分过多”的错误。这在正常操作下不应发生，仅在 ClickHouse 配置错误或使用不当时发生，例如，许多小插入。

> 由于每个分区内的部分是独立创建的，增加分区数量会导致部分数量增加，即它是分区数量的倍数。因此，高基数的分区键可能会导致此错误，应避免。

## 物化视图与投影 {#materialized-views-vs-projections}

Postgres 允许在单个表上创建多个索引，优化多种访问模式。这种灵活性允许管理员和开发人员根据特定的查询和操作需求来调整数据库性能。ClickHouse 的投影概念虽然并不完全相同，但允许用户为一张表指定多个 `ORDER BY` 子句。

在 ClickHouse [数据建模文档](/data-modeling/schema-design) 中，我们探讨了如何在 ClickHouse 中使用物化视图来预计算聚合、转换行和优化不同访问模式的查询。

对于后者，我们提供了 [一个示例](/materialized-view/incremental-materialized-view#lookup-table)，在该示例中，物化视图通过不同的排序键将行发送到目标表，而不是接收插入的原始表。

例如，考虑以下查询：

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

此查询需要扫描所有 9000 万行（快速地），因为 `UserId` 不是排序键。之前，我们通过作为 `PostId` 的查找来解决此问题的物化视图。相同的问题可以通过投影来解决。下面的命令为 `ORDER BY user_id` 添加了一个投影。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

请注意，我们必须先创建投影，然后再对其进行物化。后续命令会导致数据在磁盘上以两种不同的顺序存储两次。如果在创建数据时定义投影，如下所示，它也会在插入数据时自动维护。

```sql
CREATE TABLE comments
(
	`Id` UInt32,
	`PostId` UInt32,
	`Score` UInt16,
	`Text` String,
	`CreationDate` DateTime64(3, 'UTC'),
	`UserId` Int32,
	`UserDisplayName` LowCardinality(String),
	PROJECTION comments_user_id
	(
    	SELECT *
    	ORDER BY UserId
	)
)
ENGINE = MergeTree
ORDER BY PostId
```

如果投影是通过 `ALTER` 创建的，则在发出 `MATERIALIZE PROJECTION` 命令时该创建是异步的。用户可以通过以下查询确认此操作的进度，等待 `is_done=1`。

```sql
SELECT
	parts_to_do,
	is_done,
	latest_fail_reason
FROM system.mutations
WHERE (`table` = 'comments') AND (command LIKE '%MATERIALIZE%')

   ┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
1. │       	1 │   	0 │                	│
   └─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

如果我们重复上述查询，可以看到性能显著提高，代价是额外的存储。

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.008 sec. Processed 16.36 thousand rows, 98.17 KB (2.15 million rows/s., 12.92 MB/s.)
Peak memory usage: 4.06 MiB.
```

通过 `EXPLAIN` 命令，我们还可以确认投影用于服务此查询：

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

	┌─explain─────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY))     	│
 2. │   Aggregating                                   	│
 3. │ 	Filter                                      	│
 4. │   	ReadFromMergeTree (comments_user_id)      	│
 5. │   	Indexes:                                  	│
 6. │     	PrimaryKey                              	│
 7. │       	Keys:                                 	│
 8. │         	UserId                              	│
 9. │       	Condition: (UserId in [8592047, 8592047]) │
10. │       	Parts: 2/2                            	│
11. │       	Granules: 2/11360                     	│
	└─────────────────────────────────────────────────────┘

11 rows in set. Elapsed: 0.004 sec.
```

## 何时使用投影 {#when-to-use-projections}

投影是新用户喜欢的一个特性，因为它们在插入数据时会自动维护。此外，查询可以只发送到一个表，在可能的情况下利用投影来加快响应时间。

<br />

<img src={postgres_projections} class="image" alt="PostgreSQL 投影在 ClickHouse 中" style={{width: '600px'}} />

<br />

这与物化视图形成对比，在物化视图中，用户必须选择适当的优化目标表或根据筛选条件重写查询。这对用户的应用程序施加了更大的强调，并增加了客户端的复杂性。

尽管有这些优势，投影也有一些固有的限制，用户应该了解，因此应谨慎部署。

- 投影不允许源表和（隐藏）目标表使用不同的 TTL，而物化视图允许不同的 TTL。
- 投影 [目前不支持](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes) （隐藏）目标表的 `optimize_read_in_order`。
- 轻量级更新和删除不支持具有投影的表。
- 物化视图可以串联：一个物化视图的目标表可以是另一个物化视图的源表，以此类推。而投影则不可能。
- 投影不支持连接；物化视图支持。
- 投影不支持过滤（WHERE 子句）；物化视图支持。

我们建议在以下情况下使用投影：

- 需要对数据进行完全重新排序。虽然表达式在投影中理论上可以使用 `GROUP BY`，但物化视图更有效地维护聚合。查询优化器也更可能利用使用简单重新排序的投影，即 `SELECT * ORDER BY x`。用户可以在此表达式中选择部分列以减少存储占用。
- 用户对增加的存储占用和写入数据两次的开销感到满意。测试插入速度的影响并 [评估存储开销](/data-compression/compression-in-clickhouse)。

[点击这里查看第 4 部分](/migrations/postgresql/rewriting-queries).
