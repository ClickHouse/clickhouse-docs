---
'slug': '/faq/use-cases/time-series'
'title': '我可以将 ClickHouse 用作时间序列数据库吗？'
'toc_hidden': true
'toc_priority': 101
'description': '页面描述如何将 ClickHouse 用作时间序列数据库'
---


# Can I Use ClickHouse As a Time-Series Database? {#can-i-use-clickhouse-as-a-time-series-database}

_注意：请查看博客 [在 ClickHouse 中使用时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse) 以获取更多使用 ClickHouse 进行时间序列分析的示例。_

ClickHouse 是一个通用的数据存储解决方案，适用于 [OLAP](../../faq/general/olap.md) 工作负载，而许多专门的 [时间序列数据库管理系统](https://clickhouse.com/engineering-resources/what-is-time-series-database) 也存在。然而，ClickHouse 对于查询执行速度的 [关注](../../concepts/why-clickhouse-is-so-fast.md) 使其在许多情况下超越了专门系统。关于这个主题，有许多独立的基准测试可供参考，因此我们在这里不打算进行基准测试。相反，让我们关注 ClickHouse 中重要的特性，以便满足你的使用案例。

首先，有 **[专用编解码器](../../sql-reference/statements/create/table.md#specialized-codecs)** 使典型的时间序列数据得以处理。这些可能是常见的算法，如 `DoubleDelta` 和 `Gorilla`，或特定于 ClickHouse 的算法，如 `T64`。

其次，时间序列查询通常只涉及最近的数据，比如一到两天或一周以前的数据。使用既拥有快速 NVMe/SSD 硬盘又具有高容量 HDD 硬盘的服务器是合理的。ClickHouse 的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 特性允许配置在快速硬盘上保留新鲜的热数据，并随着时间的推移逐渐将其移至较慢的硬盘。如果你的要求需要，甚至可以进行更旧数据的汇总或删除。

尽管这与 ClickHouse 存储和处理原始数据的理念相悖，但你可以使用 [物化视图](../../sql-reference/statements/create/view.md) 以适应更严格的延迟或成本要求。

## Related Content {#related-content}

- 博客: [在 ClickHouse 中使用时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
