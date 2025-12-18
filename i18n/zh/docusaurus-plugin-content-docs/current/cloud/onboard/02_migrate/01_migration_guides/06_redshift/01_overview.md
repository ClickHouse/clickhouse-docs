---
sidebar_label: '概览'
slug: /migrations/redshift-overview
description: '从 Amazon Redshift 迁移到 ClickHouse'
keywords: ['Redshift']
title: 'ClickHouse Cloud 与 Amazon Redshift 对比'
doc_type: 'guide'
---

# 从 Amazon Redshift 迁移到 ClickHouse {#amazon-redshift-to-clickhouse-migration}

> 本文档对如何将数据从 Amazon Redshift 迁移到 ClickHouse 进行简介。

## 简介 {#introduction}

Amazon Redshift 是一款云数据仓库，为结构化和半结构化数据提供报表和
分析能力。它采用与 ClickHouse 类似的列式数据库原理，被设计用于在大规模
数据集上处理分析型工作负载。作为 AWS 产品组合的一部分，它通常是 AWS 用
户在满足分析型数据需求时会优先选择的默认解决方案。

尽管由于与 Amazon 生态系统的紧密集成而对现有 AWS 用户颇具吸引力，但那
些采用 Redshift 来支撑实时分析应用的用户往往会发现，就此类场景而言，他们
需要一个优化程度更高的解决方案。因此，越来越多的用户转向 ClickHouse，以
利用更出色的查询性能和数据压缩能力，将其作为替代方案，或作为与现有
Redshift 工作负载并行部署的“加速层”。

## ClickHouse 与 Redshift 对比 {#clickhouse-vs-redshift}

对于在 AWS 生态体系中投入较多的用户，当面临数据仓库需求时，Redshift 往往是一个顺理成章的选择。Redshift 在一个重要方面与 ClickHouse 不同——它的引擎是专门针对需要复杂报表和分析查询的数据仓库型工作负载进行优化的。
在所有部署模式下，下述两个限制使得将 Redshift 用于实时分析型工作负载变得困难：
* Redshift 会[为每个查询执行计划编译代码](https://docs.aws.amazon.com/redshift/latest/dg/c-query-performance.html)，这会为首次查询执行带来显著开销。当查询模式可预测且编译后的执行计划可以存储在查询缓存中时，这一开销是可以接受的。然而，这会给查询模式多变的交互式应用程序带来挑战。即使 Redshift 能够利用这一代码编译缓存，在大多数查询上 ClickHouse 仍然更快。参见 ["ClickBench"](https://benchmark.clickhouse.com/#system=+%E2%98%81w|%EF%B8%8Fr|C%20c|Rf&type=-&machine=-ca2|gl|6ax|6ale|3al&cluster_size=-&opensource=-&tuned=+n&metric=hot&queries=-)。
* Redshift [将所有队列的并发查询数限制为 50](https://docs.aws.amazon.com/redshift/latest/dg/c_workload_mngmt_classification.html)，这对于 BI 来说尚可，但不适用于高度并发的分析型应用。

相对而言，虽然 ClickHouse 同样可以用于复杂分析查询，但它主要针对实时分析型工作负载进行了优化，既可以为应用程序直接提供支撑，也可以充当数据仓库加速层。因此，Redshift 用户通常会出于下列原因，用 ClickHouse 替代或增强 Redshift：

| 优势                                | 说明                                                                                                                                                                                                                                                                                                                                                                                               |
|------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **更低的查询延迟**                 | ClickHouse 能实现更低的查询延迟，包括在高并发、持续进行流式写入的场景下，以及在查询模式多变的情况下。即使查询未命中缓存——在面向用户的交互式分析中这是不可避免的——ClickHouse 仍然可以快速完成处理。                                                                                                                                                             |
| **更高的并发查询上限**             | ClickHouse 对并发查询设置了远高于 Redshift 的上限，这对于实现实时应用体验至关重要。在自管版和云端 ClickHouse 中，你都可以按服务扩展计算资源分配，以获得应用所需的并发度。ClickHouse 中允许的查询并发级别是可配置的，其中 ClickHouse Cloud 的默认值为 1000。                                                                                         |
| **更优的数据压缩**                 | ClickHouse 提供更优的数据压缩能力，使你可以减少整体存储用量（从而降低成本），或者在相同成本下保留更多数据，并从中获取更多实时洞察。请参见下文的 “ClickHouse 与 Redshift 存储效率对比”。                                                                                                                                                                        |