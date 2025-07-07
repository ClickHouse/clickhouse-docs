---
'slug': '/integrations/s3/performance'
'sidebar_position': 2
'sidebar_label': '优化性能'
'title': '优化 S3 插入和读取性能'
'description': '优化 S3 读取和插入的性能'
---

import Image from '@theme/IdealImage';
import InsertMechanics from '@site/static/images/integrations/data-ingestion/s3/insert_mechanics.png';
import Pull from '@site/static/images/integrations/data-ingestion/s3/pull.png';
import Merges from '@site/static/images/integrations/data-ingestion/s3/merges.png';
import ResourceUsage from '@site/static/images/integrations/data-ingestion/s3/resource_usage.png';
import InsertThreads from '@site/static/images/integrations/data-ingestion/s3/insert_threads.png';
import S3Cluster from '@site/static/images/integrations/data-ingestion/s3/s3Cluster.png';
import HardwareSize from '@site/static/images/integrations/data-ingestion/s3/hardware_size.png';

这一部分关注于在使用 [s3 表函数](/sql-reference/table-functions/s3) 从 S3 中读取和插入数据时优化性能。

:::info
**本指南中描述的课程可以应用于其他对象存储实现，以及它们自己的专用表函数，如 [GCS](/sql-reference/table-functions/gcs) 和 [Azure Blob 存储](/sql-reference/table-functions/azureBlobStorage)。**
:::

在调整线程和块大小以提高插入性能之前，我们建议用户理解 S3 插入的机制。如果您熟悉插入机制，或者只想快速了解一些技巧，可以跳到我们下面的示例 [中](/integrations/s3/performance#example-dataset)。

## 插入机制（单节点） {#insert-mechanics-single-node}

除了硬件大小外，影响 ClickHouse 数据插入机制（对于单节点）的两个主要因素是：**插入块大小**和**插入并发性**。

### 插入块大小 {#insert-block-size}

<Image img={InsertMechanics} size="lg" border alt="Insert block size mechanics in ClickHouse" />

在执行 `INSERT INTO SELECT` 时，ClickHouse 接收一些数据部分，并 ① 从接收到的数据中形成（至少）一个内存中的插入块（根据 [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)）。该块的数据是排序的，并且应用了特定于表引擎的优化。然后，数据被压缩并 ② 以新的数据部分的形式写入数据库存储。

插入块大小会影响 ClickHouse 服务器的 [磁盘文件 I/O 使用情况](https://en.wikipedia.org/wiki/Category:Disk_file_systems) 和内存使用情况。更大的插入块使用更多的内存，但生成更大且初始部分较少的块。ClickHouse 为加载大量数据所需创建的部分越少，所需的磁盘文件 I/O 和自动 [后台合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) 越少。

在将 `INSERT INTO SELECT` 查询与集成表引擎或表函数结合使用时，数据由 ClickHouse 服务器拉取： 

<Image img={Pull} size="lg" border alt="Pulling data from external sources in ClickHouse" />

在数据完全加载之前，服务器执行一个循环：

```bash
① Pull and parse the next portion of data and form an in-memory data block (one per partitioning key) from it.

② Write the block into a new part on storage.

Go to ① 
```

在 ① 中，大小依赖于插入块大小，可以通过两个设置进行控制：

- [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) (默认：`1048545` 行)
- [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) (默认：`256 MiB`)

当插入块中收集到指定的行数或达到配置的数据量（以先发生者为准）时，将触发该块写入新部分。插入循环在步骤 ① 中继续。

请注意，`min_insert_block_size_bytes` 值表示未压缩的内存块大小（而不是压缩后的磁盘部分大小）。此外，请注意，创建的块和部分通常不精确包含配置的行数或字节，因为 ClickHouse 是以行-[块](/operations/settings/settings#max_block_size) 的方式流式处理和 [处理](https://clickhouse.com/company/events/query-performance-introspection) 数据。因此，这些设置指定的是最小阈值。

#### 注意合并 {#be-aware-of-merges}

配置的插入块大小越小，对于大量数据加载，创建的初始部分就越多，并且在数据摄取过程中同时执行的后台部分合并就越多。这可能导致资源争用（CPU 和内存），并且在摄取完成后需要额外的时间（以达到 [健康](/operations/settings/merge-tree-settings#parts_to_throw_insert) 状态的部分数量（3000））。

:::important
如果部分数量超过 [推荐限制](/operations/settings/merge-tree-settings#parts_to_throw_insert)，ClickHouse 查询性能将受到负面影响。
:::

ClickHouse 将持续 [合并部分](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) 成为更大的部分，直到它们 [达到](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 大约 150 GiB 的压缩大小。该图展示了 ClickHouse 服务器如何合并部分：

<Image img={Merges} size="lg" border alt="Background merges in ClickHouse" />

单个 ClickHouse 服务器利用多个 [后台合并线程](/operations/server-configuration-parameters/settings#background_pool_size) 执行并发 [部分合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes)。每个线程执行一个循环：

```bash
① Decide which parts to merge next, and load these parts as blocks into memory.

② Merge the loaded blocks in memory into a larger block.

③ Write the merged block into a new part on disk.

Go to ①
```

请注意，增加 [CPU 核心](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size) 数量和 RAM 大小会提高后台合并的吞吐量。

已经合并成更大部分的部分将被标记为 [非活动](/operations/system-tables/parts)，并在 [可配置](/operations/settings/merge-tree-settings#old_parts_lifetime) 的几分钟后最终删除。随着时间的推移，这创造了一个合并部分的树（因此 [`MergeTree`](/engines/table-engines/mergetree-family) 表名的由来）。

### 插入并发性 {#insert-parallelism}

<Image img={ResourceUsage} size="lg" border alt="Resource usage for insert parallelism" />

ClickHouse 服务器可以并行处理和插入数据。插入并发性的级别会影响 ClickHouse 服务器的数据输入吞吐量和内存使用情况。并行加载和处理数据需要更多的主内存，但数据处理速度更快，从而提高输入吞吐量。

像 s3 这样的表函数允许通过 glob 模式指定要加载的文件名集。当 glob 模式匹配多个现有文件时，ClickHouse 可以在这些文件之间以及内部并行读取，并通过并行运行的插入线程（每台服务器）将数据并行插入到表中：

<Image img={InsertThreads} size="lg" border alt="Parallel insert threads in ClickHouse" />

在所有文件中的所有数据被处理之前，每个插入线程执行一个循环：

```bash
① Get the next portion of unprocessed file data (portion size is based on the configured block size) and create an in-memory data block from it.

② Write the block into a new part on storage.

Go to ①. 
```

这种并行插入线程的数量可以通过 [`max_insert_threads`](/operations/settings/settings#max_insert_threads) 设置进行配置。对于开源 ClickHouse，默认值为 `1`，对于 [ClickHouse Cloud](https://clickhouse.com/cloud) 为 4。

当文件数量较多时，多个插入线程的并行处理效果很好。它可以充分利用可用的 CPU 核心和网络带宽（用于并行文件下载）。在只有少量大文件将被加载到表中的情况下，ClickHouse 会自动建立较高级别的数据处理并行性，并通过为每个插入线程生成额外的读取线程，以并行方式读取（下载）大文件中的更多不同范围，从而优化网络带宽的使用。

对于 s3 函数和表，单个文件的并行下载由值 [max_download_threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) 和 [max_download_buffer_size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size) 决定。只有当文件大小大于 `2 * max_download_buffer_size` 时，才会并行下载文件。默认情况下，`max_download_buffer_size` 默认为 10MiB。在某些情况下，您可以安全地将此缓冲区大小增加到 50 MB (`max_download_buffer_size=52428800`)，以确保每个文件仅由单个线程下载。这可以减少每个线程进行 S3 调用的时间，从而降低 S3 等待时间。此外，对于过小而无法并行读取的文件，ClickHouse 会通过异步预读取此类文件来自动预取数据以提高吞吐量。

## 测量性能 {#measuring-performance}

使用 S3 表函数优化查询性能的要求，在于运行对原数据的查询，即使用 ClickHouse 计算而数据保持在 S3 中的原始格式，以及在将数据从 S3 插入到 ClickHouse MergeTree 表引擎时。除非另有说明，以下建议适用于这两种情况。

## 硬件大小的影响 {#impact-of-hardware-size}

<Image img={HardwareSize} size="lg" border alt="Impact of hardware size on ClickHouse performance" />

可用的 CPU 核心数量和 RAM 大小会影响到：

- 支持的 [初始部分大小](#insert-block-size)
- 可能的 [插入并发性](#insert-parallelism)
- [后台部分合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) 的吞吐量

因此，整体的输入吞吐量。

## 区域本地性 {#region-locality}

确保您的存储桶位于与您的 ClickHouse 实例相同的区域。这一简单的优化可以显著提高吞吐量性能，尤其是在您将 ClickHouse 实例部署在 AWS 基础设施上时。

## 格式 {#formats}

ClickHouse 可以使用 `s3` 函数和 `S3` 引擎读取存储在 S3 存储桶中的 [支持格式](/interfaces/formats#formats-overview) 的文件。如果读取原始文件，这些格式有一些明显的优势：

* 具有编码列名的格式，如 Native、Parquet、CSVWithNames 和 TabSeparatedWithNames 在查询时将更简洁，因为用户不需要在 `s3` 函数中指明列名。列名允许推断此信息。
* 格式在读取和写入吞吐量方面表现不同。Native 和 parquet 代表了读取性能最优化的格式，因为它们已经是列式的，更加紧凑。Native 格式还受益于对 ClickHouse 在内存中存储数据方式的对齐，从而减少了在数据被流式传输到 ClickHouse 时的处理开销。
* 块大小会经常影响大文件的读取延迟。如果您仅采样数据，例如返回前 N 行，这一点非常明显。在 CSV 和 TSV 等格式中，必须解析文件以返回一组行。而 Native 和 Parquet 等格式则能更快地进行采样。
* 每种压缩格式都带来优缺点，通常在速度和压缩水平之间做出权衡，而偏向于压缩或解压缩性能。如果压缩原始文件，如 CSV 或 TSV，lz4 提供最快的解压性能，牺牲了压缩水平。Gzip 通常以稍慢的读取速度压缩得更好。Xz 则进一步提供最佳压缩，伴随最慢的压缩和解压性能。如果进行导出，Gz 和 lz4 提供可比的压缩速度。权衡这一点与您的连接速度。来自更快的解压或压缩的任何收益都可能被连接到 S3 存储桶的较慢速度所抵消。
* 像 native 或 parquet 这样的格式通常不值得压缩所带来的开销。数据大小的任何节省都可能是微乎其微的，因为这些格式本身就很紧凑。压缩和解压缩所花费的时间很少会抵消网络传输时间，尤其是因为 S3 在全球范围内可用，并且拥有更高的网络带宽。

## 示例数据集 {#example-dataset}

为了进一步说明潜在的优化，我们将使用 [来自 Stack Overflow 数据集的帖子](/data-modeling/schema-design#stack-overflow-dataset) - 优化此数据的查询和插入性能。

该数据集由 189 个 Parquet 文件构成，每个月一个，从 2008 年 7 月到 2024 年 3 月。

请注意，我们使用 Parquet 以提高性能，遵循我们上述的 [建议](#formats)，在与存储桶位于同一地区的 ClickHouse 集群上执行所有查询。该集群有 3 个节点，每个节点有 32GiB 的内存和 8 个 vCPU。

在没有调整的情况下，我们演示将此数据集插入 MergeTree 表引擎的性能以及执行查询以计算提问最多的用户。这两个查询故意需要对数据进行全面扫描。

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

在我们的示例中，我们只返回几行。如果测量 `SELECT` 查询的性能，当向客户端返回大量数据时，使用 [null 格式](/interfaces/formats/#null) 查询，或者将结果直接指向 [`Null` 引擎](/engines/table-engines/special/null.md)。这应避免客户端被数据淹没以及网络饱和。

:::info
当从查询读取时，初始查询的速度通常比重复相同查询时要慢。这可以归因于 S3 自身的缓存，也可以归因于 [ClickHouse 架构推断缓存](/operations/system-tables/schema_inference_cache)。这存储了文件的推断架构，意味着可以跳过后续访问中的推断步骤，从而减少查询时间。
:::

## 使用线程进行读取 {#using-threads-for-reads}

在 S3 上的读取性能将随核心数量线性扩展，前提是您没有受到网络带宽或本地 I/O 的限制。增加线程数量也会有内存开销，用户应注意。以下几点可以修改以改善读取吞吐量性能：

* 通常，默认值 `max_threads` 足够，即核心数量。如果查询所使用的内存量很高，并且需要降低，或者结果的 `LIMIT` 很低，则可以将此值设置得较低。内存充足的用户可能希望尝试增加此值，以期从 S3 获取更高的读取吞吐量。通常，这在核心数量较少的机器上（即 &lt; 10）更有利。由于其他资源会成为瓶颈，例如网络和 CPU 竞争，进一步的并行化通常会降低效益。
* 22.3.1 之前的 ClickHouse 版本仅在使用 `s3` 函数或 `S3` 表引擎时跨多个文件并行读取。这需要用户确保文件在 S3 中分割成块，并使用 glob 模式读取以实现最佳读取性能。后来的版本现在能够在文件内部并行下载。
* 在低线程计算场景中，用户可以通过将 `remote_filesystem_read_method` 设置为 "read"，促使从 S3 中同步读取文件，从而受益。
* 对于 s3 函数和表，单个文件的并行下载由 [设置的值](https://clickhouse.com/doc/en/operations/settings/settings/#max_download_threads) [`max_download_threads`](/operations/settings/settings#max_download_threads) 和 [`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size) 决定。虽然 [`max_download_threads`](/operations/settings/settings#max_download_threads) 控制线程数量，但仅在文件大小大于 2 * `max_download_buffer_size` 时，文件才会被并行下载。默认情况下，`max_download_buffer_size` 默认为 10MiB。在某些情况下，您可以安全地将此缓冲区大小提高至 50 MB (`max_download_buffer_size=52428800`)，以确保较小的文件仅由单个线程下载。这可以减少每个线程进行 S3 调用的时间，从而降低 S3 等待时间。有关示例，请参见 [这篇博客文章](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge)。

在进行任何性能改善的修改之前，请确保进行适当的测量。由于 S3 API 调用对延迟敏感，可能会影响客户端时间，因此使用查询日志来获取性能指标，即 `system.query_log`。

考虑我们之前的查询，将 `max_threads` 加倍至 `16`（默认 `max_thread` 为节点的核心数）可以将我们的读取查询性能提高 2 倍，但代价是更高的内存。进一步增加 `max_threads` 则回报递减，如下所示。

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

要实现最大摄取性能，您必须选择（1）一个插入块大小和（2）基于（3）可用的 CPU 核心和 RAM 大小的适当插入并发级别。总结：

- 我们越 [配置插入块大小](#insert-block-size)，ClickHouse 创建的部分就越少，所需的 [磁盘文件 I/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems) 和 [后台合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) 就越少。  
- 我们越高配置 [并行插入线程的数量](#insert-parallelism)，数据处理的速度就越快。

这两个性能因素之间存在相互矛盾的权衡（以及与后台部分合并的权衡）。ClickHouse 服务器的可用主内存是有限的。较大的块使用更多主内存，这限制了我们可以利用的并行插入线程数量。反之，较高的并行插入线程数量需要更多的主内存，因为插入线程的数量决定了内存中并发创建的插入块的数量。这限制了插入块的可能大小。此外，插入线程和后台合并线程之间也可能存在资源竞争。配置的插入线程数量较高会 (1) 创建需要合并的更多部分，(2) 从后台合并线程中抢夺 CPU 核心和内存空间。

有关这些参数的行为如何影响性能和资源的详细描述，我们建议 [阅读这篇博客文章](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)。如这篇博客文章所述，调整可能涉及对这两个参数的小心平衡。这种详尽的测试通常不切实际，因此，总的来说，我们建议：

```bash
• max_insert_threads: choose ~ half of the available CPU cores for insert threads (to leave enough dedicated cores for background merges)

• peak_memory_usage_in_bytes: choose an intended peak memory usage; either all available RAM (if it is an isolated ingest) or half or less (to leave room for other concurrent tasks)

Then:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

使用此公式，您可以将 `min_insert_block_size_rows` 设置为 0（以禁用基于行的阈值），同时将 `max_insert_threads` 设置为所选值，`min_insert_block_size_bytes` 设置为上述公式计算结果。

使用此公式与我们之前的 Stack Overflow 示例。

- `max_insert_threads=4`（每个节点 8 个核心）
- `peak_memory_usage_in_bytes` - 32 GiB（节点资源的 100%）或 `34359738368` 字节。
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```

如上所示，这些设置的调整将插入性能提高了超过 `33%`。我们将此留给读者看他们是否能进一步提高单节点性能。

## 随资源和节点的扩展 {#scaling-with-resources-and-nodes}

根据资源和节点扩展适用于读取和插入查询。

### 垂直扩展 {#vertical-scaling}

之前的所有调整和查询仅使用了我们 ClickHouse Cloud 集群中的单个节点。用户通常还会拥有多个 ClickHouse 节点。我们建议用户最初进行垂直扩展，随着核心数的增加线性提高 S3 吞吐量。如果我们在更大的 ClickHouse Cloud 节点上重复之前的插入和读取查询（资源增加一倍，64GiB，16 vCPUs），那么两者的执行速度约为原来的两倍。

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
单个节点也可能受到网络和 S3 GET 请求的瓶颈限制，从而妨碍垂直绩效线性扩展。
:::

### 水平扩展 {#horizontal-scaling}

最终，由于硬件可用性和成本效益，水平扩展通常是必要的。在 ClickHouse Cloud 中，生产集群至少有 3 个节点。因此，用户也可能希望为插入利用所有节点。

利用集群进行 S3 读取需要使用 `s3Cluster` 函数，如 [利用集群](/integrations/s3#utilizing-clusters) 中所述。这允许跨节点分配读取工作负载。 

最初接收插入查询的服务器首先解析 glob 模式，然后动态将每个匹配文件的处理分发到自身和其他服务器。

<Image img={S3Cluster} size="lg" border alt="s3Cluster function in ClickHouse" />

我们重复之前的读取查询，将工作负载分配到 3 个节点，并调整查询以使用 `s3Cluster`。在 ClickHouse Cloud 中通过引用 `default` 集群可以自动执行此操作。

如 [利用集群](/integrations/s3#utilizing-clusters) 中所述，此操作是以文件级别分布的。要受益于此功能，用户需要足够数量的文件，即数量必须大于节点数。

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

同样，我们的插入查询也可分配，使用之前针对单个节点识别的改进设置：

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```

读者会注意到文件读取的性能改善了查询，但插入性能没有。默认情况下，虽然读取是使用 `s3Cluster` 分布的，但插入将发生在发起节点上。这意味着尽管每个节点都会读取，但生成的行将被路由到发起者以进行分配。在高吞吐量场景中，这可能会成为瓶颈。为了解决这个问题，请为 `s3cluster` 函数设置参数 `parallel_distributed_insert_select`。

将其设置为 `parallel_distributed_insert_select=2`，可确保 `SELECT` 和 `INSERT` 将在每个节点的分布式引擎的底层表的每个分片上执行。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```

如预期的那样，这使插入性能降低了 3 倍。

## 进一步调整 {#further-tuning}

### 禁用去重 {#disable-de-duplication}

插入操作有时由于超时等错误而失败。当插入失败时，数据可能已插入，也可能未插入。为了允许客户端安全地重试插入，在 ClickHouse Cloud 等分布式部署中，ClickHouse 会尝试确定数据是否已经成功插入。如果插入的数据被标记为重复，ClickHouse 将不会将其插入到目标表中。然而，用户仍将收到成功的操作状态，仿佛数据已正常插入。

虽然在从客户端或批量加载数据时，这种行为（会导致插入开销）是有意义的，但在从对象存储执行 `INSERT INTO SELECT` 时可能是不必要的。通过在插入时禁用此功能，我们可以提高性能，如下所示：

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

在 ClickHouse 中，`optimize_on_insert` 设置控制在插入过程中是否合并数据部分。当启用时（默认 `optimize_on_insert = 1`），小的部分在插入时会合并成较大的部分，从而通过减少需要读取的部分数量来提高查询性能。然而，这种合并会增加插入过程的开销，可能会减缓大吞吐量插入的速度。

禁用此设置（`optimize_on_insert = 0`）会在插入期间跳过合并，从而更快地写入数据，尤其在处理频繁的小插入时。合并过程将推迟到后台，从而允许更好的插入性能，但暂时会增加小部分的数量，直到后台合并完成，这可能会减缓查询。在插入性能优先时，并且后台合并过程能够在稍后高效地处理优化时，设置是理想的。如下所示，禁用该设置可以提高插入吞吐量：

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```

## 其他说明 {#misc-notes}

* 对于低内存场景，如果插入到 S3，请考虑降低 `max_insert_delayed_streams_for_parallel_write`。
