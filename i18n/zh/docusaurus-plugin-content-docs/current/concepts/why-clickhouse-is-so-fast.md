---
sidebar_position: 1
sidebar_label: 为什么 ClickHouse 这么快？
description: "它被设计为快速的。在开发过程中，查询执行性能始终是首要任务，但其他重要特性如用户友好性、可扩展性和安全性也被考虑在内，以便 ClickHouse 能够成为一个真正的生产系统。"
---


# 为什么 ClickHouse 这么快？ {#why-clickhouse-is-so-fast}

除了 [数据取向](/intro#row-oriented-vs-column-oriented-storage)，还有许多其他因素影响数据库的性能。
接下来我们将更详细地解释是什么让 ClickHouse 这么快，尤其是与其他列式数据库相比。

从架构的角度来看，数据库至少由存储层和查询处理层组成。存储层负责保存、加载和维护表数据，而查询处理层执行用户查询。与其他数据库相比，ClickHouse 在这两个层面提供了创新，使得插入和选择查询极其快速。

## 存储层：并发插入彼此隔离 {#storage-layer-concurrent-inserts-are-isolated}

<iframe width="768" height="432" src="https://www.youtube.com/embed/vsykFYns0Ws?si=hE2qnOf6cDKn-otP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

在 ClickHouse 中，每个表由多个“表片段”组成。[片段](/parts) 在用户插入数据时（INSERT 语句）创建。查询始终针对在查询开始时存在的所有表片段执行。

为了避免过多的片段积累，ClickHouse 在后台运行一个 [合并](/merges) 操作，不断将多个小片段合并为一个较大的片段。

这种方法有几个优点：所有数据处理可以 [转移到后台合并](/concepts/why-clickhouse-is-so-fast#storage-layer-merge-time-computation)，保持数据写入轻量而高效。单个插入是“局部”的，因为它们不需要更新全局的，即每个表的数据结构。因此，多个同时插入不需要相互同步或与现有表数据同步，从而插入几乎可以以磁盘 I/O 的速度执行。

在 VLDB 论文的整体性能优化部分。

🤿 深入了解我们的 VLDB 2024 论文中 [磁盘格式](/docs/academic_overview#3-1-on-disk-format) 部分。

## 存储层：并发插入和选择彼此隔离 {#storage-layer-concurrent-inserts-and-selects-are-isolated}

<iframe width="768" height="432" src="https://www.youtube.com/embed/dvGlPh2bJFo?si=F3MSALPpe0gAoq5k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

插入完全与 SELECT 查询隔离，合并插入的数据片段在后台进行，而不会影响并发查询。

🤿 深入了解我们的 VLDB 2024 论文中 [存储层](/docs/academic_overview#3-storage-layer) 部分。

## 存储层：合并时计算 {#storage-layer-merge-time-computation}

<iframe width="768" height="432" src="https://www.youtube.com/embed/_w3zQg695c0?si=g0Wa_Petn-LcmC-6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

与其他数据库不同，ClickHouse 通过在 [合并](/merges) 背景处理中执行所有额外的数据转换，从而保持数据写入轻量和高效。以下是一些例子：

- **替换合并**，仅保留输入片段中行的最新版本，丢弃所有其他行版本。替换合并可以看作是合并时的清理操作。

- **聚合合并**，将输入片段中的中间聚合状态合并为新的聚合状态。虽然这似乎很难理解，但实际上它只是实现了一种增量聚合。

- **生存时间 (TTL) 合并**，根据某些时间基准规则压缩、移动或删除行。

这些转换的目的在于将工作（计算）从用户查询的运行时间转移到合并时。这一点很重要，原因有二：

一方面，如果用户查询能够利用“转换”的数据，例如预聚合数据，那么它们可能会显著更快，有时快几百倍或更多。

另一方面，合并的运行时间大部分消耗在加载输入片段和保存输出片段上。在合并期间转换数据的额外工作通常对合并的运行时间影响不大。这一切魔法是完全透明的，不会影响查询的结果（除其性能外）。

🤿 深入了解我们的 VLDB 2024 论文中 [合并时数据转换](/docs/academic_overview#3-3-merge-time-data-transformation) 部分。

## 存储层：数据修剪 {#storage-layer-data-pruning}

<iframe width="768" height="432" src="https://www.youtube.com/embed/UJpVAx7o1aY?si=w-AfhBcRIO-e3Ysj" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

在实践中，许多查询是重复的，即在定期的间隔内以不变或仅稍微修改的方式运行（例如不同的参数值）。一次又一次运行相同或相似的查询可以添加索引或以一种频繁查询可以更快访问的方式重新组织数据。这种方法也被称为“数据修剪”，ClickHouse 提供三种技术来实现：

1. [主键索引](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)，定义表数据的排序顺序。一个精心选择的主键允许使用快速的二进制搜索来评估过滤器（如上述查询中的 WHERE 子句），而不是全列扫描。更技术地说，扫描的运行时间变为对数据大小的对数而不是线性。

2. [表投影](/sql-reference/statements/alter/projection)作为表的替代内部版本，存储相同的数据但按不同的主键排序。当有多个频繁的过滤条件时，投影可能很有用。

3. [跳过索引](/optimize/skipping-indexes)，将额外的数据统计信息嵌入到列中，例如最小值和最大值，唯一值集合等。跳过索引与主键和表投影是正交的，取决于列中的数据分布，它们可以大大加速过滤器的评估。

这三种技术的目标是尽可能跳过整个列读取过程中的行，因为读取数据的最快方式是根本不读取。

🤿 深入了解我们的 VLDB 2024 论文中 [数据修剪](/docs/academic_overview#3-2-data-pruning) 部分。

## 存储层：数据压缩 {#storage-layer-data-compression}

<iframe width="768" height="432" src="https://www.youtube.com/embed/MH10E3rVvnM?si=duWmS_OatCLx-akH" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

此外，ClickHouse 的存储层还额外（可选）使用不同的编解码器压缩原始表数据。

列式存储特别适合这种压缩，因为相同类型和数据分布的值聚集在一起。

用户可以 [指定](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) 使用各种通用压缩算法（如 ZSTD）或专用编解码器，例如用于浮点值的 Gorilla 和 FPC，或用于整数值的 Delta 和 GCD，甚至 AES 作为加密编解码器。

数据压缩不仅减少了数据库表的存储大小，而且在许多情况下，它还提高了查询性能，因为本地磁盘和网络 I/O 经常受到低吞吐量的限制。

🤿 深入了解我们的 VLDB 2024 论文中 [磁盘格式](/docs/academic_overview#3-1-on-disk-format) 部分。

## 先进的查询处理层 {#state-of-the-art-query-processing-layer}

<iframe width="768" height="432" src="https://www.youtube.com/embed/O5qecdQ7Y18?si=XVtOIuVd8NLbqyox" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

最后，ClickHouse 使用向量化查询处理层，尽可能并行化查询执行，以最大化速度和效率地利用所有资源。

“向量化”意味着查询计划操作符批量传递中间结果行，而不是单行。这提高了 CPU 缓存的利用率，并允许操作符应用 SIMD 指令同时处理多个值。实际上，许多操作符有多个版本 - 每个 SIMD 指令集生成一个。根据其运行的硬件的能力，ClickHouse 会自动选择最新和最快的版本。

现代系统有几十个 CPU 核心。为了利用所有核心，ClickHouse 将查询计划展开为多个通道，通常每个核心一个。每个通道处理表数据的不重叠范围。这样，数据库的性能会随着可用核心数量的增加而“垂直”扩展。

如果单个节点太小，无法容纳表数据，则可以添加更多节点形成集群。表可以被拆分（“分片”）并分布在节点之间。ClickHouse 将在所有存储表数据的节点上运行查询，从而实现可用节点数量的“水平”扩展。

🤿 深入了解我们的 VLDB 2024 论文中 [查询处理层](/academic_overview#4-query-processing-layer) 部分。

## 一丝不苟的细节处理 {#meticulous-attention-to-detail}

<iframe width="768" height="432" src="https://www.youtube.com/embed/dccGLSuYWy0?si=rQ-Jp-z5Ik_-Rb8S" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

> **“ClickHouse 是一个怪异的系统 - 你们有 20 个版本的哈希表。你们有这些惊人的东西，而大多数系统只有一个哈希表。** **…** **ClickHouse 之所以有如此惊人的性能，是因为它拥有这些专用组件。”** [Andy Pavlo, CMU 数据库教授](https://www.youtube.com/watch?v=Vy2t_wZx4Is&t=3579s)

ClickHouse 的 [与众不同](https://www.youtube.com/watch?v=CAS2otEoerM) 之处在于其对低级优化的细致关注。构建一个简单可用的数据库是一方面，但将其工程化以在各种查询类型、数据结构、分布和索引配置中提供速度，则是“[怪异系统](https://youtu.be/Vy2t_wZx4Is?si=K7MyzsBBxgmGcuGU&t=3579)”艺术的闪光点。

  
**哈希表。** 让我们用哈希表作为例子。哈希表是连接和聚合中使用的中心数据结构。作为程序员，必须考虑这些设计决策：

* 选择什么哈希函数，  
* 碰撞解决： [开放寻址](https://en.wikipedia.org/wiki/Open_addressing) 还是 [链式](https://en.wikipedia.org/wiki/Hash_table#Separate_chaining)，  
* 内存布局：一个数组用于键和值还是分开数组？  
* 填充因子：何时以及如何调整大小？如何在调整大小期间移动值？  
* 删除：哈希表是否允许驱逐条目？

来自第三方库的标准哈希表在功能上是有效的，但速度并不快。出色的性能需要细致的基准测试和实验。

[ClickHouse 中的哈希表实现](https://clickhouse.com/blog/hash-tables-in-clickhouse-and-zero-cost-abstractions) 基于查询和数据的具体情况选择 **30 多种预编译哈希表变体**。

**算法。** 对于算法也是如此。例如，在排序中，你可能需要考虑：

* 将排序的对象是：数字、元组、字符串还是结构？  
* 数据是否在 RAM 中？  
* 排序是否需要稳定？  
* 所有数据都需要排序，还是部分排序就足够？

依赖于数据特征的算法通常比其通用对应物表现得更好。如果不知道数据特征，系统可以尝试不同的实现，并在运行时选择最佳的那一个。有关示例，请参见 [如何在 ClickHouse 中实现 LZ4 解压缩的文章](https://habr.com/en/company/yandex/blog/457612/)。

🤿 深入了解我们的 VLDB 2024 论文中 [整体性能优化](/academic_overview#4-4-holistic-performance-optimization) 部分。

## VLDB 2024 论文 {#vldb-2024-paper}

在 2024 年 8 月，我们的第一篇研究论文在 VLDB 被接受并发表。
VLDB 是一个关于超大规模数据库的国际会议，被广泛视为数据管理领域的领先会议之一。
在数百个提交中，VLDB 通常有约 20% 的接受率。

你可以阅读这篇论文的 [PDF 版本](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf) 或我们的 [网页版本](/docs/academic_overview)，该版本简要描述了 ClickHouse 最有趣的架构和系统设计组件，使其如此快速。

我们的首席技术官兼 ClickHouse 的创建者 Alexey Milovidov 进行了该论文的讲解（幻灯片 [见这里](https://raw.githubusercontent.com/ClickHouse/clickhouse-presentations/master/2024-vldb/VLDB_2024_presentation.pdf)），随后进行了一个迅速结束的问答环节。
你可以在这里获取录制的演示：

<iframe width="768" height="432" src="https://www.youtube.com/embed/7QXKBKDOkJE?si=5uFerjqPSXQWqDkF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
