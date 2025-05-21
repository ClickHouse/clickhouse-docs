---
'slug': '/data-modeling/overview'
'title': '数据建模概述'
'description': '数据建模概述'
'keywords':
- 'data modelling'
- 'schema design'
- 'dictionary'
- 'materialized view'
- 'data compression'
- 'denormalizing data'
---




# 数据建模 

此部分关于 ClickHouse 的数据建模，并包含以下主题：

| 页面                                                              | 描述                                                                                                                                                                                            |
|-------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [模式设计](/data-modeling/schema-design)                             | 讨论 ClickHouse 中的模式设计，以实现最佳性能，考虑查询、数据更新、延迟和数据量等因素。                                                                                                         |
| [字典](/dictionary)                                               | 解释如何定义和使用字典以改善查询性能和丰富数据。                                                                                                                                                      |
| [物化视图](/materialized-views)                                     | 有关 ClickHouse 中物化视图和可刷新的物化视图的信息。                                                                                                                                                   |
| [投影](/data-modeling/projections)| 有关 ClickHouse 中投影的信息。|
| [数据压缩](/data-compression/compression-in-clickhouse)             | 讨论 ClickHouse 中的各种压缩模式，以及如何通过选择适合您特定数据类型和工作负载的压缩方法来优化数据存储和查询性能。                                            |
| [非规范化数据](/data-modeling/denormalization)                    | 讨论 ClickHouse 中使用的非规范化方法，旨在通过将相关数据存储在一个表中来提高查询性能。                                                                                                           |
