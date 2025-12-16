---
slug: /best-practices/selecting-an-insert-strategy
sidebar_position: 10
sidebar_label: '选择插入策略'
title: '选择插入策略'
description: '介绍如何在 ClickHouse 中选择插入策略的页面'
keywords: ['INSERT', '异步插入', '压缩', '批量插入']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import insert_process from '@site/static/images/bestpractices/insert_process.png';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';
import AsyncInserts from '@site/i18n/zh/docusaurus-plugin-content-docs/current/best-practices/_snippets/_async_inserts.md';
import BulkInserts from '@site/i18n/zh/docusaurus-plugin-content-docs/current/best-practices/_snippets/_bulk_inserts.md';

高效的数据摄取是高性能 ClickHouse 部署的基础。选择合适的插入策略可以显著影响吞吐量、成本和可靠性。本节概述了最佳实践、权衡取舍和配置选项,帮助您为工作负载做出正确的决策。

:::note
以下内容假设您通过客户端将数据推送到 ClickHouse。如果您是将数据拉取到 ClickHouse,例如使用内置表函数如 [s3](/sql-reference/table-functions/s3) 和 [gcs](/sql-reference/table-functions/gcs),我们推荐参考指南 [&quot;优化 S3 插入和读取性能&quot;](/integrations/s3/performance)。
:::

## 默认情况下为同步写入 {#synchronous-inserts-by-default}

默认情况下，对 ClickHouse 的写入是同步的。每个 insert 查询都会立即在磁盘上创建一个存储分片（part），包括元数据和索引。

:::note 如果可以在客户端进行批处理，请使用同步写入
如果不行，请参见下文的 [异步写入](#asynchronous-inserts)。
:::

我们在下面简要回顾 ClickHouse 的 MergeTree 写入机制：

<Image img={insert_process} size="lg" alt="写入流程" background="black"/>

#### 客户端侧步骤 {#client-side-steps}

为了获得最佳性能，数据必须进行 ①[批处理](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)，这使得批大小成为**首要决策**。

ClickHouse 将写入的数据存储在磁盘上，并按照表的主键列[排序后存储](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)。**第二个决策**是是否在发送到服务器之前，对数据进行 ② 预排序。如果一个批次在到达时已经按主键列预排序，ClickHouse 就可以[跳过](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595)第 ⑩ 步排序，从而加速数据摄取。

如果要摄取的数据没有预定义格式，那么**关键决策**是选择一种格式。ClickHouse 支持以[超过 70 种格式](/interfaces/formats)写入数据。不过，当使用 ClickHouse 命令行客户端或编程语言客户端时，这个选择通常会自动完成。如果需要，也可以显式覆盖这种自动选择。

下一个**重要决策**是 ④ 是否在将数据传输到 ClickHouse 服务器之前对其进行压缩。压缩可以减少传输大小并提升网络效率，从而加快数据传输并降低带宽占用，尤其对大规模数据集尤为有效。

数据会被 ⑤ 传输到 ClickHouse 的某个网络接口——[原生](/interfaces/tcp)接口或 [HTTP](/interfaces/http) 接口（我们会在本文后面对其进行[比较](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults)）。

#### 服务器侧步骤 {#server-side-steps}

在 ⑥ 接收数据之后，如果使用了压缩，ClickHouse 会先对其进行 ⑦ 解压，然后从原始发送格式中进行 ⑧ 解析。

使用该格式化数据中的值以及目标表的 [DDL](/sql-reference/statements/create/table) 语句，ClickHouse 会以 MergeTree 格式构建一个内存中的 ⑨[块（block）](/development/architecture#block)，在数据未预先排序的情况下，按主键列对行进行 ⑩[排序](/parts#what-are-table-parts-in-clickhouse)，创建 ⑪[稀疏主索引](/guides/best-practices/sparse-primary-indexes)，对每一列应用 ⑫[按列压缩](/parts#what-are-table-parts-in-clickhouse)，并将数据作为一个新的 ⑭[数据分片（data part）](/parts)写入磁盘。

### 同步写入时请进行批量插入 {#batch-inserts-if-synchronous}

<BulkInserts/>

### 确保幂等重试 {#ensure-idempotent-retries}

同步写入同样是**幂等的**。在使用 MergeTree 引擎时，ClickHouse 默认会对写入进行去重。这可以防止以下不明确的失败场景：

* 写入已经成功，但由于网络中断，客户端从未收到确认。
* 写入在服务器端失败并发生超时。

在这两种情况下，只要批次的内容和顺序保持完全一致，**重试写入**就是安全的。基于此原因，客户端在重试时必须保持一致，不得修改或重新排序数据。

### 选择合适的写入目标 {#choose-the-right-insert-target}

对于分片集群，有两种选择：

* 直接写入 **MergeTree** 或 **ReplicatedMergeTree** 表。当客户端可以在分片之间执行负载均衡时，这是最高效的选项。设置 `internal_replication = true` 时，ClickHouse 会透明地处理复制。
* 写入一个 [Distributed 表](/engines/table-engines/special/distributed)。这样客户端可以将数据发送到任意节点，由 ClickHouse 将其转发到正确的分片。这更简单，但由于多了一次转发步骤，性能会略低。仍然建议将 `internal_replication` 设为 `true`。

**在 ClickHouse Cloud 中，所有节点都会对同一个分片进行读写。插入负载会在各节点间自动均衡分布。用户只需将插入请求发送到对外暴露的端点即可。**

### 选择合适的格式 {#choose-the-right-format}

为高效地在 ClickHouse 中进行数据摄取选择正确的输入格式至关重要。ClickHouse 支持 70 多种格式，选择性能最佳的选项会显著影响插入速度、CPU 与内存使用以及整体系统效率。 

在数据工程和基于文件的导入场景中，灵活性固然重要，但**应用程序应优先选择面向性能的格式**：

* **Native 格式**（推荐）：最高效。列式存储，服务端只需进行最少的解析。Go 和 Python 客户端默认使用该格式。
* **RowBinary**：高效的行式格式，如果在客户端进行列式转换比较困难，这是理想选择。Java 客户端使用该格式。
* **JSONEachRow**：易于使用但解析开销大。适用于低流量场景或快速集成。

### 使用压缩 {#use-compression}

压缩在降低网络开销、加速插入以及减少 ClickHouse 存储成本方面起着关键作用。若使用得当，无需更改数据格式或 schema 即可提升摄取性能。

对插入数据进行压缩可减少通过网络发送的有效载荷大小，从而最大限度降低带宽使用并加快传输速度。

对于插入操作，压缩与 Native 格式配合使用时尤为高效，因为该格式已经与 ClickHouse 的内部列式存储模型相匹配。在此设置下，服务端可以高效地解压并以最小的转换直接存储数据。

#### 使用 LZ4 获取速度，使用 ZSTD 获取压缩率 {#use-lz4-for-speed-zstd-for-compression-ratio}

ClickHouse 在数据传输过程中支持多种压缩编解码器。两种常见选项为：

* **LZ4**：快速且轻量。能够在仅施加极小 CPU 开销的情况下显著减小数据大小，非常适合高吞吐插入，并且是大多数 ClickHouse 客户端的默认选项。
* **ZSTD**：压缩率更高，但对 CPU 要求更高。当网络传输成本较高时（例如跨区域或跨云厂商场景），它非常有用，不过会略微增加客户端计算以及服务端解压时间。

最佳实践：除非带宽受限或会产生数据出口成本，否则使用 LZ4；在这些情况下再考虑使用 ZSTD。

:::note
在 [FastFormats 基准测试](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient) 中，使用 LZ4 压缩的 Native 插入将数据大小减少了 50% 以上，在 5.6 GiB 数据集上将摄取时间从 150 秒缩短至 131 秒。切换到 ZSTD 后，同一数据集被压缩到 1.69 GiB，但服务端处理时间略有增加。
:::

#### 压缩可降低资源使用 {#compression-reduces-resource-usage}

压缩不仅减少网络流量——还提升了服务端的 CPU 与内存效率。对于压缩数据，ClickHouse 接收的字节更少，并且在解析大体量输入时花费的时间更短。当从多个并发客户端（例如在可观测性场景中）进行摄取时，这一优势尤为重要。

对于 LZ4，压缩对 CPU 和内存的影响较小；对于 ZSTD，则影响适中。即使在高负载下，由于数据量减少，服务端效率仍然会得到提升。

**将压缩与批量插入以及高效输入格式（如 Native）结合使用，可获得最佳摄取性能。**

在使用原生接口（例如 [clickhouse-client](/interfaces/cli)）时，会默认启用 LZ4 压缩。你也可以通过设置切换为 ZSTD。

使用 [HTTP 接口](/interfaces/http) 时，请通过 Content-Encoding 头部应用压缩（例如 Content-Encoding: lz4）。整个有效载荷必须在发送前完成压缩。

### 如果代价低则预排序 {#pre-sort-if-low-cost}

在插入前按主键对数据进行预排序，可以提升 ClickHouse 中的摄取效率，尤其是对于大批量插入。

当数据以预排序形式到达时，ClickHouse 在创建数据 part 的过程中可以跳过或简化内部排序步骤，从而降低 CPU 使用并加快插入过程。预排序还会提升压缩效率，因为相似值被聚集在一起——使 LZ4 或 ZSTD 等编解码器可以获得更好的压缩率。在与大批量插入和压缩结合使用时，这种方式尤为有益，因为它同时减少了处理开销和传输数据量。

**不过，预排序是一种可选优化——不是必需条件。** ClickHouse 通过并行处理对数据进行高效排序，在许多情况下，服务端排序比在客户端进行预排序更快或更方便。 

**我们仅在数据本身已经接近有序，或客户端侧资源（CPU、内存）充足且有富余时，才建议进行预排序。** 在对延迟敏感或高吞吐量的场景（例如可观测性）中，数据往往是乱序到达或来自大量 Agent，此时通常更好的做法是跳过预排序，直接依赖 ClickHouse 的内置性能。

## 异步插入 {#asynchronous-inserts}

<AsyncInserts />

## 选择接口——HTTP 或原生 {#choose-an-interface}

### 原生 {#choose-an-interface-native}

ClickHouse 提供两种主要的数据摄取接口：**原生接口** 和 **HTTP 接口**——二者在性能与灵活性之间各有取舍。原生接口由 [clickhouse-client](/interfaces/cli) 以及部分语言客户端（如 Go 和 C++）使用，专为高性能而设计。它始终以 ClickHouse 高效的 Native 格式来传输数据，支持基于数据块的 LZ4 或 ZSTD 压缩，并通过将解析和格式转换等工作下放到客户端，最大限度地减少服务端处理。

它甚至支持在客户端计算 MATERIALIZED 和 DEFAULT 列的值，从而使服务端可以完全跳过这些步骤。这使得原生接口非常适合对效率要求极高的高吞吐量摄取场景。

### HTTP {#choose-an-interface-http}

与许多传统数据库不同，ClickHouse 也支持 HTTP 接口。**相比之下，该接口优先考虑兼容性和灵活性。** 它允许以[任意受支持的格式](/integrations/data-formats)发送数据——包括 JSON、CSV、Parquet 等——并在大多数 ClickHouse 客户端中得到广泛支持，包括 Python、Java、JavaScript 和 Rust。

这通常优于 ClickHouse 原生协议，因为它允许通过负载均衡器轻松切换流量。与原生协议相比，我们预计插入性能会有细微差异，原生协议的开销会略小一些。

然而，它缺少原生协议的深度集成能力，无法执行诸如物化值计算或自动转换为 Native 格式等客户端优化。虽然通过 HTTP 进行插入时仍可使用标准 HTTP 头进行压缩（例如 `Content-Encoding: lz4`），但压缩是针对整个负载而非单个数据块进行的。在那些更看重协议简单性、负载均衡或广泛格式兼容性而非极致性能的环境中，通常会优先选择该接口。

有关这些接口的更详细说明，请参见[此处](/interfaces/overview)。
