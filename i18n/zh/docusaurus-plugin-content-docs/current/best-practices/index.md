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
'description': 'ClickHouse最佳实践部分的登录页面'
---


# Best Practices in ClickHouse {#best-practices-in-clickhouse}

本节提供了最佳实践，您将希望遵循这些实践以充分利用 ClickHouse。

| 页面                                                                   | 描述                                                                     |
|----------------------------------------------------------------------|--------------------------------------------------------------------------|
| [选择主键](/best-practices/choosing-a-primary-key)                     | 有关在 ClickHouse 中选择有效主键的指导。                                   |
| [选择数据类型](/best-practices/select-data-types)                     | 选择适当数据类型的建议。                                                 |
| [使用物化视图](/best-practices/use-materialized-views)                 | 何时以及如何利用物化视图。                                               |
| [最小化和优化 JOIN 操作](/best-practices/minimize-optimize-joins)     | 最小化和优化 JOIN 操作的最佳实践。                                       |
| [选择分区键](/best-practices/choosing-a-partitioning-key)             | 如何有效选择和应用分区键。                                               |
| [选择插入策略](/best-practices/selecting-an-insert-strategy)         | 在 ClickHouse 中高效插入数据的策略。                                     |
| [数据跳过索引](/best-practices/use-data-skipping-indices-where-appropriate) | 何时应用数据跳过索引以获得性能提升。                                   |
| [避免变更](/best-practices/avoid-mutations)                           | 避免变更的原因以及如何在没有变更的情况下进行设计。                      |
| [避免优化最终](/best-practices/avoid-optimize-final)                 | `OPTIMIZE FINAL` 为何可能代价高昂以及如何规避它。                       |
| [在适当的地方使用 JSON](/best-practices/use-json-where-appropriate)    | 在 ClickHouse 中使用 JSON 列的注意事项。                              |
