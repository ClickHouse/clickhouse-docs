---
'slug': '/data-modeling/backfilling'
'title': '补齐数据'
'description': '如何在 ClickHouse 中使用补齐大型数据集'
'keywords':
- 'materialized views'
- 'backfilling'
- 'inserting data'
- 'resilient data load'
---

import nullTableMV from '@site/static/images/data-modeling/null_table_mv.png';
import Image from '@theme/IdealImage';


# 回填数据

无论是刚刚接触 ClickHouse 还是负责现有部署的用户，都不可避免地需要回填带有历史数据的表。在某些情况下，这相对简单，但在需要填充物化视图时可能会变得更加复杂。本指南记录了一些用户可以应用于自身用例的处理流程。

:::note
本指南假设用户已熟悉 [增量物化视图](/materialized-view/incremental-materialized-view) 和 [使用表函数进行数据加载，比如 s3 和 gcs](/integrations/s3) 的概念。我们还建议用户阅读我们关于 [优化对象存储插入性能](/integrations/s3/performance) 的指南，其中的建议可以适用于本指南中的插入操作。
:::

## 示例数据集 {#example-dataset}

在本指南中，我们使用 PyPI 数据集。此数据集中每一行代表使用 `pip` 等工具下载的 Python 包。

例如，子集涵盖了一天的内容 - `2024-12-17`，并在 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/` 上公开可用。用户可以通过以下查询：

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 32.726 sec. Processed 2.04 billion rows, 170.05 KB (62.34 million rows/s., 5.20 KB/s.)
Peak memory usage: 239.50 MiB.
```

此存储桶的完整数据集包含超过 320 GB 的 parquet 文件。在下面的示例中，我们故意使用 glob 模式来定位子集。

我们假设用户正在消费此日期之后的数据流，例如来自 Kafka 或对象存储。此数据的模式如下所示：

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
完整的 PyPI 数据集包含超过 1 万亿行，用户可以在我们的公共演示环境 [clickpy.clickhouse.com](https://clickpy.clickhouse.com) 中访问。有关此数据集的更多详细信息，包括演示如何利用物化视图来提高性能以及数据如何每天填充，请参见 [这里](https://github.com/ClickHouse/clickpy)。
:::

## 回填场景 {#backfilling-scenarios}

通常，当从某一时间点消费数据流时，需要进行回填。此数据被插入到带有 [增量物化视图](/materialized-view/incremental-materialized-view) 的 ClickHouse 表中，随着数据块的插入而触发。这些视图可能在插入之前对数据进行转换或计算汇总，并将结果发送到目标表，以便在下游应用中稍后使用。

我们将尝试涵盖以下场景：

1. **使用现有数据摄取回填数据** - 新数据正在加载，且历史数据需要回填。此历史数据已被识别。
2. **向现有表添加物化视图** - 需要向其历史数据已被填充且数据已在流入的设置中添加新的物化视图。

我们假设数据将从对象存储回填。在所有情况下，我们旨在避免数据插入的暂停。

我们建议从对象存储回填历史数据。数据应该尽可能导出为 Parquet 格式，以实现最佳读取性能和压缩（减少网络传输）。通常，约 150MB 的文件大小最为理想，但 ClickHouse 支持超过 [70 种文件格式](/interfaces/formats)，并能够处理各种大小的文件。

## 使用重复表和视图 {#using-duplicate-tables-and-views}

在所有场景下，我们依赖“重复表和视图”的概念。这些表和视图表示用于实时流数据的副本，允许在隔离的情况下执行回填，如果发生故障则有简单的恢复手段。例如，我们有以下主要的 `pypi` 表和物化视图，计算每个 Python 项目的下载次数：

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

我们用数据的子集填充主要表和关联视图：

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

假设我们希望加载另一个子集 `{101..200}`。虽然我们可以直接插入到 `pypi` 中，但可以通过创建重复表在隔离状态下完成回填。

如果回填失败，我们没有影响到主要表，只需 [截断](/managing-data/truncate) 重复表并重新执行。

要创建这些视图的新副本，我们可以使用 `CREATE TABLE AS` 子句，后加后缀 `_v2`：

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

我们用大约相同大小的第二个子集填充这一表，并确认成功加载。

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

如果在第二次加载期间的任何时刻经历了失败，我们可以简单地 [截断](/managing-data/truncate) `pypi_v2` 和 `pypi_downloads_v2`，然后重复数据加载。

完成数据加载后，我们可以使用 [`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table) 子句将数据从重复表移动到主要表。

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

0 rows in set. Elapsed: 1.401 sec.

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads

0 rows in set. Elapsed: 0.389 sec.
```

:::note 分区名称
上述的 `MOVE PARTITION` 调用使用了分区名称 `()`。这表示此表的单一分区（未分区）。对于分区表，用户需要调用多个 `MOVE PARTITION` 调用 - 每个分区一个分区。当前分区的名称可以通过 [`system.parts`](/operations/system-tables/parts) 表确定，例如 `SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')`。
:::

我们现在可以确认 `pypi` 和 `pypi_downloads` 包含完整的数据。`pypi_downloads_v2` 和 `pypi_v2` 可以安全删除。

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

重要的是，`MOVE PARTITION` 操作是轻量级的（利用硬链接）和原子性的，即它要么成功，要么失败，没有中间状态。

我们在下面的回填场景中大量利用这一过程。

请注意，该过程要求用户选择每次插入操作的大小。

较大的插入，即更多的行，将意味着需要更少的 `MOVE PARTITION` 操作。然而，这必须与因插入失败（例如由于网络中断）而恢复的成本相平衡。用户可以通过批量处理文件来降低风险。这可以通过范围查询，例如 `WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00` 或者 glob 模式来完成。例如，

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
ClickPipes 在从对象存储加载数据时使用此方法，自动创建目标表及其物化视图的副本，避免用户执行上述步骤的需要。通过使用多个工作线程，每个线程处理不同子集（通过 glob 模式）及其自己的重复表，数据可以快速加载，并确保正确一次性语义。对此感兴趣的用户可以在 [这篇博客](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3) 中找到更多详细信息。
:::

## 场景 1: 使用现有数据摄取回填数据 {#scenario-1-backfilling-data-with-existing-data-ingestion}

在此场景中，我们假设要回填的数据不在一个孤立的存储桶中，因此需要过滤。数据已经在插入，并且可以识别出某个时间戳或单调递增的列，从而需要回填历史数据。

这个过程遵循以下步骤：

1. 确定检查点 - 识别需要恢复的时间戳或列值。
2. 创建主要表和物化视图目标表的重复副本。
3. 创建指向在步骤 (2) 中创建的目标表的任何物化视图的副本。
4. 插入到在步骤 (2) 中创建的重复主要表中。
5. 将所有分区从重复表移动到它们的原始版本中。删除重复表。

例如，在我们的 PyPI 数据中，假设我们已经加载了数据。我们可以识别出最小时间戳，因此我们的“检查点”。

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

1 row in set. Elapsed: 0.163 sec. Processed 1.34 billion rows, 5.37 GB (8.24 billion rows/s., 32.96 GB/s.)
Peak memory usage: 227.84 MiB.
```

从上述内容，我们知道我们需要加载在 `2024-12-17 09:00:00` 之前的数据。使用我们之前的过程，我们创建重复表和视图，并使用时间戳上的过滤加载子集。

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
在 Parquet 中对时间戳列进行过滤可以非常高效。ClickHouse 只会读取时间戳列以识别出要加载的完整数据范围，从而最大限度地减少网络流量。ClickHouse 查询引擎还可以利用 Parquet 索引，如最小-最大。
:::

一旦此插入完成，我们可以移动相关的分区。

```sql
ALTER TABLE pypi_v2 MOVE PARTITION () TO pypi

ALTER TABLE pypi_downloads_v2 MOVE PARTITION () TO pypi_downloads
```

如果历史数据在一个孤立的存储桶中，则不需要上述时间过滤。如果没有时间或单调列，请隔离您的历史数据。

:::note 只需在 ClickHouse Cloud 中使用 ClickPipes
ClickHouse Cloud 用户应在数据可以孤立到自己的存储桶中（且不需要过滤）时使用 ClickPipes 来恢复历史备份。通过并行加载多个工作线程，从而减少加载时间，ClickPipes 自动化了上述过程 - 为主表和物化视图创建重复表。
:::

## 场景 2: 向现有表添加物化视图 {#scenario-2-adding-materialized-views-to-existing-tables}

在需要向已填充大量数据以及正在插入数据的设置中添加新物化视图并不罕见。这里可使用时间戳或单调递增的列来识别流中的某个点，这有助于避免数据插入的暂停。在下面的示例中，我们假设这两种情况，倾向于选择避免暂停的插入方法。

:::note 避免使用 POPULATE
我们不建议使用 [`POPULATE`](/sql-reference/statements/create/view#materialized-view) 命令来回填物化视图，除非是暂停插入的小数据集。此操作符可能会错过插入到其源表的行，物化视图是在 populate hash 完成后创建的。此外，此 populate 将对所有数据运行，且在大数据集上容易受到中断或内存限制的影响。
:::

### 可用时间戳或单调递增列 {#timestamp-or-monotonically-increasing-column-available}

在这种情况下，我们建议新的物化视图包含一个过滤器，将行限制为未来任意数据的值。然后可以使用来自主表的历史数据从此日期回填物化视图。回填方法依赖于数据大小和相关查询的复杂性。

我们最简单的方法包括以下步骤：

1. 创建我们的物化视图，并加上一个仅考虑任意近期时间之后的行的过滤器。
2. 运行一个 `INSERT INTO SELECT` 查询，该查询向物化视图的目标表插入数据，读取源表与视图的聚合查询。

这可以进一步增强以在步骤 (2) 中针对数据子集，和/或使用物化视图的重复目标表（在插入完成后将分区附加到原始表）以便于故障后的恢复。

考虑以下物化视图，它计算每小时最受欢迎的项目。

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

虽然我们可以添加目标表，但在添加物化视图之前，我们修改其 `SELECT` 子句，以包含一个仅考虑任意未来时间后行的过滤器 - 在这种情况下我们假设 `2024-12-17 09:00:00` 是几分钟后的时间。

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```

一旦添加了此视图，我们就可以在此数据之前回填物化视图的所有数据。

完成此操作最简单的方法是简单地在主表上运行物化视图的查询，并加上过滤以忽略最近添加的数据，通过 `INSERT INTO SELECT` 将结果插入到我们视图的目标表。例如，对于上面的视图：

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
在上述示例中，我们的目标表是 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。在这种情况下，我们可以直接使用原始聚合查询。对于更复杂的用例，这些用例利用 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)，用户将使用 `-State` 函数进行汇总。对此的示例可以在 [这里](/integrations/s3/performance#be-aware-of-merges) 找到。
:::

在我们的案例中，这是相对轻量级的聚合，完成时间少于 3 秒，使用内存少于 600MiB。对于更复杂或运行时间较长的聚合，用户可以通过使用早期的重复表方法来增强此过程，即创建一个影子目标表，例如 `pypi_downloads_per_day_v2`，将数据插入这个表，并将其生成的分区附加到 `pypi_downloads_per_day`。

物化视图的查询往往可以更复杂（这并不少见，否则用户就不会使用视图了！）并消耗资源。在更少见的情况下，查询所需的资源超出了服务器的承载能力。这凸显了 ClickHouse 物化视图的一大优势 - 它们是增量的，不会一次性处理整个数据集！

在这种情况下，用户有几种选择：

1. 修改查询以回填范围，例如 `WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00`，`WHERE timestamp BETWEEN 2024-12-17 07:00:00 AND 2024-12-17 08:00:00` 等。
2. 使用 [Null 表引擎](/engines/table-engines/special/null) 来填充物化视图。这模拟了物化视图的典型增量填充，在数据块（可配置大小）上执行查询。

（1）代表了最简单的方法，通常就足够了。为了简洁起见，我们不提供示例。

我们下面进一步探讨（2）。

#### 使用 Null 表引擎填充物化视图 {#using-a-null-table-engine-for-filling-materialized-views}

[Null 表引擎](/engines/table-engines/special/null) 提供了一种不持久化数据的存储引擎（想象它是表引擎世界的 `/dev/null`）。尽管这似乎矛盾，但物化视图仍会在插入到此表引擎的数据上执行。这允许在不持久化原始数据的情况下构建物化视图，避免了输入输出及相关存储。

重要的是，任何附着到表引擎的物化视图仍然会在其插入的数据块上执行 - 将结果发送到目标表。这些块的大小是可配置的。虽然较大的块可能在效率上更高（处理更快），但它们消耗的资源（主要是内存）也更多。使用此表引擎意味着我们可以逐步增量构建物化视图，即一次一个块，避免将整个聚合保持在内存中。

<Image img={nullTableMV} size="md" alt="ClickHouse 中的去规范化"/>

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

在此，我们创建一个 Null 表 `pypi_v2`，以接收将用于构建物化视图的行。请注意，我们将模式限制为仅包括所需的列。我们的物化视图对插入到此表的数据（一次一个块）执行聚合，将结果发送到我们的目标表 `pypi_downloads_per_day`。

:::note
我们在此使用 `pypi_downloads_per_day` 作为目标表。为了增加弹性，用户可以创建重复表 `pypi_downloads_per_day_v2`，并将其用作视图的目标表，如前面示例中所示。在插入完成后，`pypi_downloads_per_day_v2` 中的分区可以反过来移动到 `pypi_downloads_per_day`。这将允许在由于内存问题或服务器中断而导致插入失败的情况下进行恢复，即我们只需截断 `pypi_downloads_per_day_v2`，调整设置，然后重试。
:::

要填充这个物化视图，我们只需将相关数据从 `pypi.` 插入到 `pypi_v2` 中进行回填。

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0 rows in set. Elapsed: 27.325 sec. Processed 1.50 billion rows, 33.48 GB (54.73 million rows/s., 1.23 GB/s.)
Peak memory usage: 639.47 MiB.
```

请注意，我们的内存使用为 `639.47 MiB`。

##### 调整性能和资源 {#tuning-performance--resources}

几个因素将决定上述场景中的性能和资源使用情况。在尝试调整之前，我们建议读者了解在 [优化 S3 插入和读取性能指南](/integrations/s3/performance) 的 [使用线程进行读取](/integrations/s3/performance#using-threads-for-reads) 部分详细记录的插入机制。简而言之：

- **读取并行性** - 用于读取的线程数。通过 [`max_threads`](/operations/settings/settings#max_threads) 控制。在 ClickHouse Cloud 中，这取决于实例大小，默认为 vCPUs 的数量。增加该值可能会提高读取性能，但会增加内存使用。
- **插入并行性** - 用于插入的线程数。通过 [`max_insert_threads`](/operations/settings/settings#max_insert_threads) 控制。在 ClickHouse Cloud 中，这由实例大小（在 2 到 4 之间）确定，在 OSS 中设置为 1。增加该值可能会提高性能，但会增加内存使用。
- **插入块大小** - 数据在一个循环中被处理，在此过程中数据被拉取、解析并形成内存中的插入块，基于 [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)。这些块会被排序、优化、压缩，并作为新的 [数据部分](/parts) 写入存储。插入块的大小由设置 [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) 和 [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（未压缩）控制，影响内存使用和磁盘 I/O。较大的块使用更多内存，但创建更少的部分，从而减少 I/O 和后台合并。这些设置表示最小阈值（达到第一个的触发刷新）。
- **物化视图块大小** - 除了上述主插入机制，在插入到物化视图之前，块也会被压缩以提高处理效率。这些块的大小由设置 [`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views) 和 [`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views) 决定。较大的块会以较大的内存使用换取更高效的处理。默认情况下，这些设置会恢复到源表设置 [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) 和 [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) 的值。

为了提高性能，用户可以遵循在 [优化 S3 插入和读取性能指南](/integrations/s3/performance) 的 [调整线程和插入块大小](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts) 部分中概述的准则。在大多数情况下，不需要同时修改 `min_insert_block_size_bytes_for_materialized_views` 和 `min_insert_block_size_rows_for_materialized_views` 来提高性能。如果必须修改，则使用与 `min_insert_block_size_rows` 和 `min_insert_block_size_bytes` 讨论的相同最佳实践。

为了最小化内存使用，用户可能希望尝试调整这些设置。这将不可避免地降低性能。使用之前的查询，我们在下面展示示例。

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

我们可以通过将 `max_threads` 设置降低到 1，进一步减少内存。

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

最后，我们可以通过将 `min_insert_block_size_rows` 设置为 0（禁用它作为块大小的决定因素）和将 `min_insert_block_size_bytes` 设置为 10485760（10MiB），进一步减少内存使用。

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

最后，请注意，降低块大小会产生更多部分并造成更大的合并压力。如 [这里](https://integrations/s3/performance#be-aware-of-merges) 讨论的，这些设置应谨慎修改。

### 没有时间戳或单调递增列 {#no-timestamp-or-monotonically-increasing-column}

上述过程依赖于用户拥有时间戳或单调递增的列。在某些情况下，这些信息根本不可用。在这种情况下，我们建议采用以下过程，该过程利用了之前概述的许多步骤，但需要用户暂停插入。

1. 暂停主表的插入。
2. 使用 `CREATE AS` 语法创建主目标表的重复表。
3. 使用 [`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart) 将原始目标表的分区附加到重复表中。**注意：** 此附加操作与之前使用的移动操作不同。虽然依赖于硬链接，但保留了原始表中的数据。
4. 创建新的物化视图。
5. 重新启动插入。**注意：** 插入只会更新目标表，而不会更新重复表，后者仅引用原始数据。
6. 回填物化视图，使用上述针对时间戳的数据使用的相同流程，以重复表作为源。

考虑使用 PyPI 和我们之前的新物化视图 `pypi_downloads_per_day` 的以下示例（我们假设不能使用时间戳）：

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

在倒数第二个步骤中，我们使用简单的 `INSERT INTO SELECT` 方法回填 `pypi_downloads_per_day`，如 [之前](#timestamp-or-monotonically-increasing-column-available) 所述。这也可以使用上述文档中的 Null 表方法增强，并可选择使用重复表以增加弹性。

尽管此操作确实需要暂停插入，但中间操作通常可以快速完成 - 最小化任何数据中断。
