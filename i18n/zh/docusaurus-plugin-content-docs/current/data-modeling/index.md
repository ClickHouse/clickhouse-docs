---
slug: /data-modeling/overview
title: '数据建模概览'
description: '数据建模概述'
keywords: ['data modelling', 'schema design', 'dictionary', 'materialized view', 'data compression', 'denormalizing data']
doc_type: 'landing-page'
---

# 数据建模 

本节介绍 ClickHouse 中的数据建模，涵盖以下主题：

| Page                                                            | Description                                                                                                                                                                                   |
|-----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Schema Design](/data-modeling/schema-design)                   | 讨论如何在 ClickHouse 中进行模式（schema）设计以获得最佳性能，并综合考虑查询、数据更新、延迟和数据量等因素。                                                              |
| [Dictionary](/dictionary)                                       | 讲解如何定义和使用字典（dictionary）来提升查询性能并丰富数据。                                                                                              |
| [Materialized Views](/materialized-views)                       | 介绍 ClickHouse 中的物化视图（Materialized View）和可刷新的物化视图。                                                                                                           |
| [Projections](/data-modeling/projections)| 介绍 ClickHouse 中的投影（Projection）。|
| [Data Compression](/data-compression/compression-in-clickhouse) | 讨论 ClickHouse 中的多种压缩模式，以及如何根据特定数据类型和工作负载选择合适的压缩方法，从而优化数据存储和查询性能。 |
| [Denormalizing Data](/data-modeling/denormalization)            | 讨论 ClickHouse 采用的反规范化方法，即通过将相关数据存储在同一张表中来提升查询性能。                                                  |