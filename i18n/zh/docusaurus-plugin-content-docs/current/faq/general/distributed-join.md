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

ClickHouse 在集群上支持分布式 JOIN。

当数据在集群中是共置的（例如按照用户标识符执行 JOIN，而该标识符同时也是分片键）时，ClickHouse 提供了一种方式，可以在不通过网络传输数据的情况下执行 JOIN。

当数据不是共置时，ClickHouse 支持广播 JOIN，即将被 JOIN 的部分数据分发到集群的各个节点上。

截至 2025 年，ClickHouse 尚未实现 shuffle join 算法，也就是说，它不会根据 JOIN 键在集群中通过网络对 JOIN 两侧的数据进行重新分布。