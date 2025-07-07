---
'sidebar_position': 1
'sidebar_label': '为什么 ClickHouse 如此快速？'
'description': '它被设计为快速。查询执行性能一直是开发过程中的首要任务，但其他重要特性如用户友好性、可扩展性和安全性也得到了考虑，以便 ClickHouse
  能够成为一个真正的生产系统。'
'title': '为什么 ClickHouse 如此快速？'
'slug': '/concepts/why-clickhouse-is-so-fast'
'keywords':
- 'Architecture'
- 'VLDB'
- 'Performance'
'show_related_blogs': true
---


# 为什么 ClickHouse 这么快？ {#why-clickhouse-is-so-fast}

除了 [数据方向](/intro#row-oriented-vs-column-oriented-storage) 之外，还有许多其他因素影响数据库的性能。接下来，我们将详细解释为什么 ClickHouse 这么快，尤其是与其他列式数据库相比。

从架构的角度来看，数据库至少由一个存储层和一个查询处理层组成。存储层负责保存、加载和维护表数据，而查询处理层执行用户查询。与其他数据库相比，ClickHouse 在这两个层面上提供了创新，使得插入和查询的速度极快。

## 存储层：并发插入彼此隔离 {#storage-layer-concurrent-inserts-are-isolated}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/vsykFYns0Ws?si=hE2qnOf6cDKn-otP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

在 ClickHouse 中，每个表由多个“表部分”组成。每当用户向表中插入数据（INSERT 语句）时，就会创建一个 [部分](/parts)。查询始终是针对查询开始时存在的所有表部分执行的。

为了避免过多的部分积累，ClickHouse 在后台运行 [合并](/merges) 操作，持续将多个较小的部分合并成一个更大的部分。

这种方法有几个优点：所有数据处理可以 [卸载到后台部分合并](/concepts/why-clickhouse-is-so-fast#storage-layer-merge-time-computation)，保持数据写入轻量且高效。单个插入是“本地”的，因为它们不需要更新全局的，即每个表的数据结构。因此，多个并发插入无需相互同步或与现有表数据同步，因此插入可以几乎以磁盘 I/O 的速度进行。

在 VLDB 论文的整体性能优化部分。

🤿 深入了解这一点，请参见我们 VLDB 2024 论文的 [On-Disk Format](/docs/academic_overview#3-1-on-disk-format) 部分，网页版。

## 存储层：并发插入和选择是隔离的 {#storage-layer-concurrent-inserts-and-selects-are-isolated}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/dvGlPh2bJFo?si=F3MSALPpe0gAoq5k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

插入与 SELECT 查询完全隔离，合并插入的数据部分发生在后台，而不会影响并发查询。

🤿 深入了解这一点，请参见我们 VLDB 2024 论文的 [Storage Layer](/docs/academic_overview#3-storage-layer) 部分，网页版。

## 存储层：合并时间计算 {#storage-layer-merge-time-computation}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/_w3zQg695c0?si=g0Wa_Petn-LcmC-6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

与其他数据库不同，ClickHouse 通过在 [合并](/merges) 背景过程中执行所有额外的数据转换，从而保持数据写入轻量且高效。这些转换的示例包括：

- **替换合并** ，保留输入部分中行的最新版本并丢弃所有其他版本。替换合并可以被视为合并时的清理操作。

- **聚合合并** ，将输入部分中的中间聚合状态合并为新的聚合状态。虽然这看起来难以理解，但实际上只实现了增量聚合。

- **TTL（生存时间）合并** ，根据某些基于时间的规则压缩、移动或删除行。

这些转换的目的是将工作（计算）从用户查询运行时转移到合并时间。这一点重要，原因有二：

一方面，如果用户查询能够利用“转化”数据，例如预聚合数据，可能会显著加快用户查询，有时加速高达 1000 倍或更多。

另一方面，合并的大部分运行时间消耗在加载输入部分和保存输出部分上。在合并期间转换数据的额外工作通常不会对合并的运行时间产生太大影响。所有这些魔法都是完全透明的，不会影响查询的结果（除了它们的性能）。

🤿 深入了解这一点，请参见我们 VLDB 2024 论文的 [Merge-time Data Transformation](/docs/academic_overview#3-3-merge-time-data-transformation) 部分，网页版。

## 存储层：数据修剪 {#storage-layer-data-pruning}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/UJpVAx7o1aY?si=w-AfhBcRIO-e3Ysj" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

在实践中，许多查询是重复的，即在定期间隔内以不变或仅轻微修改（例如不同的参数值）运行。一次又一次运行相同或相似的查询允许添加索引或以某种方式重新组织数据，使得频繁查询可以更快地访问。这种方法也称为“数据修剪”，而 ClickHouse 提供三种技术来实现这一点：

1. [主键索引](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design) 定义表数据的排序顺序。精心选择的主键允许使用快速的二进制搜索评估过滤器（如上述查询中的 WHERE 子句），而不是进行全列扫描。在更技术上，扫描的运行时间随着数据大小的增加而变为对数而不是线性。

2. [表投影](/sql-reference/statements/alter/projection) 作为表的替代内部版本，存储相同的数据但按不同的主键排序。当存在多个频繁的过滤条件时，投影可能会很有用。

3. [跳过索引](/optimize/skipping-indexes) 将附加的数据统计信息嵌入到列中，例如最小和最大列值、唯一值集合等。跳过索引与主键和表投影是正交的，具体速度会因列中数据分布而异，它们可以大大加速过滤条件的评估。

这三种技术都旨在尽可能跳过全列读取期间的行，因为读取数据的最快方法是不读取它。

🤿 深入了解这一点，请参见我们 VLDB 2024 论文的 [Data Pruning](/docs/academic_overview#3-2-data-pruning) 部分，网页版。

## 存储层：数据压缩 {#storage-layer-data-compression}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/MH10E3rVvnM?si=duWmS_OatCLx-akH" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

除此之外，ClickHouse 的存储层还额外（可选地）使用不同的编解码器压缩原始表数据。

列存储特别适合这种压缩，因为相同类型和数据分布的值位于一起。

用户可以 [指定](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) 列使用各种通用压缩算法（如 ZSTD）或专用编解码器进行压缩，例如用于浮点值的 Gorilla 和 FPC，或用于整数值的 Delta 和 GCD，甚至 AES 作为加密编解码器。

数据压缩不仅减少了数据库表的存储大小，而且在许多情况下，查询性能也得到了提升，因为本地磁盘和网络 I/O 通常受到低吞吐量的限制。

🤿 深入了解这一点，请参见我们 VLDB 2024 论文的 [On-Disk Format](/docs/academic_overview#3-1-on-disk-format) 部分，网页版。

## 尖端查询处理层 {#state-of-the-art-query-processing-layer}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/O5qecdQ7Y18?si=XVtOIuVd8NLbqyox" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

最后，ClickHouse 使用矢量化查询处理层，尽可能并行化查询执行，以最大限度地利用所有资源，实现最大速度和效率。

“矢量化”意味着查询计划操作符以批处理的方式传递中间结果行，而不是单行。这导致了 CPU 缓存的更好利用，并允许操作符应用 SIMD 指令一次处理多个值。实际上，许多操作符有多个版本——每个 SIMD 指令集世代一个。ClickHouse 会根据运行的硬件能力自动选择最新、最快的版本。

现代系统具有数十个 CPU 核心。为了充分利用所有核心，ClickHouse 将查询计划展开为多个通道，通常每个核心一个。每个通道处理表数据的一个不重叠范围。这样，数据库的性能随着可用核心的数量“垂直”扩展。

如果单个节点变得太小，无法容纳表数据，可以添加更多节点以形成集群。表可以被拆分（“分片”）并分布到各个节点。ClickHouse 将在所有存储表数据的节点上运行查询，从而与可用节点的数量“横向”扩展。

🤿 深入了解这一点，请参见我们 VLDB 2024 论文的 [Query Processing Layer](/academic_overview#4-query-processing-layer) 部分，网页版。

## 细致入微的关注细节 {#meticulous-attention-to-detail}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/dccGLSuYWy0?si=rQ-Jp-z5Ik_-Rb8S" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

> **“ClickHouse 是一个怪异的系统 - 你们有 20 个哈希表的版本。你们有这些令人惊叹的东西，而大多数系统只有一个哈希表... ClickHouse 之所以具有这种惊人的性能，是因为它有这么多专业化的组件。”** [Andy Pavlo, 卡内基梅隆大学数据库教授](https://www.youtube.com/watch?v=Vy2t_wZx4Is&t=3579s)

ClickHouse 的不同之处在于其对低级优化的细致入微关注。构建一个仅能正常工作的数据库是一回事，但设计一个能在多种查询类型、数据结构、分布和索引配置下提供速度的数据库则是 “[怪异系统](https://youtu.be/Vy2t_wZx4Is?si=K7MyzsBBxgmGcuGU&t=3579)” 艺术的闪光点。

**哈希表。** 以哈希表为例。哈希表是连接和聚合使用的中心数据结构。作为程序员，需要考虑这些设计决策：

* 选择哈希函数，
* 碰撞解决方案：[开放地址法](https://en.wikipedia.org/wiki/Open_addressing) 或 [链式法](https://en.wikipedia.org/wiki/Hash_table#Separate_chaining)，
* 内存布局：一个数组用于键和值还是分开的数组？
* 填充因子：何时以及如何调整大小？在调整大小时如何移动值？
* 删除：哈希表是否允许驱逐条目？

由第三方库提供的标准哈希表在功能上可以工作，但速度并不快。优异的性能需要细致的基准测试和实验。

[ClickHouse 中的哈希表实现](https://clickhouse.com/blog/hash-tables-in-clickhouse-and-zero-cost-abstractions) 根据查询和数据的具体情况选择 **30 多个预编译哈希表变体** 中的一个。

**算法。** 算法也同样如此。例如，在排序时，您可能要考虑：

* 要排序的内容：数字、元组、字符串或结构？
* 数据是否在 RAM 中？
* 排序是否需要稳定？
* 所有数据都必须排序还是部分排序就可以？

依赖数据特征的算法通常比它们的通用对应算法表现更佳。如果事先不知道数据特征，系统可以尝试各种实现，并在运行时选择效果最佳的实现。有关示例，请参见 [关于 ClickHouse 中 LZ4 解压缩实现的文章](https://habr.com/en/company/yandex/blog/457612/)。

🤿 深入了解这一点，请参见我们 VLDB 2024 论文的 [Holistic Performance Optimization](/academic_overview#4-4-holistic-performance-optimization) 部分，网页版。

## VLDB 2024 论文 {#vldb-2024-paper}

在 2024 年 8 月，我们的第一篇研究论文被 VLDB 会议接受并发表。 VLDB 是一个关于超大规模数据库的国际会议，被广泛认为是数据管理领域的领先会议之一。在数百份投稿中，VLDB 通常具有约 20% 的录用率。

您可以阅读这篇 [论文 PDF](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf) 或我们的 [网页版](/docs/academic_overview)，其中简要描述了 ClickHouse 的一些最有趣的架构和系统设计组件，使其如此快速。

我们的首席技术官、ClickHouse 的创建者 Alexey Milovidov 现场演示了论文（幻灯片 [在这里](https://raw.githubusercontent.com/ClickHouse/clickhouse-presentations/master/2024-vldb/VLDB_2024_presentation.pdf)），随后进行了问答（很快就没有时间了！）。您可以在这里观看录制的演示：

<iframe width="1024" height="576" src="https://www.youtube.com/embed/7QXKBKDOkJE?si=5uFerjqPSXQWqDkF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
