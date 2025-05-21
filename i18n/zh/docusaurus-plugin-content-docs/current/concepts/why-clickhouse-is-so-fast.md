---
'sidebar_position': 1
'sidebar_label': 'ClickHouse 为什么如此快速？'
'description': 'ClickHouse 的设计目标是实现快速查询。在开发过程中，查询执行性能一直是首要考虑的因素，但也考虑了其他重要特性，如用户友好性、可伸缩性和安全性，以便
  ClickHouse 成为一个真正的生产系统。'
'title': 'ClickHouse 为什么如此快速？'
'slug': '/concepts/why-clickhouse-is-so-fast'
---




# 为什么 ClickHouse 这么快？ {#why-clickhouse-is-so-fast}

许多其他因素会影响数据库性能，除了[其数据方向](/intro#row-oriented-vs-column-oriented-storage)。
接下来，我们将更详细地解释使 ClickHouse 速度如此之快的原因，特别是与其他列式数据库相比。

从架构的角度来看，数据库至少由存储层和查询处理层组成。存储层负责保存、加载和维护表数据，而查询处理层则执行用户查询。与其他数据库相比，ClickHouse 在这两个层面上都提供了创新，使得插入和 SELECT 查询的速度极快。

## 存储层：并发插入相互隔离 {#storage-layer-concurrent-inserts-are-isolated}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/vsykFYns0Ws?si=hE2qnOf6cDKn-otP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

在 ClickHouse 中，每个表由多个“表部分”组成。当用户向表中插入数据时（INSERT 语句），会创建一个[部分](/parts)。查询始终会针对查询开始时存在的所有表部分执行。

为了避免出现过多的部分，ClickHouse 在后台运行[合并](/merges)操作，不断将多个较小的部分合并为一个较大的部分。

这种方法有几个优点：所有数据处理可以[卸载到后台部分合并中](/concepts/why-clickhouse-is-so-fast#storage-layer-merge-time-computation)，保持数据写入操作轻量化且高效。单个插入在一定程度上是“局部的”，因为它们不需要更新全局的数据结构。因此，多次同时插入操作不需要相互同步或与现有表数据同步，因此插入速度几乎可以达到磁盘 I/O 的速度。

查看 VLDB 论文的整体性能优化部分。

🤿 深入了解 [On-Disk Format](/docs/academic_overview#3-1-on-disk-format) 部分，了解我们 VLDB 2024 论文的网络版本。

## 存储层：并发插入和选择相互隔离 {#storage-layer-concurrent-inserts-and-selects-are-isolated}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/dvGlPh2bJFo?si=F3MSALPpe0gAoq5k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

插入与 SELECT 查询完全隔离，合并插入数据部分在后台进行，不会影响并发查询。

🤿 深入了解 [Storage Layer](/docs/academic_overview#3-storage-layer) 部分，了解我们 VLDB 2024 论文的网络版本。

## 存储层：合并时间计算 {#storage-layer-merge-time-computation}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/_w3zQg695c0?si=g0Wa_Petn-LcmC-6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

与其他数据库不同，ClickHouse 通过在[合并](/merges)后台过程中执行所有额外的数据转换来保持数据写入操作轻量化且高效。这些转换的示例包括：

- **替换合并**，仅保留输入部分中行的最新版本，丢弃所有其他行版本。可以将替换合并视为合并时的清理操作。

- **聚合合并**，将输入部分中的中间聚合状态合并为新的聚合状态。虽然这看起来难以理解，但实际上它仅仅实现了增量聚合。

- **TTL（生存时间）合并**，根据某些时间基于的规则压缩、移动或删除行。

这些转换的重点是将工作（计算）从用户查询运行时转移到合并时间。这一点很重要，原因有两个：

一方面，如果用户查询能利用“变换过的”数据，例如预聚合的数据，则可以显著加快速度，有时提高速度可达 1000 倍或更多。

另一方面，合并的大部分运行时间消耗在加载输入部分和保存输出部分。合并期间转换数据的额外工作通常不会对合并的运行时间产生太大影响。所有这些“魔法”是完全透明的，并不会影响查询结果（除了它们的性能）。

🤿 深入了解 [Merge-time Data Transformation](/docs/academic_overview#3-3-merge-time-data-transformation) 部分，了解我们 VLDB 2024 论文的网络版本。

## 存储层：数据修剪 {#storage-layer-data-pruning}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/UJpVAx7o1aY?si=w-AfhBcRIO-e3Ysj" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

在实际使用中，许多查询是重复的，即在周期性间隔内以不变或仅稍作修改的方式运行（例如，不同的参数值）。重复运行相同或相似的查询使得可以添加索引或重新组织数据，以便频繁查询能够更快地访问。这种方法也称为“数据修剪”，ClickHouse 提供了三种技术：

1. [主键索引](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)，定义表数据的排序顺序。合理选择的主键可以使用快速的二进制搜索评估过滤器（如上述查询中的 WHERE 子句），而不是全列扫描。用更技术性的术语来说，扫描的运行时间变为数据大小的对数而不是线性。

2. [表投影](/sql-reference/statements/alter/projection)，作为表的替代内部版本，存储相同的数据，但按不同的主键排序。当有多个频繁过滤条件时，投影可能非常有用。

3. [跳过索引](/optimize/skipping-indexes)，将附加的数据统计信息嵌入列中，例如，最小和最大列值、唯一值集合等。跳过索引与主键和表投影是正交的，根据列中数据的分布，它们可以大大加快过滤器的评估速度。

这三种技术的目标是在全列读取过程中尽可能跳过尽可能多的行，因为读取数据的最快方式就是根本不读取它。

🤿 深入了解 [Data Pruning](/docs/academic_overview#3-2-data-pruning) 部分，了解我们 VLDB 2024 论文的网络版本。

## 存储层：数据压缩 {#storage-layer-data-compression}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/MH10E3rVvnM?si=duWmS_OatCLx-akH" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

此外，ClickHouse 的存储层还额外（可选地）通过不同的编码对原始表数据进行压缩。

列式存储特别适合进行这种压缩，因为相同类型和数据分布的值会聚集在一起。

用户可以[指定](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)使用各种通用压缩算法（如 ZSTD）或专用编码，例如，用于浮点值的 Gorilla 和 FPC，用于整数值的 Delta 和 GCD，甚至以 AES 作为加密编码。

数据压缩不仅减少了数据库表的存储大小，而且在许多情况下，还提高了查询性能，因为本地磁盘和网络 I/O 往往受限于低吞吐量。

🤿 深入了解 [On-Disk Format](/docs/academic_overview#3-1-on-disk-format) 部分，了解我们 VLDB 2024 论文的网络版本。

## 最先进的查询处理层 {#state-of-the-art-query-processing-layer}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/O5qecdQ7Y18?si=XVtOIuVd8NLbqyox" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

最后，ClickHouse 使用一个向量化的查询处理层，尽可能并行化查询执行，以利用所有资源实现最大速度和效率。

“向量化”意味着查询计划操作符以批量而不是单行的方式传递中间结果行。这提高了 CPU 缓存的利用率，并允许操作符应用 SIMD 指令一次处理多个值。实际上，许多操作符有多个版本——每个 SIMD 指令集一代。ClickHouse 将根据运行的硬件能力自动选择最新和最快的版本。

现代系统具有数十个 CPU 核心。为了利用所有核心，ClickHouse 将查询计划展开为多个车道，通常每个核心一个。每条车道处理表数据的互不重叠的范围。以此方式，数据库的性能随着可用核心数量的增加而“垂直”扩展。

如果单个节点变得太小以容纳表数据，则可以添加更多节点以形成集群。表可以被划分（“分片”）并分布在节点之间。ClickHouse 将在存储表数据的所有节点上运行查询，从而随着可用节点数量的增加而“横向”扩展。

🤿 深入了解 [Query Processing Layer](/academic_overview#4-query-processing-layer) 部分，了解我们 VLDB 2024 论文的网络版本。

## 精细的关注细节 {#meticulous-attention-to-detail}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/dccGLSuYWy0?si=rQ-Jp-z5Ik_-Rb8S" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

> **“ClickHouse 是一个奇怪的系统 - 你们有 20 种哈希表。你们有所有这些惊人的东西，而大多数系统只会有一个哈希表... ClickHouse 拥有这种惊人的性能，因为它有所有这些专门构件”** [Andy Pavlo，卡内基梅隆大学的数据库教授](https://www.youtube.com/watch?v=Vy2t_wZx4Is&t=3579s)

ClickHouse 的[独特之处](https://www.youtube.com/watch?v=CAS2otEoerM)在于它对低级优化的精细关注。构建一个简单可以工作的数据库是一回事，但将其工程化以在各种查询类型、数据结构、分布和索引配置中提供速度是“[奇怪系统](https://youtu.be/Vy2t_wZx4Is?si=K7MyzsBBxgmGcuGU&t=3579)”工艺的光辉所在。

**哈希表。** 以哈希表为例，哈希表是联接和聚合使用的中心数据结构。作为程序员，需要考虑这些设计决策：

* 选择哪种哈希函数，
* 碰撞解决方法：[开放寻址](https://en.wikipedia.org/wiki/Open_addressing)或[链式哈希](https://en.wikipedia.org/wiki/Hash_table#Separate_chaining)，
* 内存布局：一个数组用于键和值还是分开数组？
* 填充因子：何时以及如何调整大小？在调整大小时如何移动值？
* 删除：哈希表是否应允许驱逐条目？

由第三方库提供的标准哈希表在功能上能工作，但速度上并不快。出色的性能需要细致的基准测试和实验。

[ClickHouse 中的哈希表实现](https://clickhouse.com/blog/hash-tables-in-clickhouse-and-zero-cost-abstractions)根据查询和数据的具体情况选择**30 多种预编译的哈希表变体**之一。

**算法。** 算法也是如此。例如，在排序中，您可能需要考虑：

* 要排序的内容：数字、元组、字符串或结构？
* 数据是否在 RAM 中？
* 是否要求排序稳定？
* 是否需对所有数据进行排序，还是部分排序就足够？

依赖于数据特征的算法通常比通用算法表现得更好。如果数据特征事先未知，系统可以尝试各种实现，并在运行时选择最佳表现的实现。例如，请参阅[关于 ClickHouse 中 LZ4 解压缩如何实现的文章](https://habr.com/en/company/yandex/blog/457612/)。

🤿 深入了解 [Holistic Performance Optimization](/academic_overview#4-4-holistic-performance-optimization) 部分，了解我们 VLDB 2024 论文的网络版本。

## VLDB 2024 论文 {#vldb-2024-paper}

在 2024 年 8 月，我们的第一篇研究论文在 VLDB 被接受并发布。
VLDB 是一个国际性的大型数据库会议，被广泛认为是数据管理领域的顶级会议之一。
在数百份投稿中，VLDB 通常具有~20%的接受率。

您可以阅读[论文的 PDF](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf)或我们的[网络版本](/docs/academic_overview)，其中简要描述了 ClickHouse 最有趣的体系结构和系统设计组件，使其如此快速。

我们的首席技术官以及 ClickHouse 的创建者 Alexey Milovidov，介绍了论文（幻灯片[在这里](https://raw.githubusercontent.com/ClickHouse/clickhouse-presentations/master/2024-vldb/VLDB_2024_presentation.pdf)），随后进行了问答（很快就超时了！）。
您可以在这里观看录制的演示：

<iframe width="1024" height="576" src="https://www.youtube.com/embed/7QXKBKDOkJE?si=5uFerjqPSXQWqDkF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
