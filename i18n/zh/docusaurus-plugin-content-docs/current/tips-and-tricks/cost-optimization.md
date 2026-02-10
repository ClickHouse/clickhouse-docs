---
sidebar_position: 1
slug: /community-wisdom/cost-optimization
sidebar_label: '成本优化'
doc_type: 'guide'
keywords: [
  '成本优化',
  '存储成本', 
  '分区管理',
  '数据保留',
  '存储分析',
  '数据库优化',
  'ClickHouse 成本优化',
  '存储热点',
  'TTL 性能',
  '磁盘使用情况',
  '压缩策略',
  '保留期分析'
]
title: '实践经验 - 成本优化'
description: '来自 ClickHouse 社区 meetup 的成本优化策略，包含真实生产环境示例和经过验证的技术手段。'
---

# 成本优化：来自社区的策略 \{#cost-optimization\}

*本指南是从社区线下交流活动中整理出的经验之一。本页内容汇集了社区成员在各自具体实践和部署环境中验证有效的 ClickHouse 成本优化经验与方法。若需了解更多真实场景下的解决方案与洞见，可以[按具体问题进行浏览](./community-wisdom.md)。*

*了解 [ClickHouse Cloud 如何帮助管理运营成本](/cloud/overview)。*

## 压缩策略：生产环境中的 LZ4 与 ZSTD 对比 \{#compression-strategy\}

当 Microsoft Clarity 需要处理数百 TB 的数据时，他们发现压缩方案的选择会对成本产生巨大影响。在这种规模下，每一点存储节省都至关重要，他们面临的是一个经典的权衡：性能与存储成本之间的取舍。Microsoft Clarity 需要处理海量数据——在所有账户中，每月有 2 PB 的未压缩数据，在 8 个节点上每小时处理约 60,000 个查询，并为数百万个网站提供数十亿次页面浏览。在这一规模下，压缩策略就成为关键的成本因素。

他们最初使用 ClickHouse 默认的 [LZ4](/sql-reference/statements/create/table#lz4) 压缩，但发现通过使用 [ZSTD](/sql-reference/statements/create/table#zstd) 可以大幅降低成本。尽管 LZ4 更快，ZSTD 在略微牺牲性能的前提下提供了更好的压缩比。在对这两种方案进行测试后，他们在策略上选择优先考虑节省存储空间。结果非常显著：在大表上实现了 50% 的存储节省，而对摄取和查询性能的影响是可控的。

**关键结果：**
- 通过 ZSTD 压缩在大表上实现 50% 的存储节省
- 每月具备 2 PB 数据处理能力
- 对摄取和查询性能的影响可控
- 在数百 TB 规模上实现显著成本降低

## 基于列的保留策略 \{#column-retention\}

最强大的成本优化技术之一，来自于分析哪些列真正被使用。Microsoft Clarity 利用 ClickHouse 内置的遥测能力，实现了精细的基于列的保留策略。ClickHouse 提供了按列统计的详细存储使用指标，以及全面的查询模式信息：包括访问了哪些列、访问频率、查询时长以及整体使用统计。

这种数据驱动的方法，使团队能够在保留策略和列生命周期管理方面做出更具战略性的决策。通过分析这些遥测数据，Microsoft 能够识别存储热点——那些占用大量空间但几乎没有查询的列。对于这些低使用率的列，可以实施更为激进的保留策略，将保留时长从 30 个月缩短到仅 1 个月，或者在完全没有被查询时直接删除这些列。这种选择性保留策略在不影响用户体验的前提下降低了存储成本。

**策略要点：**

- 使用 ClickHouse 遥测分析列使用模式
- 识别高存储占用、低查询频率的列
- 实施选择性保留策略
- 持续监控查询模式，以支持数据驱动决策

**相关文档**

- [数据管理 - 列级 TTL](/observability/managing-data)

## 基于分区的数据管理 \{#partition-management\}

Microsoft Clarity 发现，分区策略会同时影响性能和运维的简便性。他们采用的做法是：按日期分区，按小时 ORDER BY。该策略带来的收益远不止提升清理效率——它实现了近乎零成本的数据清理、简化了其面向客户服务的计费计算，并满足对行级删除的 GDPR 合规要求。

**主要收益：**

- 近乎零成本的数据清理（删除分区 vs 逐行删除）
- 简化计费计算
- 通过分区裁剪提升查询性能
- 更简便的运维管理

**相关文档**

- [数据管理 - 分区](/observability/managing-data#partitions)

## 字符串到整数的转换策略 \{#string-integer-conversion\}

分析平台在处理在数百万行中反复出现的类别型数据时，经常会面临存储挑战。Microsoft 的工程团队在搜索分析数据中遇到了这一问题，并开发出一种有效的解决方案，使受影响数据集的存储量减少了 60%。

在 Microsoft 的 web 分析系统中，搜索结果会触发不同类型的答案——天气卡片、体育信息、新闻文章以及事实性回答。每个查询结果都用描述性字符串进行标记，例如 `weather_answer`、`sports_answer` 或 `factual_answer`。在处理了数十亿条搜索查询后，这些字符串值被反复存储在 ClickHouse 中，占用了大量存储空间，并且在查询时需要进行开销很大的字符串比较。

Microsoft 使用一个单独的 MySQL 数据库实现了字符串到整数的映射系统。他们不再在 ClickHouse 中存储实际的字符串，而是只存储整数 ID。当你通过 UI 运行查询并请求 `weather_answer` 的数据时，查询优化器会首先查询 MySQL 映射表以获取对应的整数 ID，然后将查询转换为使用该整数，再发送到 ClickHouse。

这种架构在保持用户体验的同时——用户在仪表板中仍然看到诸如 `weather_answer` 之类有意义的标签——让后端存储和查询可以基于高效得多的整数运行。映射系统以透明方式处理了所有转换，无需对用户界面或用户工作流做任何修改。

**主要收益：**

- 受影响数据集的存储量减少 60%
- 基于整数比较的查询性能更快
- 连接和聚合时的内存使用更少
- 大结果集的网络传输成本更低

:::note
这是专门针对 Microsoft Clarity 数据场景的示例。如果你的所有数据都在 ClickHouse 中，或者将数据迁移到 ClickHouse 没有约束，可以尝试使用 [dictionaries](/dictionary) 来替代。
:::

## 视频资源 \{#video-sources\}

- **[Microsoft Clarity and ClickHouse](https://www.youtube.com/watch?v=rUVZlquVGw0)** - Microsoft Clarity 团队
- **[ClickHouse journey in Contentsquare](https://www.youtube.com/watch?v=zvuCBAl2T0Q)** - Doron Hoffman & Guram Sigua（ContentSquare）

*这些来自社区的成本优化实践出自那些处理数百 TB 乃至 PB 级数据的公司，展示了在真实生产环境中降低 ClickHouse 运维成本的实用方法。*