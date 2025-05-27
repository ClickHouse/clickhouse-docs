---
'title': '从 BigQuery 迁移到 ClickHouse Cloud'
'slug': '/migrations/bigquery/migrating-to-clickhouse-cloud'
'description': '如何将您的数据从 BigQuery 迁移到 ClickHouse Cloud'
'keywords':
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'BigQuery'
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

TLDR: 因为 ClickHouse 对于现代数据分析来说，速度更快、成本更低、功能更强大。

<Image img={bigquery_2} size="md" alt="ClickHouse vs BigQuery"/>

## 从 BigQuery 加载数据到 ClickHouse Cloud {#loading-data-from-bigquery-to-clickhouse-cloud}

### 数据集 {#dataset}

作为一个示例数据集，展示从 BigQuery 迁移到 ClickHouse Cloud 的典型过程，我们使用 Stack Overflow 数据集，该数据集的详细信息记录在 [这里](/getting-started/example-datasets/stackoverflow)。该数据集包含了自 2008 年至 2024 年 4 月在 Stack Overflow 上发生的每个 `post`、`vote`、`user`、`comment` 和 `badge`。以下是该数据的 BigQuery 模式：

<Image img={bigquery_3} size="lg" alt="Schema"/>

对于希望将此数据集填充到 BigQuery 实例以测试迁移步骤的用户，我们已在 GCS 存储桶中提供了这些表的数据，以 Parquet 格式存储，DDL 命令以创建和加载 BigQuery 中的表可以在 [这里](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==) 找到。

### 迁移数据 {#migrating-data}

BigQuery 与 ClickHouse Cloud 之间的数据迁移主要分为两种工作负载类型：

- **初始批量加载与定期更新** - 必须迁移初始数据集，并在设定的时间间隔内进行定期更新，例如每天。此处的更新通过重新发送已更改的行来处理 - 通过可以用于比较的列（例如，一列日期）来识别。删除操作通过完整的定期重新加载数据集来处理。
- **实时复制或 CDC** - 必须迁移初始数据集。对该数据集的更改必须在近实时内反映在 ClickHouse 中，仅允许几秒钟的延迟。这实际上是一个 [变更数据捕获（CDC）过程](https://en.wikipedia.org/wiki/Change_data_capture)，即 BigQuery 中的表必须与 ClickHouse 同步，即 BigQuery 表中的插入、更新和删除必须应用于 ClickHouse 中的等效表中。

#### 通过 Google Cloud Storage (GCS) 批量加载 {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery 支持将数据导出到 Google 的对象存储（GCS）。对于我们的示例数据集：

1. 将 7 个表导出到 GCS。相关命令可以在 [这里](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==) 找到。

2. 将数据导入到 ClickHouse Cloud。为此，我们可以使用 [gcs 表函数](/sql-reference/table-functions/gcs)。DDL 和导入查询可以在 [这里](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==) 找到。请注意，由于 ClickHouse Cloud 实例由多个计算节点组成，我们使用的不是 `gcs` 表函数，而是 [s3Cluster 表函数](/sql-reference/table-functions/s3Cluster)。此函数也支持 gcs 存储桶，并且 [利用 ClickHouse Cloud 服务的所有节点](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) 并行加载数据。

<Image img={bigquery_4} size="md" alt="Bulk loading"/>

这种方法具有以下几个优点：

- BigQuery 导出功能支持用于导出数据子集的过滤器。
- BigQuery 支持导出到 [Parquet、Avro、JSON 和 CSV](https://cloud.google.com/bigquery/docs/exporting-data) 格式以及几种 [压缩类型](https://cloud.google.com/bigquery/docs/exporting-data) - ClickHouse 全部支持。
- GCS 支持 [对象生命周期管理](https://cloud.google.com/storage/docs/lifecycle)，允许在数据导出并导入到 ClickHouse 后，按照规定的时间段删除数据。
- [Google 允许每天将最多 50TB 数据导出到 GCS 免费](https://cloud.google.com/bigquery/quotas#export_jobs)。用户只需为 GCS 存储付费。
- 导出会自动生成多个文件，每个文件最大限制为 1GB 表数据。这对 ClickHouse 有利，因为它允许并行化导入。

在尝试以下示例之前，我们建议用户查看 [导出所需的权限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions) 和 [区域建议](https://cloud.google.com/bigquery/docs/exporting-data#data-locations)，以最大限度地提高导出和导入性能。

### 通过计划查询进行实时复制或 CDC {#real-time-replication-or-cdc-via-scheduled-queries}

变更数据捕获（CDC）是保持两个数据库之间表同步的过程。如果需要实时处理更新和删除，这将复杂得多。一种方法是简单地使用 BigQuery 的 [计划查询功能](https://cloud.google.com/bigquery/docs/scheduling-queries) 定期调度导出。只要您可以接受数据插入到 ClickHouse 的延迟，这种方法就容易实施和维护。示例见 [这篇博客文章](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries)。

## 设计模式 {#designing-schemas}

Stack Overflow 数据集包含多个相关表。我们建议首先专注于迁移主表。这不一定是最大表，而是您预计将收到最多分析查询的表。这将使您熟悉 ClickHouse 的主要概念。随着其他表的添加，这个表可能需要重新建模，以充分利用 ClickHouse 的特性并获得最佳性能。我们在 [数据建模文档](/data-modeling/schema-design#next-data-modeling-techniques) 中探讨了这一建模过程。

遵循这一原则，我们专注于主 `posts` 表。BigQuery 的模式如下所示：

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

应用 [此处描述的过程](/data-modeling/schema-design) 结果如下模式：

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

我们可以通过简单的 [`INSERT INTO SELECT`](/sql-reference/statements/insert-into) 将此表填充，从 gcs 读取导出数据，使用 [`gcs` 表函数](/sql-reference/table-functions/gcs)。请注意，在 ClickHouse Cloud 上，您还可以使用与 gcs 兼容的 [`s3Cluster` 表函数](/sql-reference/table-functions/s3Cluster)，在多个节点上并行加载数据。

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

我们不在新模式中保留任何 null 值。上述插入将这些隐式转换为各自类型的默认值 - 整数为 0，字符串为一个空值。ClickHouse 还会自动将任何数值转换为其目标精度。

## ClickHouse 的主键有什么不同？ {#how-are-clickhouse-primary-keys-different}

如 [这里所述](/migrations/bigquery)，与 BigQuery 一样，ClickHouse 不会强制表的主键列值的唯一性。

与 BigQuery 的聚类类似，ClickHouse 表的数据在磁盘上按照主键列的顺序存储。此排序由查询优化器利用以防止重新排序、最小化连接内存使用，并支持限值子句的短路操作。
与 BigQuery 相比，ClickHouse 根据主键列值自动创建 [一个（稀疏）主索引](/guides/best-practices/sparse-primary-indexes)。该索引用于加速所有包含主键列过滤器的查询。具体来说：

- 内存和磁盘效率对 ClickHouse 使用的规模至关重要。数据以称为分片的块写入 ClickHouse 表，并应用规则在后台合并分片。在 ClickHouse 中，每个分片都有自己的主索引。当分片被合并时，合并后分片的主索引也被合并。需要注意的是，这些索引并不是为每一行建立的。相反，分片的主索引每组行有一个索引条目 - 这种技术称为稀疏索引。
- 稀疏索引是因为 ClickHouse 在磁盘上按照指定键的顺序存储分片的行。与直接定位单行（如基于 B 树的索引）不同，稀疏主索引允许通过对索引条目的二分查找快速识别可能匹配查询的行组。然后，找到的潜在匹配行组将被并行流入 ClickHouse 引擎以找到匹配项。这种索引设计允许主索引保持较小（完全适合主内存），而仍显著加快查询执行时间，尤其是对于数据分析用例中典型的范围查询。有关更多详细信息，我们推荐 [这篇深入指南](/guides/best-practices/sparse-primary-indexes)。

<Image img={bigquery_5} size="md" alt="ClickHouse Primary keys"/>

在 ClickHouse 中选择的主键将决定不仅是索引，也是数据在磁盘上的写入顺序。因此，这可以显著影响压缩级别，这又会影响查询性能。导致大多数列的值以连续顺序写入的排序关键字，将使所选的压缩算法（和编解码器）更有效地压缩数据。

> 表中的所有列都将根据指定排序键的值进行排序，无论它们是否包含在键中。例如，如果 `CreationDate` 被用作键，则其他所有列的值的顺序将对应于 `CreationDate` 列的值的顺序。可以指定多个排序键 - 这将以与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义进行排序。

### 选择排序键 {#choosing-an-ordering-key}

有关选择排序键的考虑和步骤，以 posts 表为例，请参见 [这里](/data-modeling/schema-design#choosing-an-ordering-key)。

## 数据建模技术 {#data-modeling-techniques}

我们建议从 BigQuery 迁移的用户阅读 [ClickHouse 中的数据建模指南](/data-modeling/schema-design)。本指南使用相同的 Stack Overflow 数据集并探索了使用 ClickHouse 特性的多种方法。

### 分区 {#partitions}

BigQuery 用户会熟悉表分区的概念，以通过将表划分为更小、更易于管理的部分来增强大型数据库的性能和可管理性。这种分区可以通过对指定列（如日期）上的范围、定义列表或通过键的哈希来实现。这允许管理员根据特定标准（例如日期范围或地理位置）组织数据。

分区有助于通过启用快速数据访问来提高查询性能，同时利用分区修剪和更高效的索引。它还通过允许对单个分区而非整个表执行操作来帮助备份和数据清理等维护任务。此外，分区可以通过将负载分布到多个分区来显著提高 BigQuery 数据库的可扩展性。

在 ClickHouse 中，分区是在初次定义表时通过 [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key) 子句指定的。该子句可以包含任何列上的 SQL 表达式，结果将决定一行发送到哪个分区。

<Image img={bigquery_6} size="md" alt="Partitions"/>

数据部分在磁盘上与每个分区逻辑相关联，可以单独查询。以下示例中，我们使用表达式 [`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toyear) 按年份对 posts 表进行分区。当行插入到 ClickHouse 时，该表达式将针对每一行进行评估 - 行随后以新数据部分的形式被路由到相应的分区。

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

ClickHouse 中的分区与 BigQuery 中的用途相似，但有一些细微差别。更具体地说：

- **数据管理** - 在 ClickHouse 中，用户应该主要认为分区是一种数据管理功能，而不是查询优化技术。通过根据键逻辑上分离数据，每个分区可以独立操作，例如删除。这允许用户在 [存储层](/integrations/s3#storage-tiers) 之间有效地移动分区，从而实现时间或 [过期数据/高效从集群中删除](/sql-reference/statements/alter/partition)。例如，以下示例中，我们删除 2008 年的帖子：

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

- **查询优化** - 虽然分区可以帮助提高查询性能，但这高度依赖于访问模式。如果查询仅针对少数几个分区（理想情况下是一个），则性能可能会改善。如果分区键不在主键中并且您按其过滤，这通常有效。然而，覆盖多个分区的查询可能在使用分区时性能较差（因为由于分区可能生成更多的部分）。如果分区键已经是主键的前部条目，定位单个分区的好处就会减弱，甚至几乎不存在。分区也可以用于 [优化 `GROUP BY` 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)，前提是每个分区中的值是唯一的。然而，通常用户应该确保主键是优化的，并且只在特殊情况下考虑分区作为查询优化技术，即访问模式访问特定可预测的子集，比如按天分区，大部分查询在最后一天。

#### 建议 {#recommendations}

用户应将分区视为一种数据管理技术。它在处理时间序列数据时尤其理想，例如，当需要从集群中过期数据时，最旧的分区可以 [简单地删除](/sql-reference/statements/alter/partition#drop-partitionpart)。

重要提示：确保您的分区键表达式不会导致高基数集，即避免创建超过 100 个分区。例如，不要按高基数列（例如客户标识符或名称）对数据进行分区。相反，将客户标识符或名称作为 `ORDER BY` 表达式中的第一列。

> 在内部，ClickHouse [为插入的数据创建部分](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。随着越来越多的数据插入，部分的数量会增加。为了防止过高的部分数量，导致查询性能下降（因为需要读取更多的文件），部分会在后台异步进程中合并。如果部分数量超过 [预配置限制](/operations/settings/merge-tree-settings#parts_to_throw_insert)，那么 ClickHouse 在插入时将抛出异常，提示为 ["too many parts" 错误](/knowledgebase/exception-too-many-parts)。这在正常操作中不应该发生，仅发生在 ClickHouse 配置错误或使用不当的情况下，例如许多小插入。由于每个分区独立创建部分，因此增加分区数量会增加部分数量，即部分数量是分区数量的倍数。因此，高基数分区键可能导致该错误，并应避免。

## 物化视图 vs 投影 {#materialized-views-vs-projections}

ClickHouse 的投影概念允许用户为表指定多个 `ORDER BY` 子句。

在 [ClickHouse 数据建模](/data-modeling/schema-design) 中，我们探讨了如何在 ClickHouse 中使用物化视图预先计算聚合、转换行，并针对不同的访问模式优化查询。对于后者，我们 [提供了一个示例](/materialized-view/incremental-materialized-view#lookup-table)，该物化视图将行发送到目标表，其排序键与接收插入的原始表不同。

例如，考虑以下查询：

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
   │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

该查询需要扫描所有 9000 万行（虽然速度很快），因为 `UserId` 不是排序键。之前，我们通过物化视图作为 `PostId` 的查找来解决此问题。通过投影也可以解决相同的问题。以下命令为 `ORDER BY user_id` 添加投影。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

请注意，我们必须先创建投影，然后将其物化。后一个命令导致数据以两种不同的顺序在磁盘上存储两次。如果在创建数据时定义投影，如下所示，它将在插入数据时自动维护。

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

如果投影是通过 `ALTER` 命令创建的，则在发出 `MATERIALIZE PROJECTION` 命令时，创建是异步的。用户可以通过以下查询确认此操作的进度，等待 `is_done=1`。

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

如果我们重复上述查询，可以看到性能显著改善，但代价是额外的存储。

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

通过 [`EXPLAIN` 命令](/sql-reference/statements/explain)，我们也确认了该查询使用了投影：

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

投影对于新用户来说是一个吸引人的特性，因为它们在插入数据时会自动维护。此外，查询可以只发送到单个表，其中尽可能利用投影来加快响应时间。

<Image img={bigquery_7} size="md" alt="Projections"/>

这与物化视图相反，后者需要用户选择适当的优化目标表，或者根据过滤器重写查询。这增加了用户应用程序的复杂性，并提高了客户端的复杂性。

尽管有这些优势，投影也有一些固有的限制，用户应当意识到，因此应谨慎使用：

- 投影不允许为源表和（隐藏的）目标表使用不同的 TTL。物化视图允许不同的 TTL。
- 投影 [目前不支持 `optimize_read_in_order`](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes) 用于（隐藏的）目标表。
- 对于具有投影的表，不支持轻量级的更新和删除操作。
- 物化视图可以链式使用：一个物化视图的目标表可以是另一个物化视图的源表，依此类推。但投影不支持。
- 投影不支持连接；物化视图支持。
- 投影不支持过滤器（`WHERE` 子句）；物化视图支持。

我们建议在以下情况下使用投影：

- 需要对数据进行全面重排序。虽然投影中的表达式在理论上可以使用 `GROUP BY`，但物化视图在维护聚合方面更有效。查询优化器也更可能利用使用简单重排序的投影，即 `SELECT * ORDER BY x`。用户可以在该表达式中选择列的子集，以减少存储占用。
- 用户对额外存储占用和重复写入数据的相关增加感到舒适。测试插入速度的影响，并 [评估存储开销](/data-compression/compression-in-clickhouse)。

## 在 ClickHouse 中重写 BigQuery 查询 {#rewriting-bigquery-queries-in-clickhouse}

以下提供了比较 BigQuery 和 ClickHouse 的示例查询。此列表旨在演示如何利用 ClickHouse 特性将查询显著简化。这里的示例使用了完整的 Stack Overflow 数据集（截至 2024 年 4 月）。

**接收最多浏览量的用户（提问超过 10 个）：**

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

**哪些标签收到最多的浏览量：**

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

用户应在可能的情况下利用 ClickHouse 聚合函数。下面展示了使用 [`argMax` 函数](/sql-reference/aggregate-functions/reference/argmax) 计算每年的最多浏览问题。

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

条件和数组函数使查询显著简化。以下查询计算 2022 年至 2023 年间（发生超过 10000 次）标签的最大百分比增长。请注意，由于条件、数组函数以及在 `HAVING` 和 `SELECT` 子句中重用别名，以下 ClickHouse 查询非常简洁。

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

这结束了我们对从 BigQuery 迁移到 ClickHouse 的用户的基本指南。我们建议从 BigQuery 迁移的用户阅读 [ClickHouse 中的数据建模指南](/data-modeling/schema-design)，以了解有关高级 ClickHouse 特性的更多信息。
