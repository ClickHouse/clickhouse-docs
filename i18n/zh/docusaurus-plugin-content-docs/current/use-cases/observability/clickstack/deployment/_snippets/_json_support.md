## schema 选择：Map 与 JSON \{#schema-choice-map-vs-json\}

默认情况下，ClickStack 将属性存储为 `Map(LowCardinality(String), String)` 列。这是可观测性工作负载的推荐 schema。结合[分桶化 Map 序列化](/sql-reference/data-types/map#bucketed-map-serialization)以及 Map 键和值上的文本索引，它可以实现有选择的查找，而无需承担动态 JSON 子列为每个键带来的额外摄取开销。

`JSON` 类型的 schema 提供 Beta 版本，可用于评估属性键集合较小且稳定的工作负载。**不建议**将其作为默认选项。有关完整对比以及启用 JSON 支持所需的环境变量，请参见 [Map 与 JSON 类型](/use-cases/observability/clickstack/ingesting-data/schema/map-vs-json)。