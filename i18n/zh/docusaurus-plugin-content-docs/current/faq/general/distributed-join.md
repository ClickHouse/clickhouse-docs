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

当数据在集群上共置时 (例如，连接是按用户标识符执行的，而该标识符同时也是分片键) ，ClickHouse 提供了一种无需通过网络移动数据即可执行连接的方式。

当数据不是共置时，ClickHouse 支持广播连接，此时参与连接的部分数据会分发到集群中的各个节点上。

截至 2025 年，ClickHouse 不执行 shuffle 连接，这意味着连接的任一侧都不会根据连接键在集群网络中重新分布。

:::tip
有关 ClickHouse 中连接的更一般性信息，参阅 [&quot;JOIN 子句&quot;](/sql-reference/statements/select/join#supported-types-of-join) 页面。
:::