import Image from '@theme/IdealImage';
import InsertMechanics from '@site/static/images/integrations/data-ingestion/s3/insert_mechanics.png';
import Pull from '@site/static/images/integrations/data-ingestion/s3/pull.png';
import Merges from '@site/static/images/integrations/data-ingestion/s3/merges.png';
import ResourceUsage from '@site/static/images/integrations/data-ingestion/s3/resource_usage.png';
import InsertThreads from '@site/static/images/integrations/data-ingestion/s3/insert_threads.png';
import S3Cluster from '@site/static/images/integrations/data-ingestion/s3/s3Cluster.png';
import HardwareSize from '@site/static/images/integrations/data-ingestion/s3/hardware_size.png';

This section focuses on optimizing performance when reading and inserting data from S3 using the [s3 table functions](/sql-reference/table-functions/s3). 

:::info
**本指南中描述的技巧可以应用于其他对象存储实现，它们有自己专用的表函数，例如 [GCS](/sql-reference/table-functions/gcs) 和 [Azure Blob 存储](/sql-reference/table-functions/azureBlobStorage)。**
:::

在调整线程和块大小以提高插入性能之前，我们建议用户了解 S3 插入的机制。如果您对插入机制很熟悉，或者只是想快速了解一些技巧，可以跳到我们下面的示例 [中](/integrations/s3/performance#example-dataset)。

## 插入机制 (单节点) {#insert-mechanics-single-node}

除了硬件规模外，有两个主要因素影响 ClickHouse 的数据插入机制的性能和资源使用（对于单个节点）：**插入块大小** 和 **插入并发性**。

### 插入块大小 {#insert-block-size}

<Image img={InsertMechanics} size="lg" border alt="插入块大小机制在 ClickHouse 中" />

当执行 `INSERT INTO SELECT` 时，ClickHouse 接收一些数据部分，① 从接收到的数据中形成（至少）一个内存中的插入块（按 [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)）。该块的数据会被排序，并应用特定于表引擎的优化。然后，数据被压缩并 ② 以新数据部分的形式写入数据库存储。

插入块大小影响 ClickHouse 服务器的 [磁盘文件 I/O 使用](https://en.wikipedia.org/wiki/Category:Disk_file_systems) 和内存使用。较大的插入块使用更多内存，但生成的初始部分更大且更少。ClickHouse 需要为加载大量数据创建的部分越少，磁盘文件 I/O 和自动的 [后台合并所需](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) 越少。

当结合使用 `INSERT INTO SELECT` 查询与集成表引擎或表函数时，数据由 ClickHouse 服务器拉取： 

<Image img={Pull} size="lg" border alt="从外部源拉取数据在 ClickHouse 中" />

在数据完全加载之前，服务器执行一个循环：

```bash
① Pull and parse the next portion of data and form an in-memory data block (one per partitioning key) from it.

② Write the block into a new part on storage.

Go to ① 
```

在 ① 中，大小取决于插入块大小，而该大小可以通过两个设置进行控制：

- [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)（默认：`1048545` 万行）
- [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（默认：`256 MiB`）

当在插入块中收集到指定行数或达到配置的数据量时（以先发生者为准），则会触发将该块写入新部分。插入循环在步骤 ① 处继续。

请注意，`min_insert_block_size_bytes` 值表示未压缩的内存块大小（而不是压缩的磁盘部分大小）。另外，请注意，创建的块和部分很少精确包含配置的行数或字节，因为 ClickHouse 通常以行- [块](/operations/settings/settings#max_block_size) 为单位流式传输和 [处理](https://clickhouse.com/company/events/query-performance-introspection) 数据。因此，这些设置指定最小阈值。

#### 注意合并 {#be-aware-of-merges}

配置的插入块大小越小，则为大量数据加载创建的初始部分就越多，并且与数据摄取并发执行的后台部分合并数量也越多。这可能导致资源争用（CPU 和内存），并需要额外的时间（以达到 [健康的](/operations/settings/merge-tree-settings#parts_to_throw_insert)（3000）部分数量），在摄取结束后。

:::important
如果部分数量超过 [推荐限制](/operations/settings/merge-tree-settings#parts_to_throw_insert)，ClickHouse 查询性能将受到负面影响。
:::

ClickHouse 将持续 [合并部分](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) 成为更大的部分，直到它们 [达到](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) ~150 GiB 的压缩大小。该图展示了 ClickHouse 服务器如何合并部分：

<Image img={Merges} size="lg" border alt="ClickHouse 的后台合并" />

单个 ClickHouse 服务器利用多个 [后台合并线程](/operations/server-configuration-parameters/settings#background_pool_size) 来执行并发的 [部分合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes)。每个线程执行一个循环：

```bash
① Decide which parts to merge next, and load these parts as blocks into memory.

② Merge the loaded blocks in memory into a larger block.

③ Write the merged block into a new part on disk.

Go to ①
```

请注意，增加 [CPU 核心数](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size) 和 RAM 大小会增加后台合并吞吐量。

合并成更大部分的部分被标记为 [不活动](/operations/system-tables/parts)，并在经过一个 [可配置的](/operations/settings/merge-tree-settings#old_parts_lifetime) 处理分钟后最终删除。随着时间的推移，这会创建一个合并部分的树（因此名称 [`MergeTree`](/engines/table-engines/mergetree-family) 表）。

### 插入并发性 {#insert-parallelism}

<Image img={ResourceUsage} size="lg" border alt="插入并发资源使用" />

ClickHouse 服务器可以并行处理和插入数据。插入并发性的级别对 ClickHouse 服务器的摄取吞吐量和内存使用产生影响。并行加载和处理数据需要更多主内存，但由于数据快速处理，提高了摄取吞吐量。

像 s3 这样的表函数允许通过全局模式指定要加载的文件名称集。当全局模式匹配多个现有文件时，ClickHouse 可以在这些文件之间和内部并行读取，并利用并行运行的插入线程将数据并行插入到表中（每个服务器）： 

<Image img={InsertThreads} size="lg" border alt="ClickHouse 中的并行插入线程" />

在所有文件中的所有数据处理完之前，每个插入线程执行一个循环： 

```bash
① Get the next portion of unprocessed file data (portion size is based on the configured block size) and create an in-memory data block from it.

② Write the block into a new part on storage.

Go to ①. 
```

此类并行插入线程的数量可以通过 [`max_insert_threads`](/operations/settings/settings#max_insert_threads) 设置进行配置。开放源代码 ClickHouse 的默认值为 `1`，而 [ClickHouse Cloud](https://clickhouse.com/cloud) 的默认值为 4。

在大量文件的情况下，多插入线程的并行处理效果良好。它可以充分利用可用的 CPU 核心和网络带宽（用于并行文件下载）。在仅将一些大型文件加载到表中时，ClickHouse 会自动建立高水平的数据处理并行性，并通过每个插入线程生成额外的读取线程，以并行读取（下载）大型文件中的更多不同范围，从而优化网络带宽使用。 

对于 s3 函数和表，单个文件的并行下载由以下值决定: [max_download_threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) 和 [max_download_buffer_size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size)。只有当文件大小大于 `2 * max_download_buffer_size` 时，文件才会并行下载。默认情况下，`max_download_buffer_size` 设置为 10MiB。在某些情况下，您可以安全地将此缓冲区大小增加到 50 MB (`max_download_buffer_size=52428800`)，确保每个文件仅由单个线程下载。这可以减少每个线程进行 S3 调用的时间，从而也降低 S3 等待时间。此外，对于太小而无法并行读取的文件，为了提高吞吐量，ClickHouse 会自动异步预读这些文件的数据。

## 测量性能 {#measuring-performance}

在对 S3 表函数的查询进行性能优化时，需要考虑两个场景：即实时查询数据，即只使用 ClickHouse 计算并且数据保留在 S3 的原始格式，以及将数据从 S3 插入到 ClickHouse MergeTree 表引擎中。除非另有说明，以下建议适用于这两种情况。

## 硬件规模的影响 {#impact-of-hardware-size}

<Image img={HardwareSize} size="lg" border alt="硬件规模对 ClickHouse 性能的影响" />

可用的 CPU 核心数和 RAM 大小影响：

- 支持的 [初始部分大小](#insert-block-size)
- 可能的 [插入并发性](#insert-parallelism)
- [后台部分合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) 的吞吐量

因此，影响整体摄取吞吐量。

## 区域位置 {#region-locality}

确保您的存储桶位于与 ClickHouse 实例相同的区域。这个简单的优化可以显著提高吞吐量性能，尤其是当您在 AWS 基础架构上部署 ClickHouse 实例时。

## 格式 {#formats}

ClickHouse 可以使用 `s3` 函数和 `S3` 引擎读取存储在 S3 存储桶中的 [支持格式](/interfaces/formats#formats-overview) 的文件。如果读取原始文件，这些格式中的一些具有独特的优点：

* 具有编码列名的格式，例如 Native、Parquet、CSVWithNames 和 TabSeparatedWithNames，将在查询时更少冗长，因为用户无需在 `s3` 函数中指定列名。这些列名允许推断此信息。
* 不同格式在读取和写入吞吐量方面的性能会有所不同。由于 Native 和 parquet 已经是列式的并且更加紧凑，它们在读取性能方面代表最优格式。原生格式还因与 ClickHouse 如何在内存中存储数据对齐而受益，从而减少进入 ClickHouse 的数据流处理开销。
* 块大小通常会影响对大文件的读取延迟。如果您只对数据进行采样，例如返回顶级 N 行，这一点就非常明显。在 CSV 和 TSV 等格式中，必须解析文件以返回一组行。Native 和 Parquet 等格式将因此允许更快的采样。
* 每种压缩格式都有其优缺点，通常在速度和偏向压缩或解压缩性能之间平衡。如果压缩原始文件（如 CSV 或 TSV），lz4 提供最快的解压缩性能，但牺牲了压缩水平。Gzip 通常以略慢的读取速度获得更好的压缩。Xz 通常提供最佳的压缩，但压缩和解压缩性能最慢。如果需要导出，Gz 和 lz4 提供了可比的压缩速度。根据您的连接速度权衡这一点。由于较慢的连接速度，很快的解压缩或压缩带来的任何收益都将很容易被抵消。
* Native 或 parquet 格式通常不足以证明压缩开销的合理性。由于这些格式本身就紧凑，所以数据量的任何节省都可能是微不足道的。压缩和解压缩所花费的时间很少能够抵消网络传输时间，特别是因为 S3 是全球可用的，且具有更高的网络带宽。

## 示例数据集 {#example-dataset}

为了进一步说明潜在的优化目的，我们将使用 [Stack Overflow 数据集中的帖子](/data-modeling/schema-design#stack-overflow-dataset) - 优化此数据的查询和插入性能。 

该数据集由 189 个 Parquet 文件组成，每个月一个，从 2008 年 7 月到 2024 年 3 月。

请注意，我们出于性能考虑使用 Parquet，根据我们的 [上述建议](#formats)，在与存储桶位于同一地区的 ClickHouse 集群上执行所有查询。该集群有 3 个节点，每个节点具有 32GiB 的 RAM 和 8 个 vCPU。

在没有调整的情况下，我们演示将此数据集插入到 MergeTree 表引擎的性能，以及执行查询以计算提问最多的用户。这两个查询故意需要对数据进行完全扫描。

```sql
-- Top usernames
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 3.013 sec. Processed 59.82 million rows, 24.03 GB (19.86 million rows/s., 7.98 GB/s.)
Peak memory usage: 603.64 MiB.

-- Load into posts table
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')

0 rows in set. Elapsed: 191.692 sec. Processed 59.82 million rows, 24.03 GB (312.06 thousand rows/s., 125.37 MB/s.)
```

在我们的示例中，我们仅返回几行。如果在 `SELECT` 查询上测量性能，返回大量数据给客户端时，可以使用 [null 格式](/interfaces/formats/#null) 进行查询，或将结果直接导向 [`Null` 引擎](/engines/table-engines/special/null.md)。这样可以避免客户端被数据淹没和网络饱和。

:::info
在查询处理中，初始查询通常看起来比重复同一查询更慢。这可以归因于 S3 自身的缓存，以及 [ClickHouse 模式推断缓存](/operations/system-tables/schema_inference_cache)。该缓存存储了文件的推断模式，这意味着在后续访问时可以跳过推断步骤，从而减少查询时间。
:::

## 使用线程进行读取 {#using-threads-for-reads}

在 S3 上读取性能会随着核心数量的增加而线性扩展，前提是您不受网络带宽或本地 I/O 的限制。增加线程数量也会增加用户需要注意的内存开销。为了提高读取吞吐量性能，以下参数可以进行修改：

* 通常，`max_threads` 的默认值就足够了，即核心数量。如果查询使用的内存量很高，需要降低该量，或者结果的 `LIMIT` 很低，则可以将此值设置得更低。拥有大量内存的用户可能希望尝试增加此值，以期获得更高的 S3 读取吞吐量。通常这仅对核心较少的机器有利，即 &lt; 10。进一步的并行化带来的好处通常会随着其他资源作为瓶颈而减小，例如网络和 CPU 争用。
* 22.3.1 之前的 ClickHouse 版本仅在使用 `s3` 函数或 `S3` 表引擎时在多个文件之间并行读取。这要求用户确保文件在 S3 上被拆分成多个部分，并使用全局模式读取，才能实现最佳读取性能。后来的版本现在在文件内部并行下载。
* 在低线程计数的情况下，用户可以通过将 `remote_filesystem_read_method` 设置为 "read" 来使 S3 的文件同步读取。
* 对于 s3 函数和表，单个文件的并行下载由 [`max_download_threads`](/operations/settings/settings#max_download_threads) 和 [`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size) 的值决定。虽然 [`max_download_threads`](/operations/settings/settings#max_download_threads) 控制使用的线程数，但只有当文件大小大于 2 * `max_download_buffer_size` 时，文件才会并行下载。默认情况下，`max_download_buffer_size` 设置为 10MiB。在某些情况下，您可以安全地将此缓冲区大小增至 50 MB (`max_download_buffer_size=52428800`)，以确保较小文件仅由单个线程下载。这可以减少每个线程进行 S3 调用的时间，从而减少 S3 等待时间。请参阅 [这篇博文](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge) 查看示例。

在进行任何改进性能的更改之前，请确保进行适当测量。由于 S3 API 调用对延迟敏感并可能影响客户端时机，请使用查询日志来获取性能指标，即 `system.query_log`。

考虑我们之前的查询，将 `max_threads` 翻倍到 `16`（默认 `max_thread` 是节点的核心数），提高了我们读取查询的性能，提升了 2 倍，但代价是更高的内存。进一步增加 `max_threads` 将会收益递减，如下所示。

```sql
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 16

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 1.505 sec. Processed 59.82 million rows, 24.03 GB (39.76 million rows/s., 15.97 GB/s.)
Peak memory usage: 178.58 MiB.

SETTINGS max_threads = 32

5 rows in set. Elapsed: 0.779 sec. Processed 59.82 million rows, 24.03 GB (76.81 million rows/s., 30.86 GB/s.)
Peak memory usage: 369.20 MiB.

SETTINGS max_threads = 64

5 rows in set. Elapsed: 0.674 sec. Processed 59.82 million rows, 24.03 GB (88.81 million rows/s., 35.68 GB/s.)
Peak memory usage: 639.99 MiB.
```

## 调整插入的线程和块大小 {#tuning-threads-and-block-size-for-inserts}

为了实现最佳的数据摄取性能，您必须选择 (1) 插入块大小，(2) 基于 (3) 可用的 CPU 核心和 RAM 的适当插入并发级别。总之：

- 我们越大地 [配置插入块大小](#insert-block-size)，ClickHouse 需要创建的部分就越少，同时 [磁盘文件 I/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems) 和 [后台合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) 所需的也越少。  
- 我们 [配置的并行插入线程数越高](#insert-parallelism)，数据处理速度就越快。

这两个性能因素之间存在冲突的权衡（加上与后台部分合并的权衡）。ClickHouse 服务器的可用主内存有限。较大的块使用更多主内存，从而限制我们可以利用的并行插入线程数。相反，较高数量的并行插入线程需要更多主内存，因为插入线程数决定了内存中并发创建的插入块数。这限制了插入块的可能大小。此外，插入线程与后台合并线程之间可能存在资源争用。配置的高数量插入线程 (1) 创建的部分需要合并更多，并且 (2) 会占用背景合并线程的 CPU 核心和内存空间。

有关这些参数的行为如何影响性能和资源的详细描述，建议 [阅读这篇博文](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)。正如在这篇博文中所述，调节可能涉及仔细平衡这两个参数。这种详尽的测试通常是不切实际的，因此，归纳一下，我们建议：

```bash
• max_insert_threads: choose ~ half of the available CPU cores for insert threads (to leave enough dedicated cores for background merges)

• peak_memory_usage_in_bytes: choose an intended peak memory usage; either all available RAM (if it is an isolated ingest) or half or less (to leave room for other concurrent tasks)

Then:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

使用此公式，您可以将 `min_insert_block_size_rows` 设置为 0（以禁用基于行的阈值），同时将 `max_insert_threads` 设置为所选值，并将 `min_insert_block_size_bytes` 设置为上述公式计算的结果。

使用此公式与我们之前的 Stack Overflow 示例。

- `max_insert_threads=4` （每个节点 8 个核心）
- `peak_memory_usage_in_bytes` - 32 GiB（节点资源的 100%）或 `34359738368` 字节。
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```

如上所示，调整这些设置已将插入性能提高了超过 `33%`。我们将此留给读者查看他们是否能进一步提升单节点性能。

## 资源和节点的扩展 {#scaling-with-resources-and-nodes}

资源和节点的扩展适用于读取和插入查询。

### 垂直扩展 {#vertical-scaling}

之前的所有调优和查询只使用了我们 ClickHouse Cloud 集群中的单个节点。用户通常会有多个 ClickHouse 节点可用。我们建议用户最初进行垂直扩展，随着核心数量的增加线性提高 S3 吞吐量。如果我们在资源是之前的两倍（64GiB，16 vCPUs）的大 ClickHouse Cloud 节点上重复我们之前的插入和读取查询，两个查询的执行速度约会快两倍。

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=8, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 67.294 sec. Processed 59.82 million rows, 24.03 GB (888.93 thousand rows/s., 357.12 MB/s.)

SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 92

5 rows in set. Elapsed: 0.421 sec. Processed 59.82 million rows, 24.03 GB (142.08 million rows/s., 57.08 GB/s.)
```

:::note
单个节点也可能会因网络和 S3 GET 请求而成为瓶颈，阻止性能的线性垂直扩展。
:::

### 水平扩展 {#horizontal-scaling}

最终，由于硬件可用性和成本效益，通常需要进行水平扩展。在 ClickHouse Cloud 中，生产集群至少有 3 个节点。因此，用户可能还希望利用所有节点进行插入。

利用集群进行 S3 读取需要使用如 [Utilizing Clusters](/integrations/s3#utilizing-clusters) 中所述的 `s3Cluster` 函数。这允许在节点之间分布读取操作。  

最初接收插入查询的服务器首先解析全局模式，然后动态地将每个匹配文件的处理分发给自己和其他服务器。

<Image img={S3Cluster} size="lg" border alt="ClickHouse 中的 s3Cluster 函数" />

我们重复之前的读取查询，在 3 个节点上分配工作负载，并调整查询以使用 `s3Cluster`。在 ClickHouse Cloud 中，这会自动执行，通过参考 `default` 集群。

如 [Utilizing Clusters](/integrations/s3#utilizing-clusters) 中所述，这项工作按文件级别进行分配。要充分利用此功能，用户需要有足够数量的文件，即至少 > 节点数。

```sql
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 16

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 0.622 sec. Processed 59.82 million rows, 24.03 GB (96.13 million rows/s., 38.62 GB/s.)
Peak memory usage: 176.74 MiB.
```

同样，我们的插入查询可以使用之前为单节点识别的改进设置进行分布：

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```

读者会注意到文件读取已提高查询但未提高插入性能。默认情况下，尽管使用 `s3Cluster` 分配读取，但插入会发生在初始节点上。这意味着尽管读取会在每个节点上进行，结果行将被路由到启动节点进行分发。在高吞吐量场景中，这可能会成为瓶颈。为解决此问题，请为 `s3cluster` 函数设置参数 `parallel_distributed_insert_select`。

将其设置为 `parallel_distributed_insert_select=2`，可确保 `SELECT` 和 `INSERT` 在每个节点的底层分布式引擎的每个分片上执行。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```

如预期的那样，这将插入性能降低了 3 倍。

## 进一步优化 {#further-tuning}

### 禁用去重 {#disable-de-duplication}

插入操作有时可能由于超时等错误而失败。当插入失败时，数据可能成功插入，也可能未插入。为了允许客户端安全地重试插入，在像 ClickHouse Cloud 这样的分布式部署中，ClickHouse 会尝试确定数据是否已经成功插入。如果插入的数据被标记为重复，ClickHouse 将不会将其插入目标表。然而，用户仍然会收到成功的操作状态，仿佛数据已正常插入。

虽然在从客户端或批量加载数据时，这种会导致插入开销的行为是合理的，但在执行来自对象存储的 `INSERT INTO SELECT` 时可能是多余的。通过在插入时禁用此功能，我们可以提高性能，如下所示：

```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0 rows in set. Elapsed: 52.992 sec. Processed 59.82 million rows, 24.03 GB (1.13 million rows/s., 453.50 MB/s.)
Peak memory usage: 26.57 GiB.
```

### 在插入时优化 {#optimize-on-insert}

在 ClickHouse 中，`optimize_on_insert` 设置控制数据部分是否在插入过程中合并。当启用时（默认 `optimize_on_insert = 1`），小部分会在插入时合并为更大的部分，从而通过减少需要读取的部分数量来提高查询性能。然而，这种合并给插入过程增加了开销，可能会减慢高吞吐量的插入。

禁用此设置（`optimize_on_insert = 0`）会在插入过程中跳过合并，从而使数据更快地写入，特别是在处理频繁的小插入时。合并过程被推迟到后台，从而允许更好的插入性能，但会暂时增加小部分的数量，这可能会在后台合并完成之前减慢查询。当插入性能是优先事项，而后台合并过程可以高效处理优化时，此设置是理想的。如下所示，禁用设置可以提高插入吞吐量：

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```

## 其他注意事项 {#misc-notes}

* 在低内存场景下，考虑在插入到 S3 时降低 `max_insert_delayed_streams_for_parallel_write`。
