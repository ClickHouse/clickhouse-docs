---
'slug': '/integrations/s3/performance'
'sidebar_position': 2
'sidebar_label': '优化性能'
'title': '优化 S3 插入和读取性能'
'description': '优化 S3 读取和插入性能'
---

import Image from '@theme/IdealImage';
import InsertMechanics from '@site/static/images/integrations/data-ingestion/s3/insert_mechanics.png';
import Pull from '@site/static/images/integrations/data-ingestion/s3/pull.png';
import Merges from '@site/static/images/integrations/data-ingestion/s3/merges.png';
import ResourceUsage from '@site/static/images/integrations/data-ingestion/s3/resource_usage.png';
import InsertThreads from '@site/static/images/integrations/data-ingestion/s3/insert_threads.png';
import S3Cluster from '@site/static/images/integrations/data-ingestion/s3/s3Cluster.png';
import HardwareSize from '@site/static/images/integrations/data-ingestion/s3/hardware_size.png';

本节着重于在使用 [s3 表函数](/sql-reference/table-functions/s3) 从 S3 读取和插入数据时优化性能。

:::info
**本指南中描述的课程可以应用于其他具有自己专用表函数的对象存储实现，如 [GCS](/sql-reference/table-functions/gcs) 和 [Azure Blob 存储](/sql-reference/table-functions/azureBlobStorage)。**
:::

在调整线程和块大小以提高插入性能之前，我们建议用户了解 S3 插入的机制。如果您熟悉插入机制，或只想要一些快速提示，可以跳到我们下面的示例 [below](/integrations/s3/performance#example-dataset)。

## 插入机制（单节点） {#insert-mechanics-single-node}

除了硬件大小外，有两个主要因素影响 ClickHouse 的数据插入机制的性能和资源使用（针对单节点）：**插入块大小**和 **插入并行性**。

### 插入块大小 {#insert-block-size}

<Image img={InsertMechanics} size="lg" border alt="ClickHouse 中的插入块大小机制" />

在执行 `INSERT INTO SELECT` 时，ClickHouse 接收一部分数据，并 ① 根据所接收的数据形成（至少）一个内存中的插入块（每个 [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)）。块的数据是有序的，并应用了表引擎特定的优化。然后数据被压缩并 ② 以新数据部分的形式写入数据库存储。

插入块大小会影响 ClickHouse 服务器的 [磁盘文件 I/O 使用](https://en.wikipedia.org/wiki/Category:Disk_file_systems) 和内存使用。更大的插入块会使用更多内存，但会生成更大且更少的初始部分。ClickHouse 在为加载大量数据创建的部分越少，磁盘文件 I/O 和自动的 [后台合并要求](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) 就越少。

当使用 `INSERT INTO SELECT` 查询与集成表引擎或表函数联合时，数据是由 ClickHouse 服务器提取的：

<Image img={Pull} size="lg" border alt="ClickHouse 中从外部源提取数据" />

在数据完全加载之前，服务器执行一个循环：

```bash
① Pull and parse the next portion of data and form an in-memory data block (one per partitioning key) from it.

② Write the block into a new part on storage.

Go to ① 
```

在 ① 中，大小取决于插入块大小，这可以通过两个设置进行控制：

- [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)（默认值：`1048545` 行）
- [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（默认值：`256 MiB`）

当收集到插入块中指定数量的行，或者达到配置的数据量（以先发生者为准），这会触发将块写入新的部分。插入循环在步骤 ① 继续。

请注意，`min_insert_block_size_bytes` 值表示未压缩的内存块大小（而不是压缩后的磁盘部分大小）。此外，请注意，创建的块和部分很少精确包含配置的行数或字节数，因为 ClickHouse 以行-[块](/operations/settings/settings#max_block_size) 方式流式处理和 [处理](https://clickhouse.com/company/events/query-performance-introspection) 数据。因此，这些设置指定了最小阈值。

#### 注意合并情况 {#be-aware-of-merges}

配置的插入块大小越小，生成的初始部分就越多，此时在数据加载的同时执行的后台部分合并也会越多。这可能会导致资源竞争（CPU 和内存），并在数据加载完成后需要更多时间（以达到 [健康](https://operations/settings/merge-tree-settings#parts_to_throw_insert)（3000）数量的部分）。

:::important
如果部分数量超过 [推荐限制](/operations/settings/merge-tree-settings#parts_to_throw_insert)，ClickHouse 查询性能将受到负面影响。
:::

ClickHouse 将持续 [合并部分](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) 为更大的部分，直到它们 [达到](https://operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) ~150 GiB 的压缩大小。下图展示了 ClickHouse 服务器如何合并部分：

<Image img={Merges} size="lg" border alt="ClickHouse 中的后台合并" />

单个 ClickHouse 服务器利用多个 [后台合并线程](/operations/server-configuration-parameters/settings#background_pool_size) 来执行并发的 [部分合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes)。每个线程执行一个循环：

```bash
① Decide which parts to merge next, and load these parts as blocks into memory.

② Merge the loaded blocks in memory into a larger block.

③ Write the merged block into a new part on disk.

Go to ①
```

请注意，增加 [CPU 内核数](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size) 和 RAM 大小会提高后台合并的吞吐量。

已合并为更大部分的部分被标记为 [不活动](/operations/system-tables/parts) ，并且在经过 [可配置](https://operations/settings/merge-tree-settings#old_parts_lifetime) 的分钟数后最终删除。随着时间的推移，这创建了一个合并部分的树（因此名为 [`MergeTree`](/engines/table-engines/mergetree-family) 表）。

### 插入并行性 {#insert-parallelism}

<Image img={ResourceUsage} size="lg" border alt="插入并行性的资源使用" />

ClickHouse 服务器可以并行处理和插入数据。插入并行性的水平会影响 ClickHouse 服务器的摄取吞吐量和内存使用。并行加载和处理数据需要更多的主内存，但可以提高摄取吞吐量，因为数据处理得更快。

像 s3 这样的表函数允许通过 glob 模式指定要加载的文件名集合。当 glob 模式匹配多个现有文件时，ClickHouse 可以在这些文件之间以及文件内部并行读取并利用并行运行的插入线程（每个服务器）将数据插入到表中：

<Image img={InsertThreads} size="lg" border alt="ClickHouse 中的并行插入线程" />

直到所有文件中的数据都被处理，每个插入线程执行一个循环：

```bash
① Get the next portion of unprocessed file data (portion size is based on the configured block size) and create an in-memory data block from it.

② Write the block into a new part on storage.

Go to ①. 
```

这样的并行插入线程的数量可以通过 [`max_insert_threads`](/operations/settings/settings#max_insert_threads) 设置进行配置。开源 ClickHouse 的默认值为 `1`，而 [ClickHouse Cloud](https://clickhouse.com/cloud) 的默认值为 4。

对于大量文件，多个插入线程的并行处理效果很好。它可以充分利用可用的 CPU 内核和网络带宽（用于并行文件下载）。在仅将少数大文件加载到表中时，ClickHouse 会自动建立较高的数据处理并行性，并通过为每个插入线程生成额外的读取线程，以并行方式在大文件中读取（下载）更多不同的范围，优化网络带宽使用。

对于 s3 函数和表，单个文件的并行下载由 [max_download_threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) 和 [max_download_buffer_size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size) 的值决定。文件仅在其大小大于 `2 * max_download_buffer_size` 时才会并行下载。默认情况下，`max_download_buffer_size` 设置为 10MiB。在某些情况下，您可以安全地将此缓冲区大小增加到 50 MB（`max_download_buffer_size=52428800`），目的是确保每个文件都由单个线程下载。这可以减少每个线程进行 S3 调用所花费的时间，从而降低 S3 等待时间。此外，对于过小而无法并行读取的文件，ClickHouse 会通过异步预读取这些文件来自动预取数据，以提高吞吐量。

## 性能测量 {#measuring-performance}

当对原始数据进行查询，即仅使用 ClickHouse 计算且数据保持在 S3 的原始格式时，使用 S3 表函数来优化查询性能是必要的，同时在将数据从 S3 插入到 ClickHouse MergeTree 表引擎时也是如此。除非另有说明，以下建议适用于这两种情况。

## 硬件大小的影响 {#impact-of-hardware-size}

<Image img={HardwareSize} size="lg" border alt="硬件大小对 ClickHouse 性能的影响" />

可用的 CPU 核心数和 RAM 大小影响：

- 支持的 [初始部分大小](#insert-block-size)
- 可能的 [插入并行性](#insert-parallelism)
- [后台部分合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) 的吞吐量

因此，整体摄取吞吐量。

## 区域局部性 {#region-locality}

确保您的桶位于与 ClickHouse 实例相同的区域。此简单的优化可以显著提高吞吐量性能，尤其是在您在 AWS 基础设施上部署 ClickHouse 实例时。

## 格式 {#formats}

ClickHouse 可以通过 `s3` 函数和 `S3` 引擎读取存储在 S3 桶中的 [支持格式](/interfaces/formats#formats-overview)。如果读取原始文件，某些格式具有明显的优势：

* 具有编码列名的格式，例如 Native、Parquet、CSVWithNames 和 TabSeparatedWithNames，在查询时将更简洁，因为用户不必在 `s3` 函数中指定列名。这些列名允许推断此信息。
* 格式在读取和写入吞吐量方面的表现会有所不同。Native 和 parquet 代表了读取性能的最优格式，因为它们已经是列式存储且更紧凑。Native 格式还受益于与 ClickHouse 将数据存储在内存中的方式的一致性 - 从而减少数据流入 ClickHouse 时的处理开销。
* 块大小通常会影响对大文件的读取延迟。如果您只采样数据，例如返回前 N 行，则这一点尤其明显。在像 CSV 和 TSV 这样的格式中，必须解析文件以返回一组行。原生格式和 Parquet 格式可更快地采样。
* 每种压缩格式都有其优缺点，通常在速度与压缩水平之间权衡。若对原始文件（如 CSV 或 TSV）进行压缩，lz4 提供最快的解压缩性能，而牺牲了压缩水平。Gzip 通常压缩效果更好，但牺牲了一些读取速度。Xz 更进一步，通常提供最佳的压缩率，但压缩和解压性能最慢。在导出时，Gz 和 lz4 提供可比拟的压缩速度。考虑到您的连接速度，任何从更快速解压或压缩中获得的好处都可能因到 S3 桶的连接速度较慢而被抵消。
* 像原生格式或 Parquet 格式通常不值得压缩所带来的开销。由于这些格式本质上是紧凑的，因此数据大小的任何节省可能是微不足道的。压缩和解压缩所花费的时间很少能抵消网络传输时间 - 尤其是因为 S3 在全球范围内可用且具有更高的网络带宽。

## 示例数据集 {#example-dataset}

为进一步说明潜在的优化目的，我们将使用 [Stack Overflow 数据集中的帖子](/data-modeling/schema-design#stack-overflow-dataset) - 优化此数据的查询和插入性能。

该数据集由 189 个 Parquet 文件组成，每个文件对应 2008 年 7 月至 2024 年 3 月的每个月。

请注意，我们出于性能考虑使用 Parquet，按照我们 [上面的建议](#formats)，在与桶位于同一地区的 ClickHouse 集群上执行所有查询。该集群有 3 个节点，每个节点具有 32GiB 的 RAM 和 8 个 vCPU。

在没有任何调优的情况下，我们展示将此数据集插入 MergeTree 表引擎的性能，以及执行计算提问最多的用户的查询。这两个查询都故意需要对数据的完整扫描。

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

在我们的示例中，我们只返回几行。如果要测量 `SELECT` 查询的性能，而返回给客户端的数据量较大，可以利用 [null 格式](/interfaces/formats/#null) 进行查询，或将结果直接定向到 [`Null` 引擎](/engines/table-engines/special/null.md)。这可以避免客户端因数据量过大而感到不堪重负，并导致网络饱和。

:::info
从查询中读取时，初始查询有时比重复该查询慢。这可以归因于 S3 自身的缓存以及 [ClickHouse 模式推断缓存](/operations/system-tables/schema_inference_cache)。这存储了文件的推断模式，因此可以在后续访问时跳过推断步骤，从而减少查询时间。
:::

## 使用线程进行读取 {#using-threads-for-reads}

S3 上的读取性能将随着核心数量的增加而线性扩展，前提是您不受网络带宽或本地 I/O 的限制。增加线程数量也会带来内存开销，用户应注意以下几点可提高读取吞吐量性能：

* 通常，`max_threads` 的默认值就足够了，即核心数。如果查询使用的内存较高，需要减少，或者结果的 `LIMIT` 较低，则可以将此值设置更低。拥有大量内存的用户可能希望尝试增加该值，以可能从 S3 获得更高的读取吞吐量。通常这仅在核心计数较少的机器上有效，即 < 10。由于其他资源作为瓶颈，例如网络和 CPU 竞争，进一步并行化的收益通常会减少。
* 在 22.3.1 之前的版本中，只有在使用 `s3` 函数或 `S3` 表引擎时，才会对多个文件进行并行读取。这要求用户确保在 S3 上将文件划分为块，并使用 glob 模式读取，以实现最佳读取性能。之后的版本现在可以在文件内部进行并行下载。
* 在低线程计数场景中，用户可以通过将 `remote_filesystem_read_method` 设置为 "read" 来受益，以使文件从 S3 中同步读取。
* 对于 s3 函数和表，单个文件的并行下载由 [`max_download_threads`](/operations/settings/settings#max_download_threads) 和 [`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size) 的值决定。虽然 [`max_download_threads`](/operations/settings/settings#max_download_threads) 控制使用的线程数，但只有在文件大小大于 2 * `max_download_buffer_size` 时，才会并行下载。默认情况下，`max_download_buffer_size` 设置为 10MiB。在某些情况下，您可以安全地将此缓冲区大小增加到 50 MB（`max_download_buffer_size=52428800`），目的是确保较小的文件仅由单个线程下载。这可以减少每个线程进行 S3 调用所花费的时间，从而降低 S3 等待时间。请参考 [此博客文章](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge) 获取示例。

在进行任何改动以提高性能之前，请确保适当测量。由于 S3 API 调用对延迟敏感，可能影响客户端的时机，请使用查询日志进行性能度量，即 `system.query_log`。

考虑我们之前的查询，将 `max_threads` 翻倍为 `16`（默认 `max_thread` 为节点上的核心数量），可将我们的读取查询性能提高 2 倍，代价是增加内存的使用。进一步增加 `max_threads` 的收益递减，如下所示。

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

## 调优插入的线程和块大小 {#tuning-threads-and-block-size-for-inserts}

为了实现最大的数据摄取性能，必须选择（1）一个插入块大小和（2）基于可用的（3）CPU 核心和 RAM 大小的适当插入并行性水平。总结如下：

- 我们越大地 [配置插入块大小](#insert-block-size)，ClickHouse 创建的部分就越少，因此所需的 [磁盘文件 I/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems) 和 [后台合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) 就越少。
- 我们配置的 [并行插入线程数越高](#insert-parallelism)，数据处理的速度就越快。

这两个性能因素之间存在互相冲突的取舍（再加上与后台部分合并的取舍）。ClickHouse 服务器可用的主内存有限。较大的块使用更多内存，这限制了可以利用的并行插入线程的数量。另一方面，较高数量的并行插入线程需要更多的主内存，因为插入线程的数量决定了内存中并发创建的插入块的数量。这限制了插入块的可能大小。此外，插入线程和后台合并线程之间可能存在资源竞争。配置的高线程数(1) 会创建更多需要合并的部分，并且(2) 会从后台合并线程中占用 CPU 核心和内存空间。

有关这些参数的行为如何影响性能和资源的详细描述，我们建议 [阅读这篇博客文章](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)。如这篇博客所述，调优可能涉及两个参数的精心平衡。此全面测试通常不切实际，因此总结建议如下：

```bash
• max_insert_threads: choose ~ half of the available CPU cores for insert threads (to leave enough dedicated cores for background merges)

• peak_memory_usage_in_bytes: choose an intended peak memory usage; either all available RAM (if it is an isolated ingest) or half or less (to leave room for other concurrent tasks)

Then:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

使用此公式，您可以将 `min_insert_block_size_rows` 设置为 0（以禁用基于行的阈值），同时将 `max_insert_threads` 设置为所选值，将 `min_insert_block_size_bytes` 设置为上述公式的计算结果。

使用此公式与我们之前的 Stack Overflow 示例。

- `max_insert_threads=4` （每个节点 8 个核心）
- `peak_memory_usage_in_bytes` - 32 GiB（节点资源的 100%）或 `34359738368` 字节。
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```

如上所示，调优这些设置提升了插入性能超过 `33%`。我们留给读者去看看他们是否能够进一步提高单节点性能。

## 资源及节点的扩展 {#scaling-with-resources-and-nodes}

资源和节点的扩展适用于读取和插入查询。

### 垂直扩展 {#vertical-scaling}

所有之前的调优和查询仅使用我们在 ClickHouse Cloud 集群中的单个节点。用户通常会有多个 ClickHouse 节点可用。我们建议用户初始进行垂直扩展，随着核心数量线性改善 S3 吞吐量。如果在较大的 ClickHouse Cloud 节点上重复之前的插入和读取查询（资源是之前的两倍，64GiB，16 vCPUs）并适当设置，两个查询执行速度约提升两倍。

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
单个节点也可能受网络和 S3 GET 请求的瓶颈，从而阻止垂直性能的线性扩展。
:::

### 水平扩展 {#horizontal-scaling}

最终，由于硬件可用性和成本效益，水平扩展通常是必要的。在 ClickHouse Cloud 中，生产集群至少有 3 个节点。因此用户也可能希望对插入进行所有节点的利用。

为了 S3 读取利用集群，需要使用如 [利用集群](/integrations/s3#utilizing-clusters) 中所述的 `s3Cluster` 函数。这样允许读取在节点之间分布。

最初接收插入查询的服务器首先解析 glob 模式，然后动态分发每个匹配文件的处理到自身和其他服务器。

<Image img={S3Cluster} size="lg" border alt="ClickHouse 中的 s3Cluster 函数" />

我们重复之前的读取查询，并将工作负载分配到 3 个节点，调整查询以使用 `s3Cluster`。在 ClickHouse Cloud 中，默认引用 `default` 集群自动执行此操作。

如 [利用集群](/integrations/s3#utilizing-clusters) 中所述，此工作在文件级别分发。为了利用这一功能，用户需要有足够数量的文件，即至少 > 节点的数量。

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

同样，使用为单节点识别的改进设置，可以对我们的插入查询进行分发：

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```

读者会发现文件的读取改善了查询，但不改善插入性能。默认情况下，虽然使用 `s3Cluster` 分发读取，但插入仍会发生在发起节点。这意味着虽然读取将发生在每个节点上，结果行将被路由到发起者进行分发。在高吞吐量场景中，这可能成为瓶颈。为了解决这个问题，请为 `s3cluster` 函数设置参数 `parallel_distributed_insert_select`。

将此设置为 `parallel_distributed_insert_select=2`，确保 `SELECT` 和 `INSERT` 将在每个节点的基础引擎的底层表上从/到每个分片执行。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```

正如预期的那样，这将插入性能降低了 3 倍。

## 进一步调优 {#further-tuning}

### 禁用重复检查 {#disable-de-duplication}

插入操作有时可能因超时等错误而失败。当插入失败时，数据可能已经成功插入，也可能未插入。为了允许客户端安全地重试插入，在诸如 ClickHouse Cloud 的分布式部署中，ClickHouse 默认会尝试确定数据是否已成功插入。如果插入的数据被标记为重复，ClickHouse 并不会将其插入目标表中。然而，用户仍会收到操作成功状态，仿佛数据已被正常插入。

虽然这种行为在从客户端或批量加载数据时是有意义的，但在从对象存储执行 `INSERT INTO SELECT` 时可能是不必要的。通过在插入时禁用此功能，我们可以提高性能，如下所示：

```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0 rows in set. Elapsed: 52.992 sec. Processed 59.82 million rows, 24.03 GB (1.13 million rows/s., 453.50 MB/s.)
Peak memory usage: 26.57 GiB.
```

### 插入优化 {#optimize-on-insert}

在 ClickHouse 中，`optimize_on_insert` 设置控制在插入过程中是否合并数据部分。当启用（`optimize_on_insert = 1` 默认），小部分在插入时会合并为更大的部分，提高查询性能，减少需要读取的部分数量。然而，这种合并会增加插入过程的开销，可能会减慢高吞吐量插入的速度。

禁用此设置（`optimize_on_insert = 0`）则在插入过程中跳过合并，可以更快地写入数据，特别是在处理频繁的小插入时。合并过程被推迟到后台，有助于更好的插入性能，但暂时增加小部分的数量，可能会减慢查询，直到后台合并完成。当插入性能优先时，且后台合并过程能够有效地在后续优化。这种设置适合于提升插入吞吐量，如下所示：

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```

## 其他说明 {#misc-notes}

* 对于内存较低的场景，考虑在插入到 S3 时降低 `max_insert_delayed_streams_for_parallel_write` 设置。
