| Page                                                                                 | Description                                                                                             |
|--------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [Choosing a Primary Key](/best-practices/choosing-a-primary-key)                     | 如何选择能够最大化查询性能并最小化存储开销的主键。                                                      |
| [Select Data Types](/best-practices/select-data-types)                               | 选择最优数据类型以减少内存占用、提升压缩率并加速查询。                                                  |
| [Use Materialized Views](/best-practices/use-materialized-views)                     | 利用物化视图对数据进行预聚合，从而显著加速分析型查询。                                                  |
| [Minimize and Optimize JOINs](/best-practices/minimize-optimize-joins)               | 高效使用 ClickHouse `JOIN` 功能的最佳实践。                                                             |
| [Choosing a Partitioning Key](/best-practices/choosing-a-partitioning-key)           | 选择能够实现高效数据剪枝并加速查询执行的分区策略和分区键。                                              |
| [Selecting an Insert Strategy](/best-practices/selecting-an-insert-strategy)         | 通过合理的写入策略优化数据摄取吞吐量并降低资源消耗。                                                    |
| [Data Skipping Indices](/best-practices/use-data-skipping-indices-where-appropriate) | 战略性地应用二级索引以跳过无关的数据块，加速带过滤条件的查询。                                          |
| [Avoid Mutations](/best-practices/avoid-mutations)                                   | 设计表结构和工作流以消除代价高昂的 `UPDATE`/`DELETE` 操作，从而获得更佳性能。                           |
| [Avoid OPTIMIZE FINAL](/best-practices/avoid-optimize-final)                         | 了解在什么情况下 `OPTIMIZE FINAL` 弊大于利，从而避免性能瓶颈。                                          |
| [Use JSON where appropriate](/best-practices/use-json-where-appropriate)             | 在 ClickHouse 中处理半结构化 JSON 数据时，在灵活性和性能之间取得平衡。                                 |