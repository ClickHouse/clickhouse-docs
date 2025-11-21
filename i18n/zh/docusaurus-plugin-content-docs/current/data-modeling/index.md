---
slug: /data-modeling/overview
title: '数据建模概览'
description: '数据建模概览'
keywords: ['数据建模', '模式设计', '字典', '物化视图', '数据压缩', '数据反规范化']
doc_type: 'landing-page'
---

# 数据建模 

本节介绍 ClickHouse 中的数据建模，包含以下主题：

| 页面                                                            | 描述                                                                                                                                                                                   |
|-----------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Schema Design](/data-modeling/schema-design)                   | 讨论 ClickHouse 的模式（schema）设计以获得最佳性能，并综合考虑查询、数据更新、延迟和数据量等因素。                                                              |
| [Dictionary](/dictionary)                                       | 说明如何定义和使用字典，以提升查询性能并丰富数据。                                                                                              |
| [Materialized Views](/materialized-views)                       | 介绍 ClickHouse 中的物化视图和可刷新物化视图。                                                                                                           |
| [Projections](/data-modeling/projections)                       | 介绍 ClickHouse 中的投影（Projections）。                                                                                                          |
| [Data Compression](/data-compression/compression-in-clickhouse) | 讨论 ClickHouse 中的多种压缩模式，以及如何根据特定数据类型和工作负载选择合适的压缩方式，以优化数据存储和查询性能。 |
| [Denormalizing Data](/data-modeling/denormalization)            | 讨论 ClickHouse 采用的反规范化方法，其目标是通过将相关数据存储在同一张表中来提升查询性能。                                                  |