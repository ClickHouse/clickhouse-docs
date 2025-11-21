---
slug: /managing-data/core-concepts
title: '核心概念'
description: '了解 ClickHouse 的核心工作原理'
keywords: ['概念', 'part', '分区', '主键索引']
doc_type: 'guide'
---

在本节文档中，
您将学习 ClickHouse 工作方式的一些核心概念。

| Page                                         | Description                                                                                                                                                                                                           |
|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Table parts](./parts.md)                        | 了解 ClickHouse 中表的 part（数据片段）是什么。                                                                                                                                                                      |
| [Table partitions](./partitions.mdx)             | 了解表分区是什么，以及它们的用途。                                                                                                                                                                                    |
| [Table part merges](./merges.mdx)                | 了解表的 part 合并是什么，以及它们的用途。                                                                                                                                                                            |
| [Table shards and replicas](./shards.mdx)        | 了解表分片和副本是什么，以及它们的用途。                                                                                                                                                                              |
| [Primary indexes](./primary-indexes.mdx)         | 介绍 ClickHouse 的稀疏主键索引，以及它如何在查询执行过程中高效跳过不必要的数据。解释索引是如何构建和使用的，并提供示例和工具，帮助您观察其效果。同时提供指向深入解析的链接，涵盖高级用例和最佳实践。 |
| [Architectural Overview](./academic_overview.mdx) | 基于我们发表于 VLDB 2024 的论文，对 ClickHouse 架构的各个组件进行简明的学术性概览。                                                                                                                                    |