---
'slug': '/best-practices/selecting-an-insert-strategy'
'sidebar_position': 10
'sidebar_label': '选择插入策略'
'title': '选择插入策略'
'description': '页面描述如何在 ClickHouse 中选择插入策略'
'keywords':
- 'INSERT'
- 'asynchronous inserts'
- 'compression'
- 'batch inserts'
'show_related_blogs': true
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import insert_process from '@site/static/images/bestpractices/insert_process.png';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';
import AsyncInserts from '@site/i18n/zh/docusaurus-plugin-content-docs/current/best-practices/_snippets/_async_inserts.md';
import BulkInserts from '@site/i18n/zh/docusaurus-plugin-content-docs/current/best-practices/_snippets/_bulk_inserts.md';

高效的数据摄取是高性能 ClickHouse 部署的基础。选择正确的插入策略可以显著影响吞吐量、成本和可靠性。本节概述了最佳实践、权衡和配置选项，以帮助您为工作负载做出正确的决策。

:::note
以下内容假设您是通过客户端将数据推送到 ClickHouse。如果您是通过例如使用内置表函数 [s3](/sql-reference/table-functions/s3) 和 [gcs](/sql-reference/table-functions/gcs) 将数据拉入 ClickHouse，我们建议您查看我们的指南 [“优化 S3 插入和读取性能”](/integrations/s3/performance)。
:::

## 默认的同步插入 {#synchronous-inserts-by-default}

默认情况下，插入到 ClickHouse 是同步的。每个插入查询立即在磁盘上创建一个存储部分，包括元数据和索引。

:::note 如果可以在客户端对数据进行批处理，请使用同步插入
如果不能，请查看下面的 [异步插入](#asynchronous-inserts)。
:::

我们简要回顾 ClickHouse 的 MergeTree 插入机制：

<Image img={insert_process} size="lg" alt="插入过程" background="black"/>

#### 客户端步骤 {#client-side-steps}

为了获得最佳性能，数据必须 ①[批处理](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)，使批处理大小成为 **第一项决定**。

ClickHouse 按照表的主键列（列）在磁盘上存储插入的数据，[有序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)。**第二项决策**是是否在传输到服务器之前 ②对数据进行预排序。如果一个批次按照主键列预排序到达，ClickHouse 可以[跳过](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595) ⑨ 排序步骤，从而加快摄取速度。

如果要摄取的数据没有预定义格式，**关键决策**是选择一种格式。ClickHouse 支持以 [超过 70 种格式](/interfaces/formats) 插入数据。但是，当使用 ClickHouse 命令行客户端或编程语言客户端时，这个选择通常是自动处理的。如果需要，也可以显式覆盖该自动选择。

下一个 **主要决定**是 ④ 是否在传输到 ClickHouse 服务器之前压缩数据。压缩可以减少传输大小，提高网络效率，从而加快数据传输速度并降低带宽使用，尤其是对于大数据集。

数据 ⑤ 被传输到 ClickHouse 网络接口——可以是 [本机](/interfaces/tcp) 或 [HTTP](/interfaces/http) 接口（我们会在本文后面对此进行 [比较](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults)）。

#### 服务器端步骤 {#server-side-steps}

在 ⑥ 接收到数据后，如果使用了压缩，ClickHouse 将 ⑦ 解压缩数据，然后 ⑧ 从最初发送的格式中解析数据。

利用格式化数据的值和目标表的 [DDL](/sql-reference/statements/create/table) 语句，ClickHouse ⑨ 在内存中构建以 MergeTree 格式的 [块](/development/architecture#block)，如果行尚未预排序，则 ⑩ [按主键列排序](/parts#what-are-table-parts-in-clickhouse)，⑪ 创建 [稀疏主索引](/guides/best-practices/sparse-primary-indexes)，⑫ 应用 [每列压缩](/parts#what-are-table-parts-in-clickhouse)，并 ⑬ 将数据作为新的 ⑭ [数据部分](/parts) 写入磁盘。

### 如果同步则批量插入 {#batch-inserts-if-synchronous}

<BulkInserts/>

### 确保幂等重试 {#ensure-idempotent-retries}

同步插入也是 **幂等的**。使用 MergeTree 引擎时，ClickHouse 默认会去重插入。这能保护您免受歧义失败情况的影响，例如：

* 插入成功，但客户端因网络中断而未收到确认。
* 插入在服务器端失败并超时。

在这两种情况下，安全的 **重试插入** 是安全的——只要批处理的内容和顺序保持不变。因此，客户端的一致重试至关重要，不能修改或重新排序数据。

### 选择正确的插入目标 {#choose-the-right-insert-target}

对于分片集群，您有两个选择：

* 直接插入到 **MergeTree** 或 **ReplicatedMergeTree** 表中。当客户端可以在分片之间执行负载均衡时，这是最有效的选项。在 `internal_replication = true` 的情况下，ClickHouse 透明地处理复制。
* 插入到 [分布式表](/engines/table-engines/special/distributed)。这允许客户端将数据发送到任何节点，并让 ClickHouse 将其转发到正确的分片。这更简单，但由于额外的转发步骤，性能略低。仍然建议使用 `internal_replication = true`。

**在 ClickHouse Cloud 中，所有节点都读取和写入同一个分片。插入会自动在节点之间平衡。用户只需将插入发送到公开终端即可。**

### 选择正确的格式 {#choose-the-right-format}

选择正确的输入格式对于 ClickHouse 的高效数据摄取至关重要。支持超过 70 种格式时，选择性能最好的选项可以显著影响插入速度、CPU 和内存使用，以及整个系统的效率。

虽然灵活性对数据工程和基于文件的导入很有用，但 **应用应该优先考虑面向性能的格式**：

* **本机格式**（推荐）：效率最高。列式，服务器端所需的解析最小。在 Go 和 Python 客户端中默认使用。
* **RowBinary**：高效的行式格式，适合在客户端进行列式转换困难时使用。在 Java 客户端中使用。
* **JSONEachRow**：使用简单但解析开销较大。适用于低容量用例或快速集成。

### 使用压缩 {#use-compression}

压缩在减少网络开销、加快插入速度和降低 ClickHouse 的存储成本中发挥着关键作用。有效使用它可以提升摄取性能，而无需更改数据格式或架构。

压缩插入数据可以减小通过网络发送的负载大小，最小化带宽使用，加快传输速度。

对于插入操作，当与本机格式一起使用时，压缩尤其有效，因为这种格式已经与 ClickHouse 的内部列式存储模型匹配。在这种设置中，服务器可以有效地解压缩并直接存储数据，而无需进行大量转化。

#### 使用 LZ4 提升速度，使用 ZSTD 提升压缩比 {#use-lz4-for-speed-zstd-for-compression-ratio}

ClickHouse 在数据传输期间支持几种压缩编解码器。其中两个常见选项是：

* **LZ4**：快速且轻量。它在 CPU 开销最小的情况下显著降低数据大小，适合高吞吐量的插入，是大多数 ClickHouse 客户端中的默认选项。
* **ZSTD**：更高的压缩比但 CPU 开销更多。当网络传输成本较高（例如跨区域或云提供商场景）时非常有用，尽管它略微增加客户端计算和服务器端解压缩时间。

最佳实践：使用 LZ4，除非您有带宽限制或产生数据出站成本 - 然后考虑 ZSTD。

:::note
在 [FastFormats 基准](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient) 的测试中，LZ4 压缩的本机插入将数据大小减少了超过 50%，将 5.6 GiB 数据集的摄取时间从 150 秒减少到 131 秒。切换到 ZSTD 将同一数据集压缩到 1.69 GiB，但略微增加了服务器端处理时间。
:::

#### 压缩减少资源使用 {#compression-reduces-resource-usage}

压缩不仅减少了网络流量，还提高了服务器的 CPU 和内存效率。通过压缩数据，ClickHouse 接收到更少的字节，并花费更少的时间解析大型输入。当从多个并发客户端摄取时，这一好处尤其重要，比如在可观测性场景中。

对于 LZ4，压缩对 CPU 和内存的影响是适度的；对于 ZSTD，则是中等的。即使在负载下，由于减少了数据量，服务器端的效率也会提高。

**将压缩与批处理和高效输入格式（如本机格式）结合使用可获得最佳摄取性能。**

在使用本机接口（例如 [clickhouse-client](/interfaces/cli)）时，LZ4 压缩默认为启用状态。您可以通过设置选择切换到 ZSTD。

对于 [HTTP 接口](/interfaces/http)，使用 Content-Encoding 头来应用压缩（例如 Content-Encoding: lz4）。整个负载必须在发送之前完成压缩。

### 如果低成本，则进行预排序 {#pre-sort-if-low-cost}

在插入之前按主键对数据进行预排序可以提高 ClickHouse 的摄取效率，特别是对于大批量数据。

当数据以预排序方式到达时，ClickHouse 可以跳过或简化在创建部分期间的内部排序步骤，从而降低 CPU 使用并加快插入过程。预排序还提高了压缩效率，因为相似值会组合在一起 - 使得像 LZ4 或 ZSTD 这样的编解码器能够实现更好的压缩比。这在与大批量插入和压缩结合使用时尤为有益，因为它减少了处理开销和传输数据量。

**也就是说，预排序是一种可选的优化——不是强制要求。** ClickHouse 使用并行处理高效地对数据进行排序，在许多情况下，服务器端排序的速度可能更快或更方便，而不是在客户端进行预排序。

**我们建议仅在数据已经几乎有序或客户端资源（CPU、内存）充分且未被利用时进行预排序。** 在那些对延迟敏感或高吞吐量的用例中，例如可观测性，数据随着顺序或来自许多代理到达，通常最好跳过预排序，依赖 ClickHouse 的内置性能。

## 异步插入 {#asynchronous-inserts}

<AsyncInserts />

## 选择接口 - HTTP 或本机 {#choose-an-interface}

### 本机 {#choose-an-interface-native}

ClickHouse 提供两种主要的数据摄取接口：**本机接口**和**HTTP 接口** - 每种接口在性能和灵活性之间都有取舍。本机接口用于 [clickhouse-client](/interfaces/cli) 和一些语言客户端（如 Go 和 C++），是为性能量身定制的。它始终以 ClickHouse 高效的本机格式传输数据，支持以 LZ4 或 ZSTD 进行块级压缩，并通过将解析和格式转换等工作委派给客户端来最小化服务器端的处理。

它甚至允许在客户端计算 MATERIALIZED 和 DEFAULT 列的值，使服务器能够完全跳过这些步骤。这使得本机接口非常适合对效率要求极高的高吞吐量摄取场景。

### HTTP {#choose-an-interface-http}

与许多传统数据库不同，ClickHouse 还支持 HTTP 接口。**相反，它优先考虑兼容性和灵活性。** 它允许以 [任何支持的格式](/integrations/data-formats) 发送数据——包括 JSON、CSV、Parquet 等，并在大多数 ClickHouse 客户端（包括 Python、Java、JavaScript 和 Rust）中广泛支持。

这通常比 ClickHouse 的本机协议更可取，因为它允许通过负载均衡器轻松切换流量。我们预计使用本机协议时的插入性能会有小幅差异，其开销较小。

但是，它缺乏本机协议的更深层次集成，无法进行客户端优化，如计算物化值或自动转换为本机格式。虽然 HTTP 插入仍然可以使用标准 HTTP 头压缩（例如 `Content-Encoding: lz4`），但压缩是应用于整个负载，而不是单独数据块。这种接口通常在协议简化、负载均衡或广泛格式兼容性比原始性能更重要的环境中更受欢迎。

有关这些接口的更详细描述，请见 [这里](/interfaces/overview)。
