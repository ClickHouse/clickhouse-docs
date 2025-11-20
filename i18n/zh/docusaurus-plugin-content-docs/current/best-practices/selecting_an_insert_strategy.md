---
slug: /best-practices/selecting-an-insert-strategy
sidebar_position: 10
sidebar_label: '选择插入策略'
title: '选择插入策略'
description: '介绍如何在 ClickHouse 中选择写入策略的页面'
keywords: ['INSERT', 'asynchronous inserts', 'compression', 'batch inserts']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import insert_process from '@site/static/images/bestpractices/insert_process.png';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';
import AsyncInserts from '@site/docs/best-practices/_snippets/_async_inserts.md';
import BulkInserts from '@site/docs/best-practices/_snippets/_bulk_inserts.md';

高效的数据写入是高性能 ClickHouse 部署的基础。选择合适的写入策略会对吞吐量、成本和可靠性产生显著影响。本节将概述最佳实践、权衡取舍以及配置选项，帮助你为自己的工作负载做出合适的决策。

:::note
以下内容假设你是通过客户端向 ClickHouse 推送数据。如果你是将数据拉取到 ClickHouse，例如使用内置表函数 [s3](/sql-reference/table-functions/s3) 和 [gcs](/sql-reference/table-functions/gcs)，我们推荐参考指南《[Optimizing for S3 Insert and Read Performance](/integrations/s3/performance)》。
:::


## 默认同步插入 {#synchronous-inserts-by-default}

默认情况下,ClickHouse 的插入操作是同步的。每个插入查询会立即在磁盘上创建一个存储部分,包括元数据和索引。

:::note 如果可以在客户端批量处理数据,请使用同步插入
如果不能,请参阅下面的[异步插入](#asynchronous-inserts)。
:::

下面我们简要介绍 ClickHouse 的 MergeTree 插入机制:

<Image
  img={insert_process}
  size='lg'
  alt='插入流程'
  background='black'
/>

#### 客户端步骤 {#client-side-steps}

为了获得最佳性能,数据必须进行 ①[批量处理](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance),因此批量大小是**第一个决策点**。

ClickHouse 将插入的数据按表的主键列[有序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)存储在磁盘上。**第二个决策点**是是否在传输到服务器之前 ② 预先对数据进行排序。如果批次数据按主键列预先排序后到达,ClickHouse 可以[跳过](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595) ⑩ 排序步骤,从而加快数据摄取速度。

如果要摄取的数据没有预定义格式,**关键决策**是选择一种格式。ClickHouse 支持以[超过 70 种格式](/interfaces/formats)插入数据。但是,在使用 ClickHouse 命令行客户端或编程语言客户端时,这个选择通常会自动处理。如有需要,也可以显式覆盖这个自动选择。

下一个**重要决策**是 ④ 是否在传输到 ClickHouse 服务器之前压缩数据。压缩可以减少传输大小并提高网络效率,从而实现更快的数据传输和更低的带宽使用,特别是对于大型数据集。

数据 ⑤ 传输到 ClickHouse 网络接口——[原生](/interfaces/tcp)接口或 [HTTP](/interfaces/http) 接口(我们将在本文后面[比较](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults)这两种接口)。

#### 服务器端步骤 {#server-side-steps}

⑥ 接收数据后,如果使用了压缩,ClickHouse 会 ⑦ 解压缩数据,然后 ⑧ 从原始发送格式中解析数据。

使用格式化数据中的值和目标表的 [DDL](/sql-reference/statements/create/table) 语句,ClickHouse ⑨ 以 MergeTree 格式在内存中构建一个[数据块](/development/architecture#block),如果行尚未预先排序,则 ⑩ 按主键列[排序](/parts#what-are-table-parts-in-clickhouse)行,⑪ 创建[稀疏主索引](/guides/best-practices/sparse-primary-indexes),⑫ 应用[按列压缩](/parts#what-are-table-parts-in-clickhouse),并 ⑬ 将数据作为新的 ⑭ [数据部分](/parts)写入磁盘。

### 同步插入时进行批量插入 {#batch-inserts-if-synchronous}

<BulkInserts />

### 确保幂等重试 {#ensure-idempotent-retries}

同步插入也是**幂等的**。使用 MergeTree 引擎时,ClickHouse 默认会对插入进行去重。这可以防止模糊的失败情况,例如:

- 插入成功但由于网络中断客户端从未收到确认。
- 插入在服务器端失败并超时。

在这两种情况下,**重试插入**都是安全的——只要批次内容和顺序保持一致。因此,客户端必须一致地重试,不修改或重新排序数据,这一点至关重要。

### 选择正确的插入目标 {#choose-the-right-insert-target}

对于分片集群,您有两个选项:

- 直接插入到 **MergeTree** 或 **ReplicatedMergeTree** 表。当客户端可以在分片之间执行负载均衡时,这是最高效的选项。使用 `internal_replication = true` 时,ClickHouse 会透明地处理复制。
- 插入到[分布式表](/engines/table-engines/special/distributed)。这允许客户端将数据发送到任何节点,并让 ClickHouse 将其转发到正确的分片。这种方式更简单,但由于额外的转发步骤,性能略低。仍然建议使用 `internal_replication = true`。


**在 ClickHouse Cloud 中,所有节点都对同一个分片进行读写。插入操作会自动在节点间进行负载均衡。用户只需将插入请求发送到公开的端点即可。**

### 选择合适的格式 {#choose-the-right-format}

选择合适的输入格式对于 ClickHouse 中的高效数据摄取至关重要。在超过 70 种支持的格式中,选择性能最优的选项可以显著影响插入速度、CPU 和内存使用率以及整体系统效率。

虽然灵活性对于数据工程和基于文件的导入很有用,但**应用程序应优先考虑面向性能的格式**:

- **Native 格式**(推荐):效率最高。列式存储,服务器端所需解析最少。在 Go 和 Python 客户端中默认使用。
- **RowBinary**:高效的基于行的格式,适用于客户端难以进行列式转换的情况。由 Java 客户端使用。
- **JSONEachRow**:易于使用但解析开销大。适用于低数据量场景或快速集成。

### 使用压缩 {#use-compression}

压缩在减少网络开销、加速插入和降低 ClickHouse 存储成本方面发挥着关键作用。有效使用压缩可以提升摄取性能,而无需更改数据格式或模式。

压缩插入数据可以减少通过网络发送的有效负载大小,最大限度地减少带宽使用并加速传输。

对于插入操作,压缩与 Native 格式结合使用时特别有效,因为该格式已经与 ClickHouse 的内部列式存储模型相匹配。在这种设置下,服务器可以高效地解压缩数据并以最少的转换直接存储。

#### 使用 LZ4 追求速度,使用 ZSTD 追求压缩率 {#use-lz4-for-speed-zstd-for-compression-ratio}

ClickHouse 在数据传输期间支持多种压缩编解码器。两个常见选项是:

- **LZ4**:快速且轻量级。它以最小的 CPU 开销显著减少数据大小,使其成为高吞吐量插入的理想选择,也是大多数 ClickHouse 客户端的默认选项。
- **ZSTD**:压缩率更高但更消耗 CPU。当网络传输成本较高时(例如跨区域或云提供商场景)很有用,尽管它会略微增加客户端计算和服务器端解压缩时间。

最佳实践:使用 LZ4,除非您的带宽受限或产生数据出口费用——此时可考虑使用 ZSTD。

:::note
在 [FastFormats 基准测试](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)中,使用 LZ4 压缩的 Native 插入将数据大小减少了 50% 以上,对于 5.6 GiB 数据集,摄取时间从 150 秒缩短到 131 秒。切换到 ZSTD 将同一数据集压缩到 1.69 GiB,但略微增加了服务器端处理时间。
:::

#### 压缩减少资源使用 {#compression-reduces-resource-usage}

压缩不仅减少网络流量,还提高了服务器上的 CPU 和内存效率。使用压缩数据时,ClickHouse 接收的字节数更少,解析大型输入所花费的时间也更少。这一优势在从多个并发客户端摄取数据时尤为重要,例如在可观测性场景中。

压缩对 CPU 和内存的影响对于 LZ4 来说较小,对于 ZSTD 来说适中。即使在负载下,由于数据量减少,服务器端效率也会提高。

**将压缩与批处理和高效的输入格式(如 Native)相结合可获得最佳的摄取性能。**

使用原生接口(例如 [clickhouse-client](/interfaces/cli))时,LZ4 压缩默认启用。您可以通过设置选择切换到 ZSTD。

使用 [HTTP 接口](/interfaces/http)时,使用 Content-Encoding 头来应用压缩(例如 Content-Encoding: lz4)。整个有效负载必须在发送前进行压缩。

### 如果成本较低则预排序 {#pre-sort-if-low-cost}

在插入之前按主键对数据进行预排序可以提高 ClickHouse 中的摄取效率,特别是对于大批量数据。

当数据以预排序状态到达时,ClickHouse 可以在创建数据部分期间跳过或简化内部排序步骤,从而减少 CPU 使用并加速插入过程。预排序还可以提高压缩效率,因为相似的值被分组在一起——使 LZ4 或 ZSTD 等编解码器能够实现更好的压缩率。当与大批量插入和压缩结合使用时,这尤其有益,因为它既减少了处理开销,又减少了传输的数据量。

**话虽如此,预排序是一种可选的优化——而非必需。** ClickHouse 使用并行处理高效地对数据进行排序,在许多情况下,服务器端排序比客户端预排序更快或更方便。


**我们仅在数据已经接近有序，或客户端资源（CPU、内存）充足且尚未被充分利用的情况下，建议进行预排序。** 在对延迟敏感或高吞吐的场景（例如可观测性场景）中，如果数据是乱序到达或来自众多代理，通常更好的做法是跳过预排序，直接依赖 ClickHouse 的内建性能。



## 异步插入 {#asynchronous-inserts}

<AsyncInserts />


## 选择接口——HTTP 或原生接口 {#choose-an-interface}

### 原生接口 {#choose-an-interface-native}

ClickHouse 提供两种主要的数据摄取接口:**原生接口**和 **HTTP 接口**——两者在性能和灵活性之间各有取舍。原生接口由 [clickhouse-client](/interfaces/cli) 以及部分语言客户端(如 Go 和 C++)使用,专为性能而设计。它始终以 ClickHouse 高效的原生格式传输数据,支持使用 LZ4 或 ZSTD 进行块级压缩,并通过将解析和格式转换等工作转移到客户端来最大限度地减少服务器端处理。

它甚至支持在客户端计算 MATERIALIZED 和 DEFAULT 列值,使服务器能够完全跳过这些步骤。这使得原生接口成为对效率要求严格的高吞吐量摄取场景的理想选择。

### HTTP 接口 {#choose-an-interface-http}

与许多传统数据库不同,ClickHouse 还支持 HTTP 接口。**相比之下,该接口优先考虑兼容性和灵活性。**它允许以[任何支持的格式](/integrations/data-formats)发送数据——包括 JSON、CSV、Parquet 等——并且在大多数 ClickHouse 客户端中得到广泛支持,包括 Python、Java、JavaScript 和 Rust。

这通常比 ClickHouse 的原生协议更受欢迎,因为它允许通过负载均衡器轻松切换流量。我们预期与原生协议相比,插入性能会有细微差异,原生协议的开销略低一些。

然而,它缺乏原生协议的深度集成,无法执行客户端优化,如物化值计算或自动转换为原生格式。虽然 HTTP 插入仍然可以使用标准 HTTP 头进行压缩(例如 `Content-Encoding: lz4`),但压缩应用于整个负载而非单个数据块。在协议简单性、负载均衡或广泛的格式兼容性比原始性能更重要的环境中,通常会优先选择此接口。

有关这些接口的更详细说明,请参阅[此处](/interfaces/overview)。
