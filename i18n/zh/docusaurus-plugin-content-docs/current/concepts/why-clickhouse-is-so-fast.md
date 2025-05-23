---
'sidebar_position': 1
'sidebar_label': '为什么 ClickHouse 如此快速？'
'description': '它旨在实现快速。查询执行性能在开发过程中一直是首要优先考虑的因素，但其他重要特性，如用户友好性、可伸缩性和安全性，也被考虑在内，以便
  ClickHouse 能够成为一个真正的生产系统。'
'title': '为什么 ClickHouse 如此快速？'
'slug': '/concepts/why-clickhouse-is-so-fast'
---


# 为什么 ClickHouse 速度如此快？ {#why-clickhouse-is-so-fast}

除了[数据存储方式](/intro#row-oriented-vs-column-oriented-storage)，数据库性能的很多其他因素也起到重要作用。接下来，我们将更详细地解释是什么让 ClickHouse如此快速，特别是与其他列式数据库相比。

从架构的角度来看，数据库至少由存储层和查询处理层组成。存储层负责保存、加载和维护表数据，而查询处理层则执行用户查询。与其他数据库相比，ClickHouse 在这两个层面上都提供了创新，使得插入和 SELECT 查询可以极为迅速。

## 存储层：并发插入是彼此隔离的 {#storage-layer-concurrent-inserts-are-isolated-from-each-other}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/vsykFYns0Ws?si=hE2qnOf6cDKn-otP" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

在 ClickHouse 中，每个表由多个“表部分”组成。每当用户向表中插入数据（INSERT 语句）时，就会创建一个[部分](/parts)。查询始终针对查询开始时存在的所有表部分执行。

为了避免过多部分的积累，ClickHouse 在后台运行[合并](/merges)操作，持续将多个较小的部分合并为一个较大的部分。

这种方法具有几个优点：所有数据处理可以通过[后台部分合并](/concepts/why-clickhouse-is-so-fast#storage-layer-merge-time-computation)卸载，从而保持数据写入轻量且高效。单独的插入是“本地”的，因为它们不需要更新全局，即按表的数据结构。因此，多个并发插入不需要彼此同步或与现有表数据同步，因此插入几乎可以在磁盘 I/O 的速度下进行。

有关这一整体性能优化的更多内容，请参考 VLDB 论文的相关部分。

🤿 深入了解，请参见我们 VLDB 2024 论文的[磁盘格式](/docs/academic_overview#3-1-on-disk-format)部分。

## 存储层：并发插入和选择是隔离的 {#storage-layer-concurrent-inserts-and-selects-are-isolated}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/dvGlPh2bJFo?si=F3MSALPpe0gAoq5k" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

插入与 SELECT 查询完全隔离，合并插入的数据部分在后台进行，而不影响并发查询。

🤿 深入了解，请参见我们 VLDB 2024 论文的[存储层](/docs/academic_overview#3-storage-layer)部分。

## 存储层：合并时间计算 {#storage-layer-merge-time-computation}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/_w3zQg695c0?si=g0Wa_Petn-LcmC-6" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

与其他数据库不同，ClickHouse 通过在[合并](/merges)后台过程中执行所有额外的数据转换，从而保持数据写入的轻量和高效。这些转换的示例包括：

- **替换合并**，仅保留输入部分中每行的最新版本，丢弃所有其他行版本。替换合并可以被视为合并时的清理操作。

- **聚合合并**，将输入部分中的中间聚合状态汇总为新的聚合状态。虽然这似乎难以理解，但实际上它真的只是实现了增量聚合。

- **TTL（生存时间）合并**，根据特定的基于时间的规则压缩、移动或删除行。

这些转换的重点是将工作（计算）从用户查询运行时转移到合并时间。这一点非常重要，原因有两个：

一方面，如果用户查询能够利用“转换”后的数据，例如预聚合的数据，则查询速度可能会显著加快，有时可达 1000 倍或更多。

另一方面，合并过程中大部分的运行时间被用于加载输入部分和保存输出部分。在合并过程中对数据进行转换的额外工作通常不会对合并的运行时间产生太大影响。所有这些魔法都是完全透明的，不会影响查询的结果（除了性能）。

🤿 深入了解，请参见我们 VLDB 2024 论文的[合并时间数据转换](/docs/academic_overview#3-3-merge-time-data-transformation)部分。

## 存储层：数据修剪 {#storage-layer-data-pruning}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/UJpVAx7o1aY?si=w-AfhBcRIO-e3Ysj" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

在实际操作中，许多查询是重复的，即在固定时间间隔内以不变或仅稍作修改（例如不同的参数值）运行。一次又一次地运行相同或相似的查询允许添加索引或以某种方式重新组织数据，以便频繁的查询可以更快地访问。此方法也被称为“数据修剪”，ClickHouse 提供了三种技术：

1. [主键索引](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)，定义表数据的排序顺序。良好的主键选择允许使用快速的二进制搜索评估筛选条件（就像上述查询中的 WHERE 子句）。从更技术的角度来看，扫描的运行时间变为对数据大小的对数时间，而不是线性时间。

2. [表投影](/sql-reference/statements/alter/projection)，作为表的替代内部版本，存储相同数据但按照不同主键排序。当存在多个频繁的过滤条件时，投影可能会非常有用。

3. [跳过索引](/optimize/skipping-indexes)，将额外的数据统计嵌入到列中，例如最小和最大列值、唯一值集合等。跳过索引与主键和表投影是正交的，具体取决于列中的数据分布，它们可以大大加快筛选条件的评估。

这三种技术的目的都是尽可能在全列读取过程中跳过尽可能多的行，因为读取数据的最快方法就是根本不读取它。

🤿 深入了解，请参见我们 VLDB 2024 论文的[数据修剪](/docs/academic_overview#3-2-data-pruning)部分。

## 存储层：数据压缩 {#storage-layer-data-compression}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/MH10E3rVvnM?si=duWmS_OatCLx-akH" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

此外，ClickHouse 的存储层还可选择性地使用不同的编解码器来压缩原始表数据。

列式存储特别适合这种压缩，因为相同类型和数据分布的值被放在一起。

用户可以[指定](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)，将列通过各种通用压缩算法（如 ZSTD）或专用编解码器进行压缩，例如浮点值的 Gorilla 和 FPC，整数值的 Delta 和 GCD，甚至 AES 作为加密编解码器。

数据压缩不仅减少了数据库表的存储大小，而且在许多情况下，它还提高了查询性能，因为本地磁盘和网络 I/O 通常受到低吞吐量的限制。

🤿 深入了解，请参见我们 VLDB 2024 论文的[磁盘格式](/docs/academic_overview#3-1-on-disk-format)部分。

## 最先进的查询处理层 {#state-of-the-art-query-processing-layer}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/O5qecdQ7Y18?si=XVtOIuVd8NLbqyox" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

最后，ClickHouse 使用一种矢量化查询处理层，尽可能将查询执行并行化，以充分利用所有资源，实现最大速度和效率。

“矢量化”的意思是查询计划操作符批量传递中间结果行，而不是单行。这导致了对 CPU 缓存的更好利用，并允许操作符应用 SIMD 指令一次处理多个值。事实上，许多操作符都有多个版本——每个 SIMD 指令集一代一个。ClickHouse 将根据其运行的硬件能力自动选择最新和最快的版本。

现代系统具有数十个 CPU 核心。为了利用所有核心，ClickHouse 将查询计划展开成多个通道，通常每个核心一个。每个通道处理表数据的一个不相交范围。这样，数据库的性能“垂直”地随着可用核心数量的增加而增加。

如果单个节点变得过小时，无法容纳表数据，可以添加更多节点以形成集群。表可以被拆分（“分片”）并分布到各个节点上。ClickHouse 会在存储表数据的所有节点上运行查询，从而随着可用节点数量的增加而“水平”扩展。

🤿 深入了解，请参见我们 VLDB 2024 论文的[查询处理层](/academic_overview#4-query-processing-layer)部分。

## 一丝不苟的细节关注 {#meticulous-attention-to-detail}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/dccGLSuYWy0?si=rQ-Jp-z5Ik_-Rb8S" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

> **“ClickHouse 是一个怪系统 - 你们有 20 个版本的哈希表。你们有这些了不起的功能，而大多数系统只会有一个哈希表... ClickHouse 的表现如此惊人，因为它有所有这些专用组件”** [Andy Pavlo, 杜克大学数据库教授](https://www.youtube.com/watch?v=Vy2t_wZx4Is&t=3579s)

让 ClickHouse[脱颖而出](https://www.youtube.com/watch?v=CAS2otEoerM)的是其对低级优化的细致关注。构建一个简单工作的数据库是一回事，但在各种查询类型、数据结构、分布和索引配置中，使其能够提供速度则是“[怪系统](https://youtu.be/Vy2t_wZx4Is?si=K7MyzsBBxgmGcuGU&t=3579)”艺术作品闪耀的地方。

**哈希表。** 以哈希表为例。哈希表是连接和聚合所用的中心数据结构。程序员需要考虑这些设计决策：

* 选择哪个哈希函数，
* 碰撞解决方案：[开放地址法](https://en.wikipedia.org/wiki/Open_addressing)或[链式法](https://en.wikipedia.org/wiki/Hash_table#Separate_chaining)，
* 内存布局：一个数组存储键和值，还是分开存储？
* 填充因子：何时以及如何调整大小？调整大小期间如何移动值？
* 删除：哈希表是否允许驱逐条目？

第三方库提供的标准哈希表在功能上可以正常工作，但它不会快速。出色的性能需要细致的基准测试和实验。

ClickHouse 中的[哈希表实现](https://clickhouse.com/blog/hash-tables-in-clickhouse-and-zero-cost-abstractions)根据查询和数据的具体情况选择**30 多个预编译哈希表变体**中的一个。

**算法。** 对于算法也是如此。例如，在排序时，您可能需要考虑：

* 要排序的内容：数字、元组、字符串还是结构？
* 数据是否在 RAM 中？
* 排序是否需要稳定？
* 是否需要对所有数据进行排序，还是部分排序就足够？

依赖于数据特征的算法通常比其通用对应物表现更好。如果事先不知道数据特征，系统可以尝试各种实现，并在运行时选择最合适的那个。有关示例，请参阅[关于 ClickHouse 中 LZ4 解压缩实现的文章](https://habr.com/en/company/yandex/blog/457612/)。

🤿 深入了解，请参见我们 VLDB 2024 论文的[整体性能优化](/academic_overview#4-4-holistic-performance-optimization)部分。

## VLDB 2024 论文 {#vldb-2024-paper}

在 2024 年 8 月，我们的第一篇研究论文在 VLDB 被接受并发表。VLDB 是一个国际性的非常大型数据库会议，被广泛认为是数据管理领域的领先会议之一。在数百份提交中，VLDB 的接受率通常约为 20%。

您可以阅读论文的[PDF 版本](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf)或我们[网页版本](/docs/academic_overview)，其中简要描述了使 ClickHouse 快速的最有趣的架构和系统设计组件。

我们的首席技术官 ClickHouse 的创始人 Alexey Milovidov 发表了这篇论文（幻灯片[在这里](https://raw.githubusercontent.com/ClickHouse/clickhouse-presentations/master/2024-vldb/VLDB_2024_presentation.pdf)），之后进行了问答（时间很快就用完了！）。您可以在此处观看录制的演示：

<iframe width="1024" height="576" src="https://www.youtube.com/embed/7QXKBKDOkJE?si=5uFerjqPSXQWqDkF" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
