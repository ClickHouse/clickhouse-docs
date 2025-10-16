---
'sidebar_position': 1
'slug': '/community-wisdom/cost-optimization'
'sidebar_label': '成本优化'
'doc_type': 'guide'
'keywords':
- 'cost optimization'
- 'storage costs'
- 'partition management'
- 'data retention'
- 'storage analysis'
- 'database optimization'
- 'clickhouse cost reduction'
- 'storage hot spots'
- 'ttl performance'
- 'disk usage'
- 'compression strategies'
- 'retention analysis'
'title': '课程 - 成本优化'
'description': '来自 ClickHouse 社区会议的成本优化策略，包含真实的生产实例和经过验证的技术。'
---


# 成本优化：来自社区的策略 {#cost-optimization}
*本指南是从社区聚会中获得的发现集合的一部分。本页面上的发现涵盖了与使用 ClickHouse 时优化成本相关的社区智慧，这些智慧在他们特定的经验和设置中效果良好。有关更多实际解决方案和见解，您可以 [按特定问题浏览](./community-wisdom.md)。*

*了解 [ClickHouse Cloud 如何帮助管理运营成本](/cloud/overview)。*

## 压缩策略：生产中的 LZ4 与 ZSTD {#compression-strategy}

当 Microsoft Clarity 需要处理数百 TB 的数据时，他们发现压缩选择对成本产生了显著影响。在他们的规模上，每一点存储节省都是重要的，他们面临着经典的权衡：性能与存储成本之间的平衡。Microsoft Clarity 每月处理两 PB 的未压缩数据，跨所有账户处理约 60,000 次查询，覆盖八个节点，并为数百万个网站提供数十亿次页面浏览。在这种规模下，压缩策略成为一个关键的成本因素。

他们最初使用 ClickHouse 默认的 [LZ4](/sql-reference/statements/create/table#lz4) 压缩，但发现使用 [ZSTD](/sql-reference/statements/create/table#zstd) 可以实现显著的成本节省。虽然 LZ4 更快，但 ZSTD 在提供更好压缩的同时性能略慢。在测试两种方法后，他们做出了优先考虑存储节省的战略决策。结果显著：使用 ZSTD 压缩在大表上储存节省达 50%，对数据摄取和查询的性能影响可控。

**关键结果：**
- 通过 ZSTD 压缩实现大表 50% 的存储节省
- 每月 2 PB 的数据处理能力
- 对数据摄取和查询的性能影响可控
- 在数百 TB 规模上显著降低成本

## 基于列的保留策略 {#column-retention}

最强大的成本优化技术之一来自于分析哪些列实际上被使用。Microsoft Clarity 实施了利用 ClickHouse 内置遥测功能的复杂基于列的保留策略。ClickHouse 提供了按列的详细存储使用指标，以及全面的查询模式：哪些列被访问、访问频率、查询持续时间和整体使用统计。

这种数据驱动的方法使得关于保留政策和列生命周期管理的战略决策成为可能。通过分析这些遥测数据，微软可以识别数据存储热点——消耗大量空间但查询很少的列。对于这些低使用率的列，他们可以实施严格的保留策略，将存储时间从 30 个月减少到仅一个月，或者完全删除这些列（如果根本没有被查询）。这种选择性保留策略降低了存储成本，同时不影响用户体验。

**策略：**
- 使用 ClickHouse 遥测分析列的使用模式
- 识别高存储、低查询的列
- 实施选择性保留政策
- 监控查询模式以做出数据驱动的决策

**相关文档**
- [管理数据 - 列级 TTL](/observability/managing-data)

## 基于分区的数据管理 {#partition-management}

Microsoft Clarity 发现分区策略对性能和操作简化都有影响。他们的做法是：按日期分区，按小时排序。这一策略不仅使清理效率得到提高，还带来多个额外好处——它简化了客户服务的计费计算，并支持针对行的删除的 GDPR 合规要求。

**主要好处：**
- 简单的数据清理（删除分区 vs 行逐一删除）
- 简化的计费计算
- 通过分区消除实现更好的查询性能
- 更简单的操作管理

**相关文档**
- [管理数据 - 分区](/observability/managing-data#partitions)

## 字符串到整数转换策略 {#string-integer-conversion}

分析平台常常面临一个存储挑战，即在数百万行中反复出现的分类数据。微软的工程团队在他们的搜索分析数据中遇到了这个问题，并开发出一种有效的解决方案，在受影响的数据集中实现了 60% 的存储减少。

在微软的网络分析系统中，搜索结果会触发不同类型的回答——天气卡、体育信息、新闻文章和事实回应。每个查询结果都用诸如 "weather_answer"、"sports_answer" 或 "factual_answer" 的描述性字符串进行标记。在处理数十亿次搜索查询的过程中，这些字符串在 ClickHouse 中被重复存储，占用了大量存储空间，并在查询期间要求进行昂贵的字符串比较。

微软实现了一个字符串到整数的映射系统，使用一个单独的 MySQL 数据库。它们不在 ClickHouse 中存储实际的字符串，而只存储整数 ID。当用户通过 UI 运行查询并请求 `weather_answer` 的数据时，他们的查询优化器首先查询 MySQL 映射表以获取相应的整数 ID，然后在发送给 ClickHouse 之前将查询转换为使用该整数。

这种架构保留了用户体验——用户在仪表板中仍然看到有意义的标签，如 `weather_answer`——而后端存储和查询则在更高效的整数上运行。映射系统透明地处理所有翻译，无需对用户界面或用户工作流程进行任何更改。

**主要好处：**
- 受影响的数据集存储减少 60%
- 整数比较的查询性能更快
- 连接和聚合所需的内存使用减少
- 大结果集的网络传输成本降低

:::note
这是一个专门用于 Microsoft Clarity 数据场景的示例。如果您将所有数据存储在 ClickHouse 中，或者没有将数据移动到 ClickHouse 的限制，请尝试使用 [字典](/dictionary) 。
:::

## 视频来源 {#video-sources}

- **[Microsoft Clarity 和 ClickHouse](https://www.youtube.com/watch?v=rUVZlquVGw0)** - Microsoft Clarity 团队
- **[Contentsquare 中的 ClickHouse 旅程](https://www.youtube.com/watch?v=zvuCBAl2T0Q)** - Doron Hoffman & Guram Sigua (ContentSquare)

*这些社区成本优化见解展示了处理数百 TB 到 PB 数据的公司的策略，显示了减少 ClickHouse 运营成本的现实世界方法。*
