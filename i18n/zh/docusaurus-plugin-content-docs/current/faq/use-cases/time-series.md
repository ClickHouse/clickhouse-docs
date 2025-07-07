---
'slug': '/faq/use-cases/time-series'
'title': '我可以将 ClickHouse 用作时间序列 DATABASE 吗？'
'toc_hidden': true
'toc_priority': 101
'description': '页面描述如何将 ClickHouse 用作时间序列 DATABASE'
---


# 我可以将 ClickHouse 用作时间序列数据库吗？ {#can-i-use-clickhouse-as-a-time-series-database}

_注意：请参阅博客 [在 ClickHouse 中处理时间序列数据](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)，了解更多使用 ClickHouse 进行时间序列分析的示例。_

ClickHouse 是一个通用的数据存储解决方案，用于 [OLAP](../../faq/general/olap.md) 工作负载，而许多专门的 [时间序列数据库管理系统](https://clickhouse.com/engineering-resources/what-is-time-series-database) 也存在。尽管如此，ClickHouse 在 [查询执行速度](../../concepts/why-clickhouse-is-so-fast.md) 上的优势使其在许多情况下超越了专门系统。关于这个主题有很多独立的基准测试，所以我们在这里不打算进行测试。相反，让我们专注于 ClickHouse 中重要的功能，以便满足您的用例。

首先，有 **[专用编解码器](../../sql-reference/statements/create/table.md#specialized-codecs)**，使得典型的时间序列更高效。这些编解码器可以是常见的算法，如 `DoubleDelta` 和 `Gorilla`，或特定于 ClickHouse 的算法，如 `T64`。

其次，时间序列查询通常只涉及最近的数据，例如一天或一周之前的数据。使用同时具有快速 NVMe/SSD 驱动器和高容量 HDD 驱动器的服务器是合理的。ClickHouse 的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 特性允许配置将新鲜的热数据保留在快速驱动器上，并随着其变老逐渐移至较慢的驱动器。如果您的要求需要，甚至可以进行更老数据的汇总或移除。

尽管这与 ClickHouse 存储和处理原始数据的理念相悖，您仍然可以使用 [物化视图](../../sql-reference/statements/create/view.md) 来满足更严格的延迟或成本要求。
