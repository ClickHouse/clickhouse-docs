---
'title': '从 BigQuery 迁移到 ClickHouse Cloud'
'slug': '/migrations/bigquery/migrating-to-clickhouse-cloud'
'description': '如何将您的数据从 BigQuery 迁移到 ClickHouse Cloud'
'keywords':
- 'BigQuery'
'show_related_blogs': true
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

## 为什么选择 ClickHouse Cloud 而不是 BigQuery? {#why-use-clickhouse-cloud-over-bigquery}

TLDR: 因为 ClickHouse 在现代数据分析中比 BigQuery 更快、更便宜且更强大：

<Image img={bigquery_2} size="md" alt="ClickHouse vs BigQuery"/>

## 从 BigQuery 加载数据到 ClickHouse Cloud {#loading-data-from-bigquery-to-clickhouse-cloud}

### 数据集 {#dataset}

作为示例数据集以展示从 BigQuery 迁移到 ClickHouse Cloud 的典型过程，我们使用 Stack Overflow 数据集，其详细信息见 [这里](/getting-started/example-datasets/stackoverflow)。该数据集包含了自 2008 年至 2024 年 4 月期间发生在 Stack Overflow 上的每一个 `post`、`vote`、`user`、`comment` 和 `badge`。此数据的 BigQuery 架构如下所示：

<Image img={bigquery_3} size="lg" alt="Schema"/>

对于希望将此数据集填充到 BigQuery 实例中以测试迁移步骤的用户，我们已在 GCS 存储桶中提供了这些表的数据，DDL 命令用于在 BigQuery 中创建和加载表可在 [这里](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==) 获取。

### 迁移数据 {#migrating-data}

从 BigQuery 到 ClickHouse Cloud 的数据迁移分为两种主要工作负载类型：

- **初始批量加载与定期更新** - 必须迁移初始数据集，并在设定的时间间隔（例如，每天）进行定期更新。这里的更新是通过重新发送已更改的行来处理的，通常根据可用于比较的列（例如日期）进行识别。删除则通过对数据集进行完整的定期重载来处理。
- **实时复制或 CDC** - 必须迁移初始数据集。对该数据集的更改必须在 ClickHouse 中近实时反映，最多可接受几秒的延迟。这实际上是一个 [变更数据捕获 (CDC) 过程](https://en.wikipedia.org/wiki/Change_data_capture)，其中 BigQuery 中的表必须与 ClickHouse 同步，即 BigQuery 表中的插入、更新和删除必须应用到 ClickHouse 中的等效表中。

#### 通过 Google Cloud Storage (GCS) 批量加载 {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery 支持将数据导出到 Google 的对象存储 (GCS)。对于我们的示例数据集：

1. 将 7 个表导出到 GCS。相关命令可在 [这里](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==) 查看。

2. 将数据导入到 ClickHouse Cloud。为此，我们可以使用 [gcs 表函数](/sql-reference/table-functions/gcs)。DDL 和导入查询可在 [这里](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==) 获取。请注意，由于 ClickHouse Cloud 实例由多个计算节点组成，因此我们用 [s3Cluster 表函数](/sql-reference/table-functions/s3Cluster) 替代 `gcs` 表函数。此函数也可以与 gcs 存储桶一起使用，并且 [利用 ClickHouse Cloud 服务的所有节点](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) 来并行加载数据。

<Image img={bigquery_4} size="md" alt="Bulk loading"/>

这种方法有许多优势：

- BigQuery 的导出功能支持用于导出数据子集的过滤器。
- BigQuery 支持导出到 [Parquet、Avro、JSON 和 CSV](https://cloud.google.com/bigquery/docs/exporting-data) 格式及几种 [压缩类型](https://cloud.google.com/bigquery/docs/exporting-data) - 这些都被 ClickHouse 支持。
- GCS 支持 [对象生命周期管理](https://cloud.google.com/storage/docs/lifecycle)，允许在特定时间段后删除已经导出并导入到 ClickHouse 的数据。
- [Google 允许每天免费导出最多 50TB 数据到 GCS](https://cloud.google.com/bigquery/quotas#export_jobs)。用户只需为 GCS 存储付费。
- 导出会自动生成多个文件，每个文件的最大表数据为 1GB。这对 ClickHouse 有利，因为它允许导入并行化。

在尝试以下示例之前，我们建议用户查看 [导出所需的权限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions) 和 [位置推荐](https://cloud.google.com/bigquery/docs/exporting-data#data-locations) 以最大化导出和导入性能。

### 通过调度查询进行实时复制或 CDC {#real-time-replication-or-cdc-via-scheduled-queries}

变更数据捕获 (CDC) 是将两个数据库之间的表保持同步的过程。如果要在接近实时的情况下处理更新和删除，这显然更复杂。一种方法是简单地使用 BigQuery 的 [调度查询功能](https://cloud.google.com/bigquery/docs/scheduling-queries) 来安排定期导出。假如您可以接受插入数据到 ClickHouse 的一些延迟，这种方法很容易实现和维护。一个示例见 [这篇博文](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries)。

## 设计模式 {#designing-schemas}

Stack Overflow 数据集中包含多个相关表。我们建议首先关注迁移主表。这并不一定是最大的表，而是您预计将接收最多分析查询的表。这样可以让您熟悉 ClickHouse 的主要概念。随着更多表的添加，这张表可能需要重新建模以充分利用 ClickHouse 的特性，并获得最佳性能。我们在 [数据建模文档](/data-modeling/schema-design#next-data-modeling-techniques) 中探讨了这一建模过程。

遵循此原则，我们关注主要的 `posts` 表。其 BigQuery 架构如下所示：

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

应用 [这里描述的过程](/data-modeling/schema-design) 将得到如下架构：

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

我们可以通过简单的 [`INSERT INTO SELECT`](/sql-reference/statements/insert-into) 将数据填充到此表中，使用 [`gcs` 表函数](/sql-reference/table-functions/gcs) 从 gcs 读取导出数据。请注意，在 ClickHouse Cloud 上，您还可以使用与 gcs 兼容的 [`s3Cluster` 表函数](/sql-reference/table-functions/s3Cluster) 在多个节点上并行加载：

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

我们在新架构中不保留任何 null 值。上述插入会将这些值隐式转换为其各自类型的默认值 - 整数为 0，字符串为空值。ClickHouse 还会自动将任何数值转换为目标精度。

## ClickHouse 主键有何不同? {#how-are-clickhouse-primary-keys-different}

如 [这里所述](/migrations/bigquery)，与 BigQuery 一样，ClickHouse 对表的主键列值不强制唯一。

与 BigQuery 中的聚类类似，ClickHouse 表的数据按主键列的顺序存储在磁盘上。这种排序被查询优化器利用，以防止重新排序，最小化连接的内存使用，并启用限制子句的短路。与 BigQuery 不同，ClickHouse 会根据主键列值自动创建 [（稀疏）主索引](/guides/best-practices/sparse-primary-indexes)。此索引用于加速所有包含主键列过滤条件的查询。具体来说：

- 内存和磁盘效率在 ClickHouse 常用的规模上至关重要。数据通过称为 parts 的块写入 ClickHouse 表中，并且在后台应用合并 parts 的规则。在 ClickHouse 中，每个 part 都有自己的主索引。当 parts 被合并时，合并后的 part 的主索引也会合并。请注意，这些索引并不是为每一行构建的。相反，对于一个 part，主索引每组行只有一个索引条目 - 这种技术称为稀疏索引。
- 稀疏索引之所以可行，是因为 ClickHouse 按指定的键在磁盘上存储一个 part 的行。与直接定位单行（如基于 B 树 的索引）不同，稀疏主索引能够通过对索引条目执行二分搜索快速（查找）识别可能匹配查询的行组。找到的潜在匹配行组将以并行方式流入 ClickHouse 引擎以找到匹配项。这种索引设计使主索引可以较小（完全符合主内存），同时仍大大加快查询执行时间，特别是在数据分析用例中典型的范围查询。有关更多详细信息，我们建议 [这篇深入指南](/guides/best-practices/sparse-primary-indexes)。

<Image img={bigquery_5} size="md" alt="ClickHouse Primary keys"/>

在 ClickHouse 中选择的主键不仅决定索引，还决定数据在磁盘上的写入顺序。因此，它会显著影响压缩级别，这反过来可能会影响查询性能。导致大多数列值按连续顺序写入的排序键，将允许所选的压缩算法（和编码）更有效地压缩数据。

> 表中的所有列将根据指定的排序键的值进行排序，无论它们是否包含在键本身中。例如，如果使用 `CreationDate` 作为键，则所有其他列中的值的顺序将与 `CreationDate` 列中的值的顺序相对应。可以指定多个排序键 - 这将与 `SELECT` 查询中的 `ORDER BY` 子句具有相同的语义。

### 选择排序键 {#choosing-an-ordering-key}

有关选择排序键的考虑和步骤，以帖子表为例，请参见 [这里](/data-modeling/schema-design#choosing-an-ordering-key)。

## 数据建模技术 {#data-modeling-techniques}

我们建议从 BigQuery 迁移的用户阅读 [ClickHouse 数据建模指南](/data-modeling/schema-design)。该指南使用相同的 Stack Overflow 数据集，并探讨了使用 ClickHouse 特性的多种方法。

### 分区 {#partitions}

BigQuery 用户对表分区的概念会比较熟悉，这种方法通过将表划分为更小、更可管理的 pieces 来提高大型数据库的性能和可管理性。这种分区可以通过指定列（例如日期）的范围、定义的列表或通过哈希键实现。这允许管理员根据特定标准（如日期范围或地理位置）组织数据。

分区有助于提高查询性能，通过允许通过分区剪裁实现更快的数据访问和更高效的索引。此外，它还支持维护任务，例如备份和数据清理，因为可以对单个分区而不是整个表进行操作。此外，分区还可以显著提高 BigQuery 数据库的可扩展性，将负载分配到多个分区。

在 ClickHouse 中，分区是在首次通过 [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key) 子句定义表时指定的。该子句可以包含任何列的 SQL 表达式，其结果将定义行发送到哪一个分区。

<Image img={bigquery_6} size="md" alt="Partitions"/>

数据部分在磁盘上与每个分区逻辑关联，并且可单独查询。对于下面的示例，我们使用表达式 [`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toyear) 按年份对帖子表进行分区。当行插入到 ClickHouse 时，将对每行评估此表达式 - 然后将行路由到结果分区，形成属于该分区的新数据部分。

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

ClickHouse 中的分区与 BigQuery 中的应用类似，但有一些细微差别。具体来说：

- **数据管理** - 在 ClickHouse 中，用户主要应将分区视为数据管理特性，而不是查询优化技术。通过基于键逻辑分隔数据，每个分区可以独立操作，例如删除。这允许用户高效地移动分区及其子集在 [存储层](/integrations/s3#storage-tiers) 之间随时间变化或 [过期数据/高效地从集群中删除](/sql-reference/statements/alter/partition)。例如，下面的操作可以删除 2008 年的帖子：

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

- **查询优化** - 虽然分区可以协助提升查询性能，但这在很大程度上取决于访问模式。如果查询仅针对少数几个分区（理想情况下是一个），性能可能会有所改善。这通常只有在分区键未在主键中，而且您正在进行过滤时才有用。然而，需要覆盖多个分区的查询可能比不使用分区的性能更差（因为由于分区可能会导致更多的 parts）。如果分区键已经是在主键中的早期条目，则单一分区的目标也可能不会显著提升。对于每个分区的值都是唯一的情况，可以使用分区来 [优化 `GROUP BY` 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)。但是，用户通常应确保主键经过优化，仅在访问模式访问特定可预测子集的情况下才考虑将分区用作查询优化技术，例如按天分区，而大多数查询都在最后一天。

#### 建议 {#recommendations}

用户应将分区视为一种数据管理技术。它适用于处理时序数据时，当数据需要从集群中过期时，例如，最旧的分区可以 [直接删除](/sql-reference/statements/alter/partition#drop-partitionpart)。

重要提示：确保您的分区键表达式不会导致高基数集，即应避免创建超过 100 个分区。例如，不要通过高基数列（如客户端标识符或名称）对数据进行分区。相反，将客户端标识符或名称作为 `ORDER BY` 表达式中的第一列。

> 在内部，ClickHouse [为插入数据创建 parts](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。随着更多数据的插入，parts 的数量会增加。为了防止 parts 数量过高，从而影响查询性能（因为需要阅读更多文件），parts 在后台异步过程中合并。如果 parts 的数量超过 [预配置的限制](/operations/settings/merge-tree-settings#parts_to_throw_insert)，则 ClickHouse 会在插入时抛出异常，即 ["太多 parts" 错误](/knowledgebase/exception-too-many-parts)。这在正常操作下不应发生，仅会在 ClickHouse 配置不当或错误使用（例如，插入过多小批量数据）时发生。因为每个分区是独立地创建 parts，所以增加分区数会增加 parts 数量，即它是分区数的倍数。因此，高基数的分区键可能导致此错误，应避免使用。

## 物化视图与投影 {#materialized-views-vs-projections}

ClickHouse 的投影概念允许用户为表指定多个 `ORDER BY` 子句。

在 [ClickHouse 数据建模](/data-modeling/schema-design) 中，我们探讨了如何使用物化视图在 ClickHouse 中预计算聚合、转换行并优化查询以应对不同的访问模式。对于后者，我们 [提供了一个示例](/materialized-view/incremental-materialized-view#lookup-table)，其中物化视图将行发送至目标表，其排序键不同于接收插入的原始表。

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

这个查询需要扫描所有 9000 万行（尽管速度很快），因为 `UserId` 不是排序键。之前，我们通过物化视图作为 `PostId` 的查找表来解决此问题。相同的问题也可以通过投影解决。以下命令为 `ORDER BY user_id` 添加了一个投影。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

请注意，我们必须先创建投影，然后再使其物化。后一个命令会导致数据在磁盘上以两种不同的顺序存储。投影也可以在创建数据时定义，如下所示，并会在插入数据时自动维护。

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

如果通过 `ALTER` 命令创建投影，则在发出 `MATERIALIZE PROJECTION` 命令时，创建过程是异步的。用户可以通过以下查询确认此操作的进度，等待 `is_done=1`。

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

如果我们重复上述查询，可以看到性能显著提高，但额外的存储需求也随之增加。

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

通过 [`EXPLAIN` 命令](/sql-reference/statements/explain)，我们还确认了该投影用于处理此查询：

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

投影是新用户非常喜欢的功能，因为它们在插入数据时会被自动维护。此外，查询可以仅发送到一个表，在这个表中尽可能地利用投影来加速响应时间。

<Image img={bigquery_7} size="md" alt="Projections"/>

与此形成对比的是物化视图，在这种情况下，用户必须选择适当的优化目标表，或者重写它们的查询，具体取决于过滤条件。这对用户应用提出了更高的要求，并增加了客户端的复杂性。

尽管有这些优势，投影也有一些固有的局限性，用户应当知晓，并因此在使用时应谨慎：

- 投影不允许为源表和（隐藏）目标表使用不同的 TTL。物化视图允许不同的 TTL。
- 投影 [当前不支持 `optimize_read_in_order`](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes) 用于（隐藏）目标表。
- 轻量级更新和删除不支持具有投影的表。
- 物化视图可以链接：一个物化视图的目标表可以是另一个物化视图的源表，依此类推。投影则不支持此功能。
- 投影不支持连接；物化视图支持。
- 投影不支持过滤器（`WHERE` 子句）；物化视图支持。

我们建议在以下情况下使用投影：

- 需要对数据进行完全重排序。尽管投影中的表达式理论上可以使用 `GROUP BY`，但物化视图在维护聚合方面更加有效。查询优化器也更可能利用使用简单重排序的投影，即 `SELECT * ORDER BY x`。用户可以在该表达式中选择列的子集，以减小存储占用。
- 用户能接受增加的存储占用和写入数据两次带来的开销。测试对插入速度的影响，并 [评估存储开销](/data-compression/compression-in-clickhouse)。

## 在 ClickHouse 中重写 BigQuery 查询 {#rewriting-bigquery-queries-in-clickhouse}

以下提供了比较 BigQuery 和 ClickHouse 的示例查询。此列表旨在展示如何利用 ClickHouse 特性显著简化查询。这里的示例使用完整的 Stack Overflow 数据集（截至 2024 年 4 月）。

**用户（有超过 10 个问题）中获得最多浏览量的：**

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

**哪些标签获得的浏览量最多：**

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

在可能的情况下，用户应利用 ClickHouse 的聚合函数。下面，我们展示了 [`argMax` 函数](/sql-reference/aggregate-functions/reference/argmax) 用于计算每年的最受欢迎问题。

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

条件和数组函数显著简化查询。以下查询计算从 2022 年到 2023 年标签（出现次数超过 10000 次）的百分比最大增幅。请注意，得益于条件、数组函数以及在 `HAVING` 和 `SELECT` 子句中重用别名，以下 ClickHouse 查询十分简洁。

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

这就是我们为从 BigQuery 迁移的用户提供的基本指南。我们建议从 BigQuery 迁移的用户阅读 [ClickHouse 的数据建模指南](/data-modeling/schema-design) 以了解更多高级 ClickHouse 特性。
