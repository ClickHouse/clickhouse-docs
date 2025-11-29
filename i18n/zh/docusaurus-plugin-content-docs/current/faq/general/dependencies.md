---
title: '运行 ClickHouse 需要哪些第三方依赖？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/dependencies
description: 'ClickHouse 是自包含的系统，没有任何运行时依赖'
doc_type: 'reference'
keywords: ['依赖', '第三方']
---

# 运行 ClickHouse 需要哪些第三方依赖？ {#what-are-the-3rd-party-dependencies-for-running-clickhouse}

ClickHouse 没有任何运行时依赖。它以单个二进制可执行文件的形式发布，完全自包含。该应用程序提供集群的全部功能：处理查询、作为集群中的工作节点、作为提供 Raft 共识算法的协调系统，以及作为客户端或本地查询引擎。

这一独特的架构设计使其有别于其他系统，后者往往需要专门的前端、后端或聚合节点；而 ClickHouse 的方式使部署、集群管理和监控更加简单。

:::info
很多年前，ClickHouse 需要使用 ZooKeeper 来协调分布式集群。如今已不再需要；虽然我们仍然支持与 ZooKeeper 集成，但已经不再推荐使用。
:::