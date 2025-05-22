---
'slug': '/best-practices/selecting-an-insert-strategy'
'sidebar_position': 10
'sidebar_label': '选择插入策略'
'title': '选择插入策略'
'description': '页面描述如何在 ClickHouse 中选择插入策略'
---

import Image from '@theme/IdealImage';
import insert_process from '@site/static/images/bestpractices/insert_process.png';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';
import AsyncInserts from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_async_inserts.md';
import BulkInserts from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_bulk_inserts.md';

高效的数据摄取是高性能 ClickHouse 部署的基础。选择正确的插入策略可以显著影响吞吐量、成本和可靠性。本节概述了最佳实践、权衡和配置选项，以帮助您为工作负载做出正确的决策。

:::note
以下内容假定您通过客户端将数据推送到 ClickHouse。如果您正在将数据拉入 ClickHouse，例如使用内置的表函数 [s3](/sql-reference/table-functions/s3) 和 [gcs](/sql-reference/table-functions/gcs)，我们建议您参考我们的指南 ["针对 S3 插入和读取性能的优化"](/integrations/s3/performance)。
:::

## 默认的同步插入 {#synchronous-inserts-by-default}

默认情况下，插入 ClickHouse 的操作是同步的。每个插入查询立即在磁盘上创建一个存储部分，包括元数据和索引。

:::note 如果可以在客户端批量处理数据，请使用同步插入
如果不能，请参见下面的 [异步插入](#asynchronous-inserts)。
:::

我们简要回顾 ClickHouse 的 MergeTree 插入机制如下：

<Image img={insert_process} size="lg" alt="插入过程" background="black"/>

#### 客户端步骤 {#client-side-steps}

为了获得最佳性能，数据必须 ① [批量处理](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)，批量大小是 **第一个决定**。

ClickHouse 在磁盘上以[有序](https://guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)的方式存储插入的数据，按表的主键列排序。 **第二个决策** 是是否 ② 在传输到服务器之前对数据进行预排序。如果批次按主键列预排序到达，ClickHouse 可以[跳过](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595) ⑨ 排序步骤，从而加速摄取。

如果要摄取的数据没有预定义格式，**关键决策** 是选择格式。ClickHouse 支持插入 [超过 70 种格式](/interfaces/formats)。然而，当使用 ClickHouse 命令行客户端或编程语言客户端时，这种选择通常是自动处理的。如果需要，也可以显式覆盖这种自动选择。

下一个 **主要决策** 是 ④ 在传输到 ClickHouse 服务器之前是否压缩数据。压缩减少了传输大小，提高了网络效率，从而加快数据传输速度并降低带宽使用，尤其是对于大数据集。

数据被 ⑤ 传输到 ClickHouse 网络接口——可以是 [原生的](/interfaces/tcp) 或者[ HTTP](/interfaces/http) 接口（我们将在本文后面[比较](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults) 二者）。

#### 服务器端步骤 {#server-side-steps}

在 ⑥ 接收到数据之后，ClickHouse 会在使用了压缩时 ⑦ 解压缩数据，然后 ⑧ 解析其原始发送格式。

使用从该格式化数据获取的值和目标表的 [DDL](/sql-reference/statements/create/table) 语句，ClickHouse ⑨ 在内存中以 MergeTree 格式构建一个 [块](/development/architecture#block)，如果尚未预排序，则 ⑩ [根据主键列排序](/parts#what-are-table-parts-in-clickhouse) 行，⑪ 创建 [稀疏主索引](/guides/best-practices/sparse-primary-indexes)，⑫ 应用 [按列压缩](/parts#what-are-table-parts-in-clickhouse)，并将数据作为新的 ⑭ [数据部分](/parts) 写入磁盘。

### 如果是同步，则进行批量插入 {#batch-inserts-if-synchronous}

<BulkInserts/>

### 确保幂等重试 {#ensure-idempotent-retries}

同步插入也是 **幂等** 的。当使用 MergeTree 引擎时，ClickHouse 默认会去重插入。这可以防止出现模糊的故障情况，例如：

* 插入成功，但由于网络中断，客户端从未收到确认。
* 插入在服务器端失败并超时。

在这两种情况下，只要批量内容和顺序保持一致，就可以安全地 **重试插入**。因此，确保客户端始终重试，而不修改或重新排序数据是至关重要的。

### 选择正确的插入目标 {#choose-the-right-insert-target}

对于分片集群，您有两个选择：

* 直接插入到 **MergeTree** 或 **ReplicatedMergeTree** 表中。当客户端可以在分片之间进行负载均衡时，这是最有效的选项。通过设置 `internal_replication = true`，ClickHouse 会透明地处理复制。
* 插入到 [分布式表](/engines/table-engines/special/distributed)。这允许客户端将数据发送到任何节点，并让 ClickHouse 转发到正确的分片。这更简单，但由于额外的转发步骤，性能稍微降低。还是建议设置 `internal_replication = true`。

**在 ClickHouse Cloud 中，所有节点都读取和写入同一个单一分片。插入在节点之间自动平衡。用户只需将插入发送到公开的端点。**

### 选择正确的格式 {#choose-the-right-format}

选择正确的输入格式对于 ClickHouse 中高效的数据摄取至关重要。由于支持超过 70 种格式，选择性能最高的选项可以显著影响插入速度、CPU 和内存使用以及整体系统效率。

虽然灵活性对数据工程和基于文件的导入很有用，但 **应用程序应优先考虑以性能为导向的格式**：

* **原生格式**（推荐）：效率最高。列式，服务器端需要的解析最小。Go 和 Python 客户端默认使用。
* **RowBinary**：高效的行式格式，适合在客户端进行列式转换困难时使用。由 Java 客户端使用。
* **JSONEachRow**：易于使用但解析成本高。适合低流量的用例或快速集成。

### 使用压缩 {#use-compression}

压缩在降低网络开销、加速插入和降低 ClickHouse 存储成本方面发挥了关键作用。如果使用得当，它可以提高摄取性能，而无需更改数据格式或架构。

压缩插入数据减少了通过网络发送的有效负载大小，最小化了带宽使用并加速了传输。

对插入而言，压缩在与原生格式结合使用时尤其有效，因为原生格式已经与 ClickHouse 的内部列式存储模型匹配。在这种配置下，服务器可以高效地解压缩并以最低的转换开销直接存储数据。

#### 使用 LZ4 以获取速度，使用 ZSTD 以提升压缩比 {#use-lz4-for-speed-zstd-for-compression-ratio}

ClickHouse 支持多种压缩编码器进行数据传输。两个常见选项是：

* **LZ4**：快速且轻量。减少数据大小显著，CPU 开销最小，适合高吞吐量插入，并且是大多数 ClickHouse 客户端的默认选项。
* **ZSTD**：更高的压缩比，但CPU 密集型。在网络传输成本高的情况下（例如在跨区域或云提供商场景中）很有用，尽管这稍微增加了客户端计算和服务器端解压缩时间。

最佳实践：除非带宽有限或产生成本，否则请使用 LZ4 - 否则考虑 ZSTD。

:::note
在 [FastFormats 基准测试](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient) 中的测试表明，LZ4 压缩的原生插入将数据大小减少了超过 50%，将 5.6 GiB 数据集的摄取时间从 150 秒缩短至 131 秒。切换到 ZSTD 后，同样的数据集缩小至 1.69 GiB，但略微增加了服务器端处理时间。
:::

#### 压缩减少资源使用 {#compression-reduces-resource-usage}

压缩不仅减少网络流量，同时还提高了服务器的 CPU 和内存效率。使用压缩数据，ClickHouse 接收的字节更少，解析大输入所花费的时间也更少。当从多个并发客户端进行摄取时（例如在可观察性场景中），这一好处尤其重要。

对于 LZ4，压缩对 CPU 和内存的影响有限；对于 ZSTD，影响中等。即使在高负载下，由于数据量减少，服务器端效率也会提高。

**将压缩与批量处理和高效的输入格式（如原生格式）结合使用可获得最佳的摄取性能。**

在使用原生接口（例如 [clickhouse-client](/interfaces/cli)）时，默认启用 LZ4 压缩。您还可以选择通过设置切换到 ZSTD。

使用 [HTTP 接口](/interfaces/http) 时，使用 Content-Encoding 头来应用压缩（例如 Content-Encoding: lz4）。整个有效负载必须在发送前压缩。

### 如果低成本则进行预排序 {#pre-sort-if-low-cost}

在插入之前按主键预排序数据可以提高 ClickHouse 的摄取效率，尤其是对于大型批次。

当数据按顺序到达时，ClickHouse 可以跳过或简化在创建部分时的内部排序步骤，从而减少 CPU 使用并加速插入过程。预排序还提高了压缩效率，因为相似的值被分组在一起——使 LZ4 或 ZSTD 等编码器能够实现更好的压缩比。特别是在与大批量插入和压缩相结合时，这一点尤为有利，因为它减少了处理开销和传输的数据量。

**话虽如此，预排序是一个可选的优化，而不是一个要求。** ClickHouse 通过并行处理以高效的方式对数据进行排序，在许多情况下，服务器端的排序速度比在客户端进行预排序更快或更便利。

**我们推荐只有在数据几乎已经有序或客户端资源（CPU、内存）足够且未被充分利用时，才进行预排序。** 在对延迟敏感或高吞吐量的用例（例如可观察性）的场景中，数据以无序方式到达或来自多个代理，通常最好跳过预排序并依赖 ClickHouse 的内置性能。

## 异步插入 {#asynchronous-inserts}

<AsyncInserts />

## 选择接口 - HTTP 或 Native {#choose-an-interface}

### 原生接口 {#choose-an-interface-native}

ClickHouse 提供两个主要的用于数据摄取的接口：**原生接口** 和 **HTTP 接口**——这两者在性能和灵活性之间存在权衡。原生接口由 [clickhouse-client](/interfaces/cli) 和一些语言客户端（如 Go 和 C++）使用，旨在性能优化。它始终使用 ClickHouse 高效的原生格式传输数据，并支持使用 LZ4 或 ZSTD 进行按块压缩，且通过将解析和格式转换等工作卸载到客户端，从而最小化服务器端的处理。

它甚至支持客户端计算 MATERIALIZED 和 DEFAULT 列的值，允许服务器完全跳过这些步骤。这使得原生接口非常适合需要高吞吐量摄取的场景，其中效率至关重要。

### HTTP 接口 {#choose-an-interface-http}

与许多传统数据库不同，ClickHouse 还支持 HTTP 接口。 **与此相反，HTTP 接口优先考虑兼容性和灵活性。** 它允许以 [任何支持的格式](/integrations/data-formats) 发送数据——包括 JSON、CSV、Parquet 等，并且在大多数 ClickHouse 客户端中广泛支持，包括 Python、Java、JavaScript 和 Rust。

这通常比 ClickHouse 的原生协议更可取，因为它使流量可以轻松与负载均衡器进行切换。我们预计采用原生协议的插入性能会有少量差异，这会稍微减少开销。

然而，它缺乏原生协议的更深集成，无法执行客户端优化，如计算物化值或自动转换为原生格式。虽然 HTTP 插入仍然可以使用标准 HTTP 头进行压缩（例如 `Content-Encoding: lz4`），但压缩应用于整个有效负载而不是单个数据块。这个接口通常在协议简单性、负载均衡或广泛格式兼容性比原始性能更加重要的环境中受到青睐。

有关这些接口的更详细说明，请参见 [此处](/interfaces/overview)。
