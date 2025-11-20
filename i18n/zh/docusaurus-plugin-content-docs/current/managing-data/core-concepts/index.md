---
slug: /managing-data/core-concepts
title: '核心概念'
description: '了解 ClickHouse 的核心工作原理'
keywords: ['concepts', 'part', 'partition', 'primary index']
doc_type: 'guide'
---

在本节文档中，
你将学习 ClickHouse 工作原理中的一些核心概念。

| Page                                         | Description                                                                                                                                                                                                           |
|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Table parts](./parts.md)                        | 了解 ClickHouse 中表部件（parts）的概念。                                                                                                                                                                            |
| [Table partitions](./partitions.mdx)             | 了解表分区是什么以及它们的用途。                                                                                                                                                                                     |
| [Table part merges](./merges.mdx)                | 了解表部件合并是什么以及它们的用途。                                                                                                                                                                                 |
| [Table shards and replicas](./shards.mdx)        | 了解表分片和副本是什么以及它们的用途。                                                                                                                                                                               |
| [Primary indexes](./primary-indexes.mdx)         | 介绍 ClickHouse 的稀疏主键索引，以及它如何在查询执行过程中高效跳过不必要的数据。解释索引是如何构建和使用的，并提供示例和工具来观察其效果，同时链接到面向高级用例和最佳实践的深度解析。 |
| [Architectural Overview](./academic_overview.mdx) | 基于我们在 VLDB 2024 发表的科学论文，对 ClickHouse 架构的各个组件进行简明的学术性概览。                                                                                                                              |