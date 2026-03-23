---
title: 'ClickHouse 是否支持分布式 JOIN？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/distributed-join
description: 'ClickHouse 支持分布式 JOIN'
doc_type: 'reference'
keywords: ['分布式', 'JOIN']
---

# ClickHouse 是否支持分布式连接？ \{#does-clickhouse-support-distributed-joins\}

是的，ClickHouse 支持在集群上进行分布式连接。

当数据在集群中是共置的 (例如，连接是按用户标识符执行的，而该标识符同时也是分片键) 时，ClickHouse 提供了一种无需通过网络移动数据即可执行连接的方式。

当数据不是共置的时，ClickHouse 允许使用广播连接，此时参与连接的部分数据会分发到集群中的各个节点。

截至 2025 年，ClickHouse 还不执行 shuffle-join 算法，这意味着不会根据连接键在整个集群中通过网络对连接两侧的数据进行重新分布。

有关 ClickHouse 中连接的更多一般性信息，请参阅 [&quot;JOIN clause&quot;](/sql-reference/statements/select/join#supported-types-of-join) 页面。