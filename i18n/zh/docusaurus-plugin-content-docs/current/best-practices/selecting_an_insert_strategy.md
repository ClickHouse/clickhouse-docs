---
'slug': '/best-practices/selecting-an-insert-strategy'
'sidebar_position': 10
'sidebar_label': '选择插入策略'
'title': '选择插入策略'
'description': '页面描述如何在ClickHouse中选择插入策略'
---

import Image from '@theme/IdealImage';
import insert_process from '@site/static/images/bestpractices/insert_process.png';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';
import AsyncInserts from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_async_inserts.md';
import BulkInserts from '@site/i18n/jp/docusaurus-plugin-content-docs/current/best-practices/_snippets/_bulk_inserts.md';

高效的数据摄取是高性能ClickHouse部署的基础。选择合适的插入策略可以对吞吐量、成本和可靠性产生显著影响。本节概述了最佳实践、权衡和配置选项，以帮助您为工作负载做出正确决策。

:::note
以下假设您通过客户端将数据推送到ClickHouse。如果您通过内置表函数（如 [s3](/sql-reference/table-functions/s3) 和 [gcs](/sql-reference/table-functions/gcs)）将数据拉入ClickHouse，我们建议您参考我们的指南 ["优化 S3 插入和读取性能"](/integrations/s3/performance)。
:::

## 默认同步插入 {#synchronous-inserts-by-default}

默认情况下，插入到ClickHouse是同步的。每个插入查询都会立即在磁盘上创建一个存储部分，包括元数据和索引。

:::note 如果可以在客户端批量处理数据，使用同步插入
如果不能，请参阅下面的 [异步插入](#asynchronous-inserts)。
:::

我们简要回顾一下ClickHouse的MergeTree插入机制：

<Image img={insert_process} size="lg" alt="插入过程" background="black"/>

#### 客户端步骤 {#client-side-steps}

为了获得最佳性能，数据必须 ①[ 批量处理](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)，批处理大小是**第一个决策**。

ClickHouse在磁盘上存储插入的数据，[按照](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)表主键列的顺序。**第二个决策**是是否在传输到服务器之前 ② 预先排序数据。如果批次按照主键列预排序到达，ClickHouse可以[跳过](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595) ⑨排序步骤，从而加速摄取。

如果要摄取的数据没有预定义格式，**关键决策**是选择一种格式。ClickHouse支持在[70种以上格式](/interfaces/formats)中插入数据。然而，当使用ClickHouse命令行客户端或编程语言客户端时，这一选择通常是自动处理的。如有需要，这种自动选择也可以显式覆盖。

下一个**主要决策**是④是否在传输到ClickHouse服务器之前压缩数据。压缩减少传输大小，提高网络效率，从而加快数据传输速度，并降低带宽使用，尤其是对于大型数据集。

数据通过⑤ClickHouse网络接口传输——可以是[native](/interfaces/tcp)或[HTTP](/interfaces/http)接口（我们在本文后面会[进行比较](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults)）。

#### 服务器端步骤 {#server-side-steps}

在⑥接收到数据后，如果使用了压缩，ClickHouse会⑦解压数据，然后⑧从最初发送的格式解析数据。

使用来自该格式化数据的值以及目标表的[DDL](/sql-reference/statements/create/table)语句，ClickHouse⑨构建一个内存中的[块](/development/architecture#block)以MergeTree格式，⑩如果行尚未预排序，则按主键列进行[排序](/parts#what-are-table-parts-in-clickhouse)，⑪创建一个[稀疏主索引](/guides/best-practices/sparse-primary-indexes)，⑫应用[按列压缩](/parts#what-are-table-parts-in-clickhouse)，并⑬将数据作为新的⑭[数据部分](/parts)写入磁盘。


### 如果是同步，使用批量插入 {#batch-inserts-if-synchronous}

<BulkInserts/>

### 确保幂等重试 {#ensure-idempotent-retries}

同步插入也是**幂等的**。在使用MergeTree引擎时，ClickHouse默认会对插入进行去重。这可以防止模糊的失败情况，例如：

* 插入成功，但客户端由于网络中断未收到确认。
* 插入在服务器端失败并超时。

在这两种情况下，只要批次内容和顺序保持一致，安全地**重试插入**。因此，客户端在重试时必须一致，不得修改或重新排序数据。

### 选择正确的插入目标 {#choose-the-right-insert-target}

对于分片集群，您有两个选择：

* 直接插入到**MergeTree**或**ReplicatedMergeTree**表中。当客户端可以在分片之间进行负载平衡时，这是最有效的选择。设置 `internal_replication = true`，ClickHouse会透明处理复制。
* 插入到[分布式表](/engines/table-engines/special/distributed)。这允许客户端将数据发送到任何节点，并让ClickHouse将其转发到正确的分片。这种方法更简单，但由于额外的转发步骤，性能略低。仍然推荐设置`internal_replication = true`。

**在ClickHouse Cloud中，所有节点都读取和写入同一个单一分片。插入会自动在节点之间平衡。用户只需将插入发送到暴露的端点。**

### 选择正确的格式 {#choose-the-right-format}

选择正确的输入格式对于ClickHouse中的高效数据摄取至关重要。支持70多种格式，选择最有效的选项可以显著影响插入速度、CPU和内存使用以及整体系统效率。

虽然灵活性对于数据工程和基于文件的导入很有用，但**应用程序应优先考虑以性能为导向的格式**：

* **本地格式**（推荐）：最有效。列式存储，服务器端所需解析最少。Go和Python客户端默认使用。
* **RowBinary**：高效的行式格式，适用于客户端处理困难的列式转换。Java客户端使用。
* **JSONEachRow**：易于使用但解析成本高。适合低容量用例或快速集成。

### 使用压缩 {#use-compression}

压缩在减少网络开销、加快插入速度和降低ClickHouse存储成本中起着至关重要的作用。有效使用时，它可以提高摄取性能，而无需更改数据格式或架构。

压缩插入数据可以减少通过网络发送的有效载荷的大小，最小化带宽使用并加快传输速度。

对于插入，当与本地格式一起使用时，压缩效果特别显著，因为它已经与ClickHouse的内部列式存储模型相匹配。在这种设置中，服务器可以有效地解压并直接存储数据，几乎无须转换。

#### 使用LZ4以提高速度，使用ZSTD以提高压缩比 {#use-lz4-for-speed-zstd-for-compression-ratio}

ClickHouse在数据传输过程中支持多种压缩编解码器。两种常见选项是：

* **LZ4**：快速且轻量。它显著减少数据大小，且CPU负担最小，非常适合高吞吐率的插入，是大多数ClickHouse客户端的默认选项。
* **ZSTD**：更高的压缩比，但对CPU要求更高。当网络传输成本较高时（例如在跨区域或云提供商场景中），它很有用，尽管这会稍微增加客户端计算和服务器端解压缩的时间。

最佳实践：使用LZ4，除非您带宽受限或产生数据出口费用——然后考虑使用ZSTD。

:::note
根据[FastFormats基准测试](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)的测试，使用LZ4压缩的本地插入将数据大小减少了超过50%，将5.6 GiB数据集的摄取时间从150秒减少到131秒。切换到ZSTD将相同数据集压缩到1.69 GiB，但增加了服务器端处理时间。
:::

#### 压缩减少资源使用 {#compression-reduces-resource-usage}

压缩不仅减少了网络流量——它还提高了服务器的CPU和内存效率。使用压缩数据，ClickHouse接收到的字节数更少，解析大型输入所花费的时间也减少。当从多个并发客户端摄取时（例如在可观察性场景中），这一好处尤其重要。

对于LZ4，压缩对CPU和内存的影响是适度的，对于ZSTD则是中等的。即使在负载下，由于数据量减少，服务器端效率也会提高。

**将压缩与批处理和有效输入格式（如本地格式）结合使用，可以获得最佳的摄取性能。**

使用本地接口（例如 [clickhouse-client](/interfaces/cli)）时，LZ4压缩默认启用。您可以通过设置选择切换到ZSTD。

通过[HTTP接口](/interfaces/http)，使用Content-Encoding头来应用压缩（例如Content-Encoding: lz4）。在发送之前，整个有效载荷必须被压缩。

### 如果成本低则进行预排序 {#pre-sort-if-low-cost}

在插入之前按主键对数据进行预排序可以提高ClickHouse中的摄取效率，特别是对于大型批量数据。

当数据预排序到达时，ClickHouse可以跳过或简化在创建部分时的内部排序步骤，从而减少CPU使用并加快插入过程。预排序还提高了压缩效率，因为相似的值被分组在一起——使得像LZ4或ZSTD这样的编解码器能够达到更好的压缩比。当与大批量插入和压缩结合时，这一点尤其有利，因为它减少了处理开销和传输数据的数量。

**不过，预排序是一个可选的优化，并不是必需的。** ClickHouse使用并行处理对数据进行高效排序，在许多情况下，服务器端排序比客户端进行预排序更快或更方便。

**我们建议仅在数据几乎已经排序好或客户端资源（CPU、内存）充足且未充分利用时进行预排序。** 在延迟敏感或高吞吐的用例中，例如可观察性场景，当数据无序到达或来自多个代理时，通常最好跳过预排序，依赖ClickHouse的内置性能。

## 异步插入 {#asynchronous-inserts}

<AsyncInserts />

## 选择接口 - HTTP 或 Native {#choose-an-interface}

### Native {#choose-an-interface-native}

ClickHouse提供两种主要的数据摄取接口：**native接口**和**HTTP接口**——各自在性能和灵活性之间存在权衡。native接口用于[clickhouse-client](/interfaces/cli)和一些编程语言的客户端（如Go和C++），它专门为性能而设计。它始终以ClickHouse的高效本地格式传输数据，支持使用LZ4或ZSTD进行按块压缩，并通过将解析和格式转换等工作卸载到客户端，来最小化服务器端处理。

它甚至可以使客户端计算MATERIALIZED和DEFAULT列值，从而允许服务器完全跳过这些步骤。这使得native接口非常适用于高吞吐量的摄取场景，在此情况下效率至关重要。

### HTTP {#choose-an-interface-http}

与许多传统数据库不同，ClickHouse还支持HTTP接口。**相比之下，这优先考虑兼容性和灵活性。** 它允许以[任何支持的格式](/integrations/data-formats)发送数据——包括JSON、CSV、Parquet等，并且在大多数ClickHouse客户端（包括Python、Java、JavaScript和Rust）中得到广泛支持。

这通常比ClickHouse的本地协议更可取，因为它允许使用负载均衡器轻松切换流量。我们预计与本地协议相比，插入性能会有小幅差异，本地协议的开销略低。

然而，它缺乏本地协议的更深集成，无法执行如物化值计算或自动转换为本地格式的客户端优化。虽然HTTP插入仍然可以使用标准HTTP头进行压缩（例如`Content-Encoding: lz4`），但压缩适用于整个有效载荷，而不是单个数据块。在协议简单性、负载均衡或广泛格式兼容性比原始性能更重要的环境中，该接口通常更受欢迎。

有关这些接口的更详细描述，请参见[这里](/interfaces/overview)。
