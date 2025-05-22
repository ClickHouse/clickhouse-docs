import nullTableMV from '@site/static/images/data-modeling/null_table_mv.png';
import Image from '@theme/IdealImage';

# 回填数据

无论是新接触 ClickHouse 还是负责现有部署，用户在不可避免地需要用历史数据回填表格。在某些情况下，这相对简单，但在需要填充物化视图时可能会变得更复杂。本指南记录了用户可以应用于自身用例的一些流程。

:::note
本指南假设用户已经了解[增量物化视图](/materialized-view/incremental-materialized-view)的概念和[使用表函数（如 s3 和 gcs）进行数据加载](/integrations/s3)。我们还建议用户阅读关于[优化对象存储的插入性能](/integrations/s3/performance)的指南，其建议可以应用于本指南中的插入操作。
:::

## 示例数据集 {#example-dataset}

在本指南中，我们使用 PyPI 数据集。此数据集中的每一行代表使用 `pip` 等工具下载的 Python 包。

例如，子集覆盖了一天 - `2024-12-17`，并且可以在 `https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/` 上公开获取。用户可以使用以下查询：

```sql
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/2024-12-17/*.parquet')

┌────count()─┐
│ 2039988137 │ -- 2.04 billion
└────────────┘

1 row in set. Elapsed: 32.726 sec. Processed 2.04 billion rows, 170.05 KB (62.34 million rows/s., 5.20 KB/s.)
Peak memory usage: 239.50 MiB.
```

此桶的完整数据集包含超过 320 GB 的 parquet 文件。在下面的示例中，我们故意使用 glob 模式来定位子集。

我们假定用户正在消费来自此日期后数据的流，例如，通过 Kafka 或对象存储。此数据的模式如下所示：

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
完整的 PyPI 数据集，由超过 1 万亿行组成，已在我们的公共演示环境 [clickpy.clickhouse.com](https://clickpy.clickhouse.com) 中提供。有关此数据集的更多详细信息，包括演示如何利用物化视图提高性能以及数据如何每天填充，见[这里](https://github.com/ClickHouse/clickpy)。
:::

## 回填场景 {#backfilling-scenarios}

回填通常是在从某一特定时间点消耗数据流时需要进行的。这些数据正被插入到带有[增量物化视图](/materialized-view/incremental-materialized-view)的 ClickHouse 表中，随着块的插入而触发。这些视图可能会在插入之前转换数据或计算聚合，并将结果发送到目标表，以便后续在下游应用中使用。

我们将尝试涵盖以下场景：

1. **在现有数据摄取中回填数据** - 新数据正在加载，历史数据需要回填。这些历史数据已被识别。
2. **向现有表添加物化视图** - 需要向已经填充了历史数据并且数据已经流入的设置中添加新的物化视图。

我们假设数据将从对象存储中回填。在所有情况下，我们的目标是避免数据插入的暂停。

我们建议从对象存储回填历史数据。数据应尽可能导出为 Parquet，以获得最佳的读取性能和压缩（减少网络传输）。通常，推荐的文件大小约为 150MB，但 ClickHouse 支持超过[70种文件格式](/interfaces/formats)，并能够处理所有大小的文件。

## 使用重复表和视图 {#using-duplicate-tables-and-views}

对于所有场景，我们依赖于“重复表和视图”的概念。这些表和视图代表用于实时流数据的副本，并允许能够以独立的状态进行回填，如果出错，则容易恢复。例如，我们有以下主要 `pypi` 表及物化视图，该物化视图计算每个 Python 项目的下载次数：

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

我们用数据的一个子集填充主要表及相关视图：

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

假设我们希望加载另一个子集 `{101..200}`。虽然我们可以直接插入到 `pypi`，但我们可以通过创建重复表来在孤立的状态下进行此回填。

如果回填失败，则不会影响我们的主要表，我们可以简单地[截断](/managing-data/truncate)我们的重复表并重试。

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

我们用大约相同大小的第二个子集填充该表，并确认加载成功。

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

如果在第二次加载过程中的任何时候遇到失败，我们可以简单地[截断](/managing-data/truncate)我们的 `pypi_v2` 和 `pypi_downloads_v2`，然后重复数据加载。

随着数据加载完成，我们可以通过 [`ALTER TABLE MOVE PARTITION`](/sql-reference/statements/alter/partition#move-partition-to-table) 子句将数据从我们的重复表移动到主要表。

```sql
ALTER TABLE pypi
 (MOVE PARTITION () FROM pypi_v2)

0 rows in set. Elapsed: 1.401 sec.

ALTER TABLE pypi_downloads
 (MOVE PARTITION () FROM pypi_downloads_v2)

0 rows in set. Elapsed: 0.389 sec.
```

:::note 分区名称
上述的 `MOVE PARTITION` 调用使用了分区名称 `()`。这表示该表的单个分区（未进行分区）。对于分区表，用户将需要调用多个 `MOVE PARTITION` 调用 - 每个分区一个。当前分区的名称可以通过 [`system.parts`](/operations/system-tables/parts) 表确定，例如 `SELECT DISTINCT partition FROM system.parts WHERE (table = 'pypi_v2')`。
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

重要的是， `MOVE PARTITION` 操作是轻量级的（利用硬链接）和原子的，即它要么失败，要么成功，没有中间状态。

我们在下面的回填场景中广泛利用此过程。

请注意，这一过程要求用户选择每个插入操作的大小。

较大的插入即更多行，将意味着需要更少的 `MOVE PARTITION` 操作。然而，必须平衡插入失败时的成本，例如由于网络中断时进行恢复。用户可以通过批量文件来补充此过程，以降低风险。这可以通过范围查询，例如 `WHERE timestamp BETWEEN 2024-12-17 09:00:00 AND 2024-12-17 10:00:00` 或使用 glob模式来执行。例如：

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
ClickPipes 在从对象存储加载数据时使用此方法，自动创建目标表及其物化视图的重复副本，避免用户执行上述步骤。通过使用多个工作线程，每个线程处理不同的子集（通过 glob 模式）并拥有自己的重复表，可以快速加载数据，确保一次性语义。有关详细信息，请参见[这篇博客](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)。
:::

## 场景1：在现有数据摄取中回填数据 {#scenario-1-backfilling-data-with-existing-data-ingestion}

在此场景中，我们假设要回填的数据不在孤立的桶中，因此需要进行过滤。数据已在插入，并且可以识别出一个时间戳或单调递增的列，从中需要回填历史数据。

此过程遵循以下步骤：

1. 确定检查点 - 时间戳或需要恢复的历史数据的列值。
2. 创建主要表和物化视图的目标表的副本。
3. 创建指向在步骤 (2) 中创建的目标表的任何物化视图的副本。
4. 将数据插入到我们在步骤 (2) 中创建的重复主要表中。
5. 将所有分区从重复表移动到其原始版本。删除重复表。

例如，在我们的 PyPI 数据中，假设我们已加载了数据。我们可以识别出最小的时间戳，从而确定我们的“检查点”。

```sql
SELECT min(timestamp)
FROM pypi

┌──────min(timestamp)─┐
│ 2024-12-17 09:00:00 │
└─────────────────────┘

1 row in set. Elapsed: 0.163 sec. Processed 1.34 billion rows, 5.37 GB (8.24 billion rows/s., 32.96 GB/s.)
Peak memory usage: 227.84 MiB.
```

从上述信息，我们知道需要加载数据在 `2024-12-17 09:00:00` 之前。使用我们早期的过程，我们创建重复表和视图，并使用时间戳的过滤器加载子集。

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
在 Parquet 中对时间戳列进行过滤可以非常高效。 ClickHouse 将仅读取时间戳列以确定要加载的完整数据范围，从而最小化网络流量。ClickHouse 查询引擎还可以利用 Parquet 索引，例如 min-max。
:::

一旦插入完成，我们可以移动相关的分区。

```sql
ALTER TABLE pypi
 (MOVE PARTITION () FROM pypi_v2)

ALTER TABLE pypi_downloads
 (MOVE PARTITION () FROM pypi_downloads_v2)
```

如果历史数据是一个孤立的桶，则不需要上述时间过滤。如果没有时间或单调列，请将历史数据进行隔离。

:::note 只需在 ClickHouse Cloud 中使用 ClickPipes
如果数据可以在自己的桶中进行隔离（并且不需要过滤），ClickHouse Cloud 用户应使用 ClickPipes 来恢复历史备份。通过多个工作并行化加载，从而减少加载时间，ClickPipes 自动化上述过程 - 为主表和物化视图创建重复表。
:::

## 场景2：向现有表添加物化视图 {#scenario-2-adding-materialized-views-to-existing-tables}

在一个设置中，需要向已填充了大量数据并且数据正在插入的表中添加新的物化视图，这并不少见。此时有时间戳或单调递增的列是非常有用的，避免了数据摄取的暂停。在下面的示例中，我们假设两种情况，偏好避免数据摄取的暂停。

:::note 避免使用 POPULATE
我们不建议使用 [`POPULATE`](/sql-reference/statements/create/view#materialized-view) 命令来回填物化视图，除非是对小数据集且插入处于暂停状态。此操作可能会漏掉在其源表中插入的行，物化视图会在填充哈希完成后创建。此外，此填充将针对所有数据运行，并且在大型数据集上容易受到中断或内存限制的影响。
:::

### 可用时间戳或单调递增列 {#timestamp-or-monotonically-increasing-column-available}

在这种情况下，我们建议新的物化视图包含一个过滤器，该过滤器限制行数为将来任意数据更大的行。随后可以使用来自主表的历史数据从这个时间开始回填该物化视图。回填方法依赖于数据的大小和相关查询的复杂性。

我们最简单的方法涉及以下步骤：

1. 创建我们的物化视图，并添加一个过滤器，仅考虑将来某个任意时间之前的行。
2. 执行一个 `INSERT INTO SELECT` 查询，该查询从源表读取数据，并插入到我们物化视图的目标表中，执行视图的聚合查询。

这可以进一步增强，以在步骤 (2) 中针对数据的子集，并/或为物化视图使用重复目标表（在插入完成后将分区附加到原始表）以便于在失败后恢复。

考虑以下物化视图，它计算每小时最流行的项目。

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

在添加目标表之前，我们在添加物化视图之前修改其 `SELECT` 子句，以包括一个过滤器，仅考虑将来某个任意时间之前的行 - 在此情况下，我们假设 `2024-12-17 09:00:00` 是几分钟后的时间。

```sql
CREATE MATERIALIZED VIEW pypi_downloads_per_day_mv TO pypi_downloads_per_day
AS SELECT
 toStartOfHour(timestamp) as hour,
 project, count() AS count
FROM pypi WHERE timestamp >= '2024-12-17 09:00:00'
GROUP BY hour, project
```

一旦添加此视图，我们可以在此数据之前回填所有物化视图的数据。

最简单的方法是直接运行主表上物化视图的查询，使用一个过滤器忽略最近添加的数据，将结果通过 `INSERT INTO SELECT` 插入到我们视图的目标表中。例如，对于上述视图：

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
在上述示例中，我们的目标表是 [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)。在这种情况下，我们可以简单使用原始的聚合查询。对更复杂的用例，利用 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 的用户将对聚合使用 `-State` 函数。这方面的示例可以在[这里]( /integrations/s3/performance#be-aware-of-merges)找到。
:::

在我们的例子中，这是一个相对轻量的聚合，在 3 秒内完成并使用不到 600MiB 的内存。对于更复杂或耗时较长的聚合，用户可以通过使用前面的重复表方法来增强此流程，即创建一个影子目标表，例如 `pypi_downloads_per_day_v2`，将数据插入其中，并将其结果分区附加到 `pypi_downloads_per_day`。

物化视图的查询通常可能非常复杂（否则用户不会使用视图！）并且消耗资源。在更少见的情况下，查询的资源超出了服务器的能力。这突显了 ClickHouse 物化视图的一个优势 - 它们是增量的，并且不会一次性处理整个数据集！

在这种情况下，用户有几个选项：

1. 修改查询以回填范围，例如 `WHERE timestamp BETWEEN 2024-12-17 08:00:00 AND 2024-12-17 09:00:00`，`WHERE timestamp BETWEEN 2024-12-17 07:00:00 AND 2024-12-17 08:00:00` 等等。
2. 使用 [Null 表引擎](/engines/table-engines/special/null) 填充物化视图。这模拟了物化视图的典型增量填充，在可配置大小的数据块上执行其查询。

（1）代表了最简单的方法，通常是足够的。我们没有包括示例以简化内容。

我们将在下面进一步探讨（2）。

#### 使用 Null 表引擎填充物化视图 {#using-a-null-table-engine-for-filling-materialized-views}

[Null 表引擎](/engines/table-engines/special/null) 提供了一种不持久化数据的存储引擎（可以把它想象成表引擎世界中的 `/dev/null`）。虽然这似乎是矛盾的，但物化视图仍将执行插入到这个表引擎中的数据。这允许在不持久化原始数据的情况下构建物化视图 - 避免了 I/O 和相关存储。

重要的是，任何附加到表引擎的物化视图仍然会在插入时对数据块执行操作 - 将它们的结果发送到目标表。这些数据块的大小是可配置的。虽然较大的数据块可能具有更高的效率（并且处理速度更快），但它们消耗更多的资源（主要是内存）。使用此表引擎意味着我们可以增量建立物化视图，即一次处理一个数据块，从而避免将整个聚合保存在内存中。

<Image img={nullTableMV} size="md" alt="在 ClickHouse 中的反范式化"/>

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

在这里，我们创建了一个 Null 表 `pypi_v2` 来接收将用于构建我们物化视图的行。请注意，我们仅限于需要的列。我们的物化视图在插入到此表的行上执行聚合（每次一块），并将结果发送到我们的目标表 `pypi_downloads_per_day`。

:::note
在这里我们使用 `pypi_downloads_per_day` 作为目标表。为了额外的鲁棒性，用户可以创建一个重复表 `pypi_downloads_per_day_v2`，并将其用作视图的目标表，如前面的示例所示。在插入完成后，`pypi_downloads_per_day_v2` 中的分区可以转移到 `pypi_downloads_per_day`。这将允许我们在由于内存问题或服务器中断而导致插入失败的情况下进行恢复，即我们只需截断 `pypi_downloads_per_day_v2`，调整设置并重试。
:::

要填充此物化视图，我们只需将相关数据从 `pypi` 插入到 `pypi_v2` 中以进行回填。

```sql
INSERT INTO pypi_v2 SELECT timestamp, project FROM pypi WHERE timestamp < '2024-12-17 09:00:00'

0 rows in set. Elapsed: 27.325 sec. Processed 1.50 billion rows, 33.48 GB (54.73 million rows/s., 1.23 GB/s.)
Peak memory usage: 639.47 MiB.
```

请注意，此时我们的内存使用量为 `639.47 MiB`。

##### 调优性能与资源 {#tuning-performance--resources}

多个因素将决定上述场景中的性能和资源使用情况。在尝试进行调优之前，我们建议读者了解[优化 S3 插入和读取性能指南](/integrations/s3/performance)中详细记录的插入机制。总结如下：

- **读取并行性** - 用于读取的线程数。通过 [`max_threads`](/operations/settings/settings#max_threads) 控制。在 ClickHouse Cloud 中，这由实例大小决定，默认情况下为 vCPU 的数量。增加此值可能会提高读取性能，但会增加内存使用量。
- **插入并行性** - 用于插入的插入线程数。通过 [`max_insert_threads`](/operations/settings/settings#max_insert_threads) 控制。在 ClickHouse Cloud 中，这由实例大小（在 2 至 4 之间）决定，在 OSS 中设置为 1。增加此值可能会提高性能，但会增加内存使用量。
- **插入块大小** - 数据在循环中处理，从中提取、解析，并形成基于 [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key) 的内存插入块。这些块会被排序、优化、压缩，并作为新的 [数据片段](/parts) 写入存储。插入块的大小由设置 [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) 和 [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（未压缩）控制，影响内存使用量和磁盘 I/O。较大的块使用更多内存，但会创建更少的片段，减少 I/O 和后台合并。这些设置表示最小阈值（首先达到的触发刷新）。
- **物化视图块大小** - 除了对主插入的上述机制外，在插入到物化视图之前，块也会被压缩以获得更高效率。块的大小由设置 [`min_insert_block_size_bytes_for_materialized_views`](/operations/settings/settings#min_insert_block_size_bytes_for_materialized_views) 和 [`min_insert_block_size_rows_for_materialized_views`](/operations/settings/settings#min_insert_block_size_rows_for_materialized_views) 决定。更大的块允许在消耗更多内存的情况下实现更高效的处理。默认情况下，这些设置恢复为源表设置的值 [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) 和 [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)。

为了提高性能，用户可以遵循[调优插入线程和块大小的指南](/integrations/s3/performance#tuning-threads-and-block-size-for-inserts)中的建议。在大多数情况下，不必修改 `min_insert_block_size_bytes_for_materialized_views` 和 `min_insert_block_size_rows_for_materialized_views` 以提高性能。如果进行修改，请使用与 `min_insert_block_size_rows` 和 `min_insert_block_size_bytes` 讨论的相同最佳实践。

为了最小化内存使用，用户可能希望尝试这些设置。这无疑会降低性能。通过早先的查询，我们在下面展示了示例。

将 `max_insert_threads` 降低至 1 将减少我们的内存开销。

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

我们可以通过将 `max_threads` 设置为 1 进一步降低内存。

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

最后，我们可以通过将 `min_insert_block_size_rows` 设置为 0（禁用作为块大小的决定因素）和将 `min_insert_block_size_bytes` 设置为 10485760（10MiB）进一步降低内存。

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

最后，请注意，降低块大小会产生更多的片段并造成更大的合并压力。正如[这里讨论的](/integrations/s3/performance#be-aware-of-merges)，这些设置应谨慎更改。

### 无时间戳或单调递增列 {#no-timestamp-or-monotonically-increasing-column}

上述流程依赖于用户具有时间戳或单调递增列。在某些情况下，这根本无法获得。在这种情况下，我们建议执行以下流程，利用之前概述的大部分步骤，但要求用户暂停摄取数据。

1. 暂停对主表的插入。
2. 使用 `CREATE AS` 语法创建主目标表的副本。
3. 使用 [`ALTER TABLE ATTACH`](/sql-reference/statements/alter/partition#attach-partitionpart) 将原目标表的分区附加到副本上。**注意：**此附加操作与之前使用的移动不同。虽然依赖于硬链接，但原表中的数据仍然保留。
4. 创建新的物化视图。
5. 重新启动插入。**注意：**插入将仅更新目标表，而未更新重复表，后者仅引用原始数据。
6. 回填物化视图，应用与上述带时间戳的数据相同的过程，使用重复表作为来源。

考虑以下使用 PyPI 和我们以前的新物化视图 `pypi_downloads_per_day` 的示例（我们假设无法使用时间戳）：

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

在倒数第二步中，我们使用我们简单的 `INSERT INTO SELECT` 方法回填 `pypi_downloads_per_day`，该方法在[前面](#timestamp-or-monotonically-increasing-column-available)描述。这也可以使用上述[使用 Null 表引擎填充物化视图](#using-a-null-table-engine-for-filling-materialized-views)的方法进一步增强，选择性地使用重复表以获得更高的鲁棒性。

虽然此操作确实需要暂停插入，但中间操作通常可以快速完成，从而最小化任何数据中断。
