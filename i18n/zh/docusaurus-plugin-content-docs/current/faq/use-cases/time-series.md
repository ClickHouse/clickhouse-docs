---
'slug': '/faq/use-cases/time-series'
'title': '我能将ClickHouse用作时间序列数据库吗？'
'toc_hidden': true
'toc_priority': 101
'description': '描述如何将ClickHouse用作时间序列数据库'
---




# 我可以将 ClickHouse 用作时间序列数据库吗？ {#can-i-use-clickhouse-as-a-time-series-database}

_注意：请参阅博客 [在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)，以获取关于使用 ClickHouse 进行时间序列分析的其他示例。_

ClickHouse 是一个通用的数据存储解决方案，适用于 [OLAP](../../faq/general/olap.md) 工作负载，而有许多专门的 [时间序列数据库管理系统](https://clickhouse.com/engineering-resources/what-is-time-series-database)。尽管如此，ClickHouse 的 [查询执行速度](../../concepts/why-clickhouse-is-so-fast.md) 专注使其在许多情况下超越专用系统。关于这个主题，存在很多独立的基准测试，因此我们不会在这里进行基准测试。相反，让我们专注于 ClickHouse 的一些重要特性，以便在您的用例中使用。

首先，有 **[专用编解码器](../../sql-reference/statements/create/table.md#specialized-codecs)**，使典型的时间序列数据得以高效存储。这包括像 `DoubleDelta` 和 `Gorilla` 这样的常见算法，或是 ClickHouse 特有的 `T64`。

其次，时间序列查询通常只涉及最近的数据，比如一天下或一周前的数据。使用同时具有快速 NVMe/SSD 驱动器和高容量 HDD 驱动器的服务器是合理的。ClickHouse 的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 功能允许配置在快速驱动器上保留新鲜的热数据，并随着其老化逐渐将其移至较慢的驱动器。如果您的要求需要，甚至可以对更老的数据进行汇总或删除。

虽然这违反了 ClickHouse 存储和处理原始数据的理念，但您可以使用 [物化视图](../../sql-reference/statements/create/view.md) 来满足更严格的延迟或成本要求。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
