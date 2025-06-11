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
---

import Image from '@theme/IdealImage';
import insert_process from '@site/static/images/bestpractices/insert_process.png';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';
import AsyncInserts from '@site/i18n/zh/docusaurus-plugin-content-docs/current/best-practices/_snippets/_async_inserts.md';
import BulkInserts from '@site/i18n/zh/docusaurus-plugin-content-docs/current/best-practices/_snippets/_bulk_inserts.md';

高效的数据摄取构成了高性能 ClickHouse 部署的基础。选择正确的插入策略可以显著影响吞吐量、成本和可靠性。本节概述了最佳实践、权衡和配置选项，以帮助您为工作负载做出正确的决策。

:::note
以下假设您通过客户端将数据推送到 ClickHouse。如果您是通过内置表函数（如 [s3](/sql-reference/table-functions/s3) 和 [gcs](/sql-reference/table-functions/gcs)）将数据拉入 ClickHouse，我们推荐您查看我们的指南 ["优化 S3 插入和读取性能"](/integrations/s3/performance)。
:::

## 默认的同步插入 {#synchronous-inserts-by-default}

默认情况下，对 ClickHouse 的插入是同步的。每个插入查询会立即在磁盘上创建一个存储部分，包括元数据和索引。

:::note 如果可以在客户端进行批处理，请使用同步插入
如果不能，请参见下面的 [异步插入](#asynchronous-inserts)。
:::

我们简要回顾 ClickHouse 的 MergeTree 插入机制：

<Image img={insert_process} size="lg" alt="插入过程" background="black"/>

#### 客户端步骤 {#client-side-steps}

为了实现最佳性能，数据必须 ① [批处理](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)，批量大小是 **第一个决定**。

ClickHouse 会根据表的主键列按[顺序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns) 存储插入的数据。 **第二个决定** 是在传输到服务器之前是否 ② 对数据进行预排序。如果批量数据按主键列预排序到达，ClickHouse 可以 [跳过](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595) ⑨ 排序步骤，从而加快摄取速度。

如果要摄取的数据没有预定义格式， **关键决策** 是选择格式。ClickHouse 支持以 [70 多种格式](https://interfaces/formats) 插入数据。然而，当使用 ClickHouse 命令行客户端或编程语言客户端时，通常会自动处理此选择。如有需要，此自动选择也可以显式覆盖。

下一个 **主要决策** 是 ④ 是否在传输到 ClickHouse 服务器之前压缩数据。压缩可以减少传输大小并提高网络效率，从而加快数据传输并降低带宽使用，尤其是对于大型数据集。

数据会 ⑤ 传输到 ClickHouse 网络接口——可以是 [native](/interfaces/tcp) 或 [HTTP](/interfaces/http) 接口（稍后我们将对此进行[比较](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults)）。

#### 服务器步骤 {#server-side-steps}

在 ⑥ 接收数据后，如果使用了压缩，ClickHouse 会 ⑦ 解压缩数据，然后 ⑧ 从原始发送格式解析数据。

使用该格式化数据的值和目标表的 [DDL](/sql-reference/statements/create/table) 语句，ClickHouse ⑨ 构建一个内存中的 [块](/development/architecture#block)，以 MergeTree 格式 ⑩ [按主键列排序](/parts#what-are-table-parts-in-clickhouse)，如果它们尚未预排序，⑪ 创建一个 [稀疏主索引](/guides/best-practices/sparse-primary-indexes)，⑫ 应用 [按列压缩](/parts#what-are-table-parts-in-clickhouse)，并将数据 ⑬ 作为新的 ⑭ [数据部分](/parts) 写入磁盘。

### 如果是同步插入则采用批量插入 {#batch-inserts-if-synchronous}

<BulkInserts/>

### 确保幂等重试 {#ensure-idempotent-retries}

同步插入也是 **幂等的**。在使用 MergeTree 引擎时，ClickHouse 默认会去重插入。这可以防止模糊的失败情况，例如：

* 插入成功但由于网络中断客户端从未收到确认。
* 插入在服务器端失败并超时。

在这两种情况下，安全地 **重试插入** 是可以的——只要批量内容和顺序保持不变。因此，客户端的一致重试至关重要，不能修改或重新排序数据。

### 选择正确的插入目标 {#choose-the-right-insert-target}

对于分片集群，您有两种选择：

* 直接插入到 **MergeTree** 或 **ReplicatedMergeTree** 表中。这是最有效的选项，当客户端可以在分片之间进行负载均衡时。启用 `internal_replication = true` 后，ClickHouse 透明地处理复制。
* 插入到 [分布式表](/engines/table-engines/special/distributed) 中。这允许客户端将数据发送到任何节点，并让 ClickHouse 转发到正确的分片。这比较简单，但由于额外的转发步骤，性能略差。仍然建议启用 `internal_replication = true`。

**在 ClickHouse Cloud 中，所有节点都对同一个分片进行读写。插入会自动在节点之间进行平衡。用户只需将插入发送到暴露的端点。**

### 选择正确的格式 {#choose-the-right-format}

选择正确的输入格式对于 ClickHouse 中高效的数据摄取至关重要。支持70多种格式时，选择最有效的选项可以显著影响插入速度、CPU 和内存使用率以及整体系统效率。

虽然灵活性对数据工程和基于文件的导入是有用的，**应用程序应优先考虑以性能为导向的格式**：

* **Native 格式**（推荐）：最高效。列式，服务器端需要最小解析。Go 和 Python 客户端默认使用。
* **RowBinary**：高效的行格式，理想情况下在客户端难以进行列式转换。用于 Java 客户端。
* **JSONEachRow**：易于使用但解析成本高。适合于低数据量的用例或快速集成。

### 使用压缩 {#use-compression}

压缩在减少网络开销、加快插入速度和降低 ClickHouse 存储成本方面起着关键作用。有效使用时，它增强了摄取性能，而无需更改数据格式或架构。

压缩插入数据会减少通过网络发送的有效负载大小，最小化带宽使用并加速传输。

对于插入，压缩在与 Native 格式一起使用时尤其有效，后者已经与 ClickHouse 的内部列式存储模型匹配。在这种设置中，服务器可以高效解压缩并直接存储数据，几乎无需转化。

#### 在速度上使用 LZ4，在压缩率上使用 ZSTD {#use-lz4-for-speed-zstd-for-compression-ratio}

ClickHouse 在数据传输过程中支持多种压缩编解码器。两个常见的选项是：

* **LZ4**：快速且轻量。它显著减少数据大小，同时 CPU 开销最小，非常适合高吞吐量插入，是大多数 ClickHouse 客户端的默认选项。
* **ZSTD**：更高的压缩比，但 CPU 消耗更多。在网络传输成本较高时（例如在跨区域或云提供商场景中）很有用，尽管它会稍微增加客户端计算和服务器端解压缩时间。

最佳实践：使用 LZ4，除非带宽受限或产生数据外发费用——那时考虑使用 ZSTD。

:::note
在 [FastFormats 基准](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient) 的测试中，LZ4 压缩的 Native 插入将数据大小减少了超过 50%，将 5.6 GiB 数据集的摄取时间从 150 秒缩短至 131 秒。切换到 ZSTD 将相同数据集压缩至 1.69 GiB，但略微增加了服务器端处理时间。
:::

#### 压缩减少资源使用 {#compression-reduces-resource-usage}

压缩不仅减少了网络流量——它还提高了服务器的 CPU 和内存效率。通过压缩数据，ClickHouse 接收的字节更少，并花费更少的时间解析大量输入。在多个并发客户端（例如可观察性场景）摄取时，这种好处尤为重要。

对于 LZ4，压缩对 CPU 和内存的影响温和，而对于 ZSTD 的影响适中。即使在负载下，由于数据量减少，服务器端效率也会提高。

**将压缩与批处理和高效输入格式（如 Native）结合使用，能获得最佳的摄取性能。**

当使用本机接口（例如 [clickhouse-client](/interfaces/cli)）时，默认启用 LZ4 压缩。您可以通过设置选项切换到 ZSTD。

在 [HTTP 接口](/interfaces/http) 中，使用 Content-Encoding 头应用压缩（例如 Content-Encoding: lz4）。整个有效负载必须在发送前进行压缩。

### 如果低成本则进行预排序 {#pre-sort-if-low-cost}

在插入之前按主键对数据进行预排序可以改善 ClickHouse 的摄取效率，特别是对于大批量数据。

当数据预排序到达时，ClickHouse 可以在创建分区时跳过或简化内部排序步骤，从而减少 CPU 使用率并加快插入过程。预排序还提高了压缩效率，因为类似的值会聚集在一起——使得像 LZ4 或 ZSTD 这样的编码器能够实现更好的压缩比。在与大批量插入和压缩结合使用时，这种好处尤其明显，因为它减少了处理开销和传输的数据量。

**也就是说，预排序是可选的优化——不是必需的。** ClickHouse 可以高效地使用并行处理对数据进行排序，在许多情况下，服务器端排序比客户端预排序的速度更快或更方便。

**我们建议仅在数据几乎已排序或客户端资源（CPU、内存）充足且未充分利用时进行预排序。** 在延迟敏感或高吞吐量的用例中，例如可观察性，在数据无序到达或来自许多代理的情况下，通常最好跳过预排序，依赖 ClickHouse 的内置性能。

## 异步插入 {#asynchronous-inserts}

<AsyncInserts />

## 选择一个接口 - HTTP 或 Native {#choose-an-interface}

### Native {#choose-an-interface-native}

ClickHouse 提供了两种主要的数据摄取接口：**native 接口**和 **HTTP 接口**，两者在性能和灵活性之间存在权衡。native 接口由 [clickhouse-client](/interfaces/cli) 和选定语言的客户端（如 Go 和 C++）使用，专为性能而构建。它始终以 ClickHouse 高效的 Native 格式传输数据，支持使用 LZ4 或 ZSTD 进行块级压缩，并通过将解析和格式转换等工作卸载到客户端来最小化服务器端处理。

它甚至使得可以在客户端计算 MATERIALIZED 和 DEFAULT 列的值，从而使服务器能够完全跳过这些步骤。这使得 native 接口非常适合高吞吐量的插入场景，其中效率至关重要。

### HTTP {#choose-an-interface-http}

与许多传统数据库不同，ClickHouse 还支持 HTTP 接口。**这相比之下，优先考虑兼容性和灵活性。** 它允许数据以 [任意支持的格式](/integrations/data-formats) 发送——包括 JSON、CSV、Parquet 等，并在大多数 ClickHouse 客户端中广泛支持，包括 Python、Java、JavaScript 和 Rust。

这通常比 ClickHouse 的 native 协议更可取，因为它允许与负载均衡器轻松切换流量。我们预计使用 native 协议时，插入性能会有小差异，后者的开销更低。

然而，它缺乏 native 协议的深度集成，并且无法执行客户端优化，如计算物化值或自动转换为 Native 格式。虽然 HTTP 插入仍然可以使用标准 HTTP 头进行压缩（例如 `Content-Encoding: lz4`），但压缩应用于整个有效负载，而不是单个数据块。该接口通常在协议简单性、负载均衡或广泛格式兼容性比原始性能更重要的环境中受到青睐。

有关这些接口的更详细描述，请参见 [此处](/interfaces/overview)。
