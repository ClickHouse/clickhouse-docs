---
'slug': '/integrations/s3/performance'
'sidebar_position': 2
'sidebar_label': '优化性能'
'title': '优化 S3 插入和读取性能'
'description': '优化 S3 的读取和插入性能'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import InsertMechanics from '@site/static/images/integrations/data-ingestion/s3/insert_mechanics.png';
import Pull from '@site/static/images/integrations/data-ingestion/s3/pull.png';
import Merges from '@site/static/images/integrations/data-ingestion/s3/merges.png';
import ResourceUsage from '@site/static/images/integrations/data-ingestion/s3/resource_usage.png';
import InsertThreads from '@site/static/images/integrations/data-ingestion/s3/insert_threads.png';
import S3Cluster from '@site/static/images/integrations/data-ingestion/s3/s3Cluster.png';
import HardwareSize from '@site/static/images/integrations/data-ingestion/s3/hardware_size.png';

此部分重点讨论在使用 [s3 表函数](/sql-reference/table-functions/s3) 从 S3 读取和插入数据时的性能优化。

:::info
**本指南中描述的内容可适用于其他具有专用表函数的对象存储实现，例如 [GCS](/sql-reference/table-functions/gcs) 和 [Azure Blob 存储](/sql-reference/table-functions/azureBlobStorage)。**
:::

在调整线程和块大小以改善插入性能之前，我们建议用户了解 S3 插入的机制。如果您熟悉插入机制，或想要一些快速提示，可以跳到我们下面的示例 [中](/integrations/s3/performance#example-dataset)。

## 插入机制 (单节点) {#insert-mechanics-single-node}

除了硬件规模，还有两个主要因素影响 ClickHouse 的数据插入机制的性能和资源使用（对于单节点）：**插入块大小**和**插入并行性**。

### 插入块大小 {#insert-block-size}

<Image img={InsertMechanics} size="lg" border alt="ClickHouse 中插入块大小的机制" />

在执行 `INSERT INTO SELECT` 时，ClickHouse 收到一部分数据，并从接收到的数据中 ① 形成（至少）一个内存中的插入块（每个 [分区键](/engines/table-engines/mergetree-family/custom-partitioning-key)）。该块的数据经过排序，并应用特定于表引擎的优化。然后，数据被压缩并 ② 以新数据部分的形式写入数据库存储。

插入块大小影响 ClickHouse 服务器的 [磁盘文件 I/O 使用](https://en.wikipedia.org/wiki/Category:Disk_file_systems) 和内存使用。较大的插入块使用更多的内存，但生成更大且更少的初始部分。ClickHouse 需要为大量数据创建的部分越少，磁盘文件 I/O 和自动 [后台合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) 所需的工作越少。

使用 `INSERT INTO SELECT` 查询结合集成表引擎或表函数时，数据由 ClickHouse 服务器拉取：

<Image img={Pull} size="lg" border alt="在 ClickHouse 中从外部源提取数据" />

在数据完全加载之前，服务器执行一个循环：

```bash
① Pull and parse the next portion of data and form an in-memory data block (one per partitioning key) from it.

② Write the block into a new part on storage.

Go to ① 
```

在 ① 中，大小取决于插入块大小，可以通过两个设置来控制：

- [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows)（默认值：`1048545` 百万行）
- [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes)（默认值：`256 MiB`）

当收集到的插入块中的行数达到指定值或达到配置的数据量（以先到者为准）时，将触发该块写入新部分。插入循环在步骤 ① 继续。

请注意，`min_insert_block_size_bytes` 值表示的是未压缩的内存块大小（而不是压缩后在磁盘上的部分大小）。还要注意，创建的块和部分很少准确包含配置的行数或字节数，因为 ClickHouse 是按行- [块](/operations/settings/settings#max_block_size) 的方式流式处理和 [处理](https://clickhouse.com/company/events/query-performance-introspection) 数据。因此，这些设置指定了最小阈值。

#### 注意合并 {#be-aware-of-merges}

配置的插入块大小越小，针对大量数据加载产生的初始部分数量越多，同时在数据摄取过程中并行执行的后台部分合并也越多。这可能导致资源争用（CPU 和内存），并在完成摄取后需要额外的时间（以达到 [健康](https://operations/settings/merge-tree-settings#parts_to_throw_insert)（3000）数量的部分）。

:::important
如果部分数量超过 [推荐限制](/operations/settings/merge-tree-settings#parts_to_throw_insert)，ClickHouse 的查询性能将受到负面影响。
:::

ClickHouse 会持续 [合并部分](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) 为更大的部分，直到它们的 [压缩大小达到](https://operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 大约 150 GiB。此图显示了 ClickHouse 服务器如何合并部分：

<Image img={Merges} size="lg" border alt="ClickHouse 中的后台合并" />

单个 ClickHouse 服务器利用多个 [后台合并线程](/operations/server-configuration-parameters/settings#background_pool_size) 执行并发 [部分合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes)。每个线程执行一个循环：

```bash
① Decide which parts to merge next, and load these parts as blocks into memory.

② Merge the loaded blocks in memory into a larger block.

③ Write the merged block into a new part on disk.

Go to ①
```

请注意，[增加](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size) CPU 核心数和 RAM 大小时可提高后台合并的吞吐量。

合并为更大部分的部分被标记为 [非活动](/operations/system-tables/parts)，并在经过 [可配置](/operations/settings/merge-tree-settings#old_parts_lifetime) 数分钟后最终被删除。随着时间的推移，这会形成一个合并部分的树（因此有了 [`MergeTree`](/engines/table-engines/mergetree-family) 表的名称）。

### 插入并行性 {#insert-parallelism}

<Image img={ResourceUsage} size="lg" border alt="插入并行性的资源使用" />

ClickHouse 服务器可以并行处理和插入数据。插入并行性的水平影响 ClickHouse 服务器的摄取吞吐量和内存使用。并行加载和处理数据需要更多的主内存，但可以提高摄取吞吐量，因为数据处理速度更快。

像 s3 这样的表函数允许通过 glob 模式指定要加载的文件名集合。当 glob 模式匹配多个现有文件时，ClickHouse 可以在这些文件之间以及在文件内并行读取，并利用并行运行的插入线程（每个服务器）将数据并行插入到表中：

<Image img={InsertThreads} size="lg" border alt="ClickHouse 中的并行插入线程" />

在所有文件的数据处理完成之前，每个插入线程执行一个循环：

```bash
① Get the next portion of unprocessed file data (portion size is based on the configured block size) and create an in-memory data block from it.

② Write the block into a new part on storage.

Go to ①. 
```

这样的并行插入线程数量可以使用 [`max_insert_threads`](/operations/settings/settings#max_insert_threads) 设置进行配置。开源 ClickHouse 的默认值为 `1`，而 [ClickHouse Cloud](https://clickhouse.com/cloud) 的默认值为 4。

对于大量文件，多个插入线程的并行处理效果很好。它可以充分利用可用的 CPU 核心和网络带宽（用于并行文件下载）。在需要将少量大文件加载到表中的场景下，ClickHouse 会自动建立高水平的数据处理并行性，并通过为每个插入线程生成额外的读线程，来优化网络带宽的使用，以并行读取（下载）大文件中更不同的范围。

对于 s3 函数和表，单个文件的并行下载由 [max_download_threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) 和 [max_download_buffer_size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size) 的值决定。只有当文件的大小大于 `2 * max_download_buffer_size` 时，文件才会并行下载。默认情况下，`max_download_buffer_size` 设置为 10MiB。在某些情况下，您可以安全地将此缓冲区大小增加到 50 MB（`max_download_buffer_size=52428800`），以确保每个文件仅由一个线程下载。这可以减少每个线程在 S3 调用时的耗时，从而降低 S3 等待时间。此外，对于那些过小而无法并行读取的文件，为了提高吞吐量，ClickHouse 会自动通过异步预读取这些文件来提前获取数据。

## 性能测量 {#measuring-performance}

使用 S3 表函数优化查询性能是必要的，尤其是在针对数据进行即时查询时，即仅使用 ClickHouse 计算，且数据仍以原始格式保留在 S3 中，以及在从 S3 插入数据到 ClickHouse MergeTree 表引擎时。默认情况下，以下建议适用于这两种情况。

## 硬件规模影响 {#impact-of-hardware-size}

<Image img={HardwareSize} size="lg" border alt="硬件规模对 ClickHouse 性能的影响" />

可用 CPU 核心数和 RAM 大小影响：

- 支持的 [初始部分大小](#insert-block-size)
- 可能的 [插入并行性水平](#insert-parallelism)
- [后台部分合并的吞吐量](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)

因此，会影响整体的摄取吞吐量。

## 区域本地性 {#region-locality}

确保您的桶位于与 ClickHouse 实例相同的区域。这一简单优化可以显著提高吞吐性能，尤其是当您在 AWS 基础设施上部署 ClickHouse 实例时。

## 格式 {#formats}

ClickHouse 可以使用 `s3` 函数和 `S3` 引擎读取存储在 S3 桶中的 [支持格式](/interfaces/formats#formats-overview) 的文件。如果是读取原始文件，其中一些格式具有明显的优势：

* 具有编码列名的格式，如 Native、Parquet、CSVWithNames 和 TabSeparatedWithNames，在查询时会减少冗长，因为用户不需要在 `s3` 函数中指定列名。列名允许推断该信息。
* 格式在读取和写入吞吐量方面会有所不同。Native 和 Parquet 代表了读取性能的最优格式，因为它们已经是列式的且更紧凑。Native 格式还得益于与 ClickHouse 在内存中存储数据的方式一致，从而减少数据流入 ClickHouse 时的处理开销。
* 块大小往往会影响对大文件的读取延迟。如果你只对数据进行取样，例如返回前 N 行，这一点是非常明显的。在 CSV 和 TSV 等格式的情况下，必须解析文件以返回一组行。Native 和 Parquet 等格式则允许更快的取样。
* 每种压缩格式都有其优缺点，通常平衡压缩级别以获得速度，并偏向于压缩或解压缩性能。如果压缩原始文件如 CSV 或 TSV，lz4 提供最快的解压缩性能，但压缩级别较低。Gzip 通常会提供更好的压缩效果，但会稍微降低读取速度。Xz 更是如此，通常提供最佳的压缩效果，但压缩和解压缩性能最慢。如果导出，Gz 和 lz4 提供可比的压缩速度。请根据您的连接速度进行平衡。由于连接到 S3 桶的速度较慢，任何来自更快解压缩或压缩的收益都会被抵消。
* Native 或 Parquet 等格式通常不值得压缩带来的开销。因为这些格式本身就很紧凑，所以数据大小的节省可能非常有限。所花费的时间用来压缩和解压缩通常不会抵消网络传输时间——特别是因为 S3 在全球范围内可用，且具有更高的网络带宽。

## 示例数据集 {#example-dataset}

为了进一步说明潜在的优化目的，我们将使用 [Stack Overflow 数据集中的帖子](/data-modeling/schema-design#stack-overflow-dataset)——优化该数据的查询和插入性能。

该数据集包含 189 个 Parquet 文件，每个文件对应于 2008 年 7 月至 2024 年 3 月的每个月。

请注意，我们为了性能使用 Parquet，根据我们 [上述建议](#formats) 在与桶位于同一地区的 ClickHouse 集群上执行所有查询。该集群有 3 个节点，每个节点具有 32GiB 的 RAM 和 8 个 vCPU。

在没有调整的情况下，我们展示了将此数据集插入 MergeTree 表引擎的性能以及执行计算提问最多的用户的查询。这两个查询都故意要求对数据执行完整扫描。

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

在我们的示例中，我们只返回少量行。如果测量 `SELECT` 查询的性能，其中大量数据被返回到客户端，请使用 [null 格式](/interfaces/formats/#null) 进行查询或将结果直接导向 [`Null` 引擎](/engines/table-engines/special/null.md)。这样可以避免客户端被大量数据压倒并导致网络饱和。

:::info
在进行读取查询时，初始查询往往看起来比重复相同查询时要慢。这可以归因于 S3 自身的缓存以及 [ClickHouse 架构推断缓存](/operations/system-tables/schema_inference_cache)。该缓存存储了推断的架构信息，因此在后续访问时可以跳过推断步骤，从而减少查询时间。
:::

## 使用线程读取 {#using-threads-for-reads}

S3 的读取性能会与核心数线性扩展，前提是您的网络带宽或本地 I/O 不受限制。增加线程数也会带来用户需要注意的内存开销。以下配置可优化读取吞吐性能：

* 通常，`max_threads` 的默认值是足够的，即核心数量。如果查询所使用的内存量很高，且需要减少，或结果的 `LIMIT` 较低，可以将此值设置得更低。有大量内存的用户可能希望尝试增加此值，以便从 S3 获取更高的读取吞吐量。通常这在核心数量较少的机器上是有益的，即少于 10 核。如果进一步并行处理，通常会由于其他资源成为瓶颈，例如网络和 CPU 竞争，因此收益会降低。
* 在版本低于 22.3.1 的 ClickHouse 中，仅在使用 `s3` 函数或 `S3` 表引擎时才会对多个文件进行并行读取。这要求用户确保文件在 S3 上被拆分为块，并通过 glob 模式读取以获得最佳读取性能。后续版本现在则实现了文件内的下载并行。
* 在低线程计数场景中，用户可以通过将 `remote_filesystem_read_method` 设置为 "read" 以实现从 S3 的同步读取文件。
* 对于 s3 函数和表，单个文件的并行下载由 [`max_download_threads`](/operations/settings/settings#max_download_threads) 和 [`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size) 的值决定。虽然 [`max_download_threads`](/operations/settings/settings#max_download_threads) 控制使用的线程数量，但只有当文件的大小大于 2 * `max_download_buffer_size` 时，文件才会并行下载。默认情况下，`max_download_buffer_size` 设置为 10MiB。在某些情况下，您可以安全地将此缓冲区大小增加到 50 MB（`max_download_buffer_size=52428800`），以确保较小的文件仅由一个线程下载。这可以减少每个线程在 S3 调用时的耗时，从而降低 S3 等待时间。请查看 [这篇博客](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge) 以获取示例。

在进行任何提高性能的更改之前，请务必进行适当测量。由于 S3 API 调用对延迟非常敏感，可能会影响客户端的计时，请使用查询日志获取性能指标，即 `system.query_log`。

考虑我们之前的查询，将 `max_threads` 加倍至 `16`（默认的 `max_thread` 为节点上的核心数量）提高了我们的读取查询性能 2 倍，但增加了内存消耗。进一步增加 `max_threads` 将会出现收益递减的问题，如下所示。

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

为了实现最佳的摄取性能，您必须选择（1）插入块大小和（2）基于（3）可用 CPU 核心和 RAM 的适当插入并行性等级。总结如下：

- 我们越大地 [配置插入块大小](#insert-block-size)，ClickHouse 需要创建的部分就越少，因此所需的 [磁盘文件 I/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems) 和 [后台合并](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) 就越少。 
- 我们越高地配置 [并行插入线程数](#insert-parallelism)，数据的处理速度就越快。

这两个性能因素之间存在相互冲突的权衡（以及与后台部分合并的权衡）。ClickHouse 服务器的可用主内存是有限的。较大的块使用更多的主内存，这限制了我们可以利用的并行插入线程的数量。相反，较高数量的并行插入线程需要更多主内存，因为插入线程的数量决定了内存中并发创建的插入块数量。这限制了插入块的可能大小。此外，插入线程和后台合并线程之间可能会有资源争用。配置较高的插入线程数量（1）创建更多需要合并的部分，并（2）从后台合并线程那里占用 CPU 核心和内存空间。

有关这些参数的行为如何影响性能和资源的详细描述，我们建议 [阅读这篇博客](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2)。如该博客所述，调优可能涉及这两个参数的谨慎平衡。由于这种全面的测试通常不切实际，因此我们总结建议如下：

```bash
• max_insert_threads: choose ~ half of the available CPU cores for insert threads (to leave enough dedicated cores for background merges)

• peak_memory_usage_in_bytes: choose an intended peak memory usage; either all available RAM (if it is an isolated ingest) or half or less (to leave room for other concurrent tasks)

Then:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

使用此公式，您可以将 `min_insert_block_size_rows` 设置为 0（以禁用基于行的阈值），同时将 `max_insert_threads` 设置为所选值，将 `min_insert_block_size_bytes` 设置为上述公式的计算结果。

使用此公式时参考我们之前的 Stack Overflow 示例。

- `max_insert_threads=4`（每个节点 8 核心）
- `peak_memory_usage_in_bytes` - 32 GiB（节点资源的 100%）或 `34359738368` 字节。
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```

如所示，调整这些设置使插入性能提高了超过 `33%`。我们留给读者来查看是否能进一步提高单节点性能。

## 随资源和节点进行扩展 {#scaling-with-resources-and-nodes}

随资源和节点进行扩展适用于读取和插入查询。

### 垂直扩展 {#vertical-scaling}

所有之前的调优和查询仅使用了我们 ClickHouse Cloud 集群中的单个节点。用户通常也会有多个 ClickHouse 节点可用。我们建议用户初步进行垂直扩展，按核心数量线性提高 S3 吞吐量。如果我们在更大的 ClickHouse Cloud 节点上重复之前的插入和读取查询，达到两倍的资源（64GiB，16 vCPUs），则两者的执行速度大约提高了两倍。

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
单个节点也可能会因网络和 S3 GET 请求造成瓶颈，从而阻碍垂直性能的线性扩展。
:::

### 水平扩展 {#horizontal-scaling}

最终，通常由于硬件可用性和成本效益，需要进行水平扩展。在 ClickHouse Cloud 中，生产集群至少有 3 个节点。因此，用户也可能希望利用所有节点进行插入。

利用集群进行 S3 读取需要使用 `s3Cluster` 函数，如 [利用集群](/integrations/s3#utilizing-clusters) 中所述。这允许读取分布在多个节点上。

最初接收插入查询的服务器首先解析 glob 模式，然后动态地将每个匹配文件的处理分配给自身和其他服务器。

<Image img={S3Cluster} size="lg" border alt="ClickHouse 中的 s3Cluster 函数" />

我们重复之前的读取查询，将工作负载分配到 3 个节点，调整查询以使用 `s3Cluster`。在 ClickHouse Cloud 中，通过引用 `default` 集群自动执行此操作。

如 [利用集群](/integrations/s3#utilizing-clusters) 中所述，此工作在文件级别分配。要受益于此功能，用户需要有足够多的文件，例如数量大于节点数。

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

同样，我们的插入查询可以被分配，使用之前在单节点上识别的改进设置：

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```

读者将注意到文件读取的查询性能有所提高，但插入性能却未受影响。默认情况下，尽管读取是通过 `s3Cluster` 分发的，但插入将发生在发起节点上。这意味着，尽管读取将在每个节点上进行，结果行将被路由到发起节点以进行分发。在高吞吐量场景下，这可能会造成瓶颈。为了解决这个问题，可以为 `s3cluster` 函数设置参数 `parallel_distributed_insert_select`。

将其设置为 `parallel_distributed_insert_select=2`，确保 `SELECT` 和 `INSERT` 将在每个节点的分布式引擎的底层表上下分片执行。

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```

如预期的那样，这将插入性能降低了 3 倍。

## 进一步调整 {#further-tuning}

### 禁用去重 {#disable-de-duplication}

插入操作有时由于超时等错误而失败。当插入失败时，数据可能已成功插入，也可能未成功插入。为了允许客户端安全地重试插入，ClickHouse 在如 ClickHouse Cloud 这样的分布式部署中默认尝试确定数据是否已经成功插入。如果插入的数据被标记为重复，ClickHouse 不会将其插入目标表中。然而，用户仍会像数据正常插入一样收到成功操作状态。

这种行为将在加载数据时，特别是从客户端或批量加载数据时是合理的，但在从对象存储执行 `INSERT INTO SELECT` 时则可能不必要。通过在插入时禁用此功能，我们可以改善如下所示的性能：

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

在 ClickHouse 中，`optimize_on_insert` 设置控制在插入过程中数据部分是否进行合并。当启用时（默认值 `optimize_on_insert = 1`），小部分在插入时合并为更大的部分，从而通过减少需要读取的部分数量来提高查询性能。然而，这种合并会给插入过程增加开销，从而可能减缓高吞吐量的插入速度。

禁用此设置（`optimize_on_insert = 0`）将跳过在插入时的合并，使得数据能够更快写入，特别是在处理频繁的小插入时。合并过程被推迟到后台，可以获得更好的插入性能，但暂时增加了小部分的数量，这可能会减缓查询，直到后台合并完成。此设置在插入性能优先级高且后台合并过程能够有效处理优化时效果最佳。如如下所示，禁用此设置可以提高插入吞吐量：

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```

## 其他说明 {#misc-notes}

* 对于低内存场景，如果插入到 S3，考虑降低 `max_insert_delayed_streams_for_parallel_write` 的设置。
