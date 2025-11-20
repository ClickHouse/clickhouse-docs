---
sidebar_position: 1
slug: /community-wisdom/cost-optimization
sidebar_label: '成本优化'
doc_type: 'guide'
keywords: [
  'cost optimization',
  'storage costs', 
  'partition management',
  'data retention',
  'storage analysis',
  'database optimization',
  'clickhouse cost reduction',
  'storage hot spots',
  'ttl performance',
  'disk usage',
  'compression strategies',
  'retention analysis'
]
title: '实践经验 - 成本优化'
description: '来自 ClickHouse 社区线下交流活动的成本优化策略，涵盖真实生产案例和经过验证的技术实践。'
---



# 成本优化:来自社区的策略 {#cost-optimization}

_本指南是社区聚会经验总结系列的一部分。本页内容汇集了社区在使用 ClickHouse 时优化成本的实践智慧,这些方法在各自的具体场景和配置中均取得了良好效果。如需了解更多实际解决方案和见解,您可以[按具体问题浏览](./community-wisdom.md)。_

_了解 [ClickHouse Cloud 如何帮助管理运营成本](/cloud/overview)。_


## 压缩策略:生产环境中的 LZ4 与 ZSTD 对比 {#compression-strategy}

当 Microsoft Clarity 需要处理数百 TB 的数据时,他们发现压缩方案的选择对成本有着巨大影响。在他们的规模下,每一点存储空间的节省都至关重要,他们面临着一个经典的权衡:性能与存储成本。Microsoft Clarity 处理着海量数据——所有账户每月产生 2 PB 的未压缩数据,在 8 个节点上每小时处理约 60,000 次查询,为数百万个网站的数十亿次页面浏览提供服务。在这种规模下,压缩策略成为关键的成本因素。

他们最初使用 ClickHouse 的默认 [LZ4](/sql-reference/statements/create/table#lz4) 压缩,但发现使用 [ZSTD](/sql-reference/statements/create/table#zstd) 可以实现显著的成本节省。虽然 LZ4 速度更快,但 ZSTD 以略微降低性能为代价提供了更好的压缩率。在测试了两种方案后,他们做出了优先考虑存储节省的战略决策。结果非常显著:大表节省了 50% 的存储空间,同时对数据写入和查询的性能影响在可控范围内。

**关键成果:**

- 通过 ZSTD 压缩在大表上节省 50% 的存储空间
- 每月 2 PB 的数据处理能力
- 对数据写入和查询的性能影响在可控范围内
- 在数百 TB 规模下实现显著的成本降低


## 基于列的保留策略 {#column-retention}

分析实际使用的列是最有效的成本优化技术之一。Microsoft Clarity 利用 ClickHouse 的内置遥测功能实现了精细的基于列的保留策略。ClickHouse 提供了按列统计的详细存储使用指标以及全面的查询模式分析:包括访问了哪些列、访问频率、查询持续时间和整体使用统计信息。

这种数据驱动的方法使得制定保留策略和列生命周期管理的战略决策成为可能。通过分析这些遥测数据,Microsoft 可以识别存储热点——即那些占用大量空间但查询量极少的列。对于这些低使用率的列,可以实施激进的保留策略,将存储时间从 30 个月缩短至仅 1 个月,或者在完全没有查询的情况下直接删除这些列。这种选择性保留策略在不影响用户体验的前提下有效降低了存储成本。

**策略:**

- 使用 ClickHouse 遥测分析列使用模式
- 识别高存储、低查询的列
- 实施选择性保留策略
- 监控查询模式以做出数据驱动的决策

**相关文档**

- [数据管理 - 列级 TTL](/observability/managing-data)


## 基于分区的数据管理 {#partition-management}

Microsoft Clarity 发现分区策略会同时影响性能和运维简便性。他们采用的方法是:按日期分区,按小时排序。这一策略带来的优势不仅限于清理效率——它实现了轻量级的数据清理、简化了面向客户服务的计费计算,并满足了 GDPR 合规中基于行删除的要求。

**主要优势:**

- 轻量级数据清理(删除分区 vs 逐行删除)
- 简化计费计算
- 通过分区裁剪提升查询性能
- 更便捷的运维管理

**相关文档**

- [数据管理 - 分区](/observability/managing-data#partitions)


## 字符串到整数转换策略 {#string-integer-conversion}

分析平台在处理分类数据时经常面临存储挑战,这些数据会在数百万行中重复出现。Microsoft 工程团队在其搜索分析数据中遇到了这个问题,并开发了一个有效的解决方案,使受影响的数据集存储空间减少了 60%。

在 Microsoft 的网络分析系统中,搜索结果会触发不同类型的答案——天气卡片、体育信息、新闻文章和事实性回答。每个查询结果都使用描述性字符串进行标记,例如 "weather_answer"、"sports_answer" 或 "factual_answer"。在处理数十亿次搜索查询的过程中,这些字符串值在 ClickHouse 中被重复存储,不仅消耗了大量存储空间,而且在查询时还需要进行开销较大的字符串比较操作。

Microsoft 使用独立的 MySQL 数据库实现了字符串到整数的映射系统。他们不在 ClickHouse 中存储实际的字符串,而是只存储整数 ID。当用户通过 UI 运行查询并请求 `weather_answer` 的数据时,查询优化器首先查询 MySQL 映射表以获取相应的整数 ID,然后将查询转换为使用该整数,最后再发送到 ClickHouse。

这种架构保留了用户体验——用户仍然可以在仪表板中看到像 `weather_answer` 这样有意义的标签——而后端存储和查询则使用效率更高的整数进行操作。映射系统透明地处理所有转换,无需更改用户界面或用户工作流程。

**主要优势:**

- 受影响数据集的存储空间减少 60%
- 整数比较的查询性能更快
- 连接和聚合操作的内存使用量减少
- 大型结果集的网络传输成本降低

:::note
这是专门用于 Microsoft Clarity 数据场景的示例。如果您的所有数据都在 ClickHouse 中,或者将数据迁移到 ClickHouse 没有限制,请尝试使用[字典](/dictionary)。
:::


## 视频资源 {#video-sources}

- **[Microsoft Clarity 与 ClickHouse](https://www.youtube.com/watch?v=rUVZlquVGw0)** - Microsoft Clarity 团队
- **[Contentsquare 的 ClickHouse 之旅](https://www.youtube.com/watch?v=zvuCBAl2T0Q)** - Doron Hoffman & Guram Sigua (ContentSquare)

_这些来自社区的成本优化经验来自处理数百 TB 至 PB 级数据的企业,展示了降低 ClickHouse 运营成本的实际应用方法。_
