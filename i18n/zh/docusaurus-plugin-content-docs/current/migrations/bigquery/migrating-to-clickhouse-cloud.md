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

总结：因为 ClickHouse 在现代数据分析中比 BigQuery 更快、更便宜、更强大：

<Image img={bigquery_2} size="md" alt="ClickHouse vs BigQuery"/>

## 从 BigQuery 加载数据到 ClickHouse Cloud {#loading-data-from-bigquery-to-clickhouse-cloud}

### 数据集 {#dataset}

作为一个示例数据集，以展示从 BigQuery 到 ClickHouse Cloud 的典型迁移，我们使用 Stack Overflow 数据集，详细说明见 [这里](/getting-started/example-datasets/stackoverflow)。该数据集包含自 2008 年至 2024 年 4 月期间在 Stack Overflow 上发生的所有 `post`、`vote`、`user`、`comment` 和 `badge`。该数据的 BigQuery 模式如下所示：

<Image img={bigquery_3} size="lg" alt="Schema"/>

对于希望将该数据集填充到 BigQuery 实例以测试迁移步骤的用户，我们提供了 Parquet 格式的数据存储在 GCS 桶中，并且在 BigQuery 中创建和加载表的 DDL 命令可在 [这里](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==) 获取。

### 迁移数据 {#migrating-data}

在 BigQuery 和 ClickHouse Cloud 之间迁移数据主要分为两种工作负载类型：

- **初始批量加载与定期更新** - 必须迁移初始数据集，并在设定的间隔（例如每日）进行定期更新。此处的更新通过重新发送已更改的行来处理 - 这些行通过可以用于比较的列（例如日期）进行识别。删除通过对数据集进行完整的定期重新加载来处理。
- **实时复制或 CDC** - 必须迁移初始数据集。对此数据集的更改必须在 ClickHouse 中近乎实时地反映，且仅允许几秒的延迟。这实际上是一个 [更改数据捕获 (CDC) 过程](https://en.wikipedia.org/wiki/Change_data_capture)，在此过程中必须将 BigQuery 中的表与 ClickHouse 同步，即 BigQuery 表中的插入、更新和删除必须应用于 ClickHouse 中的等效表。

#### 通过 Google Cloud Storage (GCS) 批量加载 {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery 支持将数据导出到 Google 的对象存储（GCS）。对于我们的示例数据集：

1. 将 7 个表导出到 GCS。相关命令可在 [这里](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==) 获取。

2. 将数据导入 ClickHouse Cloud。为此，我们可以使用 [gcs 表函数](/sql-reference/table-functions/gcs)。DDL 和导入查询可在 [这里](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==) 获取。请注意，由于 ClickHouse Cloud 实例由多个计算节点组成，因此我们使用 [s3Cluster 表函数](/sql-reference/table-functions/s3Cluster) 来替代 `gcs` 表函数。该函数也可以与 gcs 桶一起使用，并且 [利用 ClickHouse Cloud 服务的所有节点](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) 的并行加载数据。

<Image img={bigquery_4} size="md" alt="Bulk loading"/>

这种方法有许多优点：

- BigQuery 导出功能支持导出数据子集的过滤器。
- BigQuery 支持导出 [Parquet、Avro、JSON 和 CSV](https://cloud.google.com/bigquery/docs/exporting-data) 格式以及几种 [压缩类型](https://cloud.google.com/bigquery/docs/exporting-data) - 所有这些都被 ClickHouse 支持。
- GCS 支持 [对象生命周期管理](https://cloud.google.com/storage/docs/lifecycle)，允许在指定时间段后删除已经导出并导入到 ClickHouse 的数据。
- [Google 每天允许免费导出最多 50TB 数据到 GCS](https://cloud.google.com/bigquery/quotas#export_jobs)。用户仅需为 GCS 存储付费。
- 导出会自动生成多个文件，并限制每个文件的最大表数据为 1GB。这对 ClickHouse 有利，因为这允许并行化导入。

在尝试以下示例之前，我们建议用户查看 [导出所需的权限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions) 和 [位置建议](https://cloud.google.com/bigquery/docs/exporting-data#data-locations)，以最大化导出和导入性能。

### 通过调度查询进行实时复制或 CDC {#real-time-replication-or-cdc-via-scheduled-queries}

更改数据捕获 (CDC) 是保持两个数据库之间表同步的过程。如果要近实时处理更新和删除，则这会复杂得多。一个方法是简单地使用 BigQuery 的 [调度查询功能](https://cloud.google.com/bigquery/docs/scheduling-queries) 计划定期导出。只要您可以接受将数据插入 ClickHouse 的延迟，这种方法就容易实现和维护。示例在 [这篇博客文章中](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries) 提供。

## 设计模式 {#designing-schemas}

Stack Overflow 数据集包含多个相关的表。我们建议首先关注迁移主表。这可能不一定是最大表，而是您预计将收到最多分析查询的表。这将使您能够熟悉主要的 ClickHouse 概念。随着额外表的增加，这个表可能需要重新建模，以充分利用 ClickHouse 的特性并获得最佳性能。我们在我们的 [数据建模文档](/data-modeling/schema-design#next-data-modeling-techniques) 中探讨了这个建模过程。

遵循这一原则，我们专注于主要的 `posts` 表。该表的 BigQuery 模式如下所示：

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

我们可以通过简单的 [`INSERT INTO SELECT`](/sql-reference/statements/insert-into) 将数据填充到此表，即通过 [`gcs` 表函数](/sql-reference/table-functions/gcs) 从 gcs 读取已导出的数据。请注意，在 ClickHouse Cloud 上，您还可以使用与 gcs 兼容的 [`s3Cluster` 表函数](/sql-reference/table-functions/s3Cluster) 在多个节点上并行加载：

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

在我们的新模式中，我们不保留任何 Null 值。以上插入操作会将这些值隐式转换为其各自类型的默认值 - 整数的默认值为 0，字符串的空值为一个空值。 ClickHouse 还会自动将任何数字转换为其目标精度。

## ClickHouse 主键有何不同？ {#how-are-clickhouse-primary-keys-different}

正如 [这里所述](/migrations/bigquery)，与 BigQuery 一样，ClickHouse 不对表的主键列值强制唯一性。

与 BigQuery 的聚类类似，ClickHouse 表的数据按主键列有序存储在磁盘上。这种排序顺序被查询优化器用于防止重新排序、最小化连接使用的内存，并启用限制子句的短路。与 BigQuery 相比，ClickHouse 会自动基于主键列值创建 [（稀疏）主索引](/guides/best-practices/sparse-primary-indexes)。该索引用于加速所有包含主键列过滤器的查询。具体而言：

- 内存和磁盘效率在 ClickHouse 通常使用的规模上至关重要。数据以称为分区片段的块写入 ClickHouse 表，并在后台应用合并分区的规则。在 ClickHouse 中，每个分区片段都有其自己的主索引。当分区片段被合并时，合并后的分区片段的主索引也会被合并。要注意的是，这些索引并不是为每一行构建的。相反，分区片段的主索引为每组行有一个索引条目 - 这种技术称为稀疏索引。
- 稀疏索引之所以可行，是因为 ClickHouse 以指定的键按顺序在磁盘上存储行。稀疏主索引允许它通过索引条目的二分搜索快速识别可能与查询匹配的行组，而不是直接定位单独的行（就像基于 B-树的索引）。找到的可能匹配的行组随后被并行流入 ClickHouse 引擎以寻找匹配项。这种索引设计使得主索引小（它完全适合主内存），同时显著加快查询执行时间，特别是在数据分析用例中典型的范围查询。有关更多详细信息，我们建议查看 [这本深入指南](/guides/best-practices/sparse-primary-indexes)。

<Image img={bigquery_5} size="md" alt="ClickHouse Primary keys"/>

在 ClickHouse 中选择的主键不仅决定索引，还决定了数据在磁盘上的写入顺序。因此，它会对压缩级别产生重大影响，这反过来会影响查询性能。导致大多数列的值以连续顺序写入的排序键将使所选的压缩算法（和编解码器）能够更有效地压缩数据。

> 表中的所有列将根据指定排序键的值进行排序，无论它们是否包含在键中。例如，如果 `CreationDate` 用作键，则所有其他列中的值的顺序将与 `CreationDate` 列中的值的顺序相对应。可以指定多个排序键 - 这将以与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义进行排序。

### 选择排序键 {#choosing-an-ordering-key}

有关选择排序键的考虑和步骤，以 posts 表为例，请参见 [这里](/data-modeling/schema-design#choosing-an-ordering-key)。

## 数据建模技术 {#data-modeling-techniques}

我们建议从 BigQuery 迁移的用户阅读 [ClickHouse 中的数据建模指南](/data-modeling/schema-design)。该指南使用相同的 Stack Overflow 数据集，探讨了利用 ClickHouse 特性的多种方法。

### 分区 {#partitions}

BigQuery 用户将熟悉表分区的概念，以通过将表分成较小、更可管理的部分（称为分区）来提高大数据库的性能和可管理性。可以通过指定列（例如日期）上的范围、定义的列表或通过键的哈希实现这种分区。这使得管理员能够根据特定标准（如日期范围或地理位置）组织数据。

分区帮助通过启用通过分区修剪对数据的更快访问以及更有效的索引来提高查询性能。它还通过允许对单个分区而不是整个表进行操作来帮助维护任务，例如备份和数据清除。此外，分区可以显著提高 BigQuery 数据库的可扩展性，因为它通过在多个分区之间分配负载来实现。

在 ClickHouse 中，在表的初始定义时通过 [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key) 子句指定分区。该子句可以包含任何列的 SQL 表达式，结果将定义将行发送到哪个分区。

<Image img={bigquery_6} size="md" alt="Partitions"/>

数据部分在磁盘上与每个分区逻辑关联，并且可以单独查询。对于下面的示例，我们使用表达式 [`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toyear) 按年对 posts 表进行分区。当行插入到 ClickHouse 中时，将对此表达式针对每行进行评估 - 行随后被路由到属于该分区的新数据部分。

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

ClickHouse 中的分区具有与 BigQuery 相似的应用，但有一些微妙的区别。更具体地说：

- **数据管理** - 在 ClickHouse 中，用户应该将分区主要视为数据管理功能，而不是查询优化技术。通过基于键将数据逻辑上分开，每个分区可以独立进行操作，例如删除。这使用户能够在 [存储层](/integrations/s3#storage-tiers) 之间高效地移动分区，从而有效地 [过期数据/高效地从集群中删除](/sql-reference/statements/alter/partition)。以下示例中，我们移除 2008 年的帖子：

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

- **查询优化** - 虽然分区可以帮助提高查询性能，但这在很大程度上取决于访问模式。如果查询仅针对少数分区（理想情况下是一个），性能可能会有所提升。只有在分区键不在主键中且您正在按其过滤的情况下，通常这才有用。然而，如果查询需要覆盖许多分区，可能会比不使用分区更差（因为可能由于分区而存在更多的部分）。如果分区键已经是主键中的早期条目，针对单个分区的好处将不那么明显，甚至不存在。分区还可以用于 [优化 `GROUP BY` 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)，如果每个分区中的值是唯一的。然而，通常情况下，用户应确保主键是经过优化的，并且仅在访问模式访问特定可预测的子集的特殊情况下考虑分区，例如按天分区，当大多数查询集中在最后一天。

#### 推荐 {#recommendations}

用户应将分区视为数据管理技术。对于操作时间序列数据时需要从集群中过期数据时，这是理想的，例如，最旧的分区可以 [简单地删除](/sql-reference/statements/alter/partition#drop-partitionpart)。

重要提示：确保您的分区键表达式不导致高基数集，即应避免创建超过 100 个分区。例如，不要按高基数列（如客户端标识符或名称）进行分区。相反，应将客户端标识符或名称放在 `ORDER BY` 表达式的第一列。

> 在内部，ClickHouse [为插入的数据创建分区片段](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。随着更多数据的插入，分区片段数量增加。为了防止分区片段数量过多，导致查询性能下降（因为需要读取更多文件），分区片段会在后台异步进程中合并。如果分区片段的数量超过 [预配置的限制](/operations/settings/merge-tree-settings#parts_to_throw_insert)，则 ClickHouse 在插入时将引发一个 "过多分区片段" 错误。这在正常操作下不应发生，仅在 ClickHouse 配置错误或使用不当（例如多次小插入）时发生。由于分区片段在每个分区中独立创建，增加分区数量会导致分区片段数量增加，即它是分区数量的倍数。因此，高基数的分区键可能导致此错误，应避免。

## 物化视图与投影 {#materialized-views-vs-projections}

ClickHouse 的投影概念允许用户为表指定多个 `ORDER BY` 子句。

在 [ClickHouse 数据建模](/data-modeling/schema-design) 中，我们探讨了如何在 ClickHouse 中使用物化视图来预计算聚合、转换行，并针对不同的访问模式优化查询。对于后者，我们 [提供了一个示例](/materialized-view/incremental-materialized-view#lookup-table)，在该示例中，物化视图将行发送到具有不同排序键的目标表，而不是接收插入的原始表。

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

此查询需要扫描所有 9000 万行（诚然速度很快），因为 `UserId` 不是排序键。以前，我们使用物化视图作为 `PostId` 的查找来解决此问题。可以使用投影解决相同的问题。以下命令为 `ORDER BY user_id` 添加投影。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

请注意，我们必须首先创建投影，然后再进行物化。后一个命令导致数据以两种不同的顺序在磁盘上存储两次。投影也可以在创建数据时定义，如下所示，并将在数据插入时自动维护。

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

如果投影是通过 `ALTER` 命令创建的，则在发出 `MATERIALIZE PROJECTION` 命令时创建是异步的。用户可以通过以下查询确认此操作的进展，等待 `is_done=1`。

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

如果我们重复上述查询，可以看到性能显著提高，但需要额外的存储。

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

通过 [`EXPLAIN` 命令](/sql-reference/statements/explain)，我们还确认了投影用于提供此查询：

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

投影是新用户备受青睐的特性，因为它们在数据插入时会自动维护。此外，查询可以仅发送到一个表，尽可能利用投影来加快响应时间。

<Image img={bigquery_7} size="md" alt="Projections"/>

与物化视图相反，用户必须选择适当的优化目标表或根据过滤器重写查询。这对用户应用程序提出了更高的要求，并增加了客户端的复杂性。

尽管投影有这些优点，但它们也有一些固有的限制，用户应该注意这些限制，因此应谨慎部署：

- 投影不允许为源表和（隐藏）目标表使用不同的 TTL。物化视图允许不同的 TTL。
- 投影 [当前不支持 `optimize_read_in_order`](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes) 的（隐藏）目标表。
- 不支持对具有投影的表的轻量级更新和删除。
- 物化视图可以链式连接：一个物化视图的目标表可以是另一个物化视图的源表，依此类推。这在投影中不可行。
- 投影不支持连接；物化视图支持。
- 投影不支持过滤器（`WHERE` 子句）；物化视图支持。

我们建议在以下情况下使用投影：

- 需要对数据进行完整的重新排序。虽然投影中的表达式理论上可以使用 `GROUP BY`，但对于维持聚合，物化视图更加有效。查询优化器也更可能利用使用简单重新排序的投影，即 `SELECT * ORDER BY x`。用户可以在该表达式中选择列的子集以减少存储占用。
- 用户对存储占用和二次写入数据带来的额外开销感到满意。测试插入速度的影响，并 [评估存储开销](/data-compression/compression-in-clickhouse)。

## 在 ClickHouse 中重写 BigQuery 查询 {#rewriting-bigquery-queries-in-clickhouse}

以下提供了比较 BigQuery 与 ClickHouse 的示例查询。此列表旨在演示如何利用 ClickHouse 的特性显著简化查询。这里的示例使用完整的 Stack Overflow 数据集（截至 2024 年 4 月）。

**用户（提问超过 10 个）中收到最多查看的：**

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

**哪些标签接收的视图最多：**

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

在可以的情况下，用户应利用 ClickHouse 的聚合函数。下面，我们展示使用 [`argMax` 函数](/sql-reference/aggregate-functions/reference/argmax) 来计算每年的查看最多的问题。

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

条件和数组函数使查询变得更加简单。以下查询计算从 2022 年到 2023 年增长百分比最大的标签（出现超过 10000 次）。请注意，以下 ClickHouse 查询由于条件、数组函数以及在 `HAVING` 和 `SELECT` 子句中重用别名的能力而变得简洁明了。

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

这就是我们为从 BigQuery 迁移到 ClickHouse 的用户提供的基础指南。我们建议从 BigQuery 迁移的用户阅读 [ClickHouse 中的数据建模指南](/data-modeling/schema-design)，以了解更多关于高级 ClickHouse 特性的内容。
