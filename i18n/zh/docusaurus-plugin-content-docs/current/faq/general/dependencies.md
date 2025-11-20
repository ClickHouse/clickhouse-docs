---
title: '运行 ClickHouse 需要哪些第三方依赖？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/dependencies
description: 'ClickHouse 是自包含的，没有任何运行时依赖'
doc_type: 'reference'
keywords: ['dependencies', '3rd-party']
---

# 运行 ClickHouse 需要哪些第三方依赖？

ClickHouse 没有任何运行时依赖。它以单个二进制应用程序的形式发布，完全自包含。该应用程序提供集群的全部功能：处理查询、在集群中作为工作节点运行、作为实现 RAFT 共识算法的协调系统，以及充当客户端或本地查询引擎。

这一独特的架构设计使其有别于其他系统。很多系统通常会有专门的前端、后端或聚合节点，而 ClickHouse 的这种设计让部署、集群管理和监控更加简单。

:::info
很多年前，ClickHouse 在分布式集群的协调上依赖 ZooKeeper。现在已经不再需要它了。虽然我们仍然支持使用 ZooKeeper，但已不再推荐。
:::