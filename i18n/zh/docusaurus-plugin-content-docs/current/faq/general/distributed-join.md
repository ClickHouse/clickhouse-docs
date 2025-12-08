---
title: 'ClickHouse 是否支持分布式 JOIN？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/distributed-join
description: 'ClickHouse 支持分布式 JOIN'
doc_type: 'reference'
keywords: ['分布式', 'JOIN']
---

# ClickHouse 是否支持分布式 JOIN？ {#does-clickhouse-support-distributed-join}

ClickHouse 在集群上支持分布式 JOIN。

当数据在集群中是共址的（例如按用户标识符进行 JOIN，而该标识符同时也是分片键）时，ClickHouse 提供了一种方式，可以在不跨网络移动数据的情况下执行 JOIN。

当数据不是共址时，ClickHouse 支持广播 JOIN，即将参与 JOIN 的部分数据分发到集群中的各个节点。

截至 2025 年，ClickHouse 尚不支持 shuffle join 算法，也就是说，不会根据 join 键在集群中通过网络对 join 两侧的数据进行重新分布。