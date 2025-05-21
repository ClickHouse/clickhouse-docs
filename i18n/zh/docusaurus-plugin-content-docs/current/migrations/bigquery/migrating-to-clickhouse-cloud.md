---
'title': '从BigQuery迁移到ClickHouse云'
'slug': '/migrations/bigquery/migrating-to-clickhouse-cloud'
'description': '如何将您的数据从BigQuery迁移到ClickHouse云'
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

## 为什么使用 ClickHouse Cloud 而非 BigQuery? {#why-use-clickhouse-cloud-over-bigquery}

简而言之：因为 ClickHouse 在现代数据分析方面比 BigQuery 更快、更便宜且功能更强大：

<Image img={bigquery_2} size="md" alt="ClickHouse vs BigQuery"/>

## 从 BigQuery 加载数据到 ClickHouse Cloud {#loading-data-from-bigquery-to-clickhouse-cloud}

### 数据集 {#dataset}

作为一个示例数据集，我们使用 Stack Overflow 数据集来展示从 BigQuery 到 ClickHouse Cloud 的典型迁移，该数据集的详细信息记录在 [这里](/getting-started/example-datasets/stackoverflow)。该数据集包含自 2008 年至 2024 年 4 月期间在 Stack Overflow 上发生的每个 `post`、`vote`、`user`、`comment` 和 `badge`。以下是该数据的 BigQuery 架构：

<Image img={bigquery_3} size="lg" alt="Schema"/>

对于希望将此数据集填充到 BigQuery 实例以测试迁移步骤的用户，我们提供了以 Parquet 格式存储的这些表的数据，并且用于创建和加载 BigQuery 表的 DDL 命令可以在 [这里](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==) 找到。

### 数据迁移 {#migrating-data}

在 BigQuery 和 ClickHouse Cloud 之间迁移数据主要分为两种工作负载类型：

- **初始大宗加载及定期更新** - 必须迁移初始数据集，并在设定的时间间隔（例如，每日）进行定期更新。此处的更新是通过重新发送已更改的行来处理的——更改通过可以用于比较的列（例如日期）进行识别。删除则通过对数据集进行完全的定期重新加载来处理。
- **实时复制或 CDC** - 必须迁移初始数据集。该数据集的更改必须在 ClickHouse 中近实时反映，仅允许数秒的延迟。这实际上是一个 [变更数据捕获（CDC）过程](https://en.wikipedia.org/wiki/Change_data_capture)，其中 BigQuery 中的表必须与 ClickHouse 同步，即 BigQuery 表中的插入、更新和删除必须应用于 ClickHouse 中的等效表。

#### 通过 Google Cloud Storage (GCS) 进行大宗加载 {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery 支持将数据导出到 Google 的对象存储（GCS）。对于我们的示例数据集：

1. 将 7 个表导出到 GCS。相关命令可以在 [这里](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==) 找到。

2. 将数据导入到 ClickHouse Cloud。为此，我们可以使用 [gcs 表函数](/sql-reference/table-functions/gcs)。DDL 和导入查询可以在 [这里](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==) 找到。请注意，由于 ClickHouse Cloud 实例由多个计算节点组成，因此我们使用的是 [s3Cluster 表函数](/sql-reference/table-functions/s3Cluster)，而不是 `gcs` 表函数。该函数同样适用于 gcs 存储桶，并且 [利用 ClickHouse Cloud 服务的所有节点](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers) 以并行方式加载数据。

<Image img={bigquery_4} size="md" alt="Bulk loading"/>

这种方法有多个优点：

- BigQuery 导出功能支持过滤以导出数据的子集。
- BigQuery 支持导出 [Parquet, Avro, JSON 和 CSV](https://cloud.google.com/bigquery/docs/exporting-data) 格式以及多种 [压缩类型](https://cloud.google.com/bigquery/docs/exporting-data) - 所有这些都受到 ClickHouse 的支持。
- GCS 支持 [对象生命周期管理](https://cloud.google.com/storage/docs/lifecycle)，允许在指定的时间后删除已经导出并导入到 ClickHouse 的数据。
- [Google 允许每天免费导出最多 50TB 的数据到 GCS](https://cloud.google.com/bigquery/quotas#export_jobs)。用户只需支付 GCS 存储费用。
- 导出将自动生成多个文件，每个文件限制为最多 1GB 的表数据。这对 ClickHouse 很有利，因为它允许并行化导入。

在尝试以下示例之前，我们建议用户查看 [导出所需的权限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions) 和 [区域建议](https://cloud.google.com/bigquery/docs/exporting-data#data-locations)，以最大化导出和导入性能。

### 通过计划查询实现实时复制或 CDC {#real-time-replication-or-cdc-via-scheduled-queries}

变更数据捕获（CDC）是保持两个数据库之间表同步的过程。如果要近实时处理更新和删除，这个过程会复杂得多。一个方法是简单地使用 BigQuery 的 [计划查询功能](https://cloud.google.com/bigquery/docs/scheduling-queries) 安排定期导出。只要你能接受数据插入到 ClickHouse 的一些延迟，这种方法就易于实施和维护。在 [这篇博客文章](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries) 中给出了一个示例。

## 设计模式 {#designing-schemas}

Stack Overflow 数据集包含多个相关表。我们建议首先关注迁移主要表。这不一定是最大的表，而是您预期接收最多分析查询的表。这将使您熟悉 ClickHouse 的主要概念。随着其他表的添加，这个表可能需要重建，以充分利用 ClickHouse 的特性并实现最佳性能。我们在 [数据建模文档](/data-modeling/schema-design#next-data-modeling-techniques) 中探讨了这个建模过程。

遵循这一原则，我们专注于主要的 `posts` 表。该表的 BigQuery 架构如下所示：

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

应用 [此处描述的过程](/data-modeling/schema-design)，得到以下架构：

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

我们可以通过简单的 [`INSERT INTO SELECT`](/sql-reference/statements/insert-into) 将此表填充，从 gcs 中读取导出的数据，使用 [`gcs` 表函数](/sql-reference/table-functions/gcs)。请注意，在 ClickHouse Cloud 上，您还可以使用与 gcs 兼容的 [`s3Cluster` 表函数](/sql-reference/table-functions/s3Cluster) 在多个节点上并行加载：

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

我们在新的架构中不保留任何 null 值。上述插入会隐式将这些转换为其各自类型的默认值——整数的默认值为 0，字符串的默认值为空。ClickHouse 也会自动将任何数字转换为其目标精度。

## ClickHouse 的主键有什么不同？ {#how-are-clickhouse-primary-keys-different}

如 [这里所述](/migrations/bigquery) 的那样，与 BigQuery 一样，ClickHouse 不强制表主键列值的唯一性。

与 BigQuery 中的聚类类似，ClickHouse 表的数据在磁盘上的存储顺序由主键列确定。查询优化器利用这种顺序来防止重新排序、最小化连接的内存使用并启用限额子句的短路评估。
与 BigQuery 相比，ClickHouse 会根据主键列值自动创建 [一个（稀疏）主索引](/guides/best-practices/sparse-primary-indexes)。此索引用于加速所有包含主键列过滤器的查询。具体而言：

- 内存和磁盘效率是 ClickHouse 通常使用的规模的关键。数据以称为分区片段的块写入 ClickHouse 表，后台应用合并分区片段的规则。在 ClickHouse 中，每个分区片段都有自己的主索引。当分区片段被合并时，合并后的分区片段的主索引也被合并。需要注意的是，这些索引不是为每行构建的。相反，分区片段的主索引每组行有一个索引条目——这种技术称为稀疏索引。
- 稀疏索引的可行性源于 ClickHouse 将分区片段的行在磁盘上按指定键的顺序存储。与直接定位单行（如基于 B 树的索引）不同，稀疏主索引允许它通过对索引条目进行二分搜索快速识别可能与查询匹配的行组。然后，位于的可能匹配行组在 ClickHouse 引擎中并行流式传输以查找匹配。这种索引设计允许主索引的大小较小（它完全适合主内存），同时在查询执行时间上仍能显著加快速度，尤其是在数据分析用例中常见的范围查询。有关更多详细信息，我们建议查看 [这份深入指南](/guides/best-practices/sparse-primary-indexes)。

<Image img={bigquery_5} size="md" alt="ClickHouse Primary keys"/>

在 ClickHouse 中选择的主键不仅决定了索引，也决定数据在磁盘上的写入顺序。因此，它可以显著影响压缩水平，而压缩水平又会影响查询性能。使大多数列的值按连续顺序写入的排序键将允许所选的压缩算法（和编码器）更有效地压缩数据。

> 表中的所有列都将根据指定的排序键的值进行排序，无论它们是否包含在键本身中。例如，如果 `CreationDate` 被用作键，则所有其他列的值顺序将对应于 `CreationDate` 列中值的顺序。可以指定多个排序键——这将具有与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义。

### 选择排序键 {#choosing-an-ordering-key}

有关选择排序键的考虑和步骤，以 `posts` 表为例，请参见 [这里](/data-modeling/schema-design#choosing-an-ordering-key)。

## 数据建模技术 {#data-modeling-techniques}

我们建议从 BigQuery 迁移的用户阅读 [ClickHouse 中的数据建模指南](/data-modeling/schema-design)。该指南使用相同的 Stack Overflow 数据集，并探索多种使用 ClickHouse 特性的方式。

### 分区 {#partitions}

BigQuery 用户会熟悉表分区的概念，通过将表划分为更小、更易于管理的部分称为分区，来增强大数据库的性能和可管理性。这种分区可以使用在指定列（例如日期）上的范围、定义列表或通过键的哈希实现。这允许管理员根据特定标准（如日期范围或地理位置）来组织数据。

分区通过启用更快速的数据访问（通过分区修剪）和更高效的索引来帮助提高查询性能。它还帮助维护任务（如备份和数据清理），允许对单个分区而非整个表进行操作。此外，分区可以显著提高 BigQuery 数据库的可扩展性，通过在多个分区之间分配负载。

在 ClickHouse 中，分区是在通过 [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key) 子句初始定义表时指定的。该子句可以包含有关任意列的 SQL 表达式，其结果将定义行被发送到哪个分区。

<Image img={bigquery_6} size="md" alt="Partitions"/>

数据部分在磁盘上与每个分区逻辑关联，可以单独查询。下面的示例中，我们使用表达式 [`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toyear) 按年份对 `posts` 表进行分区。当行被插入到 ClickHouse 时，将对每行评估该表达式——行随后被路由到作为该分区的新数据部分。

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

ClickHouse 中的分区应用与 BigQuery 类似，但有一些微妙的差异。具体而言：

- **数据管理** - 在 ClickHouse 中，用户应主要将分区视为数据管理特性，而不是查询优化技术。通过按键逻辑分隔数据，每个分区可以独立操作，例如被删除。这使得用户能够在 [存储层](/integrations/s3#storage-tiers) 之间高效地移动分区，从而移动子集，或根据时间 [过期数据/有效删除](https://sql-reference/statements/alter/partition)。例如，以下示例中我们删除了 2008 年的帖子：

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

- **查询优化** - 虽然分区可以帮助查询性能，但这在很大程度上取决于访问模式。如果查询只针对少数几个（理想情况下是一个）分区，则性能可能会改进。只有在分区键不在主键中且您按其筛选时，这通常才是有用的。然而，需要覆盖多个分区的查询可能比不使用分区时的性能更差（因为可能会由于分区而导致更多的部分）。如果分区键已经是主键中的早期条目，针对单个分区的好处将显得更微弱，甚至没有。分区还可以用于 [优化 `GROUP BY` 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)，如果每个分区的值都是唯一的。不过，通常来说，用户应该确保主键被优化，并且仅在特殊情况下考虑将分区视为查询优化技术，例如访问模式访问数据的特定可预测子集（例如，按天分区，且大多数查询在最近的那天）。

#### 推荐 {#recommendations}

用户应将分区视为一种数据管理技术。当操作时间序列数据时，当需要从集群中过期数据时，它是理想的，例如，可以 [简单地删除最旧的分区](https://sql-reference/statements/alter/partition#drop-partitionpart)。

重要提示：确保您的分区键表达式不会导致高基数集，即应避免创建超过 100 个分区。例如，切勿按客户标识符或姓名等高基数列来分区数据。相反，应使客户标识符或姓名成为 `ORDER BY` 表达式中的第一个列。

> 在内部，ClickHouse 会为插入的数据 [创建分区片段](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。随着数据的持续插入，分区片段的数量增加。为了防止分区片段数量过高，这将降低查询性能（因为需要读取更多文件），ClickHouse 会在后台异步进程中合并分区片段。如果分区片段的数量超过预设的 [限制](/operations/settings/merge-tree-settings#parts_to_throw_insert)，ClickHouse 将在插入时抛出异常，作为 ["分区片段过多" 错误](/knowledgebase/exception-too-many-parts)。在正常操作下不应发生这种情况，只有在 ClickHouse 配置错误或使用不当（例如，许多小插入）时才会发生。由于分区片段是在每个分区中独立创建的，增加分区的数量会导致分区片段的数量随之增加，即它是分区数的倍数。因此，高基数分区键可能造成此错误，应予避免。

## 物化视图与投影 {#materialized-views-vs-projections}

ClickHouse 的投影概念允许用户为一个表指定多个 `ORDER BY` 子句。

在 [ClickHouse 数据建模](/data-modeling/schema-design) 中，我们探讨了如何在 ClickHouse 中使用物化视图进行预计算聚合、行转换和为不同访问模式优化查询。对于后者，我们 [提供了一个示例](/materialized-view/incremental-materialized-view#lookup-table)，其中物化视图将行发送到目标表，其排序键与接收插入的原始表不同。

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

该查询需要扫描所有 9000 万行（诚然很快），因为 `UserId` 不是排序键。之前，我们使用一个作为 `PostId` 查找的物化视图解决了这个问题。相同的问题也可以通过投影解决。以下命令为 `ORDER BY user_id` 添加投影。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

请注意，我们必须先创建投影，然后将其物化。这个后续命令导致数据以两种不同的顺序在磁盘上存储两次。投影也可以在创建数据时定义，如下所示，并将在数据插入时自动维护。

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

通过 [`EXPLAIN` 命令](/sql-reference/statements/explain)，我们还确认该查询使用了投影：

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

投影对于新用户来说是一个吸引人的功能，因为在数据插入时它们会自动维护。此外，查询可以仅发送到一个表，在可能的地方利用投影以加速响应时间。

<Image img={bigquery_7} size="md" alt="Projections"/>

这与物化视图形成对比，后者用户必须选择适当的优化目标表或根据过滤条件重写查询。这对用户应用施加了更大的压力并增加了客户端复杂性。

尽管有这些优点，投影也有一些用户应当注意的固有限制，因此应该谨慎使用：

- 投影不允许为源表和（隐藏的）目标表使用不同的 TTL。物化视图允许不同的 TTL。
- 投影 [当前不支持 `optimize_read_in_order`](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes) 用于（隐藏的）目标表。
- 不支持对具有投影的表进行轻量级更新和删除。
- 物化视图可以链式调用：一个物化视图的目标表可以是另一个物化视图的源表，依此类推，而投影则不可以。
- 投影不支持连接；物化视图支持连接。
- 投影不支持过滤（`WHERE` 子句）；物化视图支持过滤。

我们建议在以下情况下使用投影：

- 需要对数据进行完全重新排序。虽然投影中的表达式理论上可以使用 `GROUP BY`，但物化视图在维护聚合方面更有效。查询优化器也更有可能利用使用简单重新排序的投影，即 `SELECT * ORDER BY x`。用户可以选择该表达式中的列子集，以减少存储占用。
- 用户能够接受相应的存储占用增加和数据两次写入的开销。测试插入速度的影响，并 [评估存储开销](/data-compression/compression-in-clickhouse)。

## 在 ClickHouse 中重写 BigQuery 查询 {#rewriting-bigquery-queries-in-clickhouse}

以下提供了比较 BigQuery 与 ClickHouse 的示例查询。此列表旨在展示如何利用 ClickHouse 功能显著简化查询。这里的示例使用完整的 Stack Overflow 数据集（截至 2024 年 4 月）。

**接收最多视图的用户（提问超过 10 个）：**

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

**哪些标签接收最多视图：**

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

在可能的情况下，用户应利用 ClickHouse 聚合函数。下面，我们展示了使用 [`argMax` 函数](/sql-reference/aggregate-functions/reference/argmax) 来计算每年的最热门问题。

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

条件和数组函数使查询变得更加简洁。以下查询计算从 2022 年到 2023 年标签（出现超过 10000 次）百分比增长最大的标签。请注意，以下 ClickHouse 查询由于条件、数组函数和在 `HAVING` 和 `SELECT` 子句中重用别名的能力显得简洁。

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

这结束了我们为从 BigQuery 迁移的用户提供的基本指南。我们建议从 BigQuery 迁移的用户阅读 [ClickHouse 中的数据建模指南](/data-modeling/schema-design)，以了解更多关于高级 ClickHouse 特性的信息。
