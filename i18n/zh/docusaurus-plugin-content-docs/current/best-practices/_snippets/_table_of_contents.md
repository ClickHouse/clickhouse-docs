| Page                                                                                 | Description                                                                                             |
|--------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [Choosing a Primary Key](/best-practices/choosing-a-primary-key)                     | 如何选择主键以最大化查询性能并最小化存储开销。                                                            |
| [Select Data Types](/best-practices/select-data-types)                               | 选择最优数据类型以降低内存占用、提升压缩效果，并加速查询。                                                |
| [Use Materialized Views](/best-practices/use-materialized-views)                     | 利用物化视图对数据进行预聚合，从而显著提升分析查询的执行速度。                                           |
| [Minimize and Optimize JOINs](/best-practices/minimize-optimize-joins)               | 高效使用 ClickHouse `JOIN` 功能的最佳实践。                                                              |
| [Choosing a Partitioning Key](/best-practices/choosing-a-partitioning-key)           | 选择能够实现高效数据裁剪并加快查询执行的分区策略。                                                       |
| [Selecting an Insert Strategy](/best-practices/selecting-an-insert-strategy)         | 通过合理的插入策略优化数据写入吞吐量并降低资源消耗。                                                     |
| [Data Skipping Indices](/best-practices/use-data-skipping-indices-where-appropriate) | 合理应用数据跳过索引以跳过无关数据块，加速带过滤条件的查询。                                             |
| [Avoid Mutations](/best-practices/avoid-mutations)                                   | 设计模式和工作流以避免代价高昂的 `UPDATE`/`DELETE` 操作，从而获得更好的性能。                            |
| [Avoid OPTIMIZE FINAL](/best-practices/avoid-optimize-final)                         | 通过理解在何种情况下 `OPTIMIZE FINAL` 弊大于利，来避免性能瓶颈。                                         |
| [Use JSON where appropriate](/best-practices/use-json-where-appropriate)             | 在 ClickHouse 中处理半结构化 JSON 数据时，在灵活性与性能之间取得平衡。                                   |