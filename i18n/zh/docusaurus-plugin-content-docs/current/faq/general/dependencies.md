---
title: '运行 ClickHouse 需要哪些第三方依赖？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/dependencies
description: 'ClickHouse 是自包含的，无需任何运行时依赖'
doc_type: 'reference'
keywords: ['依赖项', '第三方']
---

# 运行 ClickHouse 所需的第三方依赖有哪些？

ClickHouse 没有任何运行时第三方依赖。它以单一的二进制可执行文件形式发布，完全自包含。该应用程序提供集群的全部功能：负责处理查询，在集群中充当工作节点，作为提供 RAFT 共识算法的协调系统，同时也可以作为客户端或本地查询引擎。

这一独特的架构设计使它有别于其他系统。其他系统通常会有专门的前端、后端或聚合节点，而 ClickHouse 的这种方式则简化了部署、集群管理和监控。

:::info
很多年前，ClickHouse 在分布式集群协调方面曾经依赖 ZooKeeper。现在已经不再需要它了。虽然我们仍然支持使用 ZooKeeper，但已经不再推荐这样做。
:::