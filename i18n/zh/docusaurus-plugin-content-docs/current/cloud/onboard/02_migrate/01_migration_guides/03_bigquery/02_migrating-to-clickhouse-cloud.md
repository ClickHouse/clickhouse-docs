---
'title': '从 BigQuery 迁移到 ClickHouse Cloud'
'slug': '/migrations/bigquery/migrating-to-clickhouse-cloud'
'description': '如何将您的数据从 BigQuery 迁移到 ClickHouse Cloud'
'keywords':
- 'BigQuery'
'show_related_blogs': true
'sidebar_label': '迁移指南'
'doc_type': 'guide'
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
import Image from '@theme/IdealImage';

## 为什么选择 ClickHouse Cloud 而不是 BigQuery？ {#why-use-clickhouse-cloud-over-bigquery}

简而言之：因为 ClickHouse 在现代数据分析方面比 BigQuery 更快、更便宜、更强大：

<Image img={bigquery_2} size="md" alt="ClickHouse vs BigQuery"/>

## 从 BigQuery 加载数据到 ClickHouse Cloud {#loading-data-from-bigquery-to-clickhouse-cloud}

### 数据集 {#dataset}

作为从 BigQuery 迁移到 ClickHouse Cloud 的典型示例数据集，我们使用 Stack Overflow 数据集，该数据集的详细信息记录在 [这里](/getting-started/example-datasets/stackoverflow)。这包含了从 2008 年到 2024 年 4 月在 Stack Overflow 上发生的每个 `post`、`vote`、`user`、`comment` 和 `badge`。此数据的 BigQuery 架构如下所示：

<Image img={bigquery_3} size="lg" alt="Schema"/>

对于希望将此数据集填充到 BigQuery 实例中以测试迁移步骤的用户，我们在 GCS 存储桶中提供了这些表的 Parquet 格式数据，并且用于在 BigQuery 中创建和加载表的 DDL 命令可以在 [这里](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==) 获取。

### 迁移数据 {#migrating-data}

在 BigQuery 和 ClickHouse Cloud 之间迁移数据主要分为两种工作负载类型：

- **初始批量加载与定期更新** - 必须迁移初始数据集，并在设定的间隔（例如每日）进行定期更新。这里的更新通过重新发送已更改的行来处理，这些行通过可以用于比较的列（例如日期）进行识别。删除操作通过完整的定期数据集重新加载来处理。
- **实时复制或 CDC** - 必须迁移初始数据集。对该数据集的更改必须在 ClickHouse 中近实时反映，只有几秒钟的延迟是可以接受的。这实际上是一种 [变更数据捕获 (CDC) 过程](https://en.wikipedia.org/wiki/Change_data_capture)，其中 BigQuery 中的表必须与 ClickHouse 中的等效表同步，即在 BigQuery 表中插入、更新和删除的操作必须应用到 ClickHouse 中的相应表。

#### 通过 Google Cloud Storage (GCS) 批量加载 {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery 支持将数据导出到 Google 的对象存储 (GCS)。对于我们的示例数据集：

1. 将 7 个表导出到 GCS。相关的命令可在 [这里](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==) 获取。

2. 将数据导入到 ClickHouse Cloud。为此，我们可以使用 [gcs 表函数](/sql-reference/table-functions/gcs)。DDL 和导入查询可以在 [这里](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==) 获取。请注意，由于 ClickHouse Cloud 实例由多个计算节点组成，因此我们使用的是 [s3Cluster 表函数](/sql-reference/table-functions/s3Cluster)，而不是 `gcs` 表函数。这个函数也可以与 gcs 储存桶配合使用，并且 [利用 ClickHouse Cloud 服务的所有节点](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) 进行并行数据加载。

<Image img={bigquery_4} size="md" alt="Bulk loading"/>

这种方法有许多优点：

- BigQuery 导出功能支持导出数据子集的过滤器。
- BigQuery 支持导出 [Parquet、Avro、JSON 和 CSV](https://cloud.google.com/bigquery/docs/exporting-data) 格式和几种 [压缩类型](https://cloud.google.com/bigquery/docs/exporting-data)，所有这些都是 ClickHouse 支持的。
- GCS 支持 [对象生命周期管理](https://cloud.google.com/storage/docs/lifecycle)，允许在指定时间后删除已经导出并导入到 ClickHouse 的数据。
- [Google 允许每天将高达 50TB 的数据免费导出到 GCS](https://cloud.google.com/bigquery/quotas#export_jobs)。用户只需支付 GCS 存储费用。
- 导出会自动生成多个文件，每个文件的表数据最大为 1GB。这对 ClickHouse 很有利，因为它允许并行化导入。

在尝试以下示例之前，我们建议用户查看 [导出所需的权限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions) 和 [本地性建议](https://cloud.google.com/bigquery/docs/exporting-data#data-locations)，以最大化导出和导入性能。

### 通过计划查询进行实时复制或 CDC {#real-time-replication-or-cdc-via-scheduled-queries}

变更数据捕获 (CDC) 是确保两个数据库之间的表保持同步的过程。如果需要近实时处理更新和删除，这将复杂得多。一种方法是简单地使用 BigQuery 的 [计划查询功能](https://cloud.google.com/bigquery/docs/scheduling-queries) 定期安排导出。只要您能接受数据插入 ClickHouse 时的延迟，这种方法易于实现和维护。一个示例可以在 [这篇博客文章](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries) 中找到。

## 设计模式 {#designing-schemas}

Stack Overflow 数据集包含多个相关表。我们建议首先重点迁移主表。这可能不一定是最大的表，而是期望收到最多分析查询的表。这将使您熟悉主要的 ClickHouse 概念。此表可能需要重新建模，因为在添加其他表以充分利用 ClickHouse 特性并获得最佳性能时，可能会涉及到额外的建模过程。我们将在我们的 [数据建模文档](/data-modeling/schema-design#next-data-modeling-techniques) 中探讨这个建模过程。

遵循这一原则，我们首先关注主 `posts` 表。其 BigQuery 架构如下所示：

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

根据 [这里描述的过程](/data-modeling/schema-design)，我们得到了以下架构：

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
COMMENT 'Optimized types'
```

我们可以通过简单的 [`INSERT INTO SELECT`](/sql-reference/statements/insert-into) 将数据填充到该表中，从 gcs 中读取导出的数据，并使用 [`gcs` 表函数](/sql-reference/table-functions/gcs)。请注意，在 ClickHouse Cloud 上，您还可以使用与 gcs 兼容的 [`s3Cluster` 表函数](/sql-reference/table-functions/s3Cluster) 在多个节点上并行加载：

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

在我们的新架构中不会保留任何 null 值。上述插入隐式地将这些值转换为各自类型的默认值 - 整数为 0，字符串为空值。ClickHouse 还会自动将任何数字转换为目标精度。

## ClickHouse 的主键有何不同？ {#how-are-clickhouse-primary-keys-different}

如 [此处所述](/migrations/bigquery)，与 BigQuery 类似，ClickHouse 不对表的主键列值强制执行唯一性。

与 BigQuery 中的聚类类似，ClickHouse 表的数据按主键列的顺序存储在磁盘上。查询优化器利用这种排序顺序来防止重新排序，最小化连接的内存使用，并为限制子句启用短路处理。
与 BigQuery 相比，ClickHouse 自动创建基于主键列值的 [（稀疏）主索引](/guides/best-practices/sparse-primary-indexes)。这个索引用于加速所有包含对主键列过滤的查询。具体而言：

- 内存和磁盘效率对 ClickHouse 通常使用的规模至关重要。数据以称为 parts 的块写入 ClickHouse 表，合并规则在后台应用。每个 part 都有自己主索引，当部分合并时，合并后的主索引也会合并。要注意，这些索引并不是为每一行构建的。相反，part 的主索引每组行有一个索引条目 - 这种技术称为稀疏索引。
- 稀疏索引成为可能是因为 ClickHouse 将 part 的行按指定键的顺序存储在磁盘上。与直接定位单行（如基于 B-Tree 的索引）不同，稀疏主索引用于快速（通过二进制搜索索引条目）识别可能与查询匹配的行组。定位到的可能匹配的行组随后被并行流入 ClickHouse 引擎以查找匹配项。该索引设计使得主索引可以较小（完全适合主存储器），同时仍显著加快查询执行时间，尤其是典型于数据分析用例的范围查询。有关更多详细信息，我们建议阅读 [这篇深入的指南](/guides/best-practices/sparse-primary-indexes)。

<Image img={bigquery_5} size="md" alt="ClickHouse Primary keys"/>

在 ClickHouse 中选择的主键不仅将决定索引，还将决定数据在磁盘上的写入顺序。因此，这可能会大幅影响压缩水平，而这又会影响查询性能。导致大多数列的值以连续顺序写入的排序键将允许所选择的压缩算法（和编码）更有效地压缩数据。

> 表中的所有列将根据指定的排序键值排序，无论它们是否包含在键中。例如，如果将 `CreationDate` 用作键，则所有其他列中的值的顺序将与 `CreationDate` 列中的值的顺序相对应。可以指定多个排序键，排序方式与 `SELECT` 查询中的 `ORDER BY` 子句具有相同的语义。

### 选择排序键 {#choosing-an-ordering-key}

有关选择排序键的考虑和步骤，使用帖子表作为示例，请参见 [此处](/data-modeling/schema-design#choosing-an-ordering-key)。

## 数据建模技术 {#data-modeling-techniques}

我们建议从 BigQuery 迁移的用户阅读 [ClickHouse 中建模数据的指南](/data-modeling/schema-design)。该指南使用相同的 Stack Overflow 数据集，并探讨使用 ClickHouse 特性的多种方法。

### 分区 {#partitions}

BigQuery 用户将熟悉通过将表划分为称为分区的小块来增强大型数据库性能和可管理性的表分区概念。这种分区可以通过对指定列（例如日期）进行范围划分、定义列表或根据某个键进行哈希来实现。这使得管理员能够根据特定标准（例如日期范围或地理位置）组织数据。

分区通过启用更快的数据访问（通过分区裁剪）和更有效的索引来帮助改善查询性能。它还通过允许在单个分区上进行操作（而不是整个表）来帮助维护任务，如备份和数据清除。此外，分区可以通过将负载分散到多个分区来显著提高 BigQuery 数据库的可扩展性。

在 ClickHouse 中，分区在通过 [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key) 子句初始定义表时指定。该子句可以包含针对任何列的 SQL 表达式，其结果将定义一个行被发送到哪个分区。

<Image img={bigquery_6} size="md" alt="Partitions"/>

数据部分在磁盘上与每个分区逻辑上关联，并可以单独查询。下面的示例中，我们通过使用表达式 [`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toYear) 按年份对 posts 表进行分区。当行被插入到 ClickHouse 中时，将对每行评估该表达式 - 然后将行路由到该分区中的新数据部分。

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

在 ClickHouse 中的分区与在 BigQuery 中有类似的应用，但有一些微妙的差异。更具体地说：

- **数据管理** - 在 ClickHouse 中，用户应主要考虑将分区视为数据管理特性，而非查询优化技术。通过基于某个键在逻辑上分隔数据，每个分区可以独立操作，例如删除。这允许用户高效地在存储层之间移动分区，从而在时间上或 [过期数据/高效删除集群](https://sql-reference/statements/alter/partition) 中进行操作。例如，下面我们删除 2008 年的帖子：

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

Ok.

0 rows in set. Elapsed: 0.103 sec.
```

- **查询优化** - 虽然分区可以帮助查询性能，但这在很大程度上依赖于访问模式。如果查询仅针对少数几个分区（理想情况下为一个），则性能可能会提高。仅在分区键不在主键中时并且您以其为过滤条件时，这通常才有用。然而，需要覆盖多个分区的查询可能会比不使用分区的情况表现更差（因为分区的结果可能产生更多的部分）。如果分区键已经是主键中的早期条目，则对单个分区的目标的好处也会微乎其微。分区还可以用于 [优化 `GROUP BY` 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)，如果每个分区中的值是唯一的。然而，通常情况下，用户应确保主键是经过优化的，仅在访问模式访问特定可预测子集的极少数情况中考虑分区作为查询优化技术，例如按天分区，而大多数查询在最后一天进行。

#### 建议 {#recommendations}

用户应将分区视为数据管理技术。当需要从集群中过期数据时，它是理想的，尤其是在处理时间序列数据时，例如：最旧的分区可以 [直接删除](/sql-reference/statements/alter/partition#drop-partitionpart)。

重要提示：确保您的分区键表达式不会导致高基数集，即应避免创建超过 100 个分区。例如，不要根据客户端标识符或名称等高基数列来分区数据。相反，将客户端标识符或名称作为 `ORDER BY` 表达式中的第一列。

> 内部，ClickHouse [为插入数据创建部分](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。随着数据的不断插入，部分的数量会增加。为了防止过高数量的部分导致查询性能下降（因为需要读取更多文件），部分会在后台异步处理的过程中进行合并。如果部分的数量超过 [预配置限制](/operations/settings/merge-tree-settings#parts_to_throw_insert)，则 ClickHouse 将在插入时抛出异常，提示为 ["太多部分" 错误](/knowledgebase/exception-too-many-parts)。在正常操作下，这种情况不应发生，只有在 ClickHouse 配置错误或使用不当（例如，多个小插入）时才会发生。由于部分是在每个分区中独立创建的，增加分区的数量会导致部分数量增加，即是分区数量的乘数。因此，高基数的分区键可能导致此错误，应该避免。

## 物化视图与投影 {#materialized-views-vs-projections}

ClickHouse 的投影概念允许用户为表指定多个 `ORDER BY` 子句。

在 [ClickHouse 数据建模](/data-modeling/schema-design) 中，我们探讨了如何使用物化视图在 ClickHouse 中进行预计算聚合、转换行，并为不同的访问模式优化查询。对于后者，我们 [提供了示例](/materialized-view/incremental-materialized-view#lookup-table)，其中物化视图将行发送到具有不同排序键的目标表，而不是接收插入的原始表。

例如，考虑以下查询：

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
   │ 0.18181818181818182 │
   └─────────────────────┘
--highlight-next-line
1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

此查询需要扫描所有 9000 万行（尽管很快），因为 `UserId` 不是排序键。以前我们通过使用物化视图作为 `PostId` 的查找来解决这个问题。同样的问题可以使用投影解决。以下命令添加具有 `ORDER BY user_id` 的投影。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

请注意，我们必须先创建投影，然后将其物化。这个后续命令会导致数据在磁盘上以两种不同的排序存储两次。还可以在创建数据时定义投影，如下所示，并在数据插入时自动维护。

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
    --highlight-begin
    PROJECTION comments_user_id
    (
    SELECT *
    ORDER BY UserId
    )
    --highlight-end
)
ENGINE = MergeTree
ORDER BY PostId
```

如果通过 `ALTER` 命令创建投影，则在发出 `MATERIALIZE PROJECTION` 命令时，创建是异步的。用户可以通过以下查询确认此操作的进度，等待 `is_done=1`。

```sql
SELECT
    parts_to_do,
    is_done,
    latest_fail_reason
FROM system.mutations
WHERE (`table` = 'comments') AND (command LIKE '%MATERIALIZE%')

   ┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
1. │           1 │       0 │                    │
   └─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

如果我们重复上述查询，可以看到性能明显提高，代价是额外的存储空间。

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘
--highlight-next-line
1 row in set. Elapsed: 0.008 sec. Processed 16.36 thousand rows, 98.17 KB (2.15 million rows/s., 12.92 MB/s.)
Peak memory usage: 4.06 MiB.
```

使用 [`EXPLAIN` 命令](/sql-reference/statements/explain)，我们也确认了该投影被用于服务该查询：

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

    ┌─explain─────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY))         │
 2. │   Aggregating                                       │
 3. │   Filter                                            │
 4. │           ReadFromMergeTree (comments_user_id)      │
 5. │           Indexes:                                  │
 6. │           PrimaryKey                                │
 7. │           Keys:                                     │
 8. │           UserId                                    │
 9. │           Condition: (UserId in [8592047, 8592047]) │
10. │           Parts: 2/2                                │
11. │           Granules: 2/11360                         │
    └─────────────────────────────────────────────────────┘

11 rows in set. Elapsed: 0.004 sec.
```

### 何时使用投影 {#when-to-use-projections}

投影对新用户是一个有吸引力的特性，因为它们会随着数据的插入自动维护。此外，查询可以只发送到单个表，投影会在可能的情况下得到利用，从而加快响应时间。

<Image img={bigquery_7} size="md" alt="Projections"/>

这与物化视图形成对比，后者用户必须选择适当的优化目标表或重写查询，具体取决于过滤器。这增加了用户应用的复杂性，从而增加了客户端的复杂性。

尽管有这些优点，投影也带有一些固有的限制，用户应该意识到，因此应谨慎部署。有关更多详细信息，请参见 ["物化视图与投影"](/managing-data/materialized-views-versus-projections)。

我们建议在以下情况下使用投影：

- 需要对数据进行完全重新排序。虽然投影中的表达式理论上可以使用 `GROUP BY`，但物化视图对于维护聚合更有效。查询优化器也更可能利用那些使用简单重新排序的投影，即 `SELECT * ORDER BY x`。用户可以在此表达式中选择一组列，以减少存储占用。
- 用户能接受附加的存储占用和双写数据的开销。测试插入速度的影响并 [评估存储开销](/data-compression/compression-in-clickhouse)。

## 在 ClickHouse 中重写 BigQuery 查询 {#rewriting-bigquery-queries-in-clickhouse}

以下提供了比较 BigQuery 和 ClickHouse 的示例查询。此列表旨在演示如何利用 ClickHouse 的特点显著简化查询。这些示例涉及完整的 Stack Overflow 数据集（截至 2024 年 4 月）。

**（问题超过 10 条的）用户获得的最多阅读量：**

_BigQuery_

<Image img={bigquery_8} size="sm" alt="Rewriting BigQuery queries" border/>

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

**哪些标签获得的最多阅读量：**

_BigQuery_

<br />

<Image img={bigquery_9} size="sm" alt="BigQuery 1" border/>

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

在可能的情况下，用户应利用 ClickHouse 的聚合函数。下面，我们展示了如何使用 [`argMax` 函数](/sql-reference/aggregate-functions/reference/argmax) 计算每年的最受欢迎问题。

_BigQuery_

<Image img={bigquery_10} border size="sm" alt="Aggregate functions 1"/>

<Image img={bigquery_11} border size="sm" alt="Aggregate functions 2"/>

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

...

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

条件和数组函数使查询变得更加简单。以下查询计算了 2022 年到 2023 年间发生的标签（出现超过 10000 次）的最大百分比增长。请注意，由于条件、数组函数以及在 `HAVING` 和 `SELECT` 子句中重用别名的能力，以下 ClickHouse 查询简洁明了。

_BigQuery_

<Image img={bigquery_12} size="sm" border alt="Conditionals and Arrays"/>

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
│ next.js     │      13788 │      10520 │   31.06463878326996 │
│ spring-boot │      16573 │      17721 │  -6.478189718413183 │
│ .net        │      11458 │      12968 │ -11.644046884639112 │
│ azure       │      11996 │      14049 │ -14.613139725247349 │
│ docker      │      13885 │      16877 │  -17.72826924216389 │
└─────────────┴────────────┴────────────┴─────────────────────┘

5 rows in set. Elapsed: 0.096 sec. Processed 5.08 million rows, 155.73 MB (53.10 million rows/s., 1.63 GB/s.)
Peak memory usage: 410.37 MiB.
```

这就是我们为从 BigQuery 迁移到 ClickHouse 的用户提供的基本指南。我们建议从 BigQuery 迁移的用户阅读 [ClickHouse 中建模数据的指南](/data-modeling/schema-design)，以了解更多高级 ClickHouse 功能。
