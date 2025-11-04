---
'slug': '/data-modeling/backfilling'
'title': '填充数据'
'description': '如何在 ClickHouse 中使用填充大量数据集'
'keywords':
- 'materialized views'
- 'backfilling'
- 'inserting data'
- 'resilient data load'
'doc_type': 'guide'
---

import nullTableMV from '@site/static/images/data-modeling/null_table_mv.png';
import Image from '@theme/IdealImage';


# 回填数据

无论是首次接触 ClickHouse 还是负责现有部署，用户通常需要用历史数据回填表。在某些情况下，这相对简单，但当需要填充物化视图时，可能会变得更加复杂。本指南记录了一些用户可以应用于其用例的回填过程。

:::note
本指南假设用户已熟悉[增量物化视图](/materialized-view/incremental-materialized-view)和[使用 s3 和 gcs 等表函数加载数据](/integrations/s3)的概念。我们还建议用户阅读我们的指南，[优化对象存储的插入性能](/integrations/s3/performance)，其中的建议可以应用于本指南中的插入操作。
:::

## 示例数据集 {#example-dataset}

在本指南中，我们使用 PyPI 数据集。该数据集中的每一行表示使用 `pip` 等工具下载的 Python 包。

例如，子集覆盖了单天 - `2024-12-17`，并可以在 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/` 上公开获取。用户可以执行以下查询：

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 32.726 sec. Processed 2.04 billion rows, 170.05 KB (62.34 million rows/s., 5.20 KB/s.)
Peak memory usage: 239.50 MiB.
```

该存储桶的完整数据集包含超过 320 GB 的 parquet 文件。在以下示例中，我们有意使用 glob 模式来定位子集。

我们假设用户正在使用 Kafka 或对象存储消费此数据流，以获取此日期之后的数据。此数据的模式如下所示：

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
完整的 PyPI 数据集包含超过 1 万亿行，已在我们的公共演示环境 [clickpy.clickhouse.com](https://clickpy.clickhouse.com) 中提供。如需有关此数据集的详细信息，包括演示如何利用物化视图来提高性能以及数据如何每天填充，请参阅[这里](https://github.com/ClickHouse/clickpy)。
:::

## 回填场景 {#backfilling-scenarios}

当从某个时间点消费数据流时，通常需要进行回填。此数据被插入到具有[增量物化视图](/materialized-view/incremental-materialized-view)的 ClickHouse 表中，并在插入块时触发。这些视图可能在插入之前对数据进行转换，或计算聚合并将结果发送到目标表，以便在后续应用程序中使用。

我们将尝试涵盖以下场景：

1. **使用现有数据摄取回填数据** - 新数据正在加载，并且需要回填已识别的历史数据。
2. **向现有表添加物化视图** - 需要向已填充历史数据且数据正在流动的设置中添加新的物化视图。

我们假设数据将从对象存储中回填。在所有情况下，我们旨在避免数据插入暂停。

我们建议从对象存储回填历史数据。数据应尽可能导出为 Parquet，以优化读取性能和压缩（减少网络传输）。通常，约 150MB 的文件大小是首选，但 ClickHouse 支持超过[70 种文件格式](/interfaces/formats)，并能够处理所有大小的文件。

## 使用副本表和视图 {#using-duplicate-tables-and-views}

对于所有场景，我们依赖于“副本表和视图”的概念。这些表和视图代表了实时流数据使用的副本，允许在隔离的情况下执行回填，并提供简单的恢复机制，以防出现故障。例如，我们有以下主要 `pypi` 表和物化视图，该视图计算每个 Python 项目的下载次数：

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

我们使用数据的一个子集填充主表和关联视图：

```sql
INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{000..100}.parquet')

0 rows in set. Elapsed: 15.702 sec. Processed 41.23 million rows, 3.94 GB (2.63 million rows/s., 251.01 MB/s.)
Peak memory usage: 977.49 MiB.

SELECT count() FROM pypi

┌──count()─┐
│ 20612750 │ -- 20.61 million
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

假设我们希望加载另一个子集 `{101..200}`。虽然我们可以直接插入到 `pypi`，但我们可以通过创建副本表在隔离的情况下进行此回填。

如果回填失败，我们不会影响我们的主表，只需[截断](/managing-data/truncate)副本表并重复操作即可。

要创建这些视图的新副本，我们可以使用 `CREATE TABLE AS` 子句并添加后缀 `_v2`：

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

我们使用大约相同大小的第二个子集填充此副本，并确认加载成功。

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')

0 rows in set. Elapsed: 17.545 sec. Processed 40.80 million rows, 3.90 GB (2.33 million rows/s., 222.29 MB/s.)
Peak memory usage: 991.50 MiB.

SELECT count()
FROM pypi_v2

┌──count()─┐
│ 20400020 │ -- 20.40 million
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

如果在第二次加载的任何点出现故障，我们可以简单地[截断](/managing-data/truncate)我们的 `pypi_v2` 和 `pypi_downloads_v2` 并重复数据加载。

数据加载完成后，我们可以使用[`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table) 子句将数据从副本表移动到主表。

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

0 rows in set. Elapsed: 1.401 sec.

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads

0 rows in set. Elapsed: 0.389 sec.
```

:::note 分区名称
上述 `MOVE PARTITION` 调用使用了分区名称 `()`。这表示该表的单个分区（没有分区）。对于已分区的表，用户需要执行多个 `MOVE PARTITION` 调用 - 每个分区一个。当前分区的名称可以从[`system.parts`](/operations/system-tables/parts) 表中获得，例如 `SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')`。
:::

我们现在可以确认 `pypi` 和 `pypi_downloads` 包含完整数据。可以安全删除 `pypi_downloads_v2` 和 `pypi_v2`。

```sql
SELECT count()
FROM pypi

┌──count()─┐
│ 41012770 │ -- 41.01 million
└──────────┘

1 row in set. Elapsed: 0.003 sec.

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   41012770 │ -- 41.01 million
└────────────┘

1 row in set. Elapsed: 0.007 sec. Processed 191.64 thousand rows, 1.53 MB (27.34 million rows/s., 218.74 MB/s.)

SELECT count()
FROM pypi_v2
```

重要的是，`MOVE PARTITION` 操作既轻量（利用硬链接）又是原子性的，即它要么失败，要么成功，没有中间状态。

我们在下面的回填场景中大量利用此过程。

请注意，这一过程要求用户选择每次插入操作的大小。

更大的插入，即更多行，将意味着需要更少的 `MOVE PARTITION` 操作。然而，这必须与插入失败（例如，因网络中断）时的恢复成本进行权衡。用户还可以通过批量处理文件来降低风险。这可以通过范围查询进行，例如 `WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00` 或 glob 模式。例如，

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{201..300}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{301..400}.parquet')
--continued to all files loaded OR MOVE PARTITION call is performed
```

:::note
ClickPipes 在从对象存储加载数据时使用此方法，自动创建目标表及其物化视图的副本，避免用户执行上述步骤的需要。通过使用多个工作线程，分别处理不同的子集（通过 glob 模式）并具有自己的副本表，数据可以快速加载，并确保准确一次的语义。有兴趣的人可以在[这篇博客](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)中找到更多详细信息。
:::

## 场景 1：使用现有数据摄取回填数据 {#scenario-1-backfilling-data-with-existing-data-ingestion}

在此场景中，我们假设要回填的数据不在一个孤立的存储桶中，因此需要进行筛选。数据已经在插入中，可以识别出一个时间戳或单调递增的列，从该列需要回填历史数据。

该过程遵循以下步骤：

1. 确定检查点 - 一个时间戳或列值，从中需恢复历史数据。
2. 为主表和物化视图的目标表创建副本。
3. 创建指向步骤（2）中创建的目标表的任何物化视图的副本。
4. 向步骤（2）中创建的副本主表插入数据。
5. 将所有分区从副本表移动到其原始版本。删除副本表。

例如，在我们的 PyPI 数据中，假设我们已经加载了数据。我们可以识别最小的时间戳，从而确定我们的“检查点”。

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

1 row in set. Elapsed: 0.163 sec. Processed 1.34 billion rows, 5.37 GB (8.24 billion rows/s., 32.96 GB/s.)
Peak memory usage: 227.84 MiB.
```

从上面，我们知道我们需要加载在 `2024-12-17 09:00:00` 之前的数据。使用我们之前的过程，我们创建副本表和视图，并使用时间戳进行过滤来加载该子集。

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

0 rows in set. Elapsed: 500.152 sec. Processed 2.74 billion rows, 364.40 GB (5.47 million rows/s., 728.59 MB/s.)
```
:::note
在 Parquet 中按时间戳列进行筛选可以非常高效。ClickHouse 将仅读取时间戳列以识别要加载的完整数据范围，从而最小化网络流量。ClickHouse 查询引擎也可以利用 Parquet 索引，例如最小-最大索引。
:::

一旦此插入完成，我们可以移动相关的分区。

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads
```

如果历史数据是在一个孤立的存储桶中，则不需要上述时间筛选。如果没有时间或单调列，请将历史数据隔离。

:::note 请在 ClickHouse Cloud 中使用 ClickPipes
ClickHouse Cloud 用户应在历史备份的数据可以隔离在其自己的存储桶中（且不需要过滤）时，使用 ClickPipes 来恢复历史备份。除了通过多个工作程序并行化加载，从而减少加载时间外，ClickPipes 自动化了上述过程 - 为主表和物化视图创建副本。
:::

## 场景 2：向现有表添加物化视图 {#scenario-2-adding-materialized-views-to-existing-tables}

向已经填充了大量数据且数据正在插入的设置中添加新的物化视图并不少见。时间戳或单调递增列的存在，可以用来识别流中的某个点，这在这里非常有用，避免数据插入暂停。在下面的示例中，我们假设两种情况，优先考虑避免插入过程中的暂停的方法。

:::note 避免使用 POPULATE
我们不建议使用[`POPULATE`](/sql-reference/statements/create/view#materialized-view)命令对物化视图进行回填，除非数据集较小并且 ingest 暂停。该操作符可能会错过插入到其源表中的行，并且物化视图的创建在 populate 哈希完成之后。此外，此 populate 会针对所有数据执行，并且在大型数据集上容易受到中断或内存限制的影响。
:::

### 可用时间戳或单调递增列 {#timestamp-or-monotonically-increasing-column-available}

在这种情况下，我们建议新的物化视图包含一个过滤器，将行限制为大于未来的任意数据。此后，这个物化视图可以使用来自主表的历史数据从该日期进行回填。回填方法取决于数据大小和相关查询的复杂性。

我们最简单的方法涉及以下步骤：

1. 创建我们的物化视图，过滤器只考虑大于近未来任意时间的行。
2. 运行一个 `INSERT INTO SELECT` 查询，将数据插入到物化视图的目标表，从源表读取带有视图聚合查询的数据。

这可以进一步增强，以便在步骤（2）中针对数据的子集进行处理和/或使用物化视图的副本目标表（在插入完成后将分区附加到原始表）以便于故障后恢复。

考虑以下物化视图，计算每小时最受欢迎的项目。

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

虽然我们可以添加目标表，但在添加物化视图之前，我们修改其 `SELECT` 子句以包含一个过滤器，仅考虑大于近未来的任意时间的行 - 在这种情况下，我们假设 `2024-12-17 09:00:00` 是几分钟之后的时间。

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) AS hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```

一旦这个视图被添加，我们可以为物化视图回填在此数据之前的所有数据。

执行此操作最简单的方法是直接在主表上运行物化视图查询，使用过滤器忽略最近添加的数据，并通过 `INSERT INTO SELECT` 将结果插入到视图的目标表中。例如，对于上述视图：

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
在上面的示例中，我们的目标表是一个[SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。在这种情况下，我们可以简单地使用原始聚合查询。对于利用[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)的更复杂用例，用户将使用 `-State` 函数来处理聚合。相关示例可以在[此处]( /integrations/s3/performance#be-aware-of-merges)找到。
:::

在我们的案例中，这是一个相对轻量的聚合，完成时间小于 3 秒，并且使用的内存少于 600MiB。对于更复杂或运行时间更长的聚合，用户可以使用早期的副本表方法使得此过程更加完善，即创建一个影子目标表，例如 `pypi_downloads_per_day_v2`，将数据插入到该表，然后将其结果分区附加到 `pypi_downloads_per_day`。

物化视图的查询通常会更复杂（否则用户不会使用视图！）并且消耗资源。在更少见的情况下，查询所需的资源超出了服务器的限制。这突显了 ClickHouse 物化视图的优势 - 它们是增量的，不会一次性处理整个数据集！

在这种情况下，用户有几个选项：

1. 修改查询以按范围回填，例如 `WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00`，`WHERE timestamp BETWEEN 2024-12-17 07:00:00 AND 2024-12-17 08:00:00` 等。
2. 使用[Null 表引擎](/engines/table-engines/special/null)填充物化视图。这复制了物化视图的典型增量填充，在指定大小的数据块上执行其查询。

（1）代表最简单的方法，通常是足够的。为了简洁，我们不提供示例。

我们在下面进一步探讨（2）。

#### 使用 Null 表引擎填充物化视图 {#using-a-null-table-engine-for-filling-materialized-views}

[Null 表引擎](/engines/table-engines/special/null)提供了一种不持久化数据的存储引擎（将其视为表引擎世界中的 `/dev/null`）。虽然这看起来矛盾，但物化视图仍将在插入到此表引擎中的数据上执行。这允许在不持久化原始数据的情况下构建物化视图 - 避免了 I/O 和相关存储。

重要的是，任何附加到表引擎的物化视图在插入时仍会针对块的数据执行 - 将其结果发送到目标表。这些块的大小是可配置的。虽然较大的块可能更有效（并且处理速度更快），但它们会消耗更多资源（主要是内存）。使用此表引擎意味着我们可以逐块增量构建物化视图，避免需要将整个聚合保留在内存中。

<Image img={nullTableMV} size="md" alt="ClickHouse 中的去标准化"/>

<br />

考虑以下示例：

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

在这里，我们创建了一个 Null 表 `pypi_v2`，以接收将用于构建物化视图的行。请注意，我们将模式限制为仅需的列。我们的物化视图在插入到此表的行上进行聚合（逐块），并将结果发送到我们的目标表 `pypi_downloads_per_day`。

:::note
我们在这里使用 `pypi_downloads_per_day` 作为我们的目标表。为了增加鲁棒性，用户可以创建一个副本表 `pypi_downloads_per_day_v2`，并将其用作视图的目标表，如前面的示例所示。在插入完成后，`pypi_downloads_per_day_v2` 中的分区可以再移动到 `pypi_downloads_per_day`。这样可以在因内存问题或服务器中断导致插入失败的情况下进行恢复，即我们只需截断 `pypi_downloads_per_day_v2`，调整设置，然后重试。
:::

要填充此物化视图，我们只需将相关数据从 `pypi` 插入到 `pypi_v2`。

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0 rows in set. Elapsed: 27.325 sec. Processed 1.50 billion rows, 33.48 GB (54.73 million rows/s., 1.23 GB/s.)
Peak memory usage: 639.47 MiB.
```

注意这里我们的内存使用为 `639.47 MiB`。

##### 调整性能与资源 {#tuning-performance--resources}

几个因素将决定上述场景中的性能和资源使用。在尝试进行调整之前，我们建议读者了解[优化 S3 插入和读取性能指南](/integrations/s3/performance)中详细记录的插入机制。总结如下：

- **读取并行性** - 用于读取的线程数量。通过[`max_threads`](/operations/settings/settings#max_threads) 控制。在 ClickHouse Cloud 中，此值由实例大小决定，默认为 vCPUs 的数量。增加该值可能会提高读取性能，但会以更大的内存使用为代价。
- **插入并行性** - 用于插入的线程数量。通过[`max_insert_threads`](/operations/settings/settings#max_insert_threads) 控制。在 ClickHouse Cloud 中，此值由实例大小（介于 2 和 4 之间）决定，在 OSS 中设为 1。增加该值可能会提高性能，但会以更大的内存使用为代价。
- **插入块大小** - 数据以循环方式处理，其中数据被拉取、解析，并根据[分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)形成内存中的插入块。这些块会被排序、优化、压缩并作为新的[data parts](/parts) 写入存储。插入块的大小，通过设置[`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)和[`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（未压缩）控制，影响内存使用和磁盘 I/O。较大的块使用更多内存，但创建的部分更少，从而减少 I/O 和后台合并。这些设置表示最小阈值（无论哪个先达到触发刷新）。
- **物化视图块大小** - 除了主插入的上述机制，在插入物化视图之前，块也会被压缩以实现更高效的处理。这些块的大小由设置[`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views) 和 [`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views) 决定。较大的块在资源使用上会更高效。默认情况下，这些设置将回退到源表设置[`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) 和 [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) 的值。

为了提高性能，用户可以遵循在[优化 S3 插入和读取性能指南](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts)中列出的指导原则。在大多数情况下，不需要修改 `min_insert_block_size_bytes_for_materialized_views` 和 `min_insert_block_size_rows_for_materialized_views` 也可提升性能。如果要修改，使用与 `min_insert_block_size_rows` 和 `min_insert_block_size_bytes` 讨论的最佳实践相同。

为了最小化内存使用，用户可能希望尝试这些设置，这无疑会降低性能。使用之前的查询，我们在下面展示了一些示例。

将 `max_insert_threads` 降低到 1 可以减少我们的内存开销。

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

我们可以通过将 `max_threads` 设置降低到 1 进一步降低内存。

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

最后，我们可以通过将 `min_insert_block_size_rows` 设置为 0（禁用其作为块大小的决定因素）和 `min_insert_block_size_bytes` 设置为 10485760（10MiB）来进一步降低内存使用。

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

最后，请注意，降低块大小会产生更多部分，并造成更大的合并压力。如前所述[这里](/integrations/s3/performance#be-aware-of-merges)，这些设置应谨慎更改。

### 没有时间戳或单调递增列 {#no-timestamp-or-monotonically-increasing-column}

上述过程依赖于用户有时间戳或单调递增列。在某些情况下，这根本不可用。在这种情况下，我们建议采用以下过程，利用之前概述的许多步骤，但需要用户暂停插入。

1. 暂停对主表的插入。
2. 使用 `CREATE AS` 语法创建主目标表的副本。
3. 使用[`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart) 将原目标表的分区附加到副本。**注意：** 此附加操作与之前使用的移动不同。虽然依赖于硬链接，但保留了原表中的数据。
4. 创建新的物化视图。
5. 重启插入。**注意：** 插入仅会更新目标表，而不会更新副本，该副本将仅引用原始数据。
6. 回填物化视图，应用上述时间戳数据使用的相同过程，使用副本表作为源。

考虑使用 PyPI 及我们先前的新物化视图 `pypi_downloads_per_day` 的以下示例（我们假设无法使用时间戳）：

```sql
SELECT count() FROM pypi

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 0.003 sec.

-- (1) Pause inserts
-- (2) Create a duplicate of our target table

CREATE TABLE pypi_v2 AS pypi

SELECT count() FROM pypi_v2

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 0.004 sec.

-- (3) Attach partitions from the original target table to the duplicate.

ALTER TABLE pypi_v2
 (ATTACH PARTITION tuple() FROM pypi)

-- (4) Create our new materialized views

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

-- (4) Restart inserts. We replicate here by inserting a single row.

INSERT INTO pypi SELECT *
FROM pypi
LIMIT 1

SELECT count() FROM pypi

┌────count()─┐
│ 2039988138 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 0.003 sec.

-- notice how pypi_v2 contains same number of rows as before

SELECT count() FROM pypi_v2
┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

-- (5) Backfill the view using the backup pypi_v2

INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project

0 rows in set. Elapsed: 3.719 sec. Processed 2.04 billion rows, 47.15 GB (548.57 million rows/s., 12.68 GB/s.)

DROP TABLE pypi_v2;
```

在倒数第二步中，我们使用之前描述的简单 `INSERT INTO SELECT` 方法回填 `pypi_downloads_per_day`。此外，还可以使用上面描述的 Null 表方法进行增强，选择性地使用副本表以增强鲁棒性。

虽然此操作确实需要暂停插入，但中间操作通常可以快速完成 - 从而最小化任何数据中断。
