---
'description': 'Documentation for MergeTree Engine Family'
'sidebar_label': 'MergeTree Family'
'sidebar_position': 10
'slug': '/engines/table-engines/mergetree-family/'
'title': 'MergeTree Engine Family'
---




# MergeTree 引擎系列

来自 MergeTree 系列的表引擎是 ClickHouse 数据存储能力的核心。它们为弹性和高性能数据检索提供了大多数功能：列式存储、自定义分区、稀疏主键、二级数据跳过索引等。

基本的 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 表引擎可以被视为单节点 ClickHouse 实例的默认表引擎，因为它在广泛的使用案例中都具有多功能性和实用性。

对于生产使用，[ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) 是最佳选择，因为它为常规 MergeTree 引擎的所有功能增加了高可用性。一个额外的好处是在数据摄取时自动去重，因此，如果在插入过程中出现网络问题，软件可以安全地重试。

MergeTree 系列的所有其他引擎为某些特定用例增加了额外功能。通常，它是作为后台进行的额外数据操作实现的。

MergeTree 引擎的主要缺点是它们相对较重。因此，典型的做法是少量使用它们。如果你需要许多小表，例如用于临时数据，请考虑 [Log 引擎系列](../../../engines/table-engines/log-family/index.md)。

<!-- 此页面的目录表由以下链接自动生成 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
来自 YAML 前置字段：slug，description，title。

如果您发现错误，请编辑相关页面的 YML 前置字段。
-->
| 页面 | 描述 |
|-----|-----|
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) | 允许快速写入不断变化的对象状态，并在后台删除旧的对象状态。 |
| [Data Replication](/engines/table-engines/mergetree-family/replication) | ClickHouse 中数据复制的概述 |
| [MergeTree](/engines/table-engines/mergetree-family/mergetree) | `MergeTree` 系列的表引擎旨在处理高数据摄取速率和大数据量。 |
| [Exact and Approximate Nearest Neighbor Search](/engines/table-engines/mergetree-family/annindexes) | 精确和近似最近邻搜索的文档 |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) | 继承自 MergeTree，但在合并过程中增加了合并行的逻辑。 |
| [Custom Partitioning Key](/engines/table-engines/mergetree-family/custom-partitioning-key) | 了解如何为 MergeTree 表添加自定义分区键。 |
| [Full-text Search using Full-text Indexes](/engines/table-engines/mergetree-family/invertedindexes) | 快速在文本中查找搜索词。 |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) | SummingMergeTree 继承自 MergeTree 引擎。其关键特性是在分区合并期间自动对数值数据进行求和。 |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) | 用于将具有相同主键（或更准确地说，具有相同的 [排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的所有行替换为单行（在单个数据分区中），该行存储聚合函数状态的组合。 |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree) | 设计用于对 Graphite 数据进行稀疏和聚合/平均（汇总）。 |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) | 与 MergeTree 不同，它通过移除具有相同排序键值的重复项（`ORDER BY` 表部分，而不是 `PRIMARY KEY`）来实现。 |
