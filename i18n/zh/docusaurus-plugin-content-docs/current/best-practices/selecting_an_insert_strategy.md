---
'slug': '/best-practices/selecting-an-insert-strategy'
'sidebar_position': 10
'sidebar_label': '选择插入策略'
'title': '选择插入策略'
'description': '描述如何在ClickHouse中选择插入策略'
---

import Image from '@theme/IdealImage';
import insert_process from '@site/static/images/bestpractices/insert_process.png';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';
import AsyncInserts from '@site/docs/best-practices/_snippets/_async_inserts.md';
import BulkInserts from '@site/docs/best-practices/_snippets/_bulk_inserts.md';

高效的数据摄取是高性能 ClickHouse 部署的基础。选择正确的插入策略可以显著影响吞吐量、成本和可靠性。本节概述了最佳实践、权衡因素和配置选项，以帮助您为您的工作负载做出正确的决定。

:::note
以下假设您是通过客户端将数据推送到 ClickHouse。如果您是通过内置的表函数（例如 [s3](/sql-reference/table-functions/s3) 和 [gcs](/sql-reference/table-functions/gcs)）将数据拉入 ClickHouse，建议您参考我们的指南 ["优化 S3 插入和读取性能"](/integrations/s3/performance)。
:::

## 默认的同步插入 {#synchronous-inserts-by-default}

默认情况下，插入到 ClickHouse 中是同步的。每个插入查询会立即在磁盘上创建一个存储部分，包括元数据和索引。

:::note 如果能够在客户端侧进行数据分批处理，请使用同步插入
如果无法分批，请查看下面的 [异步插入](#asynchronous-inserts)。
:::

我们简要回顾 ClickHouse 的 MergeTree 插入机制如下：

<Image img={insert_process} size="lg" alt="插入过程" background="black"/>

#### 客户端步骤 {#client-side-steps}

为了获得最佳性能，数据必须进行 ①[分批](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)，使批量大小成为**第一个决策**。

ClickHouse 将插入的数据按表的主键列[有序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) 存储在磁盘上。**第二个决策**是是否在发送到服务器之前 ② 对数据进行预排序。如果批量数据按主键列预排序到达，ClickHouse 可以[跳过](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595) ⑨ 排序步骤，从而加快摄取。

如果要摄取的数据没有预定义格式，**关键决策**是选择格式。ClickHouse 支持以 [70 多种格式](/interfaces/formats) 插入数据。然而，当使用 ClickHouse 命令行客户端或编程语言客户端时，这个选择通常会自动处理。如果需要，也可以显式覆盖此自动选择。

下一个**主要决策**是 ④ 是否在传输到 ClickHouse 服务器之前压缩数据。压缩可以减少传输大小，提高网络效率，从而加快数据传输速度，并降低带宽使用，尤其是对于大型数据集。

数据通过 ⑤ 传输到 ClickHouse 网络接口——可以是 [原生](/interfaces/tcp) 或 [HTTP](/interfaces/http) 接口（我们将在本文后面[进行比较](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults)）。

#### 服务器端步骤 {#server-side-steps}

在 ⑥ 接收数据后，ClickHouse 会在使用了压缩的情况下 ⑦ 解压缩数据，然后 ⑧ 从原始发送格式中解析数据。

使用该格式化数据的值和目标表的 [DDL](/sql-reference/statements/create/table) 语句，ClickHouse ⑨ 在内存中构建一个 MergeTree 格式的 [块](/development/architecture#block)，如果行尚未预排序，则 ⑩ [按主键列排序](/parts#what-are-table-parts-in-clickhouse)，⑪ 创建 [稀疏主索引](/guides/best-practices/sparse-primary-indexes)，⑫ 应用 [按列压缩](/parts#what-are-table-parts-in-clickhouse)，并 ⑬ 将数据作为新的 ⑭ [数据部分](/parts) 写入磁盘。

### 如果同步请使用批量插入 {#batch-inserts-if-synchronous}

<BulkInserts/>

### 确保幂等重试 {#ensure-idempotent-retries}

同步插入也是 **幂等** 的。当使用 MergeTree 引擎时，ClickHouse 默认会去重插入。这保护了模糊失败的情况，例如：

* 插入成功但客户端由于网络中断未收到确认。
* 插入在服务器端失败并超时。

在这两种情况下，只要批内容和顺序保持不变，就可以安全地 **重试插入**。因此，客户端在重试时必须保持一致，不得修改或重新排序数据。

### 选择正确的插入目标 {#choose-the-right-insert-target}

对于分片集群，您有两个选择：

* 直接插入到 **MergeTree** 或 **ReplicatedMergeTree** 表中。当客户端可以在分片之间进行负载均衡时，这是最有效的选择。通过设置 `internal_replication = true`，ClickHouse 会透明地处理复制。
* 插入到 [分布式表](/engines/table-engines/special/distributed)。这允许客户端将数据发送到任何节点，并让 ClickHouse 将其转发到正确的分片。这更简单，但由于额外的转发步骤，性能稍逊。`internal_replication = true` 仍然是推荐的。

**在 ClickHouse Cloud 中，所有节点都读取和写入同一个分片。插入会在节点之间自动均衡。用户只需将插入发送到公开的端点。**

### 选择正确的格式 {#choose-the-right-format}

选择正确的输入格式对 ClickHouse 中高效的数据摄取至关重要。由于支持超过 70 种格式，选择最具性能的选项可以显著影响插入速度、CPU 和内存使用以及整体系统效率。

尽管灵活性对于数据工程和文件导入有用，**应用程序应该优先选择面向性能的格式**：

* **原生格式**（推荐）：最有效。列式存储，服务器端最小解析。Go 和 Python 客户端默认使用。
* **RowBinary**：高效的行式格式，适合当列式转换在客户端难以实现时。Java 客户端使用。
* **JSONEachRow**：易于使用，但解析成本高。适合低频使用案例或快速集成。

### 使用压缩 {#use-compression}

压缩在降低网络开销、加快插入以及降低 ClickHouse 存储成本中起着至关重要的作用。有效使用时，它可以提高摄取性能，而不需要对数据格式或模式进行更改。

压缩插入数据可降低通过网络发送的负载大小，最小化带宽使用并加快传输速度。

对于插入而言，压缩在与原生格式结合使用时尤其有效，该格式已经与 ClickHouse 的内部列式存储模型匹配。在这种设置中，服务器可以有效地解压缩并直接以最小的转换存储数据。

#### 使用 LZ4 提高速度，使用 ZSTD 提高压缩比 {#use-lz4-for-speed-zstd-for-compression-ratio}

ClickHouse 支持在数据传输过程中使用多种压缩编解码器。两个常用选项是：

* **LZ4**：快速且轻量。它显著减少数据大小，CPU 开销最小，使其成为高吞吐量插入的理想选择，且在大多数 ClickHouse 客户端中默认使用。
* **ZSTD**：具有更高的压缩比但更 CPU 密集。在网络传输成本较高的情况下（例如跨地区或云提供商场景），它非常有用，尽管它会稍微增加客户端计算和服务器端解压缩的时间。

最佳实践：除非带宽受到限制或产生数据出口成本，否则使用 LZ4——然后考虑 ZSTD。

:::note
在 [FastFormats 基准](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient) 的测试中，LZ4 压缩的原生插入将数据大小减少了超过 50%，在 5.6 GiB 数据集的情况下将摄取时间从 150 秒缩短到 131 秒。切换到 ZSTD 将相同的数据集压缩至 1.69 GiB，但稍微增加了服务器端的处理时间。
:::

#### 压缩降低资源使用 {#compression-reduces-resource-usage}

压缩不仅减少了网络流量，还提高了服务器的 CPU 和内存效率。使用压缩数据时，ClickHouse 接收的字节更少，解析大输入的时间更短。在来自多个并发客户端的摄取场景中，这种好处尤为重要，例如观察场景。

对于 LZ4，压缩对 CPU 和内存的影响较小，而对于 ZSTD，影响适中。即使在负载下，服务器端的效率也因为数据量的减少而提高。

**将压缩与批处理以及高效的输入格式（例如原生格式）结合使用可以提供最佳的摄取性能。**

在使用原生接口（例如 [clickhouse-client](/interfaces/cli)）时，LZ4 压缩默认启用。您可以通过设置选择切换到 ZSTD。

在 [HTTP 接口](/interfaces/http) 中，请使用 Content-Encoding 头来应用压缩（例如 Content-Encoding: lz4）。整个负载必须在发送之前被压缩。

### 如果成本低则预排序 {#pre-sort-if-low-cost}

在插入之前按主键对数据进行预排序可以提高 ClickHouse 的摄取效率，特别是对于大型批量数据。

当数据预排序到达时，ClickHouse 可以在创建部分时跳过或简化内部排序步骤，从而减少 CPU 使用并加快插入过程。预排序还提高了压缩效率，因为相似值被组合在一起——使编码器（如 LZ4 或 ZSTD）能够实现更好的压缩比。在结合大型批量插入和压缩时，这一点尤其有利，因为它降低了处理开销和传输的数据量。

**也就是说，预排序是可选的优化——而不是必需的。** ClickHouse 使用并行处理高效地对数据进行排序，并且在许多情况下，服务器端的排序比客户端的预排序更快或更方便。

**我们建议仅在数据几乎已经排好序或客户端资源（CPU、内存）足够充足且未被充分利用的情况下进行预排序。** 在延迟敏感或高吞吐量的用例中，例如观察场景，其中数据是无序到达或来自多个代理，通常跳过预排序并依赖 ClickHouse 的内置性能会更好。

## 异步插入 {#asynchronous-inserts}

<AsyncInserts />

## 选择接口 - HTTP 还是原生 {#choose-an-interface}

### 原生 {#choose-an-interface-native}

ClickHouse 提供了两种主要的数据摄取接口：**原生接口**和 **HTTP 接口** - 这两者在性能和灵活性之间有不同的权衡。原生接口由 [clickhouse-client](/interfaces/cli) 和某些编程语言客户端（如 Go 和 C++）使用，专为性能而设计。它始终以 ClickHouse 高效的原生格式传输数据，支持使用 LZ4 或 ZSTD 进行按块压缩，并通过将解析和格式转换等工作卸载到客户端来最小化服务器端处理。

它甚至支持在客户端计算 MATERIALIZED 和 DEFAULT 列值，从而使服务器可以完全跳过这些步骤。这使得原生接口非常适合对效率要求很高的高吞吐量摄取场景。

### HTTP {#choose-an-interface-http}

与许多传统数据库不同，ClickHouse 还支持 HTTP 接口。**相反地，它优先考虑兼容性和灵活性。** 它允许以 [任何支持的格式](/integrations/data-formats) 发送数据——包括 JSON、CSV、Parquet 等，并在大多数 ClickHouse 客户端（包括 Python、Java、JavaScript 和 Rust）中得到广泛支持。

这通常比 ClickHouse 的原生协议更可取，因为它允许与负载均衡器轻松切换流量。我们预计与原生协议相比，插入性能会有小幅差异，原生协议的开销略少。

然而，它缺乏原生协议的更深层集成，无法进行客户端优化，例如计算物化值或自动转换为原生格式。虽然 HTTP 插入仍然可以使用标准 HTTP 头（例如 `Content-Encoding: lz4`）进行压缩，但压缩是应用于整个负载，而不是单个数据块。这种接口在协议简单性、负载均衡或广泛格式兼容性比原始性能更重要的环境中更受欢迎。

有关这些接口的更详细描述，请参见 [此处](/interfaces/overview)。
