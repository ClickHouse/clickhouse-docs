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

当数据在集群中是共置的（例如按用户标识符执行 JOIN，且该标识符也是分片键）时，ClickHouse 提供了一种无需在网络上传输数据即可执行 JOIN 的方式。

当数据不是共置的时，ClickHouse 支持广播 JOIN，此时被 JOIN 的部分数据会分发到集群中的各个节点。

截至 2025 年，ClickHouse 尚未实现 shuffle-join 算法，这意味着不会根据 join 键在集群中通过网络对 join 两侧的数据进行重新分布。