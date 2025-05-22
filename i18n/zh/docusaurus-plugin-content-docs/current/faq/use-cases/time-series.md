---
'slug': '/faq/use-cases/time-series'
'title': '我可以将 ClickHouse 用作时间序列 DATABASE 吗？'
'toc_hidden': true
'toc_priority': 101
'description': '页面描述了如何将 ClickHouse 用作时间序列 DATABASE'
---


# 可以将 ClickHouse 用作时间序列数据库吗？ {#can-i-use-clickhouse-as-a-time-series-database}

_注意：请查看博客 [在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)，获取有关使用 ClickHouse 进行时间序列分析的其他示例。_

ClickHouse 是一个通用的数据存储解决方案，适用于 [OLAP](../../faq/general/olap.md) 工作负载，而有许多专门的 [时间序列数据库管理系统](https://clickhouse.com/engineering-resources/what-is-time-series-database)。然而，ClickHouse 的 [查询执行速度](../../concepts/why-clickhouse-is-so-fast.md) 的重点使它在许多情况下超越了专门的系统。对此话题有许多独立的基准测试，因此我们在这里不进行基准测试。而是让我们关注 ClickHouse 中重要的特性，如果这是您的用例。

首先，有 **[专用编解码器](../../sql-reference/statements/create/table.md#specialized-codecs)**，使典型的时间序列得以实现。可以使用常见算法如 `DoubleDelta` 和 `Gorilla`，或 ClickHouse 特有的算法如 `T64`。

其次，时间序列查询通常只涉及最近的数据，比如一天或一周之前的数据。使用同时具有快速 NVMe/SSD 驱动器和高容量 HDD 驱动器的服务器是合理的。ClickHouse 的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 功能允许配置在快速驱动器上保留新鲜的热数据，并随着数据的老化逐渐将其移动到较慢的驱动器。如果您的需求要求，甚至可以对更旧的数据进行汇总或删除。

尽管这与 ClickHouse 存储和处理原始数据的理念相悖，您仍然可以使用 [物化视图](../../sql-reference/statements/create/view.md) 来满足更严格的延迟或成本要求。

## 相关内容 {#related-content}

- 博客：[在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
