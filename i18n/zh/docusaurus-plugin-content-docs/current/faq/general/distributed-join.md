---
title: 'ClickHouse 是否支持分布式 JOIN？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/distributed-join
description: 'ClickHouse 支持分布式 JOIN'
doc_type: 'reference'
keywords: ['distributed', 'join']
---

# ClickHouse 是否支持分布式 JOIN？

ClickHouse 在集群上支持分布式 `JOIN`。

当数据在集群中是共址的（例如，`JOIN` 按用户标识符执行，而该标识符同时也是分片键）时，ClickHouse 提供了一种方式，可以在无需通过网络移动数据的情况下执行 `JOIN`。

当数据不是共址时，ClickHouse 支持广播 `JOIN`，即将参与连接的部分数据分发到集群各个节点上。

截至 2025 年，ClickHouse 尚未实现 shuffle-join 算法，这意味着不会根据连接键在集群内通过网络对连接两侧的数据进行重新分布。