---
slug: /data-modeling/overview
title: '数据建模概述'
description: '数据建模概述'
keywords: ['数据建模', '架构设计', '字典', '物化视图', '数据压缩', '反规范化']
doc_type: 'landing-page'
---

# 数据建模

本节介绍 ClickHouse 中的数据建模，包含以下主题：

| 页面                                                            | 描述                                                                                                                                                                                   |
|-----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Schema 设计](/data-modeling/schema-design)                   | 讨论如何设计 ClickHouse Schema 以获得最佳性能，需要考虑查询模式、数据更新、延迟和数据量等因素。                                                              |
| [字典](/dictionary)                                       | 介绍如何定义和使用字典来提升查询性能并丰富数据。                                                                                              |
| [物化视图](/materialized-views)                       | 介绍 ClickHouse 中的物化视图和可刷新物化视图。                                                                                                           |
| [投影](/data-modeling/projections)| 介绍 ClickHouse 中的投影功能。|
| [数据压缩](/data-compression/compression-in-clickhouse) | 讨论 ClickHouse 中的各种压缩模式，以及如何针对特定的数据类型和工作负载选择合适的压缩方法，从而优化数据存储和查询性能。 |
| [数据反规范化](/data-modeling/denormalization)            | 讨论 ClickHouse 中采用的反规范化方法，该方法通过将相关数据存储在单张表中来提升查询性能。                                                  |