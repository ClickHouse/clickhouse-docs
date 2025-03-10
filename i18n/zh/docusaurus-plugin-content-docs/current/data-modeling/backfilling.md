---
slug: /data-modeling/backfilling
title: 回填数据
description: 如何在 ClickHouse 中使用回填大数据集
keywords: [物化视图, 回填, 插入数据, 可恢复数据加载]
---

import nullTableMV from '@site/static/images/data-modeling/null_table_mv.png';

# 回填数据

无论是刚接触 ClickHouse 还是负责现有部署的用户，都不可避免地需要用历史数据回填表。在某些情况下，这相对简单，但当需要填充物化视图时，情况可能会变得更复杂。本指南记录了一些用户可以应用于其用例的处理流程。

:::note
本指南假设用户已经熟悉 [增量物化视图](/materialized-view/incremental-materialized-view) 和使用如 s3 和 gcs 等表函数进行 [数据加载](/integrations/s3) 的概念。我们还建议用户阅读我们的 [优化对象存储插入性能](/integrations/s3/performance) 的指南，该建议可应用于整个指南中的插入操作。
:::
## 示例数据集 {#example-dataset}

在本指南中，我们使用了 PyPI 数据集。该数据集中每一行表示使用工具 `pip` 下载的 Python 包。

例如，该子集涵盖了一天的记录 - `2024-12-17`，并可以在 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/` 上公开访问。用户可以通过以下查询进行访问：

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 20.40亿
└────────────┘

1 row in set. Elapsed: 32.726 sec. Processed 20.40亿 行, 170.05 KB (每秒 6234 万行, 每秒 5.20 KB.)
峰值内存使用量: 239.50 MiB.
```

此存储桶的完整数据集包含超过 320GB 的 parquet 文件。在以下示例中，我们故意使用通配符模式来定位子集。

我们假设用户正在从该日期之后消费数据流，如来自 Kafka 或对象存储。该数据的模式如下：

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
完整的 PyPI 数据集包含超过 1 万亿行，提供在我们的公共演示环境 [clickpy.clickhouse.com](https://clickpy.clickhouse.com)。有关此数据集的更多详细信息，包括演示如何利用物化视图提高性能以及如何每日填充数据，请参见 [这里](https://github.com/ClickHouse/clickpy)。
:::
## 回填场景 {#backfilling-scenarios}

当从时间点消费数据流时，通常需要进行回填。该数据被插入到带有 [增量物化视图](/materialized-view/incremental-materialized-view) 的 ClickHouse 表中，随着数据块的插入触发。这些视图可能在插入之前转换数据或计算聚合并将结果发送到目标表以供后续应用程序使用。

我们将尝试覆盖以下场景：

1. **用现有数据摄取回填数据** - 新数据正在加载，并且需要回填历史数据。此历史数据已经确定。
2. **在现有表中添加物化视图** - 需要向已填充历史数据并且数据已经流入的设置中添加新的物化视图。

我们假设数据将从对象存储进行回填。在所有情况下，我们的目标是避免数据插入的暂停。

我们建议从对象存储回填历史数据。应尽可能将数据导出为 Parquet 格式，以获得最佳的读取性能和压缩（减少网络传输）。通常，约 150MB 的文件大小是比较理想的，但 ClickHouse 支持超过 [70 种文件格式](/interfaces/formats)，能够处理各种大小的文件。
## 使用重复表和视图 {#using-duplicate-tables-and-views}

对于所有场景，我们依赖于“重复表和视图”的概念。这些表和视图代表的是用于实时流数据的副本，允许在隔离状态下执行回填，并在发生故障时提供简单的恢复方案。例如，我们有以下主 `pypi` 表和物化视图，用于计算每个 Python 项目的下载次数：

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

我们用一部分数据填充主表和相关视图：

```sql
INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{000..100}.parquet')

0 rows in set. Elapsed: 15.702 sec. Processed 4123 万行, 3.94 GB (每秒 263 万行, 每秒 251.01 MB.)
峰值内存使用量: 977.49 MiB.

SELECT count() FROM pypi

┌──count()─┐
│ 20612750 │ -- 2061.27万
└──────────┘

1 row in set. Elapsed: 0.004 sec.

SELECT sum(count)
FROM pypi_downloads


┌─sum(count)─┐
│   20612750 │ -- 2061.27万
└────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 96150 行, 769.23 KB (每秒 1653 万行, 每秒 132.26 MB.)
峰值内存使用量: 682.38 KiB.
```

假设我们希望加载另一个子集 `{101..200}`。虽然我们可以直接插入到 `pypi` 中，但我们可以通过创建重复表在隔离状态下进行此回填。

如果回填失败，我们不会影响主表，可以简单地 [truncate](/managing-data/truncate) 重复表并重复操作。

要创建这些视图的新副本，我们可以使用 `CREATE TABLE AS` 子句，后缀为 `_v2`：

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

我们用第二个子集进行填充，大小大致相同，并确认成功加载。

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')

0 rows in set. Elapsed: 17.545 sec. Processed 4080 万行, 3.90 GB (每秒 233 万行, 每秒 222.29 MB.)
峰值内存使用量: 991.50 MiB.

SELECT count()
FROM pypi_v2

┌──count()─┐
│ 20400020 │ -- 2040.00万
└──────────┘

1 row in set. Elapsed: 0.004 sec.

SELECT sum(count)
FROM pypi_downloads_v2

┌─sum(count)─┐
│   20400020 │ -- 2040.00万
└────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 95490 行, 763.90 KB (每秒 1481 万行, 每秒 118.45 MB.)
峰值内存使用量: 688.77 KiB.
```

如果在这个第二次加载过程中发生故障，我们可以简单地 [truncate](/managing-data/truncate) `pypi_v2` 和 `pypi_downloads_v2` 并重复加载数据。

在数据加载完成后，我们可以通过 [`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table) 子句将数据从重复表移动到主表。

```sql
ALTER TABLE pypi
 (MOVE PARTITION () FROM pypi_v2)

0 rows in set. Elapsed: 1.401 sec.

ALTER TABLE pypi_downloads
 (MOVE PARTITION () FROM pypi_downloads_v2)

0 rows in set. Elapsed: 0.389 sec.
```

:::note 分区名称
上述 `MOVE PARTITION` 调用使用了分区名称 `()`。这表示该表的单个分区（该表未分区）。对于分区表，用户需要调用多个 `MOVE PARTITION` 调用 - 每个分区一个。当前分区的名称可以从 [`system.parts`](/operations/system-tables/parts) 表中获得，例如 `SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')`。
:::

我们现在可以确认 `pypi` 和 `pypi_downloads` 包含完整的数据。可以安全地删除 `pypi_v2` 和 `pypi_downloads_v2`。

```sql
SELECT count()
FROM pypi

┌──count()─┐
│ 41012770 │ -- 4101.27万
└──────────┘

1 row in set. Elapsed: 0.003 sec.

SELECT sum(count)
FROM pypi_downloads

┌─sum(count)─┐
│   41012770 │ -- 4101.27万
└────────────┘

1 row in set. Elapsed: 0.007 sec. Processed 19164 行, 1.53 MB (每秒 2734 万行, 每秒 218.74 MB.)

SELECT count()
FROM pypi_v2
```

重要的是，`MOVE PARTITION` 操作既轻量级（利用硬链接）又是原子操作，即它要么失败，要么成功，没有中间状态。

我们在下面的回填场景中大力利用此过程。

请注意，此过程要求用户选择每个插入操作的大小。

较大的插入即更多行，意味着更少的 `MOVE PARTITION` 操作。但是，必须在插入失败的情况下（例如，由于网络中断）进行恢复时，权衡这些成本。用户可以通过批量文件来补充此过程以降低风险。这可以通过范围查询（例如 `WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00`）或通配符模式进行。例如，

```sql
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{101..200}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{201..300}.parquet')
INSERT INTO pypi_v2 SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/1734393600-000000000{301..400}.parquet')
--持续直到所有文件加载完成或执行 MOVE PARTITION 调用
```

:::note
ClickPipes 在从对象存储加载数据时使用这种方法，自动创建目标表及其物化视图的重复副本，而无需用户执行上述步骤。通过使用多个工作线程，每个线程处理不同的子集（通过通配符模式）并具有自己的重复表，数据可以快速加载，并确保执行一次语义。有关更多信息，请参考 [这篇博客](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)。
:::
## 场景 1：用现有数据摄取回填数据 {#scenario-1-backfilling-data-with-existing-data-ingestion}

在这种情况下，我们假设要回填的数据不在一个孤立的存储桶中，因此需要进行筛选。数据已经在插入，并且可以确定一个时间戳或单调递增的列，从中回填历史数据。

该过程遵循以下步骤：

1. 确定检查点 - 要恢复的历史数据的时间戳或列值。
2. 为主表和物化视图的目标表创建副本。
3. 创建指向步骤（2）中创建的目标表的任何物化视图的副本。
4. 插入之前在步骤（2）中创建的重复主表中。
5. 将所有分区从重复表移动到它们的原始版本。删除重复表。

例如，在我们的 PyPI 数据中，假设我们已加载数据。我们可以确定最小时间戳，也就是我们的“检查点”。

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

1 row in set. Elapsed: 0.163 sec. Processed 1.34 亿行, 5.37 GB (每秒 82.4 亿行, 每秒 32.96 GB.)
峰值内存使用量: 227.84 MiB.
```

从上面我们知道我们需要加载的数据是在 `2024-12-17 09:00:00` 之前。使用我们早前的方法，我们创建重复表和视图，并使用时间戳的过滤器加载子集。

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

0 rows in set. Elapsed: 500.152 sec. Processed 27.4 亿行, 364.40 GB (每秒 547 万行, 每秒 728.59 MB.)
```
:::note
对 Parquet 中的时间戳列进行筛选非常高效。ClickHouse 将仅读取时间戳列以确定要加载的完整数据范围，从而最小化网络流量。Parquet 索引，如最小-最大索引，也可以被 ClickHouse 查询引擎利用。
:::

一旦插入完成，我们可以移动相关的分区。

```sql
ALTER TABLE pypi
 (MOVE PARTITION () FROM pypi_v2)

ALTER TABLE pypi_downloads
 (MOVE PARTITION () FROM pypi_downloads_v2)
```

如果历史数据在一个孤立的存储桶中，则不需要上述时间过滤。如果没有时间列或单调列，请隔离您的历史数据。

:::note 只需在 ClickHouse Cloud 中使用 ClickPipes
ClickHouse Cloud 用户应使用 ClickPipes 恢复历史备份，如果数据可以在自己的存储桶中隔离（不需要过滤）。通过多个工作线程并行化加载，从而减少加载时间，ClickPipes 自动执行上述过程 - 为主表和物化视图创建重复表。
:::
## 场景 2：在现有表中添加物化视图 {#scenario-2-adding-materialized-views-to-existing-tables}

在设置中填充了重要数据时，常常需要添加新的物化视图，同时数据也在插入。在这里，时间戳或单调递增的列非常有用，可以用于标识流中的一个点，并避免数据插入的暂停。在下面的示例中，我们假设这两种情况，优先考虑避免插入暂停的方法。

:::note 避免使用 POPULATE
我们不建议对回填物化视图使用 [`POPULATE`](/sql-reference/statements/create/view#materialized-view) 命令，除非对于数据量较小且暂停插入的情况。此操作可能会错过插入到源表中的行，因为物化视图是在 populate 哈希完成后创建的。此外，此 populate 将对所有数据运行，并且在大数据集上容易受到中断或内存限制的影响。
:::
### 可用的时间戳或单调递增列 {#timestamp-or-monotonically-increasing-column-available}

在这种情况下，我们建议新物化视图包含一个过滤器，只限制大于未来某个任意时间的数据。随后，可以使用主表的历史数据从该日期回填物化视图。回填方法取决于数据量和相关查询的复杂性。

我们最简单的方法包括以下步骤：

1. 创建一个物化视图，其过滤器仅考虑大于未来任意时间的数据。
2. 运行一个 `INSERT INTO SELECT` 查询，将数据插入到物化视图的目标表中，从源表读取并执行视图的聚合查询。

这可以在步骤（2）中进一步增强，针对数据子集，并/或使用物化视图的重复目标表（在插入完成后将分区附加到原始表）以便于故障后的恢复。

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

虽然我们可以添加目标表，在添加物化视图之前，我们修改其 `SELECT` 子句，以包含一个筛选器，仅考虑大于一个未来的任意时间的数据 - 在这种情况下，我们假设 `2024-12-17 09:00:00` 是几分钟后的时间。

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```

一旦该视图添加，我们可以回填此数据之前的所有物化视图的数据。

执行此操作的最简单方法是直接对主表运行物化视图的查询，并使用过滤器忽略最近添加的数据，通过 `INSERT INTO SELECT` 将结果插入到视图的目标表中。例如，对于上述视图：

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

0 rows in set. Elapsed: 2.830 sec. Processed 7.99 亿行, 17.40 GB (每秒 282.28 万行, 每秒 6.15 GB.)
峰值内存使用量: 543.71 MiB.
```

:::note
在上面的示例中，我们的目标表是 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。在这种情况下，我们可以简单地使用原始聚合查询。对于更复杂的用例，采用 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)，用户将使用 `-State` 函数进行聚合。相关示例可以在 [这里](/integrations/s3/performance#be-aware-of-merges) 找到。
:::

在我们的例子中，这是一个相对轻量级的聚合，完成时间不到 3 秒，内存使用量少于 600 MiB。对于复杂或较长时间运行的聚合，用户可以通过使用之前的重复表方法，使此过程更加可靠，即创建一个阴影目标表，例如 `pypi_downloads_per_day_v2`，将数据插入到这个表中，并在插入完成后将其结果分区移至 `pypi_downloads_per_day`。

通常，物化视图的查询可能更复杂（这并不罕见，否则用户就不会使用视图！），并且会消耗资源。在更少见的情况下，查询所需的资源超出服务器资源。 这突显了 ClickHouse 物化视图的一个优点 - 它们是增量的，不会一次性处理整个数据集！

在这种情况下，用户有几个选择：

1. 修改你的查询以回填范围，例如 `WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00`，`WHERE timestamp BETWEEN 2024-12-17 07:00:00 AND 2024-12-17 08:00:00` 等等。
2. 使用 [Null 表引擎](/engines/table-engines/special/null) 来填充物化视图。这模拟了物化视图的典型增量填充，在数据块上执行查询（可配置大小）。

（1）表示通常足够的最简单的方法。为了简洁起见，我们不包含示例。

我们在下文进一步探讨（2）。
#### 使用 Null 表引擎填充物化视图 {#using-a-null-table-engine-for-filling-materialized-views}

[Null 表引擎](/engines/table-engines/special/null) 提供了一种不持久化数据的存储引擎（可以把它视为表引擎世界中的 `/dev/null`）。尽管这似乎是自相矛盾的，但物化视图仍然会在插入此表引擎的数据时执行。这允许在不持久化原始数据的情况下构建物化视图 - 避免 I/O 和相关存储。

重要的是，任何附加到表引擎的物化视图在插入数据块时仍然会执行 - 将其结果发送到目标表。这些块的大小是可配置的。虽然较大的块可能更高效（处理速度更快），但它们会消耗更多资源（主要是内存）。使用此表引擎意味着我们可以增量构建物化视图，即一次处理一个块，从而避免在内存中存储整个聚合。

<img src={nullTableMV} class="image" alt="ClickHouse 中的非规范化" style={{width: '50%', background: 'none'}} />

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

在这里，我们创建了一个 Null 表 `pypi_v2`，接收将用于构建物化视图的行。请注意我们只限制所需的列架构。我们的物化视图对插入到该表的数据执行聚合（一次一个块），并将结果发送到我们的目标表 `pypi_downloads_per_day`。

:::note
在这里我们使用 `pypi_downloads_per_day` 作为目标表。为了提高可靠性，用户可以创建一个重复表 `pypi_downloads_per_day_v2`，并将其用作视图的目标表，如之前的示例所示。在插入完成后，可以将 `pypi_downloads_per_day_v2` 中的分区移至 `pypi_downloads_per_day`。这将允许在由于内存问题或服务器中断而导致插入失败的情况下进行恢复，即我们只需截断 `pypi_downloads_per_day_v2`，调整设置并重试。
:::

要填充此物化视图，我们只需从 `pypi` 插入相关数据以回填到 `pypi_v2`。

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0 rows in set. Elapsed: 27.325 sec. Processed 15.00 亿行, 33.48 GB (每秒 547.3 万行, 每秒 1.23 GB.)
峰值内存使用量: 639.47 MiB.
```

请注意，此处的内存使用量为 `639.47 MiB`。
##### 调优性能和资源 {#tuning-performance--resources}

几个因素将决定上述场景中的性能和使用资源。我们建议读者在尝试调整之前了解插入机制的详细文档 [这里](/integrations/s3/performance#using-threads-for-reads)。简而言之：

- **读取并行度** - 用于读取的线程数量。通过 [`max_threads`](/operations/settings/settings#max_threads) 控制。在 ClickHouse Cloud 中， 根据实例规模来决定，默认为 vCPU 的数量。增加此值可能会在增加内存使用的同时提高读取性能。
- **插入并行度** - 用于插入的线程数量。通过 [`max_insert_threads`](/operations/settings/settings#max_insert_threads) 控制。在 ClickHouse Cloud 中，根据实例大小（在 2 到 4 之间）进行决定，在 OSS 中设置为 1。增加此值可能会在增加内存使用的同时提高性能。
- **插入块大小** - 数据在循环中处理，从中提取、解析并形成基于 [partitioning key](/engines/table-engines/mergetree-family/custom-partitioning-key) 的内存插入块。这些块被排序、优化、压缩并作为新的 [data parts](/parts) 写入存储。插入块的大小通过设置 [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) 和 [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（未压缩）进行控制，影响内存使用和磁盘 I/O。较大的块使用更多内存，但会创建更少的部分，从而减少 I/O 和后台合并。这些设置代表最小阈值（达到任何一个阈值会触发 Flush）。
- **物化视图块大小** - 除了主插入的上述机制外，在物化视图中插入之前，块也会被挤压以提高效率。这些块的大小由设置 [`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views) 和 [`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views) 确定。较大的块可在提高效率的同时消耗更多内存。 默认情况下，这些设置会重置为源表设置的值 [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) 和 [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)。

为提高性能，用户可以遵循 [这里](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts) 概述的指南。在大多数情况下，不需要修改 `min_insert_block_size_bytes_for_materialized_views` 和 `min_insert_block_size_rows_for_materialized_views`。如果修改，遵循与调整 `min_insert_block_size_rows` 和 `min_insert_block_size_bytes` 相同的最佳实践。

为尽量减少内存，用户可能希望尝试调整这些设置。这无疑会降低性能。如下例所示，我们展示了一些例子。

将 `max_insert_threads` 降低至 1 可减少我们的内存开销。

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1

0 rows in set. Elapsed: 27.752 sec. Processed 15.00 亿行, 33.48 GB (每秒 53.89 万行, 每秒 1.21 GB.)
峰值内存使用量: 506.78 MiB.
```

我们可以通过将 `max_threads` 设置为 1 进一步降低内存。

```sql
INSERT INTO pypi_v2
SELECT timestamp, project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1

Ok.

0 rows in set. Elapsed: 43.907 sec. Processed 15.00 亿行, 33.48 GB (每秒 34.06 万行, 每秒 762.54 MB.)
峰值内存使用量: 272.53 MiB.
```

最后，我们可以进一步降低内存，通过将 `min_insert_block_size_rows` 设置为 0（禁用其作为决定块大小的因素），并将 `min_insert_block_size_bytes` 设置为 10485760（10MiB）。

```sql
INSERT INTO pypi_v2
SELECT
    timestamp,
 project
FROM pypi
WHERE timestamp < '2024-12-17 09:00:00'
SETTINGS max_insert_threads = 1, max_threads = 1, min_insert_block_size_rows = 0, min_insert_block_size_bytes = 10485760

0 rows in set. Elapsed: 43.293 sec. Processed 15.00 亿行, 33.48 GB (每秒 34.54 万行, 每秒 773.36 MB.)
峰值内存使用量: 218.64 MiB.
```

最后，请注意，降低块大小会生成更多部分并造成更大的合并压力。如 [这里](/integrations/s3/performance#be-aware-of-merges) 所述，这些设置应谨慎修改。
### 没有时间戳或单调递增列 {#no-timestamp-or-monotonically-increasing-column}

上述过程依赖于用户拥有时间戳或单调递增列。在某些情况下，这些列可能根本不可用。在这种情况下，我们建议以下过程，这一过程利用了之前概述的许多步骤，但要求用户暂停数据插入。

1. 暂停向主表的插入。
2. 使用 `CREATE AS` 语法创建主目标表的副本。
3. 使用 [`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart) 将原始目标表的分区附加到副本中。**注意：** 此附加操作与先前使用的移动操作不同。虽然依赖于硬链接，但原始表中的数据是保留的。
4. 创建新的物化视图。
5. 重新启动插入。**注意：** 插入将仅更新目标表，而不是副本，副本将只引用原始数据。
6. 填充物化视图，使用副本表作为源，应用与包含时间戳的数据相同的过程。

考虑以下使用 PyPI 的示例以及我们之前的新物化视图 `pypi_downloads_per_day`（我们假设无法使用时间戳）：

```sql
SELECT count() FROM pypi

┌────count()─┐
│ 2039988137 │ -- 20.4 亿
└────────────┘

1 行在结果中。耗时：0.003 秒。

-- (1) 暂停插入
-- (2) 创建目标表的副本

CREATE TABLE pypi_v2 AS pypi

SELECT count() FROM pypi_v2

┌────count()─┐
│ 2039988137 │ -- 20.4 亿
└────────────┘

1 行在结果中。耗时：0.004 秒。

-- (3) 将原始目标表的分区附加到副本中。

ALTER TABLE pypi_v2
 (ATTACH PARTITION tuple() FROM pypi)

-- (4) 创建我们的新物化视图

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

-- (4) 重新启动插入。我们通过插入一行来进行复制。

INSERT INTO pypi SELECT *
FROM pypi
LIMIT 1

SELECT count() FROM pypi

┌────count()─┐
│ 2039988138 │ -- 20.4 亿
└────────────┘

1 行在结果中。耗时：0.003 秒。

-- 注意到 pypi_v2 包含与之前相同数量的行

SELECT count() FROM pypi_v2
┌────count()─┐
│ 2039988137 │ -- 20.4 亿
└────────────┘

-- (5) 使用备用 pypi_v2 填充视图

INSERT INTO pypi_downloads_per_day SELECT
 toStartOfHour(timestamp) as hour,
 project,
    count() AS count
FROM pypi_v2
GROUP BY
    hour,
 project

0 行在结果中。耗时：3.719 秒。处理了 20.4 亿 行，47.15 GB (548.57 万行/秒，12.68 GB/秒)

DROP TABLE pypi_v2;
```

在倒数第二步中，我们使用上述简单的 `INSERT INTO SELECT` 方法填充 `pypi_downloads_per_day`，该方法在 [早期](#timestamp-or-monotonically-increasing-column-available) 进行了描述。通过使用上述文档中记录的 Null 表方法，这一步骤也可以得到增强，并在需要时使用副本表以增强鲁棒性。

虽然此操作确实需要暂停插入，但通常可以迅速完成中间操作，从而最小化任何数据中断。
