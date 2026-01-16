---
slug: /faq/use-cases/time-series
title: '我可以将 ClickHouse 用作时序数据库吗？'
toc_hidden: true
toc_priority: 101
description: '本页介绍如何将 ClickHouse 用作时序数据库'
doc_type: 'guide'
keywords: ['time series', '时间序列', 'temporal data', '时序数据', 'use case', '用例', 'time-based analytics', '基于时间的分析', 'timeseries', '时序']
---



# 我可以将 ClickHouse 用作时序数据库吗？ \\{#can-i-use-clickhouse-as-a-time-series-database\\}

_注意：有关在 ClickHouse 中处理时序数据的更多示例，请参阅博客 [Working with Time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)。_

ClickHouse 是一个面向 [OLAP](../../faq/general/olap.md) 工作负载的通用数据存储解决方案，同时也存在许多专门的[时序数据库管理系统](https://clickhouse.com/engineering-resources/what-is-time-series-database)。尽管如此，ClickHouse 对[查询执行速度的专注](../../concepts/why-clickhouse-is-so-fast.mdx)使其在许多场景下能够优于这些专门系统。关于这一主题已有许多独立的基准测试，因此我们在这里就不再复现。相反，我们将重点介绍在此类用例下应当利用的 ClickHouse 功能。

首先，有一些**[专用编解码器](../../sql-reference/statements/create/table.md#specialized-codecs)**，可用于典型的时序数据压缩。它们要么是诸如 `DoubleDelta` 和 `Gorilla` 之类的通用算法，要么是 ClickHouse 特有的 `T64`。

其次，时序查询通常只会命中最新的数据，比如一天或一周内的数据。因此，使用同时配备快速 NVMe/SSD 盘和大容量 HDD 的服务器是合理的。ClickHouse 的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 功能允许你配置将最新的热点数据保存在快速磁盘上，并随着时间推移逐步将其迁移到较慢的磁盘。如果你的需求需要，也可以对更早的数据进行汇总（rollup）或删除。

即使这有悖于 ClickHouse 一贯倡导的存储和处理原始数据的理念，你仍然可以使用[物化视图](../../sql-reference/statements/create/view.md)，以满足更加苛刻的延迟或成本要求。
