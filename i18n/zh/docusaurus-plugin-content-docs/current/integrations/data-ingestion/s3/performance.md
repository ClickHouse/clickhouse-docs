---
slug: /integrations/s3/performance
sidebar_position: 2
sidebar_label: '性能优化'
title: '优化 S3 写入与读取性能'
description: '优化 S3 读取和写入性能'
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

本节重点介绍在使用 [s3 table functions](/sql-reference/table-functions/s3) 从 S3 读取和写入数据时的性能优化。

:::info
**本指南中介绍的方法同样适用于其他具有各自专用 table function 的对象存储实现，例如 [GCS](/sql-reference/table-functions/gcs) 和 [Azure Blob storage](/sql-reference/table-functions/azureBlobStorage)。**
:::

在通过调优线程数和数据块大小来提升写入性能之前，我们建议先了解 S3 写入的工作机制。如果你已经熟悉写入机制，或者只想快速获取一些实践建议，可以直接跳转到下面的[示例](/integrations/s3/performance#example-dataset)。


## 插入机制(单节点) {#insert-mechanics-single-node}

除硬件规模外,影响 ClickHouse 数据插入机制(单节点)性能和资源使用的两个主要因素是:**插入块大小**和**插入并行度**。

### 插入块大小 {#insert-block-size}

<Image
  img={InsertMechanics}
  size='lg'
  border
  alt='ClickHouse 中的插入块大小机制'
/>

执行 `INSERT INTO SELECT` 时,ClickHouse 接收一部分数据,并 ① 从接收的数据中形成(至少)一个内存插入块(每个[分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)对应一个)。块中的数据会被排序,并应用表引擎特定的优化。然后数据被压缩并 ② 以新数据部分的形式写入数据库存储。

插入块大小会影响 ClickHouse 服务器的[磁盘文件 I/O 使用量](https://en.wikipedia.org/wiki/Category:Disk_file_systems)和内存使用量。较大的插入块会使用更多内存,但会生成更大且数量更少的初始部分。ClickHouse 加载大量数据时需要创建的部分越少,所需的磁盘文件 I/O 和自动[后台合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)就越少。

当使用 `INSERT INTO SELECT` 查询结合集成表引擎或表函数时,数据由 ClickHouse 服务器拉取:

<Image
  img={Pull}
  size='lg'
  border
  alt='在 ClickHouse 中从外部源拉取数据'
/>

在数据完全加载之前,服务器执行循环:

```bash
① 拉取并解析下一部分数据,并从中形成一个内存数据块(每个分区键对应一个)。

② 将块写入存储上的新部分。

转到 ①
```

在 ① 中,大小取决于插入块大小,可以通过两个设置来控制:

- [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)(默认值:`1048545` 行)
- [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)(默认值:`256 MiB`)

当插入块中收集到指定的行数,或达到配置的数据量(以先发生者为准)时,将触发块写入新部分。插入循环在步骤 ① 继续。

请注意,`min_insert_block_size_bytes` 值表示未压缩的内存块大小(而非压缩后的磁盘部分大小)。另外请注意,创建的块和部分很少精确包含配置的行数或字节数,因为 ClickHouse 以行-[块](/operations/settings/settings#max_block_size)方式流式传输和[处理](https://clickhouse.com/company/events/query-performance-introspection)数据。因此,这些设置指定的是最小阈值。

#### 注意合并 {#be-aware-of-merges}

配置的插入块大小越小,大数据加载时创建的初始部分就越多,与数据摄取并发执行的后台部分合并也越多。这可能导致资源争用(CPU 和内存),并在摄取完成后需要额外的时间(以达到[健康](/operations/settings/merge-tree-settings#parts_to_throw_insert)的部分数量(3000))。

:::important
如果部分数量超过[推荐限制](/operations/settings/merge-tree-settings#parts_to_throw_insert),ClickHouse 查询性能将受到负面影响。
:::

ClickHouse 将持续[合并部分](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)为更大的部分,直到它们[达到](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool)约 150 GiB 的压缩大小。此图展示了 ClickHouse 服务器如何合并部分:

<Image img={Merges} size='lg' border alt='ClickHouse 中的后台合并' />

单个 ClickHouse 服务器利用多个[后台合并线程](/operations/server-configuration-parameters/settings#background_pool_size)来执行并发[部分合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes)。每个线程执行循环:

```bash
① 决定接下来要合并哪些部分,并将这些部分作为块加载到内存中。

② 将内存中加载的块合并为更大的块。

```


③ 将合并后的数据块写入磁盘上的新分片。

回到 ①

````

请注意,[增加](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size) CPU 核心数和 RAM 大小可以提高后台合并吞吐量。

已合并为更大部分的数据部分会被标记为[非活动状态](/operations/system-tables/parts),并在[可配置](/operations/settings/merge-tree-settings#old_parts_lifetime)的分钟数后最终删除。随着时间推移,这会形成一个合并部分的树形结构(因此得名 [`MergeTree`](/engines/table-engines/mergetree-family) 表)。

### 插入并行性 {#insert-parallelism}

<Image img={ResourceUsage} size="lg" border alt="插入并行性的资源使用情况" />

ClickHouse 服务器可以并行处理和插入数据。插入并行度会影响 ClickHouse 服务器的数据摄取吞吐量和内存使用。并行加载和处理数据需要更多主内存,但由于数据处理速度更快,可以提高数据摄取吞吐量。

像 s3 这样的表函数允许通过 glob 模式指定待加载的文件名集合。当 glob 模式匹配多个现有文件时,ClickHouse 可以跨文件和文件内并行读取数据,并通过利用并行运行的插入线程(每个服务器)将数据并行插入到表中: 

<Image img={InsertThreads} size="lg" border alt="ClickHouse 中的并行插入线程" />

在处理完所有文件的所有数据之前,每个插入线程执行一个循环: 

```bash
① 获取下一部分未处理的文件数据(部分大小基于配置的块大小)并从中创建内存数据块。

② 将该块写入存储上的新部分。

转到 ①。 
````

此类并行插入线程的数量可以通过 [`max_insert_threads`](/operations/settings/settings#max_insert_threads) 设置进行配置。开源版 ClickHouse 的默认值为 `1`，而 [ClickHouse Cloud](https://clickhouse.com/cloud) 的默认值为 `4`。

在文件数量较多的情况下，多插入线程的并行处理效果良好。它可以充分利用可用的 CPU 核心以及网络带宽（用于并行下载文件）。在仅向表中加载少量大文件的场景中，ClickHouse 会自动提高数据处理的并行度，并通过为每个插入线程创建额外的读取线程，以并行读取（下载）大文件中更多彼此不重叠的数据范围，从而优化网络带宽的使用。

对于 `s3` 函数和表，单个文件是否并行下载由 [max&#95;download&#95;threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) 和 [max&#95;download&#95;buffer&#95;size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size) 的取值决定。只有当文件大小大于 `2 * max_download_buffer_size` 时，才会以并行方式下载。默认情况下，`max_download_buffer_size` 被设置为 10 MiB。在某些情况下，你可以安全地将该缓冲区大小增加到 50 MB（`max_download_buffer_size=52428800`），以确保每个文件由单个线程下载。这可以减少每个线程发起 S3 调用所花费的时间，从而降低 S3 等待时间。此外，对于过小而不适合并行读取的文件，为了提高吞吐量，ClickHouse 会通过异步预读此类文件来自动预取数据。


## 性能测量 {#measuring-performance}

在以下两种场景中,优化使用 S3 表函数的查询性能都是必要的:一是对数据进行就地查询,即仅使用 ClickHouse 计算资源进行即席查询,而数据以原始格式保留在 S3 中;二是将数据从 S3 插入到 ClickHouse MergeTree 表引擎中。除非另有说明,以下建议适用于这两种场景。


## 硬件规模的影响 {#impact-of-hardware-size}

<Image
  img={HardwareSize}
  size='lg'
  border
  alt='硬件规模对 ClickHouse 性能的影响'
/>

可用 CPU 核心数和 RAM 大小会影响：

- 支持的[数据分片初始大小](#insert-block-size)
- [插入并行度](#insert-parallelism)水平
- [后台分片合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)的吞吐量

从而影响整体数据摄取吞吐量。


## 区域就近性 {#region-locality}

确保您的存储桶与 ClickHouse 实例位于同一区域。这一简单的优化可以显著提高吞吐量性能,尤其是在 AWS 基础设施上部署 ClickHouse 实例时。


## 格式 {#formats}

ClickHouse 可以使用 `s3` 函数和 `S3` 引擎读取存储在 S3 存储桶中[支持格式](/interfaces/formats#formats-overview)的文件。在读取原始文件时,某些格式具有明显优势:

- 包含编码列名的格式(如 Native、Parquet、CSVWithNames 和 TabSeparatedWithNames)查询时更加简洁,因为用户无需在 `s3` 函数中指定列名。列名信息可以自动推断。
- 不同格式在读写吞吐量方面的性能表现各不相同。Native 和 Parquet 是读取性能最优的格式,因为它们本身采用列式存储且更加紧凑。Native 格式还额外受益于与 ClickHouse 内存数据存储方式的一致性——从而在数据流入 ClickHouse 时减少处理开销。
- 块大小通常会影响大文件读取的延迟。如果只对数据进行采样(例如返回前 N 行),这一点尤为明显。对于 CSV 和 TSV 等格式,必须解析文件才能返回行集。因此,Native 和 Parquet 等格式可以实现更快的采样速度。
- 每种压缩格式都有其优缺点,通常需要在压缩率和速度之间取得平衡,并在压缩或解压缩性能上有所侧重。如果压缩 CSV 或 TSV 等原始文件,lz4 提供最快的解压缩性能,但牺牲了压缩率。Gzip 通常压缩效果更好,但代价是读取速度稍慢。Xz 更进一步,通常提供最佳压缩效果,但压缩和解压缩性能最慢。如果是导出数据,Gz 和 lz4 提供相当的压缩速度。需要根据您的连接速度来权衡。较慢的 S3 存储桶连接速度很容易抵消更快的解压缩或压缩带来的任何收益。
- Native 或 Parquet 等格式通常不值得增加压缩开销。由于这些格式本身就很紧凑,数据大小的节省可能微乎其微。压缩和解压缩所花费的时间很少能抵消网络传输时间——尤其是考虑到 S3 在全球范围内可用且具有较高的网络带宽。


## 示例数据集 {#example-dataset}

为了进一步说明潜在的优化方法,我们将使用 [Stack Overflow 数据集中的帖子数据](/data-modeling/schema-design#stack-overflow-dataset) - 同时优化该数据的查询和插入性能。

该数据集包含 189 个 Parquet 文件,涵盖 2008 年 7 月至 2024 年 3 月期间的每个月。

请注意,根据我们[上述建议](#formats),我们使用 Parquet 格式以获得更好的性能,所有查询都在与存储桶位于同一区域的 ClickHouse 集群上执行。该集群有 3 个节点,每个节点配备 32GiB 内存和 8 个 vCPU。

在未进行任何调优的情况下,我们演示将此数据集插入 MergeTree 表引擎的性能,以及执行查询以计算提问最多的用户。这两个操作都需要对数据进行完整扫描。

```sql
-- 提问最多的用户名
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

-- 加载到 posts 表
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')

0 rows in set. Elapsed: 191.692 sec. Processed 59.82 million rows, 24.03 GB (312.06 thousand rows/s., 125.37 MB/s.)
```

在我们的示例中,仅返回少量行。如果要测量 `SELECT` 查询的性能,且需要向客户端返回大量数据,可以使用 [null 格式](/interfaces/formats/Null) 执行查询,或将结果定向到 [`Null` 引擎](/engines/table-engines/special/null.md)。这样可以避免客户端被数据淹没和网络饱和。

:::info
从 S3 读取数据时,初始查询通常比重复执行相同查询要慢。这可归因于 S3 自身的缓存机制,以及 [ClickHouse 模式推断缓存](/operations/system-tables/schema_inference_cache)。该缓存存储文件的推断模式,这意味着在后续访问时可以跳过推断步骤,从而减少查询时间。
:::


## 使用线程进行读取 {#using-threads-for-reads}

在不受网络带宽或本地 I/O 限制的情况下,S3 的读取性能将随 CPU 核心数量线性扩展。增加线程数量也会带来内存开销的变化,用户应当注意这一点。可以通过修改以下设置来提升读取吞吐量性能:

- 通常,`max_threads` 的默认值(即 CPU 核心数量)已经足够。如果查询使用的内存量较高且需要降低,或者结果的 `LIMIT` 较低,可以将此值设置得更低。内存充足的用户可以尝试增加此值,以获得更高的 S3 读取吞吐量。这通常仅在核心数较少的机器上有益,即少于 10 个核心。随着其他资源成为瓶颈(例如网络和 CPU 争用),进一步并行化带来的收益通常会递减。
- 22.3.1 之前的 ClickHouse 版本在使用 `s3` 函数或 `S3` 表引擎时,仅支持跨多个文件的并行读取。这要求用户确保文件在 S3 上被拆分成多个块,并使用 glob 模式读取以实现最佳读取性能。后续版本现在支持在单个文件内并行化下载。
- 在低线程数场景中,用户可以通过将 `remote_filesystem_read_method` 设置为 "read" 来启用从 S3 同步读取文件,从而获得性能提升。
- 对于 s3 函数和表,单个文件的并行下载由 [`max_download_threads`](/operations/settings/settings#max_download_threads) 和 [`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size) 的值决定。虽然 [`max_download_threads`](/operations/settings/settings#max_download_threads) 控制使用的线程数,但只有当文件大小大于 2 \* `max_download_buffer_size` 时才会并行下载。默认情况下,`max_download_buffer_size` 设置为 10MiB。在某些情况下,您可以安全地将此缓冲区大小增加到 50 MB(`max_download_buffer_size=52428800`),以确保较小的文件仅由单个线程下载。这可以减少每个线程进行 S3 调用所花费的时间,从而降低 S3 等待时间。有关示例,请参阅[此博客文章](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge)。

在进行任何性能优化之前,请确保进行适当的性能测量。由于 S3 API 调用对延迟敏感并可能影响客户端计时,请使用查询日志获取性能指标,即 `system.query_log`。

以我们之前的查询为例,将 `max_threads` 加倍到 `16`(默认 `max_threads` 为节点上的核心数)可以将读取查询性能提高 2 倍,但代价是更高的内存使用。进一步增加 `max_threads` 的收益会递减,如下所示。

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

返回 5 行。耗时:1.505 秒。处理了 5982 万行,24.03 GB(3976 万行/秒,15.97 GB/秒)。
峰值内存使用:178.58 MiB.

SETTINGS max_threads = 32

返回 5 行。耗时:0.779 秒。处理了 5982 万行,24.03 GB(7681 万行/秒,30.86 GB/秒)。
峰值内存使用:369.20 MiB.

SETTINGS max_threads = 64

返回 5 行。耗时:0.674 秒。处理了 5982 万行,24.03 GB(8881 万行/秒,35.68 GB/秒)。
峰值内存使用:639.99 MiB.
```


## 调优插入的线程数和块大小 {#tuning-threads-and-block-size-for-inserts}

要实现最佳的数据摄取性能,您必须根据 (3) 可用的 CPU 核心数和 RAM 容量来选择 (1) 插入块大小和 (2) 适当的插入并行度。总结如下:

- [插入块大小](#insert-block-size)配置得越大,ClickHouse 需要创建的数据分片就越少,所需的[磁盘文件 I/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems) 和[后台合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)操作也越少。
- [并行插入线程数](#insert-parallelism)配置得越高,数据处理速度就越快。

这两个性能因素之间存在相互制约的权衡关系(同时还需要权衡后台数据分片合并)。ClickHouse 服务器的可用主内存是有限的。更大的块会占用更多主内存,从而限制了我们可以使用的并行插入线程数。反之,更多的并行插入线程需要更多主内存,因为插入线程数决定了内存中并发创建的插入块数量,这又限制了插入块的可能大小。此外,插入线程和后台合并线程之间可能存在资源竞争。配置大量插入线程会 (1) 创建更多需要合并的数据分片,以及 (2) 占用后台合并线程的 CPU 核心和内存空间。

关于这些参数的行为如何影响性能和资源的详细说明,我们建议[阅读这篇博客文章](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)。如该博客文章所述,调优需要仔细平衡这两个参数。详尽的测试通常不太现实,因此总结来说,我们建议:

```bash
• max_insert_threads: 为插入线程选择约一半的可用 CPU 核心数(为后台合并留出足够的专用核心)

• peak_memory_usage_in_bytes: 选择预期的峰值内存使用量;如果是独立的数据摄取,可以使用所有可用 RAM,否则使用一半或更少(为其他并发任务留出空间)

然后:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

使用此公式,您可以将 `min_insert_block_size_rows` 设置为 0(禁用基于行数的阈值),同时将 `max_insert_threads` 设置为选定的值,并将 `min_insert_block_size_bytes` 设置为上述公式计算出的结果。

将此公式应用于我们之前的 Stack Overflow 示例:

- `max_insert_threads=4`(每个节点 8 个核心)
- `peak_memory_usage_in_bytes` - 32 GiB(节点资源的 100%)或 `34359738368` 字节
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```

如上所示,调优这些设置已将插入性能提高了 `33%` 以上。我们留给读者探索是否可以进一步提高单节点性能。


## 通过资源和节点进行扩展 {#scaling-with-resources-and-nodes}

通过资源和节点进行扩展适用于读取和插入查询。

### 垂直扩展 {#vertical-scaling}

之前的所有调优和查询都只使用了 ClickHouse Cloud 集群中的单个节点。用户通常也会有多个 ClickHouse 节点可用。我们建议用户首先进行垂直扩展,S3 吞吐量会随着核心数量线性提升。如果我们在资源翻倍的更大 ClickHouse Cloud 节点(64GiB,16 vCPUs)上使用适当的设置重复之前的插入和读取查询,两者的执行速度都会提升约两倍。

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
单个节点也可能受到网络和 S3 GET 请求的瓶颈限制,从而阻碍性能的垂直线性扩展。
:::

### 水平扩展 {#horizontal-scaling}

最终,由于硬件可用性和成本效益的考虑,水平扩展通常是必要的。在 ClickHouse Cloud 中,生产集群至少有 3 个节点。因此,用户可能希望利用所有节点进行插入操作。

利用集群进行 S3 读取需要使用 `s3Cluster` 函数,如[利用集群](/integrations/s3#utilizing-clusters)中所述。这允许将读取操作分布到各个节点上。

最初接收插入查询的服务器首先解析 glob 模式,然后将每个匹配文件的处理动态分派给自身和其他服务器。

<Image
  img={S3Cluster}
  size='lg'
  border
  alt='ClickHouse 中的 s3Cluster 函数'
/>

我们重复之前的读取查询,将工作负载分布到 3 个节点上,调整查询以使用 `s3Cluster`。在 ClickHouse Cloud 中,通过引用 `default` 集群可以自动执行此操作。

如[利用集群](/integrations/s3#utilizing-clusters)中所述,这项工作在文件级别进行分布。要从此功能中受益,用户需要足够数量的文件,即至少大于节点数量。

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

同样,我们的插入查询也可以分布式执行,使用之前为单个节点确定的优化设置:

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```


读者会注意到，读取文件提升了查询性能，但没有提升写入性能。默认情况下，虽然读取是通过 `s3Cluster` 分布式执行的，但插入会在发起查询的节点上执行。这意味着，尽管每个节点都会参与读取，生成的行仍会被路由回发起节点再进行分发。在高吞吐量场景下，这可能成为瓶颈。为了解决这一问题，需要为 `s3cluster` 函数设置参数 `parallel_distributed_insert_select`。

将其设置为 `parallel_distributed_insert_select=2`，可以确保在每个节点上，对分布式引擎在各个分片对应的底层表分别执行 `SELECT` 和 `INSERT` 操作。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```

如预期，这会将插入性能降低 3 倍。


## 进一步调优 {#further-tuning}

### 禁用去重 {#disable-de-duplication}

插入操作有时会因超时等错误而失败。当插入失败时,数据可能已成功插入,也可能未成功插入。为了允许客户端安全地重试插入操作,在分布式部署(如 ClickHouse Cloud)中,ClickHouse 默认会尝试判断数据是否已成功插入。如果插入的数据被标记为重复数据,ClickHouse 不会将其插入到目标表中。但是,用户仍会收到成功操作状态,就像数据已正常插入一样。

虽然这种行为会产生插入开销,但在从客户端或批量加载数据时是合理的,而在从对象存储执行 `INSERT INTO SELECT` 时则可能是不必要的。通过在插入时禁用此功能,我们可以提高性能,如下所示:

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

在 ClickHouse 中,`optimize_on_insert` 设置控制是否在插入过程中合并数据分区。启用时(默认为 `optimize_on_insert = 1`),小分区会在插入时合并为较大的分区,通过减少需要读取的分区数量来提高查询性能。但是,这种合并会增加插入过程的开销,可能会降低高吞吐量插入的速度。

禁用此设置(`optimize_on_insert = 0`)会跳过插入期间的合并,允许更快地写入数据,特别是在处理频繁的小批量插入时。合并过程被推迟到后台执行,从而提高插入性能,但会暂时增加小分区的数量,这可能会降低查询速度,直到后台合并完成。当插入性能是首要考虑因素,并且后台合并过程可以在稍后高效地处理优化时,此设置是理想的选择。如下所示,禁用该设置可以提高插入吞吐量:

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```


## 其他注意事项 {#misc-notes}

- 在低内存场景下,如果向 S3 插入数据,建议降低 `max_insert_delayed_streams_for_parallel_write` 参数值。
