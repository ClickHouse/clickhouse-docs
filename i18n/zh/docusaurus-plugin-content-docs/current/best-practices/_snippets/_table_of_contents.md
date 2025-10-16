| 页面                                                                                   | 描述                                                                                                |
|--------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| [选择主键](/best-practices/choosing-a-primary-key)                                    | 如何选择主键以最大化查询性能并最小化存储开销。                                                       |
| [选择数据类型](/best-practices/select-data-types)                                    | 选择最佳数据类型以减少内存使用、改善压缩效果并加快查询速度。                                        |
| [使用物化视图](/best-practices/use-materialized-views)                                | 利用物化视图预聚合数据，并显著加快分析查询的速度。                                                |
| [最小化和优化JOIN](/best-practices/minimize-optimize-joins)                          | 高效使用ClickHouse的`JOIN`功能的最佳实践。                                                        |
| [选择分区键](/best-practices/choosing-a-partitioning-key)                             | 选择有效的数据修剪和更快查询执行的分区策略。                                                      |
| [选择插入策略](/best-practices/selecting-an-insert-strategy)                        | 通过适当的插入模式优化数据摄取吞吐量并减少资源消耗。                                              |
| [数据跳过索引](/best-practices/use-data-skipping-indices-where-appropriate)         | 战略性地应用次级索引以跳过不相关的数据块并加速过滤查询。                                          |
| [避免变更](/best-practices/avoid-mutations)                                         | 设计架构和工作流程以消除代价高昂的`UPDATE`/`DELETE`操作，从而提升性能。                          |
| [避免OPTIMIZE FINAL](/best-practices/avoid-optimize-final)                         | 理解何时`OPTIMIZE FINAL`会造成比帮助更多的性能瓶颈，从而避免性能问题。                           |
| [适当地使用JSON](/best-practices/use-json-where-appropriate)                        | 在处理ClickHouse中的半结构化JSON数据时，平衡灵活性和性能。                                       |
