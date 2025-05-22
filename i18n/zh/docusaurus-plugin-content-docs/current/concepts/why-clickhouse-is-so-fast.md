---
'sidebar_position': 1
'sidebar_label': '为什么 ClickHouse 这么快？'
'description': '它的设计目标是快速。在开发过程中，查询执行性能始终是首要任务，但用户友好性、可扩展性和安全性等其他重要特征也被考虑在内，以便 ClickHouse
  能够成为一个真正的生产系统。'
'title': '为什么 ClickHouse 这么快？'
'slug': '/concepts/why-clickhouse-is-so-fast'
---


# 为什么 ClickHouse 这么快？ {#why-clickhouse-is-so-fast}

除了 [数据取向](/intro#row-oriented-vs-column-oriented-storage) 之外，还有许多因素影响数据库的性能。接下来，我们将详细解释是什么让 ClickHouse 这么快，尤其是与其他列式数据库相比。

从架构角度来看，数据库至少由存储层和查询处理层组成。存储层负责保存、加载和维护表数据，而查询处理层执行用户查询。与其他数据库相比，ClickHouse 在这两个层面都提供了创新，能够实现极快的插入和查询（Select）。

## 存储层：并发插入相互隔离 {#storage-layer-concurrent-inserts-are-isolated}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/vsykFYns0Ws?si=hE2qnOf6cDKn-otP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

在 ClickHouse 中，每个表由多个“表片”组成。每当用户向表中插入数据时（INSERT 语句），就会创建一个 [部分](/parts)。查询始终针对查询开始时存在的所有表片执行。

为了避免过多的部分积累，ClickHouse 在后台运行 [合并](/merges) 操作，不断地将多个较小的部分合并为一个较大的部分。

这种方法有几个优点：所有数据处理都可以 [卸载到后台部分合并](/concepts/why-clickhouse-is-so-fast#storage-layer-merge-time-computation)，保持数据写入轻量且高效。单个插入是“局部的”，因为它们无需更新全局（即每个表）的数据结构。因此，多个并发插入不需要相互同步或与现有表数据同步，因此插入几乎可以以磁盘 I/O 的速度进行。

全面性能优化部分的 VLDB 论文。

🤿 深入了解 [磁盘格式](/docs/academic_overview#3-1-on-disk-format) 部分，本部分来自我们 2024 年 VLDB 论文的网页版本。

## 存储层：并发插入和查询是相互隔离的 {#storage-layer-concurrent-inserts-and-selects-are-isolated}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/dvGlPh2bJFo?si=F3MSALPpe0gAoq5k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

插入与 SELECT 查询完全隔离，合并插入的数据部分在后台进行，而不影响并发查询。

🤿 深入了解 [存储层](/docs/academic_overview#3-storage-layer) 部分，本部分来自我们 2024 年 VLDB 论文的网页版本。

## 存储层：合并时计算 {#storage-layer-merge-time-computation}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/_w3zQg695c0?si=g0Wa_Petn-LcmC-6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

与其他数据库不同，ClickHouse 通过在 [合并](/merges) 后台过程中执行所有额外的数据转换，保持数据写入轻量和高效。此类转化的示例包括：

- **替换合并**，仅保留输入部分中行的最新版本，丢弃所有其他行版本。替换合并可以被视为合并时的清理操作。

- **聚合合并**，将输入部分中的中间聚合状态组合成新的聚合状态。虽然这似乎很难理解，但实际上它仅仅实施了增量聚合。

- **TTL（生存时间）合并**，根据某些基于时间的规则压缩、移动或删除行。

这些转换的目的在于将工作（计算）从用户查询执行的时间转移到合并时。这样做重要的原因有两个：

一方面，如果用户查询可以利用“转换过”的数据（例如预聚合数据），那么查询可能会变得显著更快，有时可以提高 1000 倍或更多。

另一方面，合并的大多数运行时间都消耗在加载输入部分和保存输出部分上。合并期间转换数据的额外工作通常不会对合并的运行时间产生太大影响。所有这些操作都是完全透明的，并且不影响查询的结果（除了它们的性能）。

🤿 深入了解 [合并时的数据转换](/docs/academic_overview#3-3-merge-time-data-transformation) 部分，本部分来自我们 2024 年 VLDB 论文的网页版本。

## 存储层：数据修剪 {#storage-layer-data-pruning}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/UJpVAx7o1aY?si=w-AfhBcRIO-e3Ysj" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

在实践中，许多查询是重复性的，即在周期性时间间隔内以不变或仅稍加修改（例如不同参数值）运行。反复运行相同或类似的查询允许添加索引或以某种方式重新组织数据，使得频繁的查询可以更快地访问。这种方法也被称为“数据修剪”，ClickHouse 提供了三种技术：

1. [主键索引](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)，定义表数据的排序顺序。精心选择的主键使得能够使用快速的二进制搜索来评估过滤器（如上面查询中的 WHERE 子句），而不是全列扫描。用更专业的术语来说，扫描的运行时间变为对数据规模的对数，而不是线性。

2. [表投影](/sql-reference/statements/alter/projection)作为表的替代内部版本，存储相同的数据但按不同的主键排序。当有多个频繁的过滤条件时，投影可能非常有用。

3. [跳过索引](/optimize/skipping-indexes)，在列中嵌入额外的数据统计信息，例如列的最小和最大值、唯一值集等。跳过索引与主键和表投影是正交的，取决于列中数据的分布，它们可以极大地加速过滤器的评估。

这三种技术的目标是在全列读取的过程中尽可能跳过尽可能多的行，因为读取数据的最快方法就是根本不读取它。

🤿 深入了解 [数据修剪](/docs/academic_overview#3-2-data-pruning) 部分，本部分来自我们 2024 年 VLDB 论文的网页版本。

## 存储层：数据压缩 {#storage-layer-data-compression}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/MH10E3rVvnM?si=duWmS_OatCLx-akH" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

此外，ClickHouse 的存储层还（可选）使用不同的编解码器对原始表数据进行压缩。

列式存储特别适合这种压缩，因为相同类型和数据分布的值是一起存放的。

用户可以 [指定](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) 使用各种通用压缩算法（如 ZSTD）或专门编解码器对列进行压缩，例如对浮点值使用 Gorilla 和 FPC，对整数值使用 Delta 和 GCD，甚至使用 AES 作为加密编解码器。

数据压缩不仅减少数据库表的存储大小，而且在许多情况下，它还改善查询性能，因为本地磁盘和网络 I/O 通常受到低吞吐量的限制。

🤿 深入了解 [磁盘格式](/docs/academic_overview#3-1-on-disk-format) 部分，本部分来自我们 2024 年 VLDB 论文的网页版本。

## 先进的查询处理层 {#state-of-the-art-query-processing-layer}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/O5qecdQ7Y18?si=XVtOIuVd8NLbqyox" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

最后，ClickHouse 使用了向量化的查询处理层，以尽可能并行化查询执行，从而最大限度地利用所有资源以获得最高速度和效率。

“向量化”意味着查询计划操作符以批量方式而不是单行传递中间结果行。这导致 CPU 缓存得到更好的利用，并允许操作符应用 SIMD 指令同时处理多个值。实际上，许多操作符有多个版本 ‒ 每个 SIMD 指令集生成一个。ClickHouse 将根据运行所需硬件的能力自动选择最新且最快的版本。

现代系统有数十个 CPU 核心。为了利用所有核心，ClickHouse 将查询计划展开为多个通道，通常每个核心一个。每个通道处理表数据的一个不重叠范围。这样，数据库的性能就随着可用核心数量的增加而“垂直”扩展。

如果单个节点变得太小而无法容纳表数据，则可以添加更多节点以形成集群。可以将表分割（“分片”）并分布在节点之间。ClickHouse 将在所有存储表数据的节点上运行查询，从而达到随着可用节点数量的增加而“水平”扩展。

🤿 深入了解 [查询处理层](/academic_overview#4-query-processing-layer) 部分，本部分来自我们 2024 年 VLDB 论文的网页版本。

## 对细节的严格关注 {#meticulous-attention-to-detail}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/dccGLSuYWy0?si=rQ-Jp-z5Ik_-Rb8S" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

> **“ClickHouse 是一个奇怪的系统 - 你们有 20 个版本的哈希表。你们有这么多令人惊叹的东西，而大多数系统只有一个哈希表… ClickHouse 拥有这么惊人的性能，因为它有这么多专门的组件。”** [Andy Pavlo, CMU 数据库教授](https://www.youtube.com/watch?v=Vy2t_wZx4Is&t=3579s)

ClickHouse [的不同之处](https://www.youtube.com/watch?v=CAS2otEoerM) 在于对低级优化的严格关注。构建一个简单工作的数据库是一回事，但为了在各种查询类型、数据结构、分布和索引配置中提供速度而进行工程化建设，则是 “[奇怪的系统](https://youtu.be/Vy2t_wZx4Is?si=K7MyzsBBxgmGcuGU&t=3579)” 艺术的彰显。

**哈希表。** 让我们以哈希表为例。哈希表是连接和聚合中使用的核心数据结构。作为程序员，需要考虑这些设计决策：

* 选择哪个哈希函数，
* 碰撞解决方案：[开放寻址](https://en.wikipedia.org/wiki/Open_addressing)还是 [链式](https://en.wikipedia.org/wiki/Hash_table#Separate_chaining)，
* 内存布局：一个数组用于键和值还是分开存放？
* 填充因子：何时及如何调整大小？在调整大小时如何移动值？
* 删除：哈希表是否允许驱逐条目？

由第三方库提供的标准哈希表功能上可以正常工作，但速度并不快。卓越的性能需要仔细的基准测试和实验。

在 ClickHouse 中的 [哈希表实现](https://clickhouse.com/blog/hash-tables-in-clickhouse-and-zero-cost-abstractions) 根据查询和数据的具体情况选择 **30 多个预编译哈希表变体** 中的一个。

**算法。** 对于算法也是如此。例如，在排序中，可能考虑：

* 要排序的内容：数字、元组、字符串还是结构？
* 数据是否在 RAM 中？
* 排序是否需要稳定？
* 是否需要对所有数据进行排序，还是仅部分排序就足够？

依赖于数据特征的算法通常比其通用对手表现更好。如果数据特征事先未知，系统可以尝试不同的实现，并选择在运行时表现最佳的。有关示例，请参见 [关于 ClickHouse 中 LZ4 解压缩如何实现的文章](https://habr.com/en/company/yandex/blog/457612/)。

🤿 深入了解 [全面性能优化](/academic_overview#4-4-holistic-performance-optimization) 部分，本部分来自我们 2024 年 VLDB 论文的网页版本。

## VLDB 2024 论文 {#vldb-2024-paper}

在 2024 年 8 月，我们的第一篇研究论文在 VLDB 上被接受并发表。 
VLDB 是国际大型数据库会议，被广泛视为数据管理领域的领先会议之一。 在数百份提交中，VLDB 的接受率一般约为 20%。

您可以阅读论文的 [PDF](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf) 或我们的 [网页版本](/docs/academic_overview)，该版本提供了 ClickHouse 最有趣的架构和系统设计组件的简要描述，使其如此快速。

我们的首席技术官（CTO）兼 ClickHouse 的创始人 Alexey Milovidov 提出了这篇论文（幻灯片 [在这里](https://raw.githubusercontent.com/ClickHouse/clickhouse-presentations/master/2024-vldb/VLDB_2024_presentation.pdf)），之后进行了问答（很快就超时了！）。
您可以在此观看录制的演讲：

<iframe width="1024" height="576" src="https://www.youtube.com/embed/7QXKBKDOkJE?si=5uFerjqPSXQWqDkF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
