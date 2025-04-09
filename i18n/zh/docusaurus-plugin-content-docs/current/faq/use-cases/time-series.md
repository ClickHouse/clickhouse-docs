---
slug: /faq/use-cases/time-series
title: 我可以将 ClickHouse 用作时间序列数据库吗？
toc_hidden: true
toc_priority: 101
---

# 我可以将 ClickHouse 用作时间序列数据库吗？ {#can-i-use-clickhouse-as-a-time-series-database}

_注意：请参见博客 [Working with Time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)，获得有关使用 ClickHouse 进行时间序列分析的更多示例。_

ClickHouse 是一个通用的数据存储解决方案，适用于 [OLAP](../../faq/general/olap.md) 工作负载，尽管有许多专门的 [时间序列数据库管理系统](https://clickhouse.com/engineering-resources/what-is-time-series-database)。尽管如此，ClickHouse 在 [查询执行速度](../../concepts/why-clickhouse-is-so-fast.md) 上的重点使其在许多情况下优于专门系统。关于这个主题有许多独立的基准测试，所以我们在这里不进行基准测试。相反，让我们关注 ClickHouse 的一些特性，这些特性在您使用时是重要的。

首先，有 **[专用编解码器](../../sql-reference/statements/create/table.md#specialized-codecs)** 可以优化典型时间序列数据。行为是常用的算法，如 `DoubleDelta` 和 `Gorilla`，或特定于 ClickHouse 的算法，如 `T64`。

其次，时间序列查询通常仅涉及最近的数据，比如一天或一周前的数据。使用同时具有快速 NVMe/SSD 驱动和高容量 HDD 驱动的服务器是有意义的。ClickHouse 的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 功能允许在快速驱动上配置保留新鲜的热数据，并随着数据的老化逐渐将其移至较慢的驱动。如果您的需求要求，甚至可以回收或删除更早期的数据。

尽管这与 ClickHouse 存储和处理原始数据的哲学相悖，您仍然可以使用 [物化视图](../../sql-reference/statements/create/view.md) 来满足更严格的延迟或成本要求。

## 相关内容 {#related-content}

- 博客: [Working with time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
