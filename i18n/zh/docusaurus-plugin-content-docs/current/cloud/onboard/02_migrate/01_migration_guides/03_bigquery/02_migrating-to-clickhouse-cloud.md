---
title: '从 BigQuery 迁移到 ClickHouse Cloud'
slug: /migrations/bigquery/migrating-to-clickhouse-cloud
description: '如何将数据从 BigQuery 迁移到 ClickHouse Cloud'
keywords: ['BigQuery']
show_related_blogs: true
sidebar_label: '迁移指南'
doc_type: 'guide'
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

简而言之:在现代数据分析场景中,ClickHouse 比 BigQuery 更快、更经济、功能更强大:

<Image img={bigquery_2} size='md' alt='ClickHouse vs BigQuery' />


## 从 BigQuery 加载数据到 ClickHouse Cloud {#loading-data-from-bigquery-to-clickhouse-cloud}

### 数据集 {#dataset}

作为展示从 BigQuery 迁移到 ClickHouse Cloud 的典型示例,我们使用[此处](/getting-started/example-datasets/stackoverflow)记录的 Stack Overflow 数据集。该数据集包含 Stack Overflow 从 2008 年到 2024 年 4 月期间的所有 `post`、`vote`、`user`、`comment` 和 `badge` 数据。该数据的 BigQuery 模式如下所示:

<Image img={bigquery_3} size='lg' alt='模式' />

对于希望将此数据集导入 BigQuery 实例以测试迁移步骤的用户,我们在 GCS 存储桶中提供了这些表的 Parquet 格式数据,用于在 BigQuery 中创建和加载表的 DDL 命令可在[此处](https://pastila.nl/?003fd86b/2b93b1a2302cfee5ef79fd374e73f431#hVPC52YDsUfXg2eTLrBdbA==)获取。

### 迁移数据 {#migrating-data}

在 BigQuery 和 ClickHouse Cloud 之间迁移数据主要分为两种工作负载类型:

- **初始批量加载与定期更新** - 需要迁移初始数据集,并按设定间隔(例如每日)进行定期更新。更新操作通过重新发送已更改的行来处理 - 通过可用于比较的列(例如日期)来识别变更。删除操作通过完全定期重新加载数据集来处理。
- **实时复制或 CDC** - 需要迁移初始数据集。对该数据集的更改必须以近实时方式反映在 ClickHouse 中,仅可接受几秒钟的延迟。这实际上是一个[变更数据捕获 (CDC) 流程](https://en.wikipedia.org/wiki/Change_data_capture),其中 BigQuery 中的表必须与 ClickHouse 同步,即 BigQuery 表中的插入、更新和删除操作必须应用到 ClickHouse 中的对应表。

#### 通过 Google Cloud Storage (GCS) 批量加载 {#bulk-loading-via-google-cloud-storage-gcs}

BigQuery 支持将数据导出到 Google 的对象存储 (GCS)。对于我们的示例数据集:

1. 将 7 个表导出到 GCS。相关命令可在[此处](https://pastila.nl/?014e1ae9/cb9b07d89e9bb2c56954102fd0c37abd#0Pzj52uPYeu1jG35nmMqRQ==)获取。

2. 将数据导入 ClickHouse Cloud。为此我们可以使用 [gcs 表函数](/sql-reference/table-functions/gcs)。DDL 和导入查询可在[此处](https://pastila.nl/?00531abf/f055a61cc96b1ba1383d618721059976#Wf4Tn43D3VCU5Hx7tbf1Qw==)获取。请注意,由于 ClickHouse Cloud 实例由多个计算节点组成,我们使用 [s3Cluster 表函数](/sql-reference/table-functions/s3Cluster)而不是 `gcs` 表函数。该函数也适用于 GCS 存储桶,并[利用 ClickHouse Cloud 服务的所有节点](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#parallel-servers)并行加载数据。

<Image img={bigquery_4} size='md' alt='批量加载' />

这种方法具有多项优势:

- BigQuery 导出功能支持使用过滤器导出数据子集。
- BigQuery 支持导出为 [Parquet、Avro、JSON 和 CSV](https://cloud.google.com/bigquery/docs/exporting-data) 格式以及多种[压缩类型](https://cloud.google.com/bigquery/docs/exporting-data) - ClickHouse 均支持这些格式。
- GCS 支持[对象生命周期管理](https://cloud.google.com/storage/docs/lifecycle),允许在指定时间段后删除已导出并导入 ClickHouse 的数据。
- [Google 允许每天免费导出最多 50TB 数据到 GCS](https://cloud.google.com/bigquery/quotas#export_jobs)。用户只需支付 GCS 存储费用。
- 导出会自动生成多个文件,每个文件最多包含 1GB 的表数据。这对 ClickHouse 有利,因为它允许并行化导入。

在尝试以下示例之前,我们建议用户查看[导出所需的权限](https://cloud.google.com/bigquery/docs/exporting-data#required_permissions)和[位置建议](https://cloud.google.com/bigquery/docs/exporting-data#data-locations),以最大化导出和导入性能。


### 通过定时查询实现实时复制或 CDC {#real-time-replication-or-cdc-via-scheduled-queries}

变更数据捕获(CDC)是使两个数据库之间的表保持同步的过程。如果要近实时地处理更新和删除操作,复杂度会显著增加。一种方法是使用 BigQuery 的[定时查询功能](https://cloud.google.com/bigquery/docs/scheduling-queries)来安排周期性导出。只要您能够接受数据插入 ClickHouse 时的一定延迟,这种方法就易于实现和维护。[此博客文章](https://clickhouse.com/blog/clickhouse-bigquery-migrating-data-for-realtime-queries#using-scheduled-queries)中给出了一个示例。


## 设计表结构 {#designing-schemas}

Stack Overflow 数据集包含多个相关表。我们建议首先专注于迁移主表。这不一定是最大的表,而是您预期会收到最多分析查询的那张表。这将帮助您熟悉 ClickHouse 的主要概念。随着添加更多表以充分利用 ClickHouse 功能并获得最佳性能,此表可能需要重新建模。我们在[数据建模文档](/data-modeling/schema-design#next-data-modeling-techniques)中探讨了这个建模过程。

遵循这一原则,我们专注于主要的 `posts` 表。其 BigQuery 表结构如下所示:

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

### 优化数据类型 {#optimizing-types}

应用[此处描述的](/data-modeling/schema-design)过程会得到以下表结构:

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

我们可以使用简单的 [`INSERT INTO SELECT`](/sql-reference/statements/insert-into) 填充此表,使用 [`gcs` 表函数](/sql-reference/table-functions/gcs)从 gcs 读取导出的数据。请注意,在 ClickHouse Cloud 上,您还可以使用与 gcs 兼容的 [`s3Cluster` 表函数](/sql-reference/table-functions/s3Cluster)在多个节点上并行加载数据:

```sql
INSERT INTO stackoverflow.posts SELECT * FROM gcs( 'gs://clickhouse-public-datasets/stackoverflow/parquet/posts/*.parquet', NOSIGN);
```

我们在新表结构中不保留任何空值。上述插入操作会将这些空值隐式转换为其各自类型的默认值——整数为 0,字符串为空值。ClickHouse 还会自动将任何数值转换为其目标精度。


## ClickHouse 主键有何不同? {#how-are-clickhouse-primary-keys-different}

如[此处](/migrations/bigquery)所述,与 BigQuery 类似,ClickHouse 不强制要求表的主键列值具有唯一性。

与 BigQuery 中的聚簇类似,ClickHouse 表的数据在磁盘上按主键列的顺序存储。查询优化器利用此排序顺序来避免重新排序、最小化连接操作的内存使用,并为 limit 子句启用短路优化。
与 BigQuery 不同,ClickHouse 会根据主键列值自动创建[稀疏主索引](/guides/best-practices/sparse-primary-indexes)。该索引用于加速所有包含主键列过滤条件的查询。具体而言:

- 内存和磁盘效率对于 ClickHouse 通常使用的规模至关重要。数据以称为数据分片(parts)的块写入 ClickHouse 表,并在后台应用规则合并这些数据分片。在 ClickHouse 中,每个数据分片都有自己的主索引。当数据分片合并时,合并后数据分片的主索引也会合并。需要注意的是,这些索引不是为每一行构建的。相反,数据分片的主索引为每组行设置一个索引条目——这种技术称为稀疏索引。
- 稀疏索引之所以可行,是因为 ClickHouse 将数据分片的行按指定键排序存储在磁盘上。稀疏主索引不是直接定位单个行(如基于 B 树的索引),而是通过对索引条目进行二分查找,快速识别可能匹配查询的行组。然后,这些可能匹配的行组会并行流式传输到 ClickHouse 引擎中以查找匹配项。这种索引设计使主索引保持较小(完全适合主内存),同时仍能显著加快查询执行时间,特别是对于数据分析用例中典型的范围查询。有关更多详细信息,我们推荐阅读[此深入指南](/guides/best-practices/sparse-primary-indexes)。

<Image img={bigquery_5} size='md' alt='ClickHouse 主键' />

在 ClickHouse 中选择的主键不仅决定索引,还决定数据写入磁盘的顺序。因此,它可能会显著影响压缩级别,进而影响查询性能。使大多数列的值以连续顺序写入的排序键将使所选的压缩算法(和编解码器)更有效地压缩数据。

> 表中的所有列都将根据指定排序键的值进行排序,无论它们是否包含在键本身中。例如,如果使用 `CreationDate` 作为键,则所有其他列中值的顺序将与 `CreationDate` 列中值的顺序相对应。可以指定多个排序键——这将使用与 `SELECT` 查询中 `ORDER BY` 子句相同的语义进行排序。

### 选择排序键 {#choosing-an-ordering-key}

有关选择排序键的注意事项和步骤,以 posts 表为例,请参见[此处](/data-modeling/schema-design#choosing-an-ordering-key)。


## 数据建模技术 {#data-modeling-techniques}

我们建议从 BigQuery 迁移的用户阅读 [ClickHouse 数据建模指南](/data-modeling/schema-design)。该指南使用相同的 Stack Overflow 数据集,探索了利用 ClickHouse 功能的多种方法。

### 分区 {#partitions}

BigQuery 用户应该熟悉表分区的概念,即通过将表划分为称为分区的更小、更易管理的部分来增强大型数据库的性能和可管理性。分区可以通过指定列的范围(例如日期)、定义的列表或对键进行哈希来实现。这使管理员能够根据特定条件(如日期范围或地理位置)组织数据。

分区通过分区裁剪和更高效的索引实现更快的数据访问,从而有助于提高查询性能。它还通过允许对单个分区而非整个表执行操作,来帮助完成备份和数据清除等维护任务。此外,分区可以通过在多个分区之间分配负载来显著提高 BigQuery 数据库的可扩展性。

在 ClickHouse 中,分区在表初始定义时通过 [`PARTITION BY`](/engines/table-engines/mergetree-family/custom-partitioning-key) 子句指定。该子句可以包含针对任意列的 SQL 表达式,其结果将决定行被发送到哪个分区。

<Image img={bigquery_6} size='md' alt='分区' />

数据部分在磁盘上与每个分区逻辑关联,并且可以单独查询。在下面的示例中,我们使用表达式 [`toYear(CreationDate)`](/sql-reference/functions/date-time-functions#toYear) 按年对 posts 表进行分区。当行插入到 ClickHouse 时,该表达式将针对每一行进行求值——然后行以属于该分区的新数据部分的形式路由到相应分区。

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

#### 应用场景 {#applications}

ClickHouse 中的分区与 BigQuery 中的应用场景类似,但存在一些细微差别。具体而言:

- **数据管理** - 在 ClickHouse 中,用户应主要将分区视为数据管理功能,而非查询优化技术。通过基于键逻辑分离数据,每个分区可以独立操作,例如删除。这使用户能够在[存储层](/integrations/s3#storage-tiers)之间高效移动分区(从而移动数据子集),或[使数据过期/从集群中高效删除](/sql-reference/statements/alter/partition)。例如,下面我们删除 2008 年的帖子:

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

返回 17 行。耗时:0.002 秒。

ALTER TABLE posts
(DROP PARTITION '2008')

Ok.

返回 0 行。耗时:0.103 秒。
```


- **查询优化** - 虽然分区可以提升查询性能,但这在很大程度上取决于访问模式。如果查询仅针对少数分区(理想情况下是单个分区),性能可能会有所提升。这通常仅在分区键不在主键中且您按其进行过滤时才有用。然而,需要覆盖多个分区的查询可能比不使用分区时性能更差(因为分区可能导致更多的数据部分)。如果分区键已经是主键中的靠前条目,则针对单个分区的优势将更不明显甚至不复存在。如果每个分区中的值是唯一的,分区也可用于[优化 `GROUP BY` 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)。然而,总体而言,用户应确保主键已优化,并且仅在访问模式针对特定可预测的数据子集的特殊情况下才考虑将分区作为查询优化技术,例如按天分区,且大多数查询集中在最近一天。

#### 建议 {#recommendations}

用户应将分区视为一种数据管理技术。当操作时间序列数据需要从集群中清理过期数据时,分区是理想的选择,例如可以[直接删除](/sql-reference/statements/alter/partition#drop-partitionpart)最旧的分区。

重要提示:确保您的分区键表达式不会产生高基数集,即应避免创建超过 100 个分区。例如,不要按客户端标识符或名称等高基数列对数据进行分区。相反,应将客户端标识符或名称作为 `ORDER BY` 表达式中的第一列。

> 在内部,ClickHouse 为插入的数据[创建数据部分](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。随着更多数据的插入,数据部分的数量会增加。为了防止数据部分数量过多(这会降低查询性能,因为需要读取更多文件),数据部分会在后台异步过程中合并。如果数据部分的数量超过[预配置的限制](/operations/settings/merge-tree-settings#parts_to_throw_insert),则 ClickHouse 将在插入时抛出异常,显示为["数据部分过多"错误](/knowledgebase/exception-too-many-parts)。这在正常操作下不应发生,仅在 ClickHouse 配置错误或使用不当时才会出现,例如进行大量小批量插入。由于数据部分是按分区独立创建的,增加分区数量会导致数据部分数量增加,即它是分区数量的倍数。因此,高基数分区键可能导致此错误,应予以避免。


## 物化视图与投影对比 {#materialized-views-vs-projections}

ClickHouse 的投影功能允许用户为单个表指定多个 `ORDER BY` 子句。

在 [ClickHouse 数据建模](/data-modeling/schema-design)中,我们探讨了如何使用物化视图来预计算聚合、转换数据行,以及针对不同访问模式优化查询。对于后者,我们[提供了一个示例](/materialized-view/incremental-materialized-view#lookup-table),其中物化视图将数据行发送到目标表,该目标表的排序键与接收插入操作的原始表不同。

例如,考虑以下查询:

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

由于 `UserId` 不是排序键,此查询需要扫描全部 9000 万行数据(尽管速度很快)。之前,我们通过物化视图作为 `PostId` 的查找表来解决此问题。同样的问题也可以通过投影来解决。下面的命令添加了一个按 `ORDER BY user_id` 排序的投影。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

请注意,我们必须先创建投影,然后再将其物化。后一个命令会导致数据以两种不同的顺序在磁盘上存储两份。投影也可以在创建表时定义,如下所示,这样在插入数据时会自动维护投影。

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

如果通过 `ALTER` 命令创建投影,则在执行 `MATERIALIZE PROJECTION` 命令时,创建过程是异步的。用户可以通过以下查询确认操作进度,等待 `is_done=1`。

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

如果我们重复执行上述查询,可以看到性能显著提升,代价是需要额外的存储空间。

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

通过 [`EXPLAIN` 命令](/sql-reference/statements/explain),我们还可以确认投影被用于处理此查询:

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

```


┌─explain─────────────────────────────────────────────┐

1. │ Expression ((Projection + Before ORDER BY))         │
2. │   Aggregating                                       │
3. │   Filter                                            │
4. │           ReadFromMergeTree (comments&#95;user&#95;id)      │
5. │           Indexes:                                  │
6. │           PrimaryKey                                │
7. │           Keys:                                     │
8. │           UserId                                    │
9. │           Condition: (UserId in [8592047, 8592047]) │
10. │           Parts: 2/2                                │
11. │           Granules: 2/11360                         │
    └─────────────────────────────────────────────────────┘

11 行结果。耗时：0.004 秒。

```

### 何时使用投影 {#when-to-use-projections}

投影对新用户来说是一个极具吸引力的功能,因为它们会在数据插入时自动维护。此外,查询只需发送到单个表,投影会在可能的情况下自动被利用以加快响应时间。

<Image img={bigquery_7} size="md" alt="投影"/>

这与物化视图形成对比。在物化视图中,用户必须根据过滤条件选择合适的优化目标表或重写查询。这对用户应用程序提出了更高的要求,并增加了客户端的复杂性。

尽管有这些优势,投影也存在一些固有的局限性,用户应该了解这些局限性,因此应谨慎部署。有关更多详细信息,请参阅["物化视图与投影对比"](/managing-data/materialized-views-versus-projections)

我们建议在以下情况下使用投影:

- 需要对数据进行完全重新排序。虽然投影中的表达式理论上可以使用 `GROUP BY`,但物化视图在维护聚合数据方面更加有效。查询优化器也更有可能利用使用简单重新排序的投影,即 `SELECT * ORDER BY x`。用户可以在此表达式中选择列的子集以减少存储占用空间。
- 用户能够接受相关的存储占用空间增加以及两次写入数据的开销。请测试对插入速度的影响并[评估存储开销](/data-compression/compression-in-clickhouse)。
```


## 在 ClickHouse 中重写 BigQuery 查询 {#rewriting-bigquery-queries-in-clickhouse}

以下提供了 BigQuery 与 ClickHouse 的查询对比示例。本列表旨在演示如何利用 ClickHouse 的特性来显著简化查询。这里的示例使用完整的 Stack Overflow 数据集(截至 2024 年 4 月)。

**获得最多浏览量的用户(提出超过 10 个问题):**

_BigQuery_

<Image img={bigquery_8} size='sm' alt='重写 BigQuery 查询' border />

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

**哪些标签获得最多浏览量:**

_BigQuery_

<br />

<Image img={bigquery_9} size='sm' alt='BigQuery 1' border />

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

在可能的情况下,用户应充分利用 ClickHouse 的聚合函数。下面我们展示如何使用 [`argMax` 函数](/sql-reference/aggregate-functions/reference/argmax) 来计算每年浏览量最高的问题。

_BigQuery_

<Image img={bigquery_10} border size='sm' alt='聚合函数 1' />

<Image img={bigquery_11} border size='sm' alt='聚合函数 2' />

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


## 条件函数和数组 {#conditionals-and-arrays}

条件函数和数组函数可以显著简化查询。以下查询计算从 2022 年到 2023 年增长百分比最大的标签(出现次数超过 10000 次)。请注意,得益于条件函数、数组函数以及在 `HAVING` 和 `SELECT` 子句中重用别名的能力,以下 ClickHouse 查询非常简洁。

_BigQuery_

<Image img={bigquery_12} size='sm' border alt='条件函数和数组' />

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

返回 5 行。耗时:0.096 秒。处理了 508 万行,155.73 MB(5310 万行/秒,1.63 GB/秒)。
峰值内存使用:410.37 MiB。
```

至此,我们完成了从 BigQuery 迁移到 ClickHouse 的基础指南。我们建议从 BigQuery 迁移的用户阅读 [ClickHouse 数据建模](/data-modeling/schema-design)指南,以了解更多 ClickHouse 高级功能。
