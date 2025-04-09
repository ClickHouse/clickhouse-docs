---
title: '从 BigQuery 迁移到 ClickHouse Cloud'
slug: /migrations/bigquery/migrating-to-clickhouse-cloud
description: '如何将数据从 BigQuery 迁移到 ClickHouse Cloud'
keywords: ['migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'BigQuery']
---

import bigquery_2 from '@site/static/images/migrations/bigquery-2.png';
import bigquery_3 from '@site/static/images/migrations/bigquery-3.png';
import bigquery_4 from '@site/static/images/migrations/bigquery-4.png';
import bigquery_5 from '@site/static/images/migrations/bigquery-5.png';
import bigquery_6 from '@site/static/images/migrations/bigquery-6.png';
import bigquery_7 from '@site/static/images/migrations/bigquery-7.png';
import bigquery_8 from '@site/static/images/migrations/bigquery-8.png';
import bigquery_9 from '@site/static/images/migrations/bigquery-9.png';
import bigquery_10 from '@site/static/images/migrations/bigquery-10.png';
import bigquery_11 from '@site/static/images/migrations/bigquery-11.png';
import bigquery_12 from '@site/static/images/migrations/bigquery-12.png';

## 为什么选择 ClickHouse Cloud 而不是 BigQuery？ {#why-use-clickhouse-cloud-over-bigquery}

简而言之：因为 ClickHouse 在现代数据分析方面比 BigQuery 更快、更便宜和更强大：

<br />

<img src={bigquery_2}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

## 从 BigQuery 加载数据到 ClickHouse Cloud {#loading-data-from-bigquery-to-clickhouse-cloud}
### 数据集 {#dataset}

作为一个示例数据集，以展示从 BigQuery 到 ClickHouse Cloud 的典型迁移，我们使用 Stack Overflow 数据集，具体请见 [这里](/getting-started/example-datasets/stackoverflow)。该数据集包含自2008年至2024年4月期间在 Stack Overflow 上发生的每一条 `post`、`vote`、`user`、`comment` 和 `badge`。下面是该数据的 BigQuery 模式：

<br />

<img src={bigquery_3}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '1000px'}} />

<br />

希望将此数据集填充到 BigQuery 实例以测试迁移步骤的用户，我们已提供这些表的数据，格式为 Parquet，并且创建和加载这些表的 DDL 命令可以在 [这里](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==) 获取。
### 迁移数据 {#migrating-data}

在 BigQuery 和 ClickHouse Cloud 之间迁移数据主要涉及两种工作负载类型：

- **初始批量加载与定期更新** - 必须迁移初始数据集，并在设定的时间间隔内进行定期更新，例如每日。这里的更新通过重新发送已更改的行来处理 – 通过可以用于比较的列（例如日期）进行识别。删除通过对数据集进行完整的定期重新加载来处理。
- **实时复制或 CDC** - 必须迁移初始数据集。对该数据集的更改必须在 ClickHouse 中近乎实时反映，仅允许几秒钟的延迟。这实际上是一个 [更改数据捕获 (CDC) 过程](https://en.wikipedia.org/wiki/Change_data_capture)，其中 BigQuery 中的表必须与 ClickHouse 同步，即 BigQuery 表中的插入、更新和删除必须应用到 ClickHouse 中的等效表。
#### 通过 Google Cloud Storage (GCS) 批量加载 {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery 支持将数据导出到 Google 的对象存储（GCS）。对于我们的示例数据集：

1. 将 7 张表导出到 GCS。相关命令可在 [这里](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==) 获取。

2. 将数据导入 ClickHouse Cloud。为此，我们可以使用 [gcs 表函数](/sql-reference/table-functions/gcs)。DDL 和导入查询可在 [这里](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==) 获取。请注意，由于 ClickHouse Cloud 实例由多个计算节点组成，因此我们使用 [s3Cluster 表函数](/sql-reference/table-functions/s3Cluster) 而不是 `gcs` 表函数。该函数也可以与 GCS 存储桶配合使用，并且 [利用 ClickHouse Cloud 服务的所有节点](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) 来并行加载数据。

<br />

<img src={bigquery_4}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

此方法具有多项优点：

- BigQuery 导出功能支持导出数据子集的过滤。
- BigQuery 支持导出为 [Parquet、Avro、JSON 和 CSV](https://cloud.google.com/bigquery/docs/exporting-data) 格式和多种 [压缩类型](https://cloud.google.com/bigquery/docs/exporting-data) - 这些均为 ClickHouse 所支持。
- GCS 支持 [对象生命周期管理](https://cloud.google.com/storage/docs/lifecycle)，允许在指定时间后删除已导出并导入 ClickHouse 的数据。
- [Google 允许每天最多将 50TB 数据导出到 GCS，且免费](https://cloud.google.com/bigquery/quotas#export_jobs)。用户只需支付 GCS 存储费用。
- 导出会自动生成多个文件，将每个文件限制为最多 1GB 的表数据。这对 ClickHouse 有利，因为这允许并行导入。

在尝试以下示例之前，我们建议用户查看 [导出所需的权限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions) 和 [本地性建议](https://cloud.google.com/bigquery/docs/exporting-data#data-locations)，以最大限度地提高导出和导入性能。
### 通过定期查询进行实时复制或 CDC {#real-time-replication-or-cdc-via-scheduled-queries}

更改数据捕获（CDC）是使两个数据库之间的表保持同步的过程。如果必须在近实时中处理更新和删除，这将复杂得多。一种方法是简单地使用 BigQuery 的 [定期查询功能](https://cloud.google.com/bigquery/docs/scheduling-queries)安排定期导出。只要您可以接受 ClickHouse 数据插入的延迟，这种方法就易于实现和维护。此处提供了一个示例 [在这篇博客文章中](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries)。
## 设计模式 {#designing-schemas}

Stack Overflow 数据集包含多个相关表。我们建议优先关注迁移主表。这未必是最大的表，而是您期望接收最多分析查询的表。这将使您能够熟悉 ClickHouse 的主要概念。随着其他表的添加，这个表可能需要重建，以充分利用 ClickHouse 的特点以获得最佳性能。我们在 [数据建模文档](/data-modeling/schema-design#next-data-modelling-techniques) 中探讨这一建模过程。

遵循这一原则，我们专注于主要的 `posts` 表。其 BigQuery 模式如下所示：

```sql
CREATE TABLE stackoverflow.posts (
    id INTEGER,
    posttypeid INTEGER,
    acceptedanswerid STRING,
    creationdate TIMESTAMP,
    score INTEGER,
    viewcount INTEGER,
    body STRING,
    owneruserid INTEGER,
    ownerdisplayname STRING,
    lasteditoruserid STRING,
    lasteditordisplayname STRING,
    lasteditdate TIMESTAMP,
    lastactivitydate TIMESTAMP,
    title STRING,
    tags STRING,
    answercount INTEGER,
    commentcount INTEGER,
    favoritecount INTEGER,
    conentlicense STRING,
    parentid STRING,
    communityowneddate TIMESTAMP,
    closeddate TIMESTAMP
);
```
### 优化类型 {#optimizing-types}

按照 [此处描述的过程](/data-modeling/schema-design) 的结果如下的模式：

```sql
CREATE TABLE stackoverflow.posts
(
   `Id` Int32,
   `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   `AcceptedAnswerId` UInt32,
   `CreationDate` DateTime,
   `Score` Int32,
   `ViewCount` UInt32,
   `Body` String,
   `OwnerUserId` Int32,
   `OwnerDisplayName` String,
   `LastEditorUserId` Int32,
   `LastEditorDisplayName` String,
   `LastEditDate` DateTime,
   `LastActivityDate` DateTime,
   `Title` String,
   `Tags` String,
   `AnswerCount` UInt16,
   `CommentCount` UInt8,
   `FavoriteCount` UInt8,
   `ContentLicense`LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT '优化的类型'
```

我们可以用一个简单的 [`INSERT INTO SELECT`](/sql-reference/statements/insert-into) 将此表填充，通过 [`gcs` 表函数](/sql-reference/table-functions/gcs) 从 GCS 中读取导出的数据。请注意，在 ClickHouse Cloud 上，您还可以使用与 GCS 兼容的 [`s3Cluster` 表函数](/sql-reference/table-functions/s3Cluster) 在多个节点上并行加载数据：

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

在我们的新模式中，我们不保留任何空值。上述插入隐式地将这些转换为其各自类型的默认值——整数为 0，字符串为空。ClickHouse 还会自动将任何数字类型转换为其目标精度。
## ClickHouse 的主键有何不同？ {#how-are-clickhouse-primary-keys-different}

如 [这里所述](/migrations/bigquery)，与 BigQuery 一样，ClickHouse 不对表的主键列值强制唯一。

类似于 BigQuery 的聚类，ClickHouse 表的数据按主键列值在磁盘上按顺序存储。此排序对于查询优化器的利用至关重要，以避免重新排序、最大限度地减少连接的内存使用并启用限制子句的短路功能。
与 BigQuery 相比，ClickHouse 自动基于主键列值创建 [（稀疏）主索引](/guides/best-practices/sparse-primary-indexes)。该索引用于加速所有包含主键列过滤的查询。具体而言：

- 内存和磁盘效率在 ClickHouse 通常使用的规模上至关重要。数据以称为 parts 的块写入 ClickHouse 表中，并，在后台应用合并规则。在 ClickHouse 中，每个 part 都有自己的主索引。当 parts 被合并时，合并的 part 的主索引也会被合并。请注意，这些索引不会为每行构建。相反，部分的主索引对每组行有一个索引条目——这种技术称为稀疏索引。
- 稀疏索引的实现依赖于 ClickHouse 将某个 part 的行按指定键在磁盘上按顺序存储。稀疏主索引允许 ClickHouse 通过对索引条目的二分搜索快速识别可能与查询匹配的行组，而不是直接定位单行（如基于 B-Tree 的索引） 。然后，找到的可能匹配的行组将以并行方式流入 ClickHouse 引擎以查找匹配项。此索引设计使得主索引可以很小（完全适合主内存中），同时显著加快查询执行时间，特别是在数据分析用例中典型的范围查询。有关详细信息，我们建议您查看 [此深入指南](/guides/best-practices/sparse-primary-indexes)。

<br />

<img src={bigquery_5}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

在 ClickHouse 中选择的主键不仅决定索引，还决定数据写入磁盘的顺序。因此，这可能会显著影响压缩级别，这反过来又会影响查询性能。导致大多数列的值按连续顺序写入的排序键将允许所选的压缩算法（和编解码器）更有效地压缩数据。

> 表中的所有列都将根据指定排序键的值进行排序，无论它们是否包含在键中。例如，如果 `CreationDate` 被用作键，那么所有其他列中的值的顺序将对应于 `CreationDate` 列中的值的顺序。可以指定多个排序键 - 这将按照与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义进行排序。
### 选择排序键 {#choosing-an-ordering-key}

有关选择排序键的考虑和步骤，以 `posts` 表为例，请见 [这里](/data-modeling/schema-design#choosing-an-ordering-key)。
## 数据建模技术 {#data-modeling-techniques}

我们建议从 BigQuery 迁移的用户阅读 [ClickHouse 数据建模指南](/data-modeling/schema-design)。本指南使用相同的 Stack Overflow 数据集，探讨使用 ClickHouse 特性的多种方法。
### 分区 {#partitions}

BigQuery 用户将熟悉表分区的概念，通过将表分成较小、更易于管理的部分，来提高性能和可管理性。这种分区可以通过对指定列（例如日期）进行范围划分、定义列表或通过对某个键进行哈希来实现。这允许管理员根据特定标准（如日期范围或地理位置）组织数据。

分区通过启用更快的数据访问（通过分区裁剪）和更有效的索引来帮助提高查询性能。它还通过允许对单个分区而不是整个表进行操作，帮助维护任务，如备份和数据清除。此外，分区可以显著提高 BigQuery 数据库的可扩展性，方法是将负载分布到多个分区。

在 ClickHouse 中，通过在初始定义表时指定 [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key) 子句来定义分区。该子句可以包含针对任意列的 SQL 表达式，其结果将定义行被发送到哪个分区。

<br />

<img src={bigquery_6}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

数据 parts 与磁盘上每个分区逻辑关联，可以独立查询。以下示例中，我们使用表达式 [`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toyear) 按年份对 posts 表进行分区。当行被插入到 ClickHouse 时，该表达式将针对每行进行评估—然后将行按新的数据部分的形式路由到结果分区。

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
#### 应用 {#applications}

ClickHouse 中的分区具有与 BigQuery 类似的应用，但有一些微妙的区别。更具体地说：

- **数据管理** - 在 ClickHouse 中，用户应主要将分区视为数据管理特性，而不是查询优化技术。通过根据某个键将数据在逻辑上分开，每个分区都可以独立操作，例如，删除。这使用户能够在 [存储层](/integrations/s3#storage-tiers) 之间高效地移动分区，从而高效地过期数据/从集群中删除。例如，下面我们删除 2008 年的 posts：

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

- **查询优化** - 虽然分区可以帮助查询性能，但这在很大程度上取决于访问模式。如果查询只针对少数几个分区（理想情况下为一个），那么性能可能会有所提升。仅在分区键不在主键中且您按其进行过滤时，才能确保此优势更为明显。然而，需要覆盖多个分区的查询可能会比不进行分区时表现更差（因为可能会因此而有更多的 parts）。如果分区键已经在主键的早期属性中，则定位单个分区的优点将减少到几乎不存在。分区也可以用于 [优化 `GROUP BY` 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)，如果每个分区中的值是唯一的。但是，通常情况下，用户应确保主键是经过优化的，并且仅在访问模式能够访问特定可预测的子集（例如按天分区，并且大多数查询在最后一天）时，才考虑使用分区作为查询优化技术。
#### 推荐 {#recommendations}

用户应视分区为数据管理技术。当需要从集群中过期数据时，例如处理时间序列数据时，使用分区是理想的，旧的分区可以 [简单地删除](/sql-reference/statements/alter/partition#drop-partitionpart)。

重要提示：确保您的分区键表达式不会导致高基数集，即应避免创建超过 100 个分区。例如，不要按高基数列如客户端标识符或名称进行分区。而应将客户端标识符或名称设为 `ORDER BY` 表达式中的第一列。

> 在内部，ClickHouse [为插入数据创建 parts](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。随着数据的插入，parts 的数量会增加。为了防止过高的 parts 数量（可能会使查询性能下降，因为要读取的文件增多），parts 会在后台异步过程进行合并。如果 parts 的数量超过 [预配置的限制](/operations/settings/merge-tree-settings#parts-to-throw-insert)，则 ClickHouse 会在插入时抛出异常，并显示为 ["too many parts" 错误](/knowledgebase/exception-too-many-parts)。在正常运作下，这种情况不应发生，仅在 ClickHouse 配置错误或使用不当（例如，许多小的插入）时发生。由于 parts 是在每个分区内独立创建的，增加分区的数量会导致 parts 数量增加，即是分区数量的倍数。因此，基数较高的分区键可能会引发此错误并应避免。
## 物化视图与投影 {#materialized-views-vs-projections}

ClickHouse 的投影概念允许用户为表指定多个 `ORDER BY` 子句。

在 [ClickHouse 数据建模](/data-modeling/schema-design) 中，我们探讨了如何在 ClickHouse 中使用物化视图预计算聚合、转换行以及优化不同访问模式的查询。对于后者，我们 [提供了一个示例](/materialized-view/incremental-materialized-view#lookup-table)，其中物化视图将行发送到目标表，该表的排序键与接收插入的原始表不同。

例如，考虑以下查询：

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
   │ 0.18181818181818182  │
   └────────────────────┘

1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

此查询要求扫描所有 9000 万行（虽然速度很快），因为 `UserId` 不是排序键。以前，我们通过物化视图作为 `PostId` 的查找来解决此问题。此问题也可以通过投影来解决。以下命令为 `ORDER BY user_id` 添加了一个投影。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

请注意，我们必须先创建投影，然后再物化。后一个命令会导致数据在磁盘上以两种不同的顺序存储两次。投影也可以在创建数据时定义，如下所示，并将在插入数据时自动维护。

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

如果投影是通过 `ALTER` 命令创建的，那么创建是异步的，在发出 `MATERIALIZE PROJECTION` 命令时。用户可以使用以下查询确认该操作的进度，等待 `is_done=1`。

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

如果我们重复上述查询，可以看到性能显著提高，但存储消耗增加。

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

通过 [`EXPLAIN` 命令](/sql-reference/statements/explain)，我们也确认投影用于服务此查询：

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
### 何时使用投影 {#when-to-use-projections}

投影对于新用户来说是一个有吸引力的特性，因为随着数据的插入，它们会被自动维护。此外，查询可以直接发送到单个表中，投影将在可能的地方被利用，以加快响应时间。

<br />

<img src={bigquery_7}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '800px'}} />

<br />

这与物化视图形成对比，后者用户必须选择适当优化的目标表或重写查询，这取决于筛选条件。这使得用户应用程序的复杂性增加，并提高了客户端的复杂性。

尽管具有这些优点，投影存在一些固有的限制，用户应当意识到，并因此应谨慎部署：

- 投影不允许为源表和（隐藏的）目标表使用不同的 TTL。物化视图允许不同的 TTL。
- 投影 [当前不支持 `optimize_read_in_order`](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes) 以供（隐藏的）目标表使用。
- 对于具有投影的表，不支持轻量级更新和删除。
- 物化视图可以链式使用：一个物化视图的目标表可以是另一个物化视图的源表，依此类推。而投影则不可能。
- 投影不支持联接；物化视图支持。
- 投影不支持筛选（`WHERE` 子句）；物化视图支持。

我们建议在以下情况下使用投影：

- 需要对数据进行完全重新排序。虽然投影中的表达式理论上可以使用 `GROUP BY`，但物化视图更有效于维护聚合。查询优化器也更有可能利用使用简单重新排序的投影，即 `SELECT * ORDER BY x`。用户可以在此表达式中选择列的子集以减少存储占用。
- 用户能够接受相关的存储占用增加和数据写入两次的开销。测试插入速度的影响并 [评估存储开销](/data-compression/compression-in-clickhouse)。
## 将 BigQuery 查询重写为 ClickHouse {#rewriting-bigquery-queries-in-clickhouse}

以下是比较 BigQuery 和 ClickHouse 的示例查询。此列表旨在展示如何利用 ClickHouse 的特性显著简化查询。此处示例使用完整的 Stack Overflow 数据集（截至2024年4月）。

**用户（提出超过 10 个问题）并接收最多浏览的用户：**

_BigQuery_

<img src={bigquery_8}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '500px'}} />

<br />

_ClickHouse_

```sql
SELECT
    OwnerDisplayName,
    sum(ViewCount) AS total_views
FROM stackoverflow.posts
WHERE (PostTypeId = 'Question') AND (OwnerDisplayName != '')
GROUP BY OwnerDisplayName
HAVING count() > 10
ORDER BY total_views DESC
LIMIT 5

   ┌─OwnerDisplayName─┬─total_views─┐
1. │ Joan Venge       │    25520387 │
2. │ Ray Vega         │    21576470 │
3. │ anon             │    19814224 │
4. │ Tim              │    19028260 │
5. │ John             │    17638812 │
   └──────────────────┴─────────────┘

5 rows in set. Elapsed: 0.076 sec. Processed 24.35 million rows, 140.21 MB (320.82 million rows/s., 1.85 GB/s.)
Peak memory usage: 323.37 MiB.
```

**哪些标签接收最多浏览量：**

_BigQuery_

<br />

<img src={bigquery_9}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '400px'}} />

<br />

_ClickHouse_

```sql
-- ClickHouse
SELECT
    arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tags,
    sum(ViewCount) AS views
FROM stackoverflow.posts
GROUP BY tags
ORDER BY views DESC
LIMIT 5


   ┌─tags───────┬──────views─┐
1. │ javascript │ 8190916894 │
2. │ python     │ 8175132834 │
3. │ java       │ 7258379211 │
4. │ c#         │ 5476932513 │
5. │ android    │ 4258320338 │
   └────────────┴────────────┘

5 rows in set. Elapsed: 0.318 sec. Processed 59.82 million rows, 1.45 GB (188.01 million rows/s., 4.54 GB/s.)
Peak memory usage: 567.41 MiB.
```
## 聚合函数 {#aggregate-functions}

在可能的情况下，用户应利用 ClickHouse 的聚合函数。下面，我们展示了 [`argMax` 函数](/sql-reference/aggregate-functions/reference/argmax) 用于计算每年的最多浏览问题。

_BigQuery_

<br />

<img src={bigquery_10}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '500px'}} />

<br />

<img src={bigquery_11}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '500px'}} />

<br />

_ClickHouse_

```sql
-- ClickHouse
SELECT
    toYear(CreationDate) AS Year,
    argMax(Title, ViewCount) AS MostViewedQuestionTitle,
    max(ViewCount) AS MaxViewCount
FROM stackoverflow.posts
WHERE PostTypeId = 'Question'
GROUP BY Year
ORDER BY Year ASC
FORMAT Vertical


Row 1:
──────
Year:                    2008
MostViewedQuestionTitle: How to find the index for a given item in a list?
MaxViewCount:            6316987

Row 2:
──────
Year:                    2009
MostViewedQuestionTitle: How do I undo the most recent local commits in Git?
MaxViewCount:            13962748

…

Row 16:
───────
Year:                    2023
MostViewedQuestionTitle: How do I solve "error: externally-managed-environment" every time I use pip 3?
MaxViewCount:            506822

Row 17:
───────
Year:                    2024
MostViewedQuestionTitle: Warning "Third-party cookie will be blocked. Learn more in the Issues tab"
MaxViewCount:            66975

17 rows in set. Elapsed: 0.225 sec. Processed 24.35 million rows, 1.86 GB (107.99 million rows/s., 8.26 GB/s.)
Peak memory usage: 377.26 MiB.
```
## 条件和数组 {#conditionals-and-arrays}

条件和数组函数使查询变得更加简单。以下查询计算了 2022 年到 2023 年标签（出现次数超过 10000 次）的百分比增长。请注意，由于条件、数组函数和能够在 `HAVING` 和 `SELECT` 子句中重用别名，以下 ClickHouse 查询非常简洁。

_BigQuery_

<br />

<img src={bigquery_12}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '500px'}} />

<br />

_ClickHouse_

```sql
SELECT
    arrayJoin(arrayFilter(t -> (t != ''), splitByChar('|', Tags))) AS tag,
    countIf(toYear(CreationDate) = 2023) AS count_2023,
    countIf(toYear(CreationDate) = 2022) AS count_2022,
    ((count_2023 - count_2022) / count_2022) * 100 AS percent_change
FROM stackoverflow.posts
WHERE toYear(CreationDate) IN (2022, 2023)
GROUP BY tag
HAVING (count_2022 > 10000) AND (count_2023 > 10000)
ORDER BY percent_change DESC
LIMIT 5

┌─tag─────────┬─count_2023─┬─count_2022─┬──────percent_change─┐
│ next.js   │   13788 │     10520 │   31.06463878326996 │
│ spring-boot │     16573 │     17721 │  -6.478189718413183 │
│ .net      │   11458 │     12968 │ -11.644046884639112 │
│ azure     │   11996 │     14049 │ -14.613139725247349 │
│ docker    │   13885 │     16877 │  -17.72826924216389 │
└─────────────┴────────────┴────────────┴─────────────────────┘

5 行结果。耗时: 0.096 秒。处理了 5.08 百万行，155.73 MB (53.10 百万行/秒, 1.63 GB/秒)。
峰值内存使用: 410.37 MiB。
```

这就是我们为从 BigQuery 迁移到 ClickHouse 的用户准备的基础指南。我们推荐从 BigQuery 迁移的用户阅读 [ClickHouse 中的数据建模指南](/data-modeling/schema-design)，以了解更多有关 ClickHouse 高级特性的内容。
