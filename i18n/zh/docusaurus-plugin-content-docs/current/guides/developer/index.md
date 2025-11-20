---
slug: /guides/developer/overview
sidebar_label: '高级指南概览'
description: '高级指南概览'
title: '高级指南'
keywords: ['ClickHouse 高级指南', '开发者指南', '查询优化', '物化视图', '去重', '时间序列', '查询执行']
doc_type: 'guide'
---

# 高级指南

本节包含以下高级指南：

| Guide                                                                                                                  | Description                                                                                                                                                                                                                                                                                                                                    |
|------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Alternative Query Languages](../developer/alternative-query-languages)                                         | 介绍受支持的其他查询方言及其用法的指南，并为每种方言提供查询示例。                                                                                                                                                                                                                                   |
| [Cascading Materialized Views](../developer/cascading-materialized-views)                                       | 介绍如何创建物化视图并将其级联，从而将多个源表合并到一个目标表中的指南。包含一个使用级联物化视图按月和按年聚合一组域名数据的示例。                                                                              |
| [Debugging memory issues](../developer/debugging-memory-issues)                                                 | 介绍如何在 ClickHouse 中调试内存问题的指南。                                                                                                                                                                                                                                                                                       |
| [Deduplicating Inserts on Retries](../developer/deduplicating-inserts-on-retries)                               | 介绍在可能需要重试失败插入时如何处理相关情况的指南。                                                                                                                                                                                                                                                                      |
| [Deduplication strategies](../developer/deduplication)                                                          | 深入讲解数据去重这一用于从数据库中移除重复行的技术的指南。解释其与 OLTP 系统中基于主键的去重方式的差异、ClickHouse 的去重方法，以及如何在 ClickHouse 查询中处理重复数据场景。                                          |
| [Filling gaps in time-series data](../developer/time-series-filling-gaps)                                       | 介绍 ClickHouse 在处理时序数据方面能力的指南，包括用于填补数据缺口、以创建更完整、更连续时序信息表示的技术。                                                                                                                |
| [Manage Data with TTL (Time-to-live)](../developer/ttl)                                                         | 介绍如何使用 `WITH FILL` 子句填补时序数据中的缺口的指南。内容包括如何用 0 值填补缺口、如何指定填补缺口的起始点、如何填补到特定结束点，以及如何为累积计算进行插值。                                                     |
| [Stored procedures & query parameters](../developer/stored-procedures-and-prepared-statements)                  | 说明 ClickHouse 不支持传统存储过程并给出推荐替代方案的指南，包括用户自定义函数（UDF）、参数化视图、物化视图以及外部编排。同时还介绍用于安全参数化查询（类似预处理语句）的查询参数。            |
| [Understanding query execution with the Analyzer](../developer/understanding-query-execution-with-the-analyzer) | 通过介绍 analyzer 工具来剖析 ClickHouse 查询执行过程的指南。说明 analyzer 如何将查询分解为一系列步骤，从而使你能够可视化并排查整个执行过程，以获得最佳性能。                                                                               |
| [Using JOINs in ClickHouse](../joining-tables)                                                                  | 讲解如何在 ClickHouse 中进行表关联的指南。内容涵盖不同类型的关联（`INNER`、`LEFT`、`RIGHT` 等），探讨高效 JOIN 的最佳实践（例如将较小的表放在右侧），并介绍 ClickHouse 内部 JOIN 算法的工作方式，帮助你针对复杂数据关系优化查询。 |