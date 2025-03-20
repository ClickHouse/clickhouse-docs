---
slug: /integrations/s3/performance
sidebar_position: 2
sidebar_label: 性能优化
title: 优化 S3 插入和读取性能
description: 优化 S3 读取和插入的性能
---

import InsertMechanics from '@site/static/images/integrations/data-ingestion/s3/insert_mechanics.png';
import Pull from '@site/static/images/integrations/data-ingestion/s3/pull.png';
import Merges from '@site/static/images/integrations/data-ingestion/s3/merges.png';
import ResourceUsage from '@site/static/images/integrations/data-ingestion/s3/resource_usage.png';
import InsertThreads from '@site/static/images/integrations/data-ingestion/s3/insert_threads.png';
import S3Cluster from '@site/static/images/integrations/data-ingestion/s3/s3Cluster.png';
import HardwareSize from '@site/static/images/integrations/data-ingestion/s3/hardware_size.png';

本节重点优化从 S3 读取和插入数据的性能，使用 [s3 表函数](/sql-reference/table-functions/s3)。

:::info
**本指南中描述的课程可以应用于其他具有自己专用表函数的对象存储实现，例如 [GCS](/sql-reference/table-functions/gcs) 和 [Azure Blob storage](/sql-reference/table-functions/azureBlobStorage)。**
:::

在调整线程和块大小以提高插入性能之前，我们建议用户了解 S3 插入的机制。如果您熟悉插入机制，或者只想获取一些快速提示，可以跳到我们下面的例子 [示例数据集](/integrations/s3/performance#example-dataset)。
## 插入机制（单节点） {#insert-mechanics-single-node}

除了硬件大小外，影响 ClickHouse 数据插入机制（对于单个节点）的两个主要因素是：**插入块大小** 和 **插入并发性**。
### 插入块大小 {#insert-block-size}

<img src={InsertMechanics} alt="ClickHouse 中的插入块大小机制" />

在执行 `INSERT INTO SELECT` 时，ClickHouse 接收一部分数据，并 ① 从接收到的数据中形成（至少）一个内存中的插入块（根据 [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)）。块数据被排序，并应用特定于表引擎的优化。然后，数据被压缩，并 ② 以新数据部分的形式写入数据库存储。

插入块大小会影响 ClickHouse 服务器的 [磁盘文件 I/O 使用](https://en.wikipedia.org/wiki/Category:Disk_file_systems) 和内存使用。较大的插入块使用更多内存，但生成更大且数量较少的初始部分。ClickHouse 为加载大量数据所需创建的部分越少，所需的磁盘文件 I/O 和自动 [后台合并则越少](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)。

在使用与集成表引擎或表函数结合的 `INSERT INTO SELECT` 查询时，数据由 ClickHouse 服务器提取：

<img src={Pull} alt="在 ClickHouse 中从外部源提取数据" />

在数据完全加载之前，服务器执行一个循环：

```bash
① 提取并解析下一部分数据，并从中形成内存中数据块（每个分区键一个）。

② 将块写入存储的新部分。

回到 ①
```

在 ① 中，大小取决于插入块大小，可以通过两个设置控制：

- [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)（默认值：`1048545` 行）
- [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（默认值：`256 MiB`）

当在插入块中收集到指定数量的行，或达到配置的数据量（以先到者为准）时，这将触发将块写入新部分。插入循环继续进行步骤 ①。

请注意，`min_insert_block_size_bytes` 值表示未压缩的内存块大小（而非压缩后的磁盘部分大小）。此外，请注意，创建的块和部分很少精确包含配置的行数或字节数，因为 ClickHouse 以行块的方式流式传输和 [处理](https://clickhouse.com/company/events/query-performance-introspection) 数据。因此，这些设置指定了最小阈值。
#### 注意合并 {#be-aware-of-merges}

配置的插入块大小越小，针对大量数据加载创建的初始部分越多，并且在数据摄取的同时执行的后台部分合并越多。这可能导致资源争用（CPU 和内存），并在摄取完成后需要额外时间（以达到 [健康的](https://operations/settings/merge-tree-settings#parts-to-throw-insert)（3000）部分数量）。

:::important
如果部分数量超过 [推荐限制](/operations/settings/merge-tree-settings#parts-to-throw-insert)，ClickHouse 查询性能将受到负面影响。
:::

ClickHouse 将持续 [合并部分](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) 为更大的部分，直到其 [达到](https://operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool) 大约 150 GiB 的压缩大小。此图显示了 ClickHouse 服务器如何合并部分：

<img src={Merges} alt="ClickHouse 中的后台合并" />

单个 ClickHouse 服务器利用多个 [后台合并线程](/operations/server-configuration-parameters/settings#background_pool_size) 来执行并发的 [部分合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes)。每个线程执行一个循环：

```bash
① 决定下一个要合并的部分，并将这些部分作为块加载到内存中。

② 将加载的块在内存中合并为一个更大的块。

③ 将合并的块写入磁盘的新部分。

回到 ①
```

请注意 [增加](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size) CPU 核心数量和内存大小会增加后台合并的吞吐量。

被合并为更大部分的部分会被标记为 [非活动](/operations/system-tables/parts)，在经过 [可配置的](/operations/settings/merge-tree-settings#old-parts-lifetime) 几分钟后最终被删除。随着时间的推移，这将创建一个合并部分的树（因此命名为 [`MergeTree`](/engines/table-engines/mergetree-family) 表）。
### 插入并发性 {#insert-parallelism}

<img src={ResourceUsage} alt="插入并发性的资源使用" />

ClickHouse 服务器可以并行处理和插入数据。插入并发性的水平影响 ClickHouse 服务器的数据摄取吞吐量和内存使用。并行加载和处理数据需要更多主内存，但可以提高数据摄取的吞吐量，因为数据处理得更快。

像 s3 这样的表函数允许通过 glob 模式指定要加载的文件名集。当 glob 模式匹配多个现有文件时，ClickHouse 可以并行读取这些文件之间和文件内的数据，并利用并行运行的插入线程并行将数据插入表中（每个服务器）：

<img src={InsertThreads} alt="ClickHouse 中的并行插入线程" />

在处理所有文件中的所有数据之前，每个插入线程执行一个循环：

```bash
① 获取下一部分未处理的文件数据（部分大小基于配置的块大小），并从中创建内存中的数据块。

② 将块写入存储的新部分。

回到 ①。
```

可以通过 [`max_insert_threads`](/operations/settings/settings#max_insert_threads) 设置配置此类并行插入线程的数量。开源 ClickHouse 的默认值为 `1`，而 [ClickHouse Cloud](https://clickhouse.com/cloud) 的默认值为 4。

对于数量庞大的文件，多个插入线程的并行处理效果良好。它可以充分利用可用的 CPU 核心和网络带宽（用于并行文件下载）。在仅有少数大型文件将被加载到表中的情况下，ClickHouse 会自动建立高水平的数据处理并行性，并通过为读取（下载）大型文件中的更多不同范围生成每个插入线程的附加读取线程来优化网络带宽使用。

对于 s3 函数和表，单个文件的并行下载由 [max_download_threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) 和 [max_download_buffer_size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size) 的值决定。仅当文件的大小大于 `2 * max_download_buffer_size` 时，文件才会并行下载。默认情况下，`max_download_buffer_size` 的值设置为 10MiB。在某些情况下，您可以安全地将此缓冲区大小增加到 50 MB (`max_download_buffer_size=52428800`)，以确保每个文件由单个线程下载。这可以减少每个线程在进行 S3 调用时所花费的时间，从而也降低 S3 等待时间。此外，对于太小而无法进行并行读取的文件，为提高吞吐量，ClickHouse 会自动通过异步预读取这些文件来预取数据。
## 性能测量 {#measuring-performance}

使用 S3 表函数优化查询性能是必要的，这包括在对原始数据进行现场查询时，即在仅使用 ClickHouse 计算的情况下，数据保持在 S3 中的原始格式，以及从 S3 向 ClickHouse MergeTree 表引擎插入数据时。除非另有说明，否则以下建议适用于这两种情况。
## 硬件大小的影响 {#impact-of-hardware-size}

<img src={HardwareSize} alt="硬件大小对 ClickHouse 性能的影响" />

可用的 CPU 核心数量和 RAM 大小会影响：

- 支持的 [初始部分大小](#insert-block-size)
- 可能的 [插入并发性](#insert-parallelism)
- [后台部分合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) 的吞吐量

因此，影响整体的摄取吞吐量。
## 区域局部性 {#region-locality}

确保您的存储桶位于与 ClickHouse 实例相同的区域。这一简单的优化可以显著提高吞吐性能，尤其是在将 ClickHouse 实例部署在 AWS 基础设施上时。
## 格式 {#formats}

ClickHouse 可以使用 `s3` 函数和 `S3` 引擎读取存储在 S3 存储桶中的 [受支持的格式](/interfaces/formats#formats-overview) 的文件。如果读取原始文件，这些格式中的一些具有明显的优势：

* 具有编码列名的格式，如 Native、Parquet、CSVWithNames 和 TabSeparatedWithNames，将不需要用户在 `s3` 函数中指定列名，从而使查询不那么冗长。列名允许推断这些信息。
* 格式在读取和写入吞吐量方面表现不同。Native 和 Parquet 是针对读取性能的最优格式，因为它们已经是列式的且更加紧凑。原生格式还因与 ClickHouse 内存中数据存储的方式对齐而受益，从而减少了数据流入 ClickHouse 时的处理开销。
* 块大小通常会影响对大文件读取的延迟。如果仅对数据进行抽样，例如返回前 N 行，这一点非常明显。在 CSV 和 TSV 等格式的情况下，必须解析文件以返回一组行。Native 和 Parquet 等格式可以更快地进行抽样。
* 每种压缩格式都有优缺点，通常在速度与压缩级别之间进行权衡，并使得压缩或解压缩性能受损。如果压缩原始文件（如 CSV 或 TSV），lz4 提供了最快的解压性能，但牺牲了压缩级别。Gzip 通常提供更好的压缩效果，但以稍慢的读取速度为代价。Xz 更进一步，通常提供最佳的压缩效果，但压缩和解压性能最慢。如果导出，Gz 和 lz4 提供了比较接近的压缩速度。根据您的连接速度平衡这一点。任何来自更快解压或压缩的收益都可能由于与 S3 存储桶的较慢连接而被轻易抵消。
* 像 Native 或 Parquet 这样的格式通常不值得压缩带来的开销。由于这些格式本身就是紧凑的，因此数据大小的任何节省可能会微乎其微。花在压缩和解压缩上的时间很少会抵消网络传输时间，尤其是因为 S3 是全球可用的，且具有更高的网络带宽。
## 示例数据集 {#example-dataset}

为了进一步说明可能的优化，我们将使用 [Stack Overflow 数据集中的帖子](/data-modeling/schema-design#stack-overflow-dataset) —— 优化该数据的查询和插入性能。

该数据集由 189 个 Parquet 文件组成，涵盖 2008 年 7 月至 2024 年 3 月的每个月一个文件。

请注意，我们采用 Parquet 格式以提高性能，符合我们在 [上述建议](#formats) 中的推荐，执行所有查询时所用的 ClickHouse 集群位于与存储桶相同的区域。该集群有 3 个节点，每个节点 32GiB 的 RAM 和 8 个 vCPU。

在未进行调优的情况下，我们演示将该数据集插入到 MergeTree 表引擎的性能，以及执行计算提问最多的用户的查询。这两个查询都故意要求对数据进行完全扫描。

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

在我们的示例中，我们只返回了几行。如果在测量 `SELECT` 查询的性能时，需要返回大量数据给客户端，建议使用 [null 格式](/interfaces/formats/#null) 查询或将结果直接发送到 [`Null` 引擎](/engines/table-engines/special/null.md)。这应避免客户端被数据淹没和网络饱和。

:::info
在读取查询时，初始查询的响应时间通常会比重复相同的查询要慢。这可以归因于 S3 自身的缓存以及 [ClickHouse 模式推断缓存](/operations/system-tables/schema_inference_cache)。该缓存存储文件的推断模式，意味着推断步骤可以在后续访问中跳过，从而减少查询时间。
:::
## 使用线程进行读取 {#using-threads-for-reads}

在 S3 上的读取性能将随着核心数量呈线性增长，前提是您不受网络带宽或本地 I/O 的限制。增加线程数量也会有内存开销，用户应该对此有所了解。可以修改以下内容，以潜在地改善读取吞吐性能：

* 通常，`max_threads` 的默认值是足够的，即核心数量。如果查询所用的内存量较高，需要降低此值，或者结果的 `LIMIT` 较低，可以将该值设置得更低。有大量内存的用户可能希望尝试增加该值，以便从 S3 获取更高的读取吞吐量。通常这仅在核心计数较少的机器上有益，即 &lt; 10。当其他资源成为瓶颈时，这种进一步并行化的收益通常会降低，例如网络和 CPU 争用。
* ClickHouse 22.3.1 之前的版本仅在使用 `s3` 函数或 `S3` 表引擎时在多个文件上并行化读取。这要求用户确保文件在 S3 上被拆分为多个块，并使用 glob 模式读取，以实现最佳读取性能。后来的版本现在也支持在单个文件中并行下载。
* 在低线程计数的情况下，用户可以通过将 `remote_filesystem_read_method` 设置为 "read" 来获益，以强制同步读取 S3 中的文件。
* 对于 s3 函数和表，单个文件的并行下载由 [`max_download_threads`](/operations/settings/settings#max_download_threads) 和 [`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size) 的值决定。虽然 [`max_download_threads`](/operations/settings/settings#max_download_threads) 控制使用的线程数量，但仅当文件大小大于 2 * `max_download_buffer_size` 时，文件才会并行下载。默认情况下，`max_download_buffer_size` 的值设置为 10MiB。在某些情况下，您可以安全地将此缓冲区大小增加到 50 MB (`max_download_buffer_size=52428800`)， 以确保较小文件仅由单个线程下载。这可以减少每个线程在进行 S3 调用时所花费的时间，从而也降低 S3 等待时间。有关此的示例，请参见 [这篇博客文章](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge)。

在进行任何性能改进之前，请确保适当测量。由于 S3 API 调用对延迟敏感，可能会影响客户端时间，使用查询日志获取性能指标，即 `system.query_log`。

考虑我们之前的查询，将 `max_threads` 的值加倍至 `16`（默认的 `max_thread` 是节点上的核心数量），可以将读取查询的性能提升 2 倍，代价是更高的内存消耗。进一步增加 `max_threads` 的效果递减，如下所示。

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

要实现最大的摄取性能，您必须选择 (1) 一个插入块大小和 (2) 根据可用 CPU 核心和 RAM 的量选择适当的插入并发性。在总结中：

- 我们越是 [配置插入块大小](#insert-block-size)，ClickHouse 必须创建的部分就越少，从而所需的 [磁盘文件 I/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems) 和 [后台合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) 就越少。
- 我们配置的 [并行插入线程数量越高](#insert-parallelism)，数据处理的速度就越快。

这两个性能因素之间存在冲突的权衡（以及与后台合并的权衡）。ClickHouse 服务器的可用主内存是有限的。较大的块使用更多的主内存，这限制了我们可以利用的并行插入线程的数量。相反，较高数量的并行插入线程需要更多主内存，因为插入线程的数量决定了内存中同时创建的插入块的数量。这限制了插入块的可能大小。此外，插入线程与后台合并线程之间可能存在资源争用。配置了大量插入线程 (1) 创建了更多需要合并的部分和 (2) 从后台合并线程中占用了 CPU 核心和内存空间。

有关这些参数如何影响性能和资源的详细描述，我们建议 [阅读这篇博客文章](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)。正如该博客中所述，调优可能涉及平衡这两个参数。这种详尽的测试通常是不切实际的，因此总而言之，我们建议：

```bash
• max_insert_threads: 选择可用 CPU 核心的大约一半作为插入线程（以留出足够的专用核心用于后台合并）

• peak_memory_usage_in_bytes: 选择所需的峰值内存使用；如果是独立摄取，则选择所有可用 RAM（否则选择一半或更少，以留出空间用于其他并发任务）

然后：
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

根据此公式，您可以将 `min_insert_block_size_rows` 设置为 0（以禁用基于行的阈值），同时将 `max_insert_threads` 设置为选择值，将 `min_insert_block_size_bytes` 设置为上述公式计算的结果。

根据我们之前 Stack Overflow 示例的使用此公式：

- `max_insert_threads=4`（每个节点 8 核心）
- `peak_memory_usage_in_bytes` - 32 GiB（100% 的节点资源）或 `34359738368` 字节。
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```

如所示，调整这些设置已将插入性能提高了超过 `33%`。我们将此留给读者，看看他们是否可以进一步改善单节点性能。
## 随资源和节点的扩展 {#scaling-with-resources-and-nodes}

随资源和节点扩展适用于读取和插入查询。
### 垂直扩展 {#vertical-scaling}

之前的所有调优和查询仅使用了我们 ClickHouse Cloud 集群中的单个节点。用户通常还会有多个 ClickHouse 节点可用。我们建议用户首先进行垂直扩展，随着核心数量的增加线性提升 S3 吞吐量。如果我们在一个更大的 ClickHouse Cloud 节点上重复之前的插入和读取查询（资源是其两倍，64GiB，16 vCPUs，并配以适当的设置），则两者的执行速度都大约提高了一倍。

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
单个节点在网络和 S3 GET 请求上也可能成为瓶颈，从而阻碍垂直性能的线性扩展。
:::
### 水平扩展 {#horizontal-scaling}

最终，出于硬件可用性和成本效益，通常需要进行水平扩展。在 ClickHouse Cloud 中，生产集群至少有 3 个节点。因此，用户可能希望利用所有节点进行插入。

利用集群进行 S3 读取需要使用如 [利用集群](/integrations/s3#utilizing-clusters)中的 `s3Cluster` 函数。这允许将读取分布到各个节点上。

首次接收插入查询的服务器首先解析 glob 模式，然后将每个匹配文件的处理动态分配给自身和其他服务器。

<img src={S3Cluster} alt="ClickHouse 中的 s3Cluster 函数" />

我们将之前的读取查询重复并将工作负载分配到 3 个节点之间，调整查询以使用 `s3Cluster`。在 ClickHouse Cloud 中，通过引用 `default` 集群会自动执行此操作。

正如 [利用集群](/integrations/s3#utilizing-clusters) 中提到的，这项工作是以文件为单位分配的。要受益于该特性，用户需要足够多的文件，即文件数量大于节点数。

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

同样，我们的插入查询也可以分布使用之前识别出的改进设置进行单节点插入：

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```

读者会注意到文件读取改善了查询性能但没有改善插入性能。默认情况下，尽管读取使用 `s3Cluster` 进行分发，但插入仍会发生在发起节点上。这意味着虽然读取将发生在每个节点，但结果行将被路由到发起节点进行分发。在高吞吐场景中，这可能会成为瓶颈。为了解决此问题，请设置 `s3cluster` 函数的参数 `parallel_distributed_insert_select`。

将其设置为 `parallel_distributed_insert_select=2`，确保 `SELECT` 和 `INSERT` 将在每个节点的分布式引擎的底层表的每个分片上执行。

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
### 禁用去重 {#disable-de-duplication}

插入操作有时可能会因超时等错误而失败。当插入失败时，数据可能已成功插入，也可能没有。为了允许客户端安全地重试插入，在 ClickHouse Cloud 等分布式部署中，ClickHouse 会尝试确定数据是否已成功插入。如果插入的数据被标记为重复，ClickHouse 不会将其插入目标表中。然而，用户仍然会收到与数据正常插入一样的成功操作状态。

虽然这种行为（会导致插入开销）在从客户端或批量加载数据时是有意义的，但在从对象存储执行 `INSERT INTO SELECT` 时可能是不必要的。通过在插入时禁用此功能，我们可以如下面所示改善性能：

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

在 ClickHouse 中，`optimize_on_insert` 设置控制在插入过程中数据分片是否被合并。当启用时（默认值为 `optimize_on_insert = 1`），小的分片会在插入时合并成更大的分片，从而通过减少需要读取的分片数量来提高查询性能。然而，这种合并会对插入过程增加开销，可能会减慢高吞吐量的插入操作。

禁用此设置（`optimize_on_insert = 0`）将在插入期间跳过合并，允许更快速地写入数据，尤其是在处理频繁的小规模插入时。合并过程会被推迟到后台进行，这样可以提高插入性能，但临时增加的小分片数量可能会在后台合并完成之前降低查询性能。当插入性能是优先考虑的问题，并且后台合并过程能够在稍后有效地处理优化时，此设置是理想的。如下面所示，禁用该设置可以提高插入吞吐量：

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```
## 其他说明 {#misc-notes}

* 对于内存较低的情况，考虑在插入 S3 时降低 `max_insert_delayed_streams_for_parallel_write`。
