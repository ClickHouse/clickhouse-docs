---
'slug': '/best-practices'
'keywords':
- 'Cloud'
- 'Primary key'
- 'Ordering key'
- 'Materialized Views'
- 'Best Practices'
- 'Bulk Inserts'
- 'Asynchronous Inserts'
- 'Avoid Mutations'
- 'Avoid Nullable Columns'
- 'Avoid Optimize Final'
- 'Partitioning Key'
'title': '概述'
'hide_title': true
'description': 'ClickHouse中最佳实践部分的入口页面'
---




# 在 ClickHouse 中的最佳实践 {#best-practices-in-clickhouse}

本节提供您希望遵循的最佳实践，以充分利用 ClickHouse。

| 页面                                                                  | 描述                                                                   |
|----------------------------------------------------------------------|-------------------------------------------------------------------------|
| [选择主键](/best-practices/choosing-a-primary-key)                  | 有关在 ClickHouse 中选择有效主键的指导。                                |
| [选择数据类型](/best-practices/select-data-types)                   | 选择适当数据类型的建议。                                                |
| [使用物化视图](/best-practices/use-materialized-views)               | 何时以及如何利用物化视图。                                             |
| [最小化和优化 JOINs](/best-practices/minimize-optimize-joins)      | 最小化和优化 JOIN 操作的最佳实践。                                     |
| [选择分区键](/best-practices/choosing-a-partitioning-key)           | 如何有效选择和应用分区键。                                            |
| [选择插入策略](/best-practices/selecting-an-insert-strategy)       | 在 ClickHouse 中高效数据插入的策略。                                   |
| [数据跳过索引](/best-practices/use-data-skipping-indices-where-appropriate) | 何时应用数据跳过索引以获得性能提升。                                  |
| [避免突变](/best-practices/avoid-mutations)                          | 避免突变的原因以及如何在设计中避免它们。                               |
| [避免 OPTIMIZE FINAL](/best-practices/avoid-optimize-final)         | 为什么 `OPTIMIZE FINAL` 可能代价高昂，以及如何规避它。                |
| [在适当场合使用 JSON](/best-practices/use-json-where-appropriate)     | 使用 ClickHouse 中 JSON 列的考虑事项。                               |
