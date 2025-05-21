---
'slug': '/data-modeling/backfilling'
'title': '数据回填'
'description': '如何在ClickHouse中使用回填大型数据集'
'keywords':
- 'materialized views'
- 'backfilling'
- 'inserting data'
- 'resilient data load'
---

import nullTableMV from '@site/static/images/data-modeling/null_table_mv.png';
import Image from '@theme/IdealImage';


# 回填数据

无论是新接触 ClickHouse 还是负责现有的部署，用户通常需要用历史数据回填表格。在某些情况下，这相对简单，但在需要填充物化视图时可能会变得更加复杂。本指南记录了一些用户可以应用于其用例的流程。

:::note
本指南假设用户已熟悉 [增量物化视图](/materialized-view/incremental-materialized-view) 和 [使用表函数进行数据加载，例如 s3 和 gcs](/integrations/s3) 的概念。我们还建议用户阅读我们的 [对对象存储的插入性能进行优化](/integrations/s3/performance) 指南，其中的建议可以应用于本指南中的所有插入操作。
:::

## 示例数据集 {#example-dataset}

在本指南中，我们使用 PyPI 数据集。此数据集中每一行代表使用 `pip` 等工具下载的 Python 包。

例如，该子集覆盖了一天 - `2024-12-17`，并可在 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/` 上公开获取。用户可以使用以下查询：

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 32.726 sec. Processed 2.04 billion rows, 170.05 KB (62.34 million rows/s., 5.20 KB/s.)
Peak memory usage: 239.50 MiB.
```

该存储桶的完整数据集包含超过 320 GB 的 parquet 文件。在下面的示例中，我们故意针对使用 glob 模式的子集。

我们假设用户正在消费来自此日期之后的数据流，例如来自 Kafka 或对象存储。该数据的模式如下所示：

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
包含超过 1 万亿行的完整 PyPI 数据集可在我们的公共演示环境 [clickpy.clickhouse.com](https://clickpy.clickhouse.com) 中找到。有关该数据集的更多详细信息，包括演示如何利用物化视图提高性能以及如何每天填充数据，请参见 [此处](https://github.com/ClickHouse/clickpy)。
:::

## 回填场景 {#backfilling-scenarios}

当从某一时间点消费数据流时，通常需要回填。此数据被插入到 ClickHouse 表中，使用 [增量物化视图](/materialized-view/incremental-materialized-view)，在插入时触发块。这些视图可能在插入之前转换数据或计算聚合，并将结果发送到目标表以供后续应用程序使用。

我们将尝试涵盖以下场景：

1. **使用现有数据摄取回填数据** - 新数据正在加载，且需要回填历史数据。该历史数据已经被识别。
2. **向现有表添加物化视图** - 需要向一个已填充历史数据并且数据已在流动的设置中添加新物化视图。

我们假设数据将从对象存储中进行回填。在所有情况下，我们旨在避免数据插入的暂停。

我们推荐从对象存储回填历史数据。数据应该在可能的情况下导出为 Parquet，以获得最佳的读取性能和压缩（减少网络传输）。通常优选约 150MB 的文件大小，但 ClickHouse 支持超过 [70 种文件格式](/interfaces/formats)，能够处理所有大小的文件。

## 使用重复表和视图 {#using-duplicate-tables-and-views}

在所有场景中，我们依赖于“重复表和视图”的概念。这些表和视图表示用于实时流数据的副本，允许回填在隔离中进行，并且在发生故障时可以轻松恢复。例如，我们有以下主 `pypi` 表和物化视图，计算每个 Python 项目的下载次数：

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

我们使用一部分数据填充主表和相关视图：

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

假设我们希望加载另一个子集 `{101..200}`。尽管我们可以直接插入到 `pypi`，但我们可以通过创建重复表在隔离中进行此回填。

如果回填失败，我们不会影响我们主要的表，只需 [truncate](/managing-data/truncate) 我们的重复表并再次进行。

要创建这些视图的新副本，我们可以使用具有后缀 `_v2` 的 `CREATE TABLE AS` 子句：

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

我们用我们的第二个大小大致相同的子集来填充，并确认成功加载。

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

如果我们在第二次加载的任何时候遇到故障，我们可以简单地 [truncate](/managing-data/truncate) 我们的 `pypi_v2` 和 `pypi_downloads_v2` 并重复数据加载。

随着数据加载完成，我们可以使用 [`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table) 子句将数据从我们的重复表移动到主表。

```sql
ALTER TABLE pypi
 (MOVE PARTITION () FROM pypi_v2)

0 rows in set. Elapsed: 1.401 sec.

ALTER TABLE pypi_downloads
 (MOVE PARTITION () FROM pypi_downloads_v2)

0 rows in set. Elapsed: 0.389 sec.
```

:::note 分区名称
上述 `MOVE PARTITION` 调用使用分区名称 `()`。这表示该表的单个分区（该表没有分区）。对于分区表，用户需要多次调用 `MOVE PARTITION` - 每个分区一次。当前分区的名称可以从 [`system.parts`](/operations/system-tables/parts) 表中确定，例如 `SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')`。
:::

我们现在可以确认 `pypi` 和 `pypi_downloads` 包含完整的数据。`pypi_downloads_v2` 和 `pypi_v2` 可以安全地删除。

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

重要的是，`MOVE PARTITION` 操作是轻量级的（利用硬链接）并且是原子的，即它要么失败，要么成功，没有中间状态。

我们在下面的回填场景中大量利用这个过程。

注意，此过程要求用户选择每个插入操作的大小。

较大的插入，即更多的行，将意味着需要更少的 `MOVE PARTITION` 操作。然而，这必须与插入失败事件（例如，由于网络中断）所需的成本相平衡，以便进行恢复。用户可以结合这个过程使用分批文件来降低风险。这可以通过范围查询（例如 `WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00`）或使用 glob 模式来执行。例如：

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
ClickPipes 在从对象存储加载数据时使用这种方法，自动创建目标表及其物化视图的副本，避免用户执行上述步骤的需要。通过同时使用多个工作线程，每个线程处理不同的子集（通过 glob 模式）并具有自己的重复表，可以快速加载数据并具有精确一次的语义。对于感兴趣的用户，进一步的详细信息可以在 [这篇博客](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3) 中找到。
:::

## 场景 1: 使用现有数据摄取回填数据 {#scenario-1-backfilling-data-with-existing-data-ingestion}

在此场景中，我们假设回填的数据不在孤立的存储桶中，因此需要过滤。数据已经插入，可以识别出一个时间戳或单调递增的列，从而确定需要回填历史数据的起始点。

该过程遵循以下步骤：

1. 确定检查点 - 时间戳或需要恢复的历史数据的列值。
2. 创建主表和目标表的副本，用于物化视图。
3. 创建任何指向在步骤 (2) 中创建的目标表的物化视图的副本。
4. 插入数据到我们在步骤 (2) 中创建的重复主表中。
5. 将所有分区从重复表移动到其原始版本。删除重复表。

例如，在我们的 PyPI 数据中，假设我们加载了数据。我们可以识别最小的时间戳，因此我们的 "检查点"。

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

1 row in set. Elapsed: 0.163 sec. Processed 1.34 billion rows, 5.37 GB (8.24 billion rows/s., 32.96 GB/s.)
Peak memory usage: 227.84 MiB.
```

从上面可以知道，我们需要加载 `2024-12-17 09:00:00` 之前的数据。使用我们之前的流程，我们创建重复表和视图，并使用时间戳进行过滤加载子集。

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
在 Parquet 中以时间戳列进行过滤可以非常高效。ClickHouse 只会读取时间戳列以识别加载的完整数据范围，从而最小化网络流量。Parquet 索引，如最小-最大索引，也可以被 ClickHouse 查询引擎利用。
:::

完成此插入后，我们可以移动相关的分区。

```sql
ALTER TABLE pypi
 (MOVE PARTITION () FROM pypi_v2)

ALTER TABLE pypi_downloads
 (MOVE PARTITION () FROM pypi_downloads_v2)
```

如果历史数据在孤立的存储桶中，则不需要上述时间过滤。如果没有时间或单调递增的列，请隔离您的历史数据。

:::note 只需在 ClickHouse Cloud 中使用 ClickPipes
ClickHouse Cloud 用户应使用 ClickPipes 来恢复历史备份，如果数据可以隔离在自己的存储桶中（而且不需要过滤）。除了并行化加载并减少加载时间，ClickPipes 自动化上述过程 - 为主表和物化视图创建重复表。
:::

## 场景 2: 向现有表添加物化视图 {#scenario-2-adding-materialized-views-to-existing-tables}

新物化视图需要添加到已填充大量数据且正在插入数据的设置中并不罕见。时间戳或单调递增的列可用于识别流中的某个点，在这里很有用，并避免暂停数据摄取。在下面的示例中，我们假设两种情况，优先选择避免数据摄取暂停的方法。

:::note 避免使用 POPULATE
我们不建议使用 [`POPULATE`](/sql-reference/statements/create/view#materialized-view) 命令来回填物化视图，除非数据集很小且摄取已暂停。此操作符可能会错过插入到其源表中的行，物化视图在 populate hash 完成后创建。此外，该 populate 会针对所有数据运行，且在处理大型数据集时易受中断或内存限制的影响。
:::

### 可用时间戳或单调递增列 {#timestamp-or-monotonically-increasing-column-available}

在这种情况下，我们建议新的物化视图包含过滤器，只考虑大于未来任意数据的行。随后，可以使用主表中的历史数据从此日期回填物化视图。回填的方法取决于数据大小和相关查询的复杂性。

我们最简单的方法涉及以下步骤：

1. 创建物化视图，包含仅考虑大于近期某个任意时间的行的过滤器。
2. 执行 `INSERT INTO SELECT` 查询，该查询插入数据到物化视图的目标表，从源表读取并聚合视图查询。

这可以进一步提高，以便在步骤 (2) 中针对数据的子集，并/或使用物化视图的重复目标表（在插入完成后将分区附加到原始目标表）以便在失败后更容易恢复。

考虑以下物化视图，该视图计算每小时最受欢迎的项目。

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

虽然我们可以添加目标表，但在添加物化视图之前，我们修改其 `SELECT` 子句以包含过滤器，仅考虑大于近期某个任意时间的行 - 在本例中，我们假设 `2024-12-17 09:00:00` 是几分钟后的时间。

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```

添加此视图后，我们可以回填该物化视图在此数据之前的所有数据。

最简单的方式是直接从主表运行物化视图的查询，使用过滤器忽略最近添加的数据，通过 `INSERT INTO SELECT` 将结果插入我们视图的目标表中。例如，对于上述视图：

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
在上述示例中，我们的目标表是 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。在这种情况下，我们可以直接使用原始的聚合查询。对于利用 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 的更复杂用例，用户将使用 `-State` 函数进行聚合。此类示例可以在 [此处](/integrations/s3/performance#be-aware-of-merges) 找到。
:::

在我们的例子中，这是一个相对轻量的聚合，完成时间在 3 秒以内，并且使用的内存少于 600MiB。对于更复杂或运行时间较长的聚合，用户可以通过使用早期的重复表方法来增强这个过程，即创建一个阴影目标表，例如 `pypi_downloads_per_day_v2`，并将数据插入到该表中，然后将其结果分区附加到 `pypi_downloads_per_day`。

物化视图的查询通常可能更复杂（这并不奇怪，否则用户不会使用视图！），并且消耗的资源。在更少见的情况下，查询所需的资源超出了服务器的处理能力。这凸显了 ClickHouse 物化视图的一个优势 - 它们是增量的，不会一一次性处理整个数据集！

在这种情况下，用户有几种选择：

1. 修改查询以回填范围，例如 `WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00`，`WHERE timestamp BETWEEN 2024-12-17 07:00:00 AND 2024-12-17 08:00:00` 等等。
2. 使用 [Null 表引擎](/engines/table-engines/special/null) 来填充物化视图。这复制了物化视图的典型增量填充，便于在配置大小的数据块上执行其查询。

(1) 代表的最简单的方法通常是足够的。我们不会提供示例以简洁。

我们在下面进一步探讨 (2)。

#### 使用 Null 表引擎填充物化视图 {#using-a-null-table-engine-for-filling-materialized-views}

[Null 表引擎](/engines/table-engines/special/null) 提供了一种不持久化数据的存储引擎（可以认为它是表引擎世界中的 `/dev/null`）。虽然这似乎是自相矛盾的，但物化视图仍将在插入到此表引擎的数据上执行。这允许在不持久化原始数据的情况下构建物化视图，从而避免 I/O 和相关存储。

重要的是，任何附加到表引擎的物化视图仍将在插入的数据块上执行 - 将其结果发送到目标表。这些数据块大小是可配置的。尽管较大的数据块可能更高效（处理速度更快），但它们会消耗更多资源（主要是内存）。使用此表引擎的好处在于，我们可以增量构建物化视图，即一次处理一个块，避免需要将整个聚合保留在内存中。

<Image img={nullTableMV} size="md" alt="ClickHouse 中的去范式化"/>

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

在这里，我们创建了一个 Null 表 `pypi_v2`，用于接收将用于构建我们的物化视图的行。请注意，我们将模式限制为仅包含所需的列。我们的物化视图对插入到该表的行执行聚合（一次一个数据块），并将结果发送到目标表 `pypi_downloads_per_day`。

:::note
我们在此使用 `pypi_downloads_per_day` 作为我们的目标表。为了增加弹性，用户可以创建一个重复表 `pypi_downloads_per_day_v2`，并将其用作视图的目标表，如前面的示例所示。在插入完成后，可以将 `pypi_downloads_per_day_v2` 中的分区移动到 `pypi_downloads_per_day`。这将允许在由于内存问题或服务器中断导致插入失败的情况下进行恢复，即我们只需 truncate `pypi_downloads_per_day_v2`，调整设置，然后重试。
:::

要填充此物化视图，我们只需从 `pypi` 将相关数据插入到 `pypi_v2` 中。

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0 rows in set. Elapsed: 27.325 sec. Processed 1.50 billion rows, 33.48 GB (54.73 million rows/s., 1.23 GB/s.)
Peak memory usage: 639.47 MiB.
```

注意我们的内存使用量为 `639.47 MiB`。

##### 调整性能与资源 {#tuning-performance--resources}

有几个因素将决定上述场景中使用的性能和资源。在尝试调整之前，我们建议读者了解在 [优化 S3 的插入和读取性能指南](/integrations/s3/performance) 中详细记录的插入机制。概括如下：

- **读取并行性** - 用于读取的线程数。通过 [`max_threads`](/operations/settings/settings#max_threads) 控制。在 ClickHouse Cloud 中，这取决于实例大小，默认为 vCPUs 的数量。增加此值可能会提高读取性能，但牺牲更多内存使用。
- **插入并行性** - 用于插入的线程数。通过 [`max_insert_threads`](/operations/settings/settings#max_insert_threads) 控制。在 ClickHouse Cloud 中，这取决于实例大小（在 2 到 4 之间），开源版本设置为 1。增加此值可能会提高性能，但牺牲更多内存使用。
- **插入块大小** - 数据在循环中处理，从中提取、解析，并形成基于 [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key) 的内存插入块。这些块被排序、优化、压缩并作为新的 [数据分区片段](/parts) 写入存储。插入块的大小由设置 [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) 和 [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（未压缩）控制，影响内存使用和磁盘 I/O。较大的块使用更多内存，但创建的分区较少，从而减少 I/O 和后台合并。这些设置代表最小阈值（无论哪个优先达到都会触发刷新）。
- **物化视图块大小** - 除了主插入的上述机制，物化视图在插入前也会对这些块进行压缩以提高处理效率。这些块的大小由设置 [`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views) 和 [`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views) 决定。较大的块在牺牲更多内存使用的情况下允许更高效的处理。默认情况下，这些设置恢复为源表设置 [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) 和 [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) 的值。

为了提高性能，用户可以遵循 [优化 S3 的插入和读取性能指南](/integrations/s3/performance) 中的 [调整插入的线程和块大小](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts) 的指导。大多数情况下，不应需要修改 `min_insert_block_size_bytes_for_materialized_views` 和 `min_insert_block_size_rows_for_materialized_views` 来提高性能。如果修改这些，请使用与修改 `min_insert_block_size_rows` 和 `min_insert_block_size_bytes` 时相同的最佳实践。

为了最小化内存使用，用户可能需要试验这些设置。这将不可避免地降低性能。我们使用之前的查询，下面展示一些示例。

将 `max_insert_threads` 降低到 1 可以降低我们的内存开销。

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

我们还可以通过将 `max_threads` 设置降低到 1 进一步降低内存。

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

最后，我们可以通过将 `min_insert_block_size_rows` 设置为 0（禁用作为块大小的决定性因素）和将 `min_insert_block_size_bytes` 设置为 10485760（10MiB）进一步降低内存。

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

最后，请注意，降低块大小会产生更多分区并导致更大的合并压力。如 [这里](https://integrations/s3/performance#be-aware-of-merges) 讨论的，这些设置应谨慎更改。

### 没有时间戳或单调递增列 {#no-timestamp-or-monotonically-increasing-column}

上述过程依赖于用户具有时间戳或单调递增的列。在某些情况下，这根本不可用。在这种情况下，我们建议以下流程，利用之前概述的许多步骤，但需要用户暂停插入。

1. 暂停向主表的插入。
2. 使用 `CREATE AS` 语法创建主目标表的副本。
3. 使用 [`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart) 将原始目标表的分区附加到副本上。 **注意：** 此附加操作与之前使用的移动不同。虽然依赖于硬链接，但原始表中的数据仍然保留。
4. 创建新的物化视图。
5. 重新启动插入。 **注意：** 插入将仅更新目标表，而不会更新副本，副本仅引用原始数据。
6. 使用与之前对时间戳数据所用的相同过程回填物化视图，使用重复表作为源。

考虑以下使用 PyPI 和我们之前的新物化视图 `pypi_downloads_per_day`（我们假设不能使用时间戳）的示例：

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

在倒数第二步中，我们使用我们的简单 `INSERT INTO SELECT` 方法回填 `pypi_downloads_per_day`，如前面 [提到的](#timestamp-or-monotonically-increasing-column-available)。这还可以使用上文记录的 Null 表方法进行增强，并可选择使用重复表以提高弹性。

虽然此操作确实需要暂停插入，但中间操作通常可以快速完成，从而最小化任何数据中断。
