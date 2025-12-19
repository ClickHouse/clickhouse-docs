---
slug: /integrations/s3/performance
sidebar_position: 2
sidebar_label: '性能优化'
title: '优化 S3 插入与读取性能'
description: '优化 S3 插入和读取操作的性能'
doc_type: 'guide'
keywords: ['s3', 'performance', 'optimization', 'object storage', 'data loading']
---

import Image from '@theme/IdealImage';
import InsertMechanics from '@site/static/images/integrations/data-ingestion/s3/insert_mechanics.png';
import Pull from '@site/static/images/integrations/data-ingestion/s3/pull.png';
import Merges from '@site/static/images/integrations/data-ingestion/s3/merges.png';
import ResourceUsage from '@site/static/images/integrations/data-ingestion/s3/resource_usage.png';
import InsertThreads from '@site/static/images/integrations/data-ingestion/s3/insert_threads.png';
import S3Cluster from '@site/static/images/integrations/data-ingestion/s3/s3Cluster.png';
import HardwareSize from '@site/static/images/integrations/data-ingestion/s3/hardware_size.png';

本节重点介绍如何在使用 [s3 表函数](/sql-reference/table-functions/s3) 从 S3 读取和插入数据时优化性能。

:::info
**本指南中讲解的方法同样适用于其他具有各自专用表函数的对象存储实现，例如 [GCS](/sql-reference/table-functions/gcs) 和 [Azure Blob storage](/sql-reference/table-functions/azureBlobStorage)。**
:::

在通过调优线程数和块大小来提升插入性能之前，我们建议用户先了解 S3 插入的工作机制。如果你已经熟悉插入机制，或者只想快速获得一些调优建议，可以直接跳转到下面的[示例](/integrations/s3/performance#example-dataset)部分。


## 插入机制（单节点） {#insert-mechanics-single-node}

在硬件配置之外，还有两个主要因素会影响 ClickHouse 单节点数据插入机制的性能和资源使用：**插入块大小** 和 **插入并行度**。

### 插入块大小 {#insert-block-size}

<Image img={InsertMechanics} size="lg" border alt="ClickHouse 中插入块大小的机制" />

在执行 `INSERT INTO SELECT` 时，ClickHouse 会接收到一部分数据，并从这些数据中 ① 构建出（至少）一个内存中的插入块（按[分区键](/engines/table-engines/mergetree-family/custom-partitioning-key) 划分）。该块中的数据会被排序，并应用表引擎特定的优化。随后数据被压缩，并以一个新的数据 part 的形式 ② 写入到数据库存储中。

插入块大小会同时影响 ClickHouse 服务器的 [磁盘文件 I/O 使用情况](https://en.wikipedia.org/wiki/Category:Disk_file_systems) 和内存使用情况。更大的插入块会占用更多内存，但会生成更大且数量更少的初始 part。ClickHouse 在加载大量数据时需要创建的 part 越少，所需的磁盘文件 I/O 和自动[后台合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) 就越少。

当将 `INSERT INTO SELECT` 查询与集成表引擎或表函数组合使用时，数据会由 ClickHouse 服务器拉取：

<Image img={Pull} size="lg" border alt="在 ClickHouse 中从外部源拉取数据" />

在数据完全加载之前，服务器会执行一个循环：

```bash
① Pull and parse the next portion of data and form an in-memory data block (one per partitioning key) from it.

② Write the block into a new part on storage.

Go to ① 
```

在 ① 中，大小取决于插入块的大小，可以通过两个设置进行控制：

* [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)（默认值：`1048545` 百万行）
* [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（默认值：`256 MiB`）

当插入块中累积到指定数量的行，或者达到配置的数据量（以先发生者为准）时，就会触发将该块写入一个新的 part。插入循环随后回到步骤 ① 继续执行。

请注意，`min_insert_block_size_bytes` 的值表示内存中未压缩的块大小（而不是压缩后的磁盘 part 大小）。另外需要注意的是，创建出来的块和 part 很少会精确包含配置的行数或字节数，因为 ClickHouse 是按行‑[块](/operations/settings/settings#max_block_size)粒度对数据进行流式[处理](https://clickhouse.com/company/events/query-performance-introspection)的。因此，这些设置指定的是最小阈值。


#### 注意合并操作 {#be-aware-of-merges}

配置的插入块越小，对于一次大规模数据加载而言，创建的初始 part 就越多，并且会在数据摄取的同时执行越多的后台 part 合并。这可能导致资源争用（CPU 和内存），并在摄取完成后，为达到[健康的](/operations/settings/merge-tree-settings#parts_to_throw_insert)（3000）个 part 数量而需要额外时间。

:::important
如果 part 数量超过[推荐限制](/operations/settings/merge-tree-settings#parts_to_throw_insert)，将对 ClickHouse 查询性能产生负面影响。
:::

ClickHouse 会持续[合并 part](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)为更大的 part，直到它们[达到](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)约 150 GiB 的压缩大小。下图展示了 ClickHouse 服务器如何合并 part：

<Image img={Merges} size="lg" border alt="ClickHouse 中的后台合并" />

单个 ClickHouse 服务器会利用多个[后台合并线程](/operations/server-configuration-parameters/settings#background_pool_size)来执行并发的[part 合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes)。每个线程都会执行一个循环：

```bash
① Decide which parts to merge next, and load these parts as blocks into memory.

② Merge the loaded blocks in memory into a larger block.

③ Write the merged block into a new part on disk.

Go to ①
```

请注意，[增加](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size) CPU 核心数和 RAM 大小会提高后台合并的吞吐量。

已经被合并进更大 part 的 part 会被标记为[非活动](/operations/system-tables/parts)，并在经过[可配置](/operations/settings/merge-tree-settings#old_parts_lifetime)的若干分钟后最终被删除。随着时间推移，这会形成一个由合并后 part 组成的树状结构（这也是 [`MergeTree`](/engines/table-engines/mergetree-family) 表名称的由来）。


### 插入并行性 {#insert-parallelism}

<Image img={ResourceUsage} size="lg" border alt="插入并行性的资源使用情况" />

ClickHouse 服务器可以并行处理和插入数据。插入并行性的级别会影响 ClickHouse 服务器的摄取吞吐量和内存使用。并行加载和处理数据需要更多主内存，但由于数据处理速度更快，可以提高摄取吞吐量。

像 s3 这样的表函数允许通过 glob 模式指定一组待加载的文件名。当某个 glob 模式匹配多个现有文件时，ClickHouse 可以在这些文件之间以及文件内部并行读取数据，并通过运行多个并行插入线程（每个服务器）将数据并行插入到表中：

<Image img={InsertThreads} size="lg" border alt="ClickHouse 中的并行插入线程" />

在处理完所有文件的所有数据之前，每个插入线程都会执行一个循环：

```bash
① Get the next portion of unprocessed file data (portion size is based on the configured block size) and create an in-memory data block from it.

② Write the block into a new part on storage.

Go to ①. 
```

此类并行插入线程的数量可以通过 [`max_insert_threads`](/operations/settings/settings#max_insert_threads) 设置进行配置。开源版 ClickHouse 的默认值为 `1`，而 [ClickHouse Cloud](https://clickhouse.com/cloud) 的默认值为 `4`。

在处理大量文件时，多插入线程的并行处理效果良好，可以充分利用可用的 CPU 核心以及网络带宽（用于并行下载文件）。在仅向表中加载少量大文件的场景下，ClickHouse 会自动建立较高的数据处理并行度，并通过为每个插入线程派生额外的读取线程来并行读取（下载）大文件中更多彼此独立的区间，从而优化网络带宽的使用。

对于 s3 函数和表，单个文件是否并行下载由 [max&#95;download&#95;threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) 和 [max&#95;download&#95;buffer&#95;size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size) 的取值决定。只有当文件大小大于 `2 * max_download_buffer_size` 时，文件才会被并行下载。默认情况下，`max_download_buffer_size` 设置为 10MiB。在某些情况下，可以放心地将该缓冲区大小增大到 50 MB（`max_download_buffer_size=52428800`），以确保每个文件由单个线程下载。这样可以减少每个线程发起 S3 调用所花费的时间，从而降低 S3 等待时间。此外，对于过小而不适合并行读取的文件，为了提高吞吐量，ClickHouse 会通过异步预读此类文件来自动预取数据。


## 性能衡量 {#measuring-performance}

在以下两种场景下，都需要对使用 S3 表函数的查询进行性能优化：一是数据不搬移、直接对其运行查询的场景，即仅使用 ClickHouse 计算资源、数据保持在 S3 中并保留原始格式的临时（即席）查询；二是将来自 S3 的数据插入到 ClickHouse MergeTree 表引擎中的场景。除非特别说明，以下建议适用于这两种场景。

## 硬件规模的影响 {#impact-of-hardware-size}

<Image img={HardwareSize} size="lg" border alt="硬件规模对 ClickHouse 性能的影响" />

可用的 CPU 核心数量和内存容量会影响：

- 支持的[初始分区片段大小](#insert-block-size)
- 可实现的[写入并行度](#insert-parallelism)
- [后台分区片段合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)的吞吐量

从而影响整体的摄取吞吐量。

## 区域本地性 {#region-locality}

请确保你的存储桶（bucket）与 ClickHouse 实例位于同一地域（region）。这个简单的优化可以显著提升吞吐量表现，尤其是在你将 ClickHouse 实例部署在 AWS 基础设施上时。

## 格式 {#formats}

ClickHouse 可以使用 `s3` 函数和 `S3` 引擎，以[受支持的格式](/interfaces/formats#formats-overview)读取存储在 S3 存储桶中的文件。如果是直接读取原始文件，这些格式各有一些明显优势：

* 对于带有编码列名的格式（例如 Native、Parquet、CSVWithNames 和 TabSeparatedWithNames），查询时会更简洁，因为用户在使用 `s3` 函数时不需要显式指定列名。列名本身可以让 ClickHouse 推断出这些信息。
* 各种格式在读写吞吐量方面的性能不同。Native 和 Parquet 在读取性能上是最优的格式，因为它们本身就是列式存储并且更加紧凑。Native 格式还额外受益于与 ClickHouse 在内存中存储数据的方式保持一致——从而在数据流入 ClickHouse 时降低处理开销。
* 对于大文件，块大小通常会影响读取延迟。如果你只是对数据进行采样，例如只返回前 N 行，这一点会尤为明显。对于 CSV 和 TSV 等格式，必须逐行解析文件才能返回一批行。而 Native 和 Parquet 等格式则可以实现更快速的采样。
* 每种压缩格式都有其优缺点，通常在压缩率与速度之间权衡，并分别偏向压缩或解压缩方向的性能。如果对 CSV 或 TSV 等原始文件进行压缩，lz4 提供最快的解压缩性能，但牺牲了压缩率。Gzip 通常能获得更好的压缩率，但读取速度会略慢。Xz 在这方面更进一步，通常提供最佳压缩率，但压缩和解压缩性能最慢。如果是导出数据，Gz 和 lz4 的压缩速度相近。需要结合你的网络连接速度进行权衡。任何来自更快压缩或解压缩的收益，都可能轻易被到 S3 存储桶的较慢网络连接所抵消。
* 对于 Native 或 Parquet 等格式，通常不值得再引入额外的压缩开销。数据大小的节省往往非常有限，因为这些格式本身已经非常紧凑。花在压缩和解压缩上的时间很难抵消网络传输时间——尤其是考虑到 S3 在全球范围内可用且通常具有较高的网络带宽。

## 示例数据集 {#example-dataset}

为了进一步说明潜在的优化空间，我们将使用 [Stack Overflow 数据集中的 posts 表](/data-modeling/schema-design#stack-overflow-dataset)，同时优化该数据集的查询和插入性能。

该数据集由 189 个 Parquet 文件组成，每个文件对应 2008 年 7 月到 2024 年 3 月之间的一个月。

请注意，我们出于性能考虑使用 Parquet，遵循 [上文关于格式的推荐](#formats)，并在与存储桶位于同一地区的 ClickHouse 集群上执行所有查询。该集群包含 3 个节点，每个节点具有 32GiB 内存和 8 个 vCPU。

在未进行任何调优的情况下，我们展示了将该数据集写入一个使用 MergeTree 引擎的表时的性能，以及执行一个查询以统计提出问题最多的用户时的性能。这两个查询都被有意设计为需要对全部数据进行完整扫描。

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

在我们的示例中，我们只返回少量行数据。如果要衡量向客户端返回大量数据的 `SELECT` 查询的性能，可以在查询中使用 [null format](/interfaces/formats/Null)，或者将结果写入 [`Null` engine](/engines/table-engines/special/null.md)。这样可以避免客户端被数据淹没以及网络带宽饱和。

:::info
在读取查询结果时，初次执行的查询往往看起来比重复执行同一查询更慢。这通常是由于 S3 自身的缓存机制以及 [ClickHouse Schema Inference Cache](/operations/system-tables/schema_inference_cache) 所致。后者会存储针对文件推断出的 schema，从而在后续访问中跳过推断步骤，缩短查询时间。
:::


## 在读取中使用线程 {#using-threads-for-reads}

在不受网络带宽或本地 I/O 限制的前提下，S3 上的读取性能会随核心数量线性扩展。增加线程数量也会带来额外的内存开销，用户需要了解这一点。可以通过修改以下设置来潜在地提升读取吞吐性能：

* 通常，`max_threads` 的默认值（即核心数）已经足够。如果单个查询使用的内存过高且需要降低，或者结果上的 `LIMIT` 很小，可以将该值设置得更低。拥有充足内存的用户可以尝试增大该值，以期从 S3 获得更高的读取吞吐量。一般来说，这只在核心数较低（即 &lt; 10） 的机器上有益。随着其他资源（例如网络和 CPU 争用）成为瓶颈，进一步并行化的收益通常会降低。
* 22.3.1 之前版本的 ClickHouse 在使用 `s3` 函数或 `S3` 表引擎时，只会在多个文件之间并行读取。这要求用户确保文件在 S3 上被拆分为多个分块，并通过通配符模式读取，才能获得最佳读取性能。后续版本现在已经支持在单个文件内部并行下载。
* 在线程数较低的场景下，用户可以考虑将 `remote_filesystem_read_method` 设置为 &quot;read&quot;，以改为从 S3 同步读取文件。
* 对于 s3 函数和表，单个文件的并行下载由 [`max_download_threads`](/operations/settings/settings#max_download_threads) 和 [`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size) 的取值决定。虽然 [`max_download_threads`](/operations/settings/settings#max_download_threads) 控制使用的线程数，但只有当文件大小大于 2 * `max_download_buffer_size` 时才会并行下载。默认情况下，`max_download_buffer_size` 被设置为 10MiB。在某些情况下，可以安全地将该缓冲区大小增加到 50 MB（`max_download_buffer_size=52428800`），以确保较小文件仅由单个线程下载。这可以减少每个线程发起 S3 调用所花费的时间，从而降低 S3 等待时间。相关示例可参考 [这篇博文](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge)。

在进行任何性能优化调整之前，请确保进行恰当的度量。由于 S3 API 调用对延迟较为敏感，可能会影响客户端的耗时，请使用查询日志（`system.query_log`）来获取性能指标。

考虑前面提到的查询，将 `max_threads` 加倍到 `16`（默认 `max_thread` 为节点上的核心数）可以在占用更多内存的代价下，将读取查询性能提升 2 倍。进一步增加 `max_threads` 的收益会逐渐减少，如图所示。

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


## 为插入操作调优线程数与块大小 {#tuning-threads-and-block-size-for-inserts}

为了获得最大的摄取性能，你必须基于以下三点进行选择：(1) 插入块大小；(2) 合适的插入并行度；(3) 可用 CPU 内核数和 RAM 容量。总结如下：

* [插入块大小](#insert-block-size)配置得越大，ClickHouse 需要创建的分区片段就越少，所需的[磁盘文件 I/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems) 和[后台合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)也就越少。
* [并行插入线程数](#insert-parallelism)配置得越高，数据处理速度就越快。

这两个性能因素之间（以及与后台分区片段合并之间）存在此消彼长的权衡。ClickHouse 服务器可用的主内存是有限的。更大的块会占用更多主内存，从而限制可使用的并行插入线程数。反过来，更高的并行插入线程数又需要更多主内存，因为插入线程数决定了同时在内存中创建的插入块数量，这会限制插入块的可选大小。此外，插入线程与后台合并线程之间也可能出现资源竞争。配置较多的插入线程会 (1) 产生更多需要合并的分区片段，并且 (2) 占用本可用于后台合并线程的 CPU 内核和内存空间。

关于这些参数的行为如何影响性能和资源的详细说明，我们建议[阅读这篇博客文章](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)。正如文中所述，调优可能需要在这两个参数之间进行精细平衡。这种穷举式测试往往不切实际，因此，总结来说，我们建议：

```bash
• max_insert_threads: choose ~ half of the available CPU cores for insert threads (to leave enough dedicated cores for background merges)

• peak_memory_usage_in_bytes: choose an intended peak memory usage; either all available RAM (if it is an isolated ingest) or half or less (to leave room for other concurrent tasks)

Then:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

使用该公式时，您可以将 `min_insert_block_size_rows` 设置为 0（禁用基于行数的阈值），同时将 `max_insert_threads` 设置为选定的值，并将 `min_insert_block_size_bytes` 设置为上述公式计算得到的结果。

将此公式应用到前面的 Stack Overflow 示例中：

* `max_insert_threads=4`（每个节点 8 核）
* `peak_memory_usage_in_bytes` = 32 GiB（节点资源的 100%），即 `34359738368` 字节。
* `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```

如上所示，通过调整这些设置，插入性能提升了 `33%` 以上。我们将其留给读者自行尝试，看看能否进一步提升单节点性能。


## 基于资源和节点的扩展 {#scaling-with-resources-and-nodes}

基于资源和节点的扩展同样适用于读取查询和插入查询。

### 垂直扩展 {#vertical-scaling}

之前所有的调优和查询都只使用了我们 ClickHouse Cloud 集群中的单个节点。用户通常也会有多个 ClickHouse 节点可用。我们建议用户优先进行垂直扩展，通过增加核心数线性提升 S3 吞吐量。如果我们在资源加倍（64GiB、16 vCPU）且配置合适的更大 ClickHouse Cloud 节点上重复之前的插入和读取查询，两者的执行速度大约都会提升一倍。

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
单个节点也可能受限于网络性能和 S3 GET 请求，从而无法通过垂直扩展线性提升性能。
:::


### 水平扩展 {#horizontal-scaling}

最终，出于硬件可用性和成本效益的考虑，通常需要进行水平扩展。在 ClickHouse Cloud 中，生产集群至少包含 3 个节点。因此用户也可能希望在一次插入中利用所有节点。

要在集群中读取 S3，需要按照[利用集群](/integrations/s3#utilizing-clusters)中所述使用 `s3Cluster` 函数。这样可以将读取操作分布到多个节点上。

最先接收插入查询的服务器会首先解析 glob 通配模式，然后将每个匹配文件的处理动态分发给自身和其他服务器。

<Image img={S3Cluster} size="lg" border alt="ClickHouse 中的 s3Cluster 函数" />

我们重复之前的读取查询，将工作负载分布在 3 个节点上，并调整查询以使用 `s3Cluster`。在 ClickHouse Cloud 中，这一步通过引用 `default` 集群自动完成。

如[利用集群](/integrations/s3#utilizing-clusters)中所述，工作负载是在文件级别进行分布的。要从此特性中获益，用户需要有足够数量的文件，即文件数至少要大于节点数。

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

同样，我们也可以将 INSERT 查询做成分布式的，并使用之前为单节点确定的改进设置：

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```

读者会注意到，文件读取的改进提升了查询性能，但并未提升插入性能。默认情况下，尽管读取是通过 `s3Cluster` 分布式执行的，但插入操作仍然在发起节点上进行。这意味着读取会在每个节点上执行，但生成的行会被路由回发起节点再进行分发。在高吞吐量场景下，这可能会成为瓶颈。为了解决这一问题，请为 `s3cluster` 函数设置参数 `parallel_distributed_insert_select`。

将其设置为 `parallel_distributed_insert_select=2`，可以确保在每个节点上，分布式引擎底层表的每个分片上都会执行对应的 `SELECT` 和 `INSERT` 操作。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```

如预期，这会使插入性能降低到原来的三分之一。


## 进一步调优 {#further-tuning}

### 禁用去重 {#disable-de-duplication}

插入操作有时会因为超时等错误而失败。当插入失败时，数据可能已经成功写入，也可能没有。为了让客户端能够安全地重试插入，在诸如 ClickHouse Cloud 等分布式部署中，ClickHouse 默认会尝试判断数据是否已经成功插入。如果插入的数据被标记为重复，ClickHouse 不会将其写入目标表。不过，用户仍会收到操作成功的状态反馈，就好像数据已正常插入一样。

这种行为会带来额外的插入开销，在从客户端或以批处理方式加载数据时是合理的，但在从对象存储执行 `INSERT INTO SELECT` 时则可能没有必要。通过在插入时禁用此功能，我们可以如下面所示提升性能：

```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0 rows in set. Elapsed: 52.992 sec. Processed 59.82 million rows, 24.03 GB (1.13 million rows/s., 453.50 MB/s.)
Peak memory usage: 26.57 GiB.
```


### 插入时优化 {#optimize-on-insert}

在 ClickHouse 中，`optimize_on_insert` 设置用于控制是否在插入过程中合并数据分区片段。启用该设置时（默认 `optimize_on_insert = 1`），小分区片段在插入时会被合并为更大的分区片段，通过减少需要读取的分区片段数量来提升查询性能。不过，这种合并会给插入过程增加开销，可能会减慢高吞吐量插入。

禁用该设置（`optimize_on_insert = 0`）会跳过插入时的合并，使数据能够更快写入，尤其是在处理频繁的小批量插入时。合并过程将被推迟到后台执行，从而提升插入性能，但会在一段时间内增加小分区片段的数量，在后台合并完成之前可能会降低查询速度。当插入性能优先、且后台合并过程可以在之后高效完成优化时，该设置尤为适用。如下所示，禁用该设置后可以提升插入吞吐量：

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```


## 其他注意事项 {#misc-notes}

* 在内存紧张的场景下，如果需要向 S3 插入数据，可以考虑调低 `max_insert_delayed_streams_for_parallel_write`。