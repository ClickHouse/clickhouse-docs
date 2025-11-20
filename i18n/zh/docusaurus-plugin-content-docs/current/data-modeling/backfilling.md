---
slug: /data-modeling/backfilling
title: '回填数据'
description: '如何在 ClickHouse 中对大型数据集进行回填'
keywords: ['materialized views', 'backfilling', 'inserting data', 'resilient data load']
doc_type: 'guide'
---

import nullTableMV from '@site/static/images/data-modeling/null_table_mv.png';
import Image from '@theme/IdealImage';


# 回填数据

无论是刚开始使用 ClickHouse，还是负责现有部署，用户通常都需要将历史数据回填到表中。在某些情况下，这相对简单，但在需要填充物化视图时可能会变得更加复杂。本指南介绍了一些可用于此任务的流程，用户可以根据自身用例加以应用。

:::note
本指南假定用户已熟悉 [增量物化视图](/materialized-view/incremental-materialized-view) 的概念，以及使用诸如 `s3` 和 `gcs` 等表函数进行[数据加载](/integrations/s3)。我们还建议用户阅读关于[从对象存储优化插入性能](/integrations/s3/performance)的指南，其中的建议可以应用于本指南中的所有插入操作。
:::



## 示例数据集 {#example-dataset}

本指南使用 PyPI 数据集。该数据集中的每一行代表使用 `pip` 等工具下载 Python 包的一次记录。

例如,该子集涵盖单日数据 - `2024-12-17`,可在 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/` 公开访问。用户可以执行以下查询:

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 20.4 亿
└────────────┘

1 row in set. Elapsed: 32.726 sec. Processed 2.04 billion rows, 170.05 KB (62.34 million rows/s., 5.20 KB/s.)
Peak memory usage: 239.50 MiB.
```

此存储桶的完整数据集包含超过 320 GB 的 parquet 文件。在下面的示例中,我们有意使用 glob 模式来定位子集。

我们假设用户正在消费此数据流(例如从 Kafka 或对象存储),用于此日期之后的数据。该数据的模式如下所示:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')
FORMAT PrettyCompactNoEscapesMonoBlock
SETTINGS describe_compact_output = 1

┌─name───────────────┬─type────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ timestamp │ Nullable(DateTime64(6))                                                                                                                 │
│ country_code       │ Nullable(String)                                                                                                                        │
│ url │ Nullable(String)                                                                                                                        │
│ project            │ Nullable(String)                                                                                                                        │
│ file │ Tuple(filename Nullable(String), project Nullable(String), version Nullable(String), type Nullable(String))                             │
│ installer          │ Tuple(name Nullable(String), version Nullable(String))                                                                                  │
│ python             │ Nullable(String)                                                                                                                        │
│ implementation     │ Tuple(name Nullable(String), version Nullable(String))                                                                                  │
│ distro             │ Tuple(name Nullable(String), version Nullable(String), id Nullable(String), libc Tuple(lib Nullable(String), version Nullable(String))) │
│ system │ Tuple(name Nullable(String), release Nullable(String))                                                                                  │
│ cpu                │ Nullable(String)                                                                                                                        │
│ openssl_version    │ Nullable(String)                                                                                                                        │
│ setuptools_version │ Nullable(String)                                                                                                                        │
│ rustc_version      │ Nullable(String)                                                                                                                        │
│ tls_protocol       │ Nullable(String)                                                                                                                        │
│ tls_cipher         │ Nullable(String)                                                                                                                        │
└────────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

:::note
完整的 PyPI 数据集包含超过 1 万亿行,可在我们的公共演示环境 [clickpy.clickhouse.com](https://clickpy.clickhouse.com) 中访问。有关此数据集的更多详细信息,包括演示如何利用物化视图提升性能以及数据如何每日填充,请参见[此处](https://github.com/ClickHouse/clickpy)。
:::


## 回填场景 {#backfilling-scenarios}

当需要从某个时间点开始消费数据流时,通常需要进行回填。这些数据通过[增量物化视图](/materialized-view/incremental-materialized-view)插入到 ClickHouse 表中,在数据块插入时触发视图。这些视图可能会在插入前对数据进行转换,或计算聚合结果并将其发送到目标表,供下游应用程序后续使用。

我们将介绍以下场景:

1. **在现有数据摄取过程中回填数据** - 在加载新数据的同时,需要回填历史数据。这些历史数据已经确定。
2. **向现有表添加物化视图** - 需要向已填充历史数据且正在进行数据流式传输的环境中添加新的物化视图。

我们假设数据将从对象存储中回填。在所有情况下,我们的目标是避免数据插入过程中断。

我们建议从对象存储回填历史数据。应尽可能将数据导出为 Parquet 格式,以获得最佳的读取性能和压缩效果(减少网络传输量)。通常建议使用约 150MB 的文件大小,但 ClickHouse 支持超过 [70 种文件格式](/interfaces/formats),并且能够处理各种大小的文件。


## 使用副本表和视图 {#using-duplicate-tables-and-views}

在所有场景中,我们都依赖"副本表和视图"的概念。这些表和视图是用于实时流数据的表和视图的副本,允许在隔离环境中执行回填操作,并在发生故障时提供便捷的恢复方式。例如,我们有以下主 `pypi` 表和物化视图,用于计算每个 Python 项目的下载次数:

```sql
CREATE TABLE pypi
(
    `timestamp` DateTime,
    `country_code` LowCardinality(String),
    `project` String,
    `type` LowCardinality(String),
    `installer` LowCardinality(String),
    `python_minor` LowCardinality(String),
    `system` LowCardinality(String),
    `on` String
)
ENGINE = MergeTree
ORDER BY (project, timestamp)

CREATE TABLE pypi_downloads
(
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY project

CREATE MATERIALIZED VIEW pypi_downloads_mv TO pypi_downloads
AS SELECT
 project,
    count() AS count
FROM pypi
GROUP BY project
```

我们使用数据子集填充主表和关联视图:

```sql
INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{000..100}.parquet')

0 rows in set. Elapsed: 15.702 sec. Processed 41.23 million rows, 3.94 GB (2.63 million rows/s., 251.01 MB/s.)
Peak memory usage: 977.49 MiB.

SELECT count() FROM pypi

┌──count()─┐
│ 20612750 │ -- 2061万
└──────────┘

1 row in set. Elapsed: 0.004 sec.

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   20612750 │ -- 20.61 million
└────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 96.15 thousand rows, 769.23 KB (16.53 million rows/s., 132.26 MB/s.)
Peak memory usage: 682.38 KiB.
```

假设我们希望加载另一个子集 `{101..200}`。虽然可以直接插入到 `pypi` 中,但我们可以通过创建副本表在隔离环境中执行此回填操作。

如果回填失败,我们不会影响主表,只需简单地[清空](/managing-data/truncate)副本表并重试即可。

要创建这些表和视图的新副本,我们可以使用带有后缀 `_v2` 的 `CREATE TABLE AS` 子句:

```sql
CREATE TABLE pypi_v2 AS pypi

CREATE TABLE pypi_downloads_v2 AS pypi_downloads

CREATE MATERIALIZED VIEW pypi_downloads_mv_v2 TO pypi_downloads_v2
AS SELECT
 project,
    count() AS count
FROM pypi_v2
GROUP BY project
```

我们使用大小相近的第二个子集填充此表,并确认加载成功。

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')

0 rows in set. Elapsed: 17.545 sec. Processed 40.80 million rows, 3.90 GB (2.33 million rows/s., 222.29 MB/s.)
Peak memory usage: 991.50 MiB.

SELECT count()
FROM pypi_v2

┌──count()─┐
│ 20400020 │ -- 2040万
└──────────┘

1 row in set. Elapsed: 0.004 sec.

SELECT sum(count)
FROM pypi_downloads_v2

┌─sum(count)─┐
│   20400020 │ -- 20.40 million
└────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 95.49 thousand rows, 763.90 KB (14.81 million rows/s., 118.45 MB/s.)
Peak memory usage: 688.77 KiB.
```


如果在第二次加载过程中的任何时间点发生故障，我们只需[truncate](/managing-data/truncate)我们的 `pypi_v2` 和 `pypi_downloads_v2`，然后重新执行数据加载即可。

在数据加载完成后，我们可以使用 [`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table) 子句将数据从副本表移动到主表中。

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

返回 0 行。用时:1.401 秒。

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads

返回 0 行。用时:0.389 秒。
```

:::note 分区名称
上面的 `MOVE PARTITION` 调用使用了分区名 `()`. 这表示该表只有一个分区（该表本身未进行分区）。对于已分区的表，用户需要多次调用 `MOVE PARTITION`——每个分区调用一次。当前分区的名称可以从 [`system.parts`](/operations/system-tables/parts) 表中获取，例如：`SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')`.
:::

现在我们可以确认 `pypi` 和 `pypi_downloads` 已包含完整数据。`pypi_downloads_v2` 和 `pypi_v2` 可以安全删除。

```sql
SELECT count()
FROM pypi

┌──count()─┐
│ 41012770 │ -- 4101万
└──────────┘

1 row in set. Elapsed: 0.003 sec.

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   41012770 │ -- 4101万
└────────────┘

1 row in set. Elapsed: 0.007 sec. Processed 191.64 thousand rows, 1.53 MB (27.34 million rows/s., 218.74 MB/s.)

SELECT count()
FROM pypi_v2
```

重要的是，`MOVE PARTITION` 操作既轻量（利用硬链接），又是原子的，即要么失败，要么成功，不会出现中间状态。

我们在下文的回填场景中大量使用这一过程。

请注意，该过程要求用户自行决定每次插入操作的大小。

更大的插入（即更多行）意味着需要执行的 `MOVE PARTITION` 操作次数更少。不过，这需要与插入失败（例如由于网络中断）时的恢复成本进行权衡。用户可以通过对文件进行批量处理来降低风险，以配合这一过程。这可以通过范围查询（例如 `WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00`）或 glob 模式来实现。例如，

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{201..300}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{301..400}.parquet')
--继续直到所有文件加载完成或执行 MOVE PARTITION 调用
```

:::note
ClickPipes 在从对象存储加载数据时采用了这种方法，会自动创建目标表及其物化视图的副本，从而免去用户手动执行上述步骤的需要。通过使用多个工作线程，让每个线程通过 glob 模式处理不同的数据子集，并配备各自的副本表，即可在保证“恰好一次”语义的前提下高速加载数据。感兴趣的读者可以在[这篇博客](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)中了解更多细节。
:::


## 场景 1:在现有数据摄取的情况下回填数据 {#scenario-1-backfilling-data-with-existing-data-ingestion}

在此场景中,我们假设要回填的数据不在独立的存储桶中,因此需要进行过滤。数据已经在持续插入,并且可以识别出一个时间戳或单调递增列,用于确定需要回填哪些历史数据。

此过程遵循以下步骤:

1. 确定检查点 - 即需要从中恢复历史数据的时间戳或列值。
2. 创建主表和物化视图目标表的副本。
3. 创建指向步骤 (2) 中创建的目标表的所有物化视图的副本。
4. 向步骤 (2) 中创建的主表副本插入数据。
5. 将所有分区从副本表移动到其原始版本。删除副本表。

例如,在我们的 PyPI 数据中,假设我们已经加载了数据。我们可以识别最小时间戳,从而确定我们的"检查点"。

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

返回 1 行。耗时:0.163 秒。处理了 13.4 亿行,5.37 GB(每秒 82.4 亿行,32.96 GB/秒)
峰值内存使用:227.84 MiB。
```

从上面的结果可以看出,我们需要加载 `2024-12-17 09:00:00` 之前的数据。使用我们之前的流程,我们创建副本表和视图,并使用时间戳过滤器加载数据子集。

```sql
CREATE TABLE pypi_v2 AS pypi

CREATE TABLE pypi_downloads_v2 AS pypi_downloads

CREATE MATERIALIZED VIEW pypi_downloads_mv_v2 TO pypi_downloads_v2
AS SELECT project, count() AS count
FROM pypi_v2
GROUP BY project

INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-*.parquet')
WHERE timestamp < '2024-12-17 09:00:00'

返回 0 行。耗时:500.152 秒。处理了 27.4 亿行,364.40 GB(每秒 547 万行,728.59 MB/秒)
```

:::note
在 Parquet 中对时间戳列进行过滤可以非常高效。ClickHouse 只会读取时间戳列来识别要加载的完整数据范围,从而最小化网络流量。ClickHouse 查询引擎还可以利用 Parquet 索引(如最小-最大索引)。
:::

插入完成后,我们可以移动相关的分区。

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads
```

如果历史数据位于独立的存储桶中,则不需要上述时间过滤器。如果没有时间列或单调列,请将您的历史数据隔离存放。

:::note 在 ClickHouse Cloud 中直接使用 ClickPipes
如果数据可以隔离在其自己的存储桶中(并且不需要过滤器),ClickHouse Cloud 用户应使用 ClickPipes 来恢复历史备份。除了通过多个工作进程并行化加载从而减少加载时间外,ClickPipes 还自动化了上述过程 - 为主表和物化视图创建副本表。
:::


## 场景 2:向现有表添加物化视图 {#scenario-2-adding-materialized-views-to-existing-tables}

在已经填充了大量数据并且正在持续插入数据的环境中,需要添加新的物化视图是很常见的情况。此时,可用于标识数据流中某个时间点的时间戳或单调递增列非常有用,可以避免数据摄取的暂停。在下面的示例中,我们假设这两种情况都存在,并优先选择避免摄取暂停的方法。

:::note 避免使用 POPULATE
除了在暂停摄取的小型数据集上使用外,我们不建议使用 [`POPULATE`](/sql-reference/statements/create/view#materialized-view) 命令来回填物化视图。此操作符可能会遗漏插入到源表中的行,因为物化视图是在 populate 哈希完成后创建的。此外,populate 会针对所有数据运行,在大型数据集上容易受到中断或内存限制的影响。
:::

### 存在时间戳或单调递增列 {#timestamp-or-monotonically-increasing-column-available}

在这种情况下,我们建议新的物化视图包含一个过滤器,将行限制为大于未来某个任意时间点的数据。随后可以使用主表中的历史数据从该时间点开始回填物化视图。回填方法取决于数据大小和相关查询的复杂性。

我们最简单的方法包括以下步骤:

1. 创建物化视图时添加一个过滤器,仅考虑大于近期未来某个任意时间的行。
2. 运行 `INSERT INTO SELECT` 查询,使用视图的聚合查询从源表读取数据并插入到物化视图的目标表中。

可以进一步增强此方法,在步骤 (2) 中针对数据子集进行操作,和/或为物化视图使用重复的目标表(在插入完成后将分区附加到原始表),以便在失败后更容易恢复。

考虑以下物化视图,它计算每小时最受欢迎的项目。

```sql
CREATE TABLE pypi_downloads_per_day
(
    `hour` DateTime,
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, hour)

CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi
GROUP BY
    hour,
 project
```

虽然我们可以添加目标表,但在添加物化视图之前,我们修改其 `SELECT` 子句以包含一个过滤器,仅考虑大于近期未来某个任意时间的行 - 在本例中,我们假设 `2024-12-17 09:00:00` 是未来几分钟后的时间。

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) AS hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```

添加此视图后,我们可以回填该时间点之前的所有物化视图数据。

最简单的方法是在主表上运行物化视图的查询,使用过滤器忽略最近添加的数据,并通过 `INSERT INTO SELECT` 将结果插入到视图的目标表中。例如,对于上述视图:

```sql
INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) AS hour,
 project,
    count() AS count
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
GROUP BY
    hour,
 project

Ok.

0 rows in set. Elapsed: 2.830 sec. Processed 798.89 million rows, 17.40 GB (282.28 million rows/s., 6.15 GB/s.)
Peak memory usage: 543.71 MiB.
```

:::note
在上述示例中,我们的目标表是 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。在这种情况下,我们可以直接使用原始的聚合查询。对于利用 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 的更复杂用例,用户需要为聚合使用 `-State` 函数。可以在[此处](/integrations/s3/performance#be-aware-of-merges)找到相关示例。
:::


在我们的案例中,这是一个相对轻量级的聚合操作,在 3 秒内完成,使用内存不到 600MiB。对于更复杂或运行时间更长的聚合操作,用户可以使用前面提到的重复表方法来提高此过程的容错性,即创建一个影子目标表,例如 `pypi_downloads_per_day_v2`,向其中插入数据,然后将其生成的分区附加到 `pypi_downloads_per_day`。

物化视图的查询通常可能更复杂(这并不罕见,否则用户就不会使用视图了!)并消耗资源。在更罕见的情况下,查询所需的资源会超出服务器的承载能力。这突显了 ClickHouse 物化视图的一个优势——它们是增量式的,不会一次性处理整个数据集!

在这种情况下,用户有以下几个选项:

1. 修改查询以分段回填数据,例如 `WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00`、`WHERE timestamp BETWEEN 2024-12-17 07:00:00 AND 2024-12-17 08:00:00` 等。
2. 使用 [Null 表引擎](/engines/table-engines/special/null) 来填充物化视图。这模拟了物化视图的典型增量填充方式,对数据块(可配置大小)执行其查询。

(1) 代表最简单的方法,通常已经足够。为简洁起见,我们不包含示例。

我们在下面进一步探讨 (2)。

#### 使用 Null 表引擎填充物化视图 {#using-a-null-table-engine-for-filling-materialized-views}

[Null 表引擎](/engines/table-engines/special/null) 提供了一个不持久化数据的存储引擎(可以将其视为表引擎世界中的 `/dev/null`)。虽然这看起来矛盾,但物化视图仍然会对插入到此表引擎的数据执行操作。这允许在不持久化原始数据的情况下构建物化视图——避免了 I/O 和相关的存储开销。

重要的是,附加到该表引擎的任何物化视图仍然会在数据插入时对数据块执行操作——将其结果发送到目标表。这些块的大小是可配置的。虽然较大的块可能更高效(处理速度更快),但它们会消耗更多资源(主要是内存)。使用此表引擎意味着我们可以增量式地构建物化视图,即一次处理一个块,避免需要在内存中保存整个聚合结果。

<Image img={nullTableMV} size='md' alt='Denormalization in ClickHouse' />

<br />

考虑以下示例:

```sql
CREATE TABLE pypi_v2
(
    `timestamp` DateTime,
    `project` String
)
ENGINE = Null

CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv_v2 TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project
```

在这里,我们创建了一个 Null 表 `pypi_v2`,用于接收将用于构建物化视图的行。注意我们如何将模式限制为仅包含所需的列。我们的物化视图对插入到此表的行执行聚合(一次一个块),将结果发送到目标表 `pypi_downloads_per_day`。

:::note
我们在这里使用 `pypi_downloads_per_day` 作为目标表。为了提高容错性,用户可以创建一个重复表 `pypi_downloads_per_day_v2`,并将其用作视图的目标表,如前面的示例所示。在插入完成后,`pypi_downloads_per_day_v2` 中的分区可以依次移动到 `pypi_downloads_per_day`。这将允许在插入因内存问题或服务器中断而失败的情况下进行恢复,即我们只需截断 `pypi_downloads_per_day_v2`,调整设置并重试。
:::

要填充此物化视图,我们只需将相关数据从 `pypi` 插入到 `pypi_v2` 进行回填。

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0 rows in set. Elapsed: 27.325 sec. Processed 1.50 billion rows, 33.48 GB (54.73 million rows/s., 1.23 GB/s.)
Peak memory usage: 639.47 MiB.
```

注意这里的内存使用峰值是 `639.47 MiB`。


##### 调优性能与资源 {#tuning-performance--resources}

多个因素将决定上述场景中的性能和资源使用情况。在尝试调优之前,我们建议读者先理解[优化 S3 插入和读取性能指南](/integrations/s3/performance)中[使用线程进行读取](/integrations/s3/performance#using-threads-for-reads)部分详细记录的插入机制。总结如下:

- **读取并行度** - 用于读取的线程数。通过 [`max_threads`](/operations/settings/settings#max_threads) 控制。在 ClickHouse Cloud 中,该值由实例大小决定,默认为 vCPU 数量。增加此值可能会提高读取性能,但代价是更高的内存使用量。
- **插入并行度** - 用于插入的线程数。通过 [`max_insert_threads`](/operations/settings/settings#max_insert_threads) 控制。在 ClickHouse Cloud 中,该值由实例大小决定(介于 2 到 4 之间),在开源版本中设置为 1。增加此值可能会提高性能,但代价是更高的内存使用量。
- **插入块大小** - 数据在循环中处理,根据[分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)被拉取、解析并形成内存中的插入块。这些块经过排序、优化、压缩后,作为新的[数据部分](/parts)写入存储。插入块的大小由设置 [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) 和 [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)(未压缩)控制,影响内存使用和磁盘 I/O。较大的块使用更多内存,但创建更少的数据部分,从而减少 I/O 和后台合并。这些设置表示最小阈值(先达到哪个阈值就触发刷新)。
- **物化视图块大小** - 除了主插入的上述机制外,在插入物化视图之前,块也会被合并以实现更高效的处理。这些块的大小由设置 [`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views) 和 [`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views) 决定。较大的块允许更高效的处理,但代价是更高的内存使用量。默认情况下,这些设置分别回退到源表设置 [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) 和 [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) 的值。

为了提高性能,用户可以遵循[优化 S3 插入和读取性能指南](/integrations/s3/performance)中[调优插入的线程和块大小](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts)部分概述的指南。在大多数情况下,不需要同时修改 `min_insert_block_size_bytes_for_materialized_views` 和 `min_insert_block_size_rows_for_materialized_views` 来提高性能。如果需要修改这些设置,请使用与 `min_insert_block_size_rows` 和 `min_insert_block_size_bytes` 相同的最佳实践。

为了最小化内存使用,用户可能希望尝试调整这些设置。这将不可避免地降低性能。使用前面的查询,我们在下面展示示例。

将 `max_insert_threads` 降低到 1 可以减少内存开销。

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1

0 rows in set. Elapsed: 27.752 sec. Processed 1.50 billion rows, 33.48 GB (53.89 million rows/s., 1.21 GB/s.)
Peak memory usage: 506.78 MiB.
```

我们可以通过将 `max_threads` 设置降低到 1 来进一步降低内存使用。

```sql
INSERT INTO pypi_v2
SELECT timestamp, project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1

Ok.

0 rows in set. Elapsed: 43.907 sec. Processed 1.50 billion rows, 33.48 GB (34.06 million rows/s., 762.54 MB/s.)
Peak memory usage: 272.53 MiB.
```


最后,我们可以通过将 `min_insert_block_size_rows` 设置为 0(禁用其作为块大小的决定因素)和将 `min_insert_block_size_bytes` 设置为 10485760(10MiB)来进一步减少内存使用。

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1, min_insert_block_size_rows = 0, min_insert_block_size_bytes = 10485760

0 rows in set. Elapsed: 43.293 sec. Processed 1.50 billion rows, 33.48 GB (34.54 million rows/s., 773.36 MB/s.)
Peak memory usage: 218.64 MiB.
```

最后,请注意降低块大小会产生更多数据部分并导致更大的合并压力。如[此处](/integrations/s3/performance#be-aware-of-merges)所述,应谨慎更改这些设置。

### 没有时间戳或单调递增列 {#no-timestamp-or-monotonically-increasing-column}

上述过程依赖于用户拥有时间戳或单调递增列。在某些情况下,这些列可能不可用。在这种情况下,我们建议采用以下过程,该过程利用了前面概述的许多步骤,但需要用户暂停数据摄入。

1. 暂停向主表插入数据。
2. 使用 `CREATE AS` 语法创建主目标表的副本。
3. 使用 [`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart) 将原始目标表的分区附加到副本。**注意:**此附加操作与之前使用的移动操作不同。虽然依赖硬链接,但原始表中的数据会被保留。
4. 创建新的物化视图。
5. 重新开始插入。**注意:**插入操作只会更新目标表,而不会更新副本,副本将仅引用原始数据。
6. 回填物化视图,使用副本表作为源,应用上述用于带时间戳数据的相同过程。

考虑以下使用 PyPI 和我们之前的新物化视图 `pypi_downloads_per_day` 的示例(我们假设无法使用时间戳):

```sql
SELECT count() FROM pypi

┌────count()─┐
│ 2039988137 │ -- 20.4 亿
└────────────┘

1 row in set. Elapsed: 0.003 sec.

-- (1) 暂停插入
-- (2) 创建目标表的副本

CREATE TABLE pypi_v2 AS pypi

SELECT count() FROM pypi_v2

┌────count()─┐
│ 2039988137 │ -- 20.4 亿
└────────────┘

1 row in set. Elapsed: 0.004 sec.

-- (3) 将原始目标表的分区附加到副本。

ALTER TABLE pypi_v2
 (ATTACH PARTITION tuple() FROM pypi)

-- (4) 创建新的物化视图

CREATE TABLE pypi_downloads_per_day
(
    `hour` DateTime,
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, hour)

CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi
GROUP BY
    hour,
 project

-- (4) 重新开始插入。我们在此通过插入单行来模拟。

INSERT INTO pypi SELECT *
FROM pypi
LIMIT 1

SELECT count() FROM pypi

┌────count()─┐
│ 2039988138 │ -- 20.4 亿
└────────────┘

1 row in set. Elapsed: 0.003 sec.

-- 注意 pypi_v2 包含与之前相同的行数

SELECT count() FROM pypi_v2
┌────count()─┐
│ 2039988137 │ -- 20.4 亿
└────────────┘

-- (5) 使用备份表 pypi_v2 回填视图

INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project

0 rows in set. Elapsed: 3.719 sec. Processed 2.04 billion rows, 47.15 GB (548.57 million rows/s., 12.68 GB/s.)
```


DROP TABLE pypi&#95;v2;

```

在倒数第二步中,我们使用[前文](#timestamp-or-monotonically-increasing-column-available)所述的简单 `INSERT INTO SELECT` 方法来回填 `pypi_downloads_per_day`。也可以使用[上文](#using-a-null-table-engine-for-filling-materialized-views)记录的 Null 表方法进行增强,并可选择使用副本表以提高容错性。

虽然此操作需要暂停插入,但中间操作通常可以快速完成,从而最大限度地减少数据中断。
```
