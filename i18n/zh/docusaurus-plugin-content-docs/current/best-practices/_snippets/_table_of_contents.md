| Page                                                                                 | Description                                                                                             |
|--------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [选择主键](/best-practices/choosing-a-primary-key)                                   | 如何选择既能最大化查询性能又能最小化存储开销的主键。                                                   |
| [选择数据类型](/best-practices/select-data-types)                                    | 选择最优数据类型以减少内存使用、提升压缩效果并加速查询。                                               |
| [使用物化视图](/best-practices/use-materialized-views)                               | 利用物化视图预聚合数据，从而大幅加速分析型查询。                                                       |
| [最小化并优化 JOIN](/best-practices/minimize-optimize-joins)                        | 高效使用 ClickHouse `JOIN` 功能的最佳实践。                                                            |
| [选择分区键](/best-practices/choosing-a-partitioning-key)                           | 选择合适的分区策略，以实现高效数据裁剪并加快查询执行。                                                 |
| [选择写入策略](/best-practices/selecting-an-insert-strategy)                        | 通过合理的写入模式优化数据导入吞吐量并降低资源消耗。                                                   |
| [数据跳过索引](/best-practices/use-data-skipping-indices-where-appropriate)         | 有策略地应用二级索引以跳过无关数据块，加速带过滤条件的查询。                                           |
| [避免使用 Mutations](/best-practices/avoid-mutations)                               | 设计表结构和工作流以消除代价高昂的 `UPDATE`/`DELETE` 操作，从而获得更好的性能。                        |
| [避免使用 OPTIMIZE FINAL](/best-practices/avoid-optimize-final)                     | 理解在何种情况下 `OPTIMIZE FINAL` 弊大于利，从而避免性能瓶颈。                                         |
| [在合适场景下使用 JSON](/best-practices/use-json-where-appropriate)                | 在 ClickHouse 中处理半结构化 JSON 数据时，在灵活性与性能之间取得平衡。                                |