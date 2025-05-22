---
'slug': '/cloud/bestpractices'
'keywords':
- 'Cloud'
- 'Best Practices'
- 'Bulk Inserts'
- 'Asynchronous Inserts'
- 'Avoid Mutations'
- 'Avoid Nullable Columns'
- 'Avoid Optimize Final'
- 'Low Cardinality Partitioning Key'
- 'Multi Tenancy'
- 'Usage Limits'
'title': '概述'
'hide_title': true
'description': 'ClickHouse Cloud最佳实践部分的登录页面'
---


# 在 ClickHouse Cloud 中的最佳实践 {#best-practices-in-clickhouse-cloud}

本节提供了您想要遵循的最佳实践，以充分利用 ClickHouse Cloud。

| 页面                                                     | 描述                                                                |
|----------------------------------------------------------|----------------------------------------------------------------------------|
| [使用限制](/cloud/bestpractices/usage-limits)| 探索 ClickHouse 的限制。                                          |
| [多租户](/cloud/bestpractices/multi-tenancy)| 了解实现多租户的不同策略。                                          |

这些是适用于所有 ClickHouse 部署的标准最佳实践的补充。

| 页面                                                                 | 描述                                                              |
|----------------------------------------------------------------------|--------------------------------------------------------------------------|
| [选择主键](/best-practices/choosing-a-primary-key)     | 关于在 ClickHouse 中选择有效主键的指导。            |
| [选择数据类型](/best-practices/select-data-types)               | 选择适当数据类型的建议。                     |
| [使用物化视图](/best-practices/use-materialized-views)     | 何时以及如何利用物化视图。                         |
| [最小化和优化 JOIN 操作](/best-practices/minimize-optimize-joins)| 最小化和优化 JOIN 操作的最佳实践。            |
| [选择分区键](/best-practices/choosing-a-partitioning-key) | 如何有效选择和应用分区键。              |
| [选择插入策略](/best-practices/selecting-an-insert-strategy) | 在 ClickHouse 中实现高效数据插入的策略。             |
| [数据跳过索引](/best-practices/use-data-skipping-indices-where-appropriate) | 何时应用数据跳过索引以获得性能提升。    |
| [避免变更](/best-practices/avoid-mutations)                   | 避免变更的原因以及如何设计而不使用变更。               |
| [避免 OPTIMIZE FINAL](/best-practices/avoid-optimize-final)         | 为什么 `OPTIMIZE FINAL` 可能代价高昂以及如何规避。           |
| [在适当情况下使用 JSON](/best-practices/use-json-where-appropriate) | 在 ClickHouse 中使用 JSON 列的注意事项。               |
