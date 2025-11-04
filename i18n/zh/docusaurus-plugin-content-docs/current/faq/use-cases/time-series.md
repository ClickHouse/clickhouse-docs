---
'slug': '/faq/use-cases/time-series'
'title': '我可以将 ClickHouse 用作时间序列 DATABASE 吗？'
'toc_hidden': true
'toc_priority': 101
'description': '页面描述如何将 ClickHouse 用作时间序列 DATABASE'
'doc_type': 'guide'
---


# Can I use ClickHouse as a time-series database? {#can-i-use-clickhouse-as-a-time-series-database}

_Note: 请参见博客 [在ClickHouse中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)，了解使用ClickHouse进行时间序列分析的更多示例。_

ClickHouse是一个通用的数据存储解决方案，适用于[OLAP](../../faq/general/olap.md)工作负载，尽管还有许多专业化的[时间序列数据库管理系统](https://clickhouse.com/engineering-resources/what-is-time-series-database)。然而，ClickHouse对[查询执行速度的关注](../../concepts/why-clickhouse-is-so-fast.mdx)使其在许多情况下超越了专业系统。关于这个主题有许多独立的基准测试，因此我们在这里不进行测试。相反，让我们关注对于你的用例来说，使用ClickHouse的重要特性。

首先，有**[专业编解码器](../../sql-reference/statements/create/table.md#specialized-codecs)**，使典型的时间序列数据更具优势。包括常见的算法，如`DoubleDelta`和`Gorilla`，以及特定于ClickHouse的`T64`。

其次，时间序列查询通常只涉及最近的数据，例如一天或一周前的数据。使用同时拥有快速的NVMe/SSD驱动器和大容量HDD驱动器的服务器是合理的。ClickHouse的[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)特性允许配置将新鲜的热数据保存在快速驱动器上，并随着时间的推移逐渐将其移动到较慢的驱动器上。如果你的要求需要，甚至可以进行更旧数据的汇总或删除。

尽管这违背了ClickHouse存储和处理原始数据的理念，但你可以使用[物化视图](../../sql-reference/statements/create/view.md)来满足更严格的延迟或成本要求。
