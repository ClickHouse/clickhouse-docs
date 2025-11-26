---
slug: /managing-data/core-concepts
title: '核心概念'
description: '了解 ClickHouse 的核心工作原理和概念'
keywords: ['概念', 'part', '分区', '主键索引']
doc_type: 'guide'
---

在本节文档中，
你将学习 ClickHouse 工作方式的一些核心概念。

| Page                                         | Description                                                                                                                                                                                                           |
|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Table parts](./parts.md)                        | 了解 ClickHouse 中的表 part 是什么。                                                                                                                                                                                  |
| [Table partitions](./partitions.mdx)             | 了解表分区是什么，以及它们的用途。                                                                                                                                                                                    |
| [Table part merges](./merges.mdx)                | 了解表 part 合并是什么，以及它们的用途。                                                                                                                                                                              |
| [Table shards and replicas](./shards.mdx)        | 了解表分片和副本是什么，以及它们的用途。                                                                                                                                                                              |
| [Primary indexes](./primary-indexes.mdx)         | 介绍 ClickHouse 的稀疏主键索引，以及它如何在查询执行过程中高效跳过不必要的数据。解释索引是如何构建和使用的，并给出示例和工具，用于观测其效果。同时链接到针对高级用例和最佳实践的深入解析。 |
| [Architectural Overview](./academic_overview.mdx) | 基于我们在 VLDB 2024 发表的学术论文，对 ClickHouse 架构的所有组件进行简明的学术性概览。                                                                                                                               |