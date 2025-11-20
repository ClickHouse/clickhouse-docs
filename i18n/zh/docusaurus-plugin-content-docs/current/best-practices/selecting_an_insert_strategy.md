---
slug: /best-practices/selecting-an-insert-strategy
sidebar_position: 10
sidebar_label: '选择写入策略'
title: '选择写入策略'
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

高效的数据导入是构建高性能 ClickHouse 部署的基础。选择合适的写入策略会显著影响吞吐量、成本和可靠性。本节将介绍最佳实践、权衡取舍以及配置选项，帮助你为自己的工作负载做出正确选择。

:::note
以下内容假设你是通过客户端将数据推送到 ClickHouse。如果你是将数据拉取到 ClickHouse，例如使用内置表函数 [s3](/sql-reference/table-functions/s3) 和 [gcs](/sql-reference/table-functions/gcs)，我们推荐查阅我们的指南《[Optimizing for S3 Insert and Read Performance](/integrations/s3/performance)》。
:::


## 默认使用同步插入 {#synchronous-inserts-by-default}

在默认情况下，对 ClickHouse 的插入是同步的。每条插入查询都会立即在磁盘上创建一个存储分片（data part），其中包含元数据和索引。

:::note 如果可以在客户端进行批处理，请使用同步插入
如果无法做到，请参阅下文的[异步插入](#asynchronous-inserts)。
:::

下面简要回顾 ClickHouse 中 MergeTree 的插入机制：

<Image
  img={insert_process}
  size='lg'
  alt='插入流程'
  background='black'
/>

#### 客户端步骤 {#client-side-steps}

为了获得最佳性能，数据必须进行①[批处理](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)，因此批大小是需要做出的**第一个决策**。

ClickHouse 会将插入的数据存储到磁盘上，并按表的主键列[排序](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)。需要做出的**第二个决策**是，是否在将数据发送到服务器之前②对其进行预排序。如果批次在到达时已经按主键列完成预排序，ClickHouse 就可以[跳过](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595)第⑩步的排序，从而加快写入。

如果待写入的数据没有预定义格式，那么**关键决策**是选择一种格式。ClickHouse 支持以[70 多种格式](/interfaces/formats)插入数据。不过，当使用 ClickHouse 命令行客户端或各类编程语言客户端时，这一选择通常会被自动处理。如果需要，也可以显式覆盖这种自动选择。

接下来的**重要决策**是④是否在将数据发送到 ClickHouse 服务器之前进行压缩。压缩可以减少传输数据量并提升网络效率，使数据传输更快、带宽占用更低，尤其适用于大规模数据集。

数据会⑤通过 ClickHouse 的某个网络接口进行传输——要么是[原生](/interfaces/tcp)接口，要么是 [HTTP](/interfaces/http) 接口（我们会在本文后面对二者进行[对比](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults)）。

#### 服务器端步骤 {#server-side-steps}

在第⑥步接收数据之后，如果启用了压缩，ClickHouse 会在第⑦步对其解压缩，然后在第⑧步从原始发送格式中解析数据。

基于已格式化数据中的值以及目标表的 [DDL](/sql-reference/statements/create/table) 定义，ClickHouse 在第⑨步构建一个 MergeTree 格式的内存[块](/development/architecture#block)，在第⑩步如果行尚未按主键列预排序，则会按主键列对行进行[排序](/parts#what-are-table-parts-in-clickhouse)，在第⑪步创建[稀疏主键索引](/guides/best-practices/sparse-primary-indexes)，在第⑫步应用[按列压缩](/parts#what-are-table-parts-in-clickhouse)，并在第⑬步将数据作为新的⑭[数据分片（data part）](/parts)写入磁盘。

### 使用同步插入时进行批量插入 {#batch-inserts-if-synchronous}

<BulkInserts />

### 确保幂等重试 {#ensure-idempotent-retries}

同步插入同样是**幂等的**。在使用 MergeTree 引擎时，ClickHouse 默认会对插入进行去重。这有助于防护一些含糊不清的失败场景，例如：

- 插入在服务器端已成功，但由于网络中断，客户端从未收到确认。
- 插入在服务器端失败并发生超时。

在这两种情况下，只要批次的内容和顺序保持完全一致，**重试插入**就是安全的。基于这一点，客户端在执行重试时必须保持一致，不得修改或重新排序数据。

### 选择合适的插入目标 {#choose-the-right-insert-target}

对于分片集群，你有两种选择：

- 直接插入到 **MergeTree** 或 **ReplicatedMergeTree** 表中。如果客户端能够在各个分片之间自行做负载均衡，这是效率最高的方案。设置 `internal_replication = true` 时，ClickHouse 会透明地处理复制。
- 插入到 [Distributed 表](/engines/table-engines/special/distributed)。这种方式允许客户端将数据发送到任意节点，由 ClickHouse 将其转发到正确的分片。实现更简单，但由于多了一步转发，性能会略低。此时依然推荐设置 `internal_replication = true`。


**在 ClickHouse Cloud 中，所有节点都对同一个分片进行读写。插入会在节点之间自动均衡。用户只需将插入请求发送到对外暴露的端点即可。**

### 选择合适的格式 {#choose-the-right-format}

在 ClickHouse 中选择合适的输入格式对高效数据导入至关重要。ClickHouse 支持 70 多种格式，选择性能最优的选项会显著影响插入速度、CPU 与内存占用以及整体系统效率。

虽然灵活性对数据工程和基于文件的导入很有帮助，但**应用程序应优先选择面向性能的格式**：

- **Native 格式**（推荐）：最高效。列式组织，服务端只需进行极少量解析。Go 和 Python 客户端默认使用该格式。
- **RowBinary**: Efficient row-based format, ideal if columnar transformation is hard client-side. Used by the Java client.
- **JSONEachRow**：易于使用，但解析开销较大。适合低数据量场景或快速集成。

### 使用压缩 {#use-compression}

在 ClickHouse 中，压缩在降低网络开销、加速插入以及降低存储成本方面起着关键作用。合理使用压缩，可以在无需更改数据格式或表结构的情况下提升导入性能。

对插入数据进行压缩可以减小通过网络发送的负载大小，从而减少带宽占用并加快传输速度。

对于插入操作，将压缩与 Native 格式结合使用尤其高效，因为该格式已经与 ClickHouse 的内部列式存储模型相匹配。在这种情况下，服务端可以高效解压，并以最少的转换直接存储数据。

#### 追求速度用 LZ4，追求压缩率用 ZSTD {#use-lz4-for-speed-zstd-for-compression-ratio}

ClickHouse 在数据传输过程中支持多种压缩编码。两个常见的选项是：

- **LZ4**：快速且轻量。能够在几乎不增加 CPU 开销的情况下显著减小数据体积，非常适合高吞吐插入，也是大多数 ClickHouse 客户端的默认选择。
- **ZSTD**：压缩率更高，但更耗费 CPU。当网络传输成本较高（例如跨地域或跨云厂商场景）时非常实用，不过会略微增加客户端计算量和服务端解压时间。

最佳实践：默认使用 LZ4；只有在带宽受限或存在数据出口费用时，再考虑使用 ZSTD。

:::note
在 [FastFormats 基准测试](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)中，使用 LZ4 压缩的 Native 插入将 5.6 GiB 数据集的体积减少了 50% 以上，将导入时间从 150 秒缩短到 131 秒。切换为 ZSTD 后，同一数据集被压缩到 1.69 GiB，但服务端处理时间略有增加。
:::

#### 压缩可以降低资源占用 {#compression-reduces-resource-usage}

压缩不仅能减少网络流量，还能提升服务端 CPU 和内存的使用效率。对于压缩后的数据，ClickHouse 接收到的字节数更少，解析大批量输入所需的时间也更短。该优势在来自多个并发客户端（例如可观测性场景）的导入中尤为重要。

对于 LZ4，压缩对 CPU 和内存的影响较小；对于 ZSTD，影响中等。即使在高负载下，由于数据量减少，服务端整体效率仍能得到提升。

**将压缩与批量插入以及高效的输入格式（如 Native）结合使用，可以获得最佳的导入性能。**

在使用原生接口（例如 [clickhouse-client](/interfaces/cli)）时，默认启用 LZ4 压缩。你可以通过相关设置切换为 ZSTD。

在使用 [HTTP 接口](/interfaces/http) 时，可通过 Content-Encoding 头来开启压缩（例如 `Content-Encoding: lz4`）。在发送之前，必须对整个请求负载进行压缩。

### 如果成本较低，考虑预排序 {#pre-sort-if-low-cost}

在插入前按主键对数据进行预排序，可以提升 ClickHouse 的导入效率，尤其是针对大批量数据。

当数据以预排序的形式写入时，ClickHouse 在创建数据分片时可以跳过或简化内部排序步骤，从而降低 CPU 使用并加速插入过程。预排序还能提升压缩效率，因为相似的值被聚集在一起，使 LZ4 或 ZSTD 等编码能够取得更好的压缩率。结合大批量插入与压缩时，这种方式尤其有利，可同时降低处理开销和传输数据量。

**需要说明的是，预排序是一种可选优化，而不是硬性要求。** ClickHouse 通过并行处理可以非常高效地完成排序，在很多情况下，由服务端完成排序要比在客户端预排序更快或更方便。


**我们仅在数据已经接近有序，或客户端资源（CPU、内存）充足且未被充分利用时，建议进行预排序。** 在对延迟敏感或高吞吐的场景（例如可观测性场景），如果数据是乱序到达或来自大量 Agent，通常更好的做法是跳过预排序，直接依赖 ClickHouse 本身的性能。



## 异步插入 {#asynchronous-inserts}

<AsyncInserts />


## 选择接口——HTTP 或原生接口 {#choose-an-interface}

### 原生接口 {#choose-an-interface-native}

ClickHouse 提供两种主要的数据摄取接口:**原生接口**和 **HTTP 接口**——两者在性能和灵活性之间各有取舍。原生接口由 [clickhouse-client](/interfaces/cli) 以及部分语言客户端(如 Go 和 C++)使用,专为性能而设计。它始终以 ClickHouse 高效的原生格式传输数据,支持使用 LZ4 或 ZSTD 进行块级压缩,并通过将解析和格式转换等工作转移到客户端来最大限度地减少服务器端处理。

它甚至支持在客户端计算 MATERIALIZED 和 DEFAULT 列值,使服务器可以完全跳过这些步骤。这使得原生接口成为对效率要求严格的高吞吐量摄取场景的理想选择。

### HTTP 接口 {#choose-an-interface-http}

与许多传统数据库不同,ClickHouse 还支持 HTTP 接口。**相比之下,HTTP 接口优先考虑兼容性和灵活性。**它允许以[任何支持的格式](/integrations/data-formats)发送数据——包括 JSON、CSV、Parquet 等——并且在大多数 ClickHouse 客户端中得到广泛支持,包括 Python、Java、JavaScript 和 Rust。

这通常比 ClickHouse 的原生协议更可取,因为它允许通过负载均衡器轻松切换流量。我们预期与原生协议相比,插入性能会有细微差异,原生协议的开销略低一些。

然而,它缺乏原生协议的深度集成,无法执行客户端优化,如物化值计算或自动转换为原生格式。虽然 HTTP 插入仍然可以使用标准 HTTP 头进行压缩(例如 `Content-Encoding: lz4`),但压缩应用于整个有效负载而非单个数据块。在协议简单性、负载均衡或广泛的格式兼容性比原始性能更重要的环境中,通常首选此接口。

有关这些接口的更详细说明,请参阅[此处](/interfaces/overview)。
