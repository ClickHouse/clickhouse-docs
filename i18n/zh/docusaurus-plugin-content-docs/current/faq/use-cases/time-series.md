---
slug: /faq/use-cases/time-series
title: '我可以将 ClickHouse 用作时间序列数据库吗？'
toc_hidden: true
toc_priority: 101
description: '介绍如何将 ClickHouse 用作时间序列数据库的页面'
doc_type: 'guide'
keywords: ['时间序列', '时间数据', '使用场景', '基于时间的分析', '时序数据']
---



# 我可以将 ClickHouse 用作时间序列数据库吗? {#can-i-use-clickhouse-as-a-time-series-database}

_注意:请参阅博客文章 [Working with Time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse) 以获取使用 ClickHouse 进行时间序列分析的更多示例。_

ClickHouse 是一个用于 [OLAP](../../faq/general/olap.md) 工作负载的通用数据存储解决方案,而市面上有许多专门的[时间序列数据库管理系统](https://clickhouse.com/engineering-resources/what-is-time-series-database)。尽管如此,ClickHouse [专注于查询执行速度](../../concepts/why-clickhouse-is-so-fast.mdx)使其在许多情况下能够超越这些专用系统。关于这个主题已有许多独立的基准测试,因此我们不会在此进行重复测试。相反,让我们关注在此类使用场景下需要使用的 ClickHouse 重要特性。

首先,有**[专用编解码器](../../sql-reference/statements/create/table.md#specialized-codecs)**可用于典型的时间序列数据。包括 `DoubleDelta` 和 `Gorilla` 等常见算法,或 ClickHouse 特有的 `T64` 算法。

其次,时间序列查询通常只访问最近的数据,例如一天或一周前的数据。使用同时配备快速 NVMe/SSD 驱动器和大容量 HDD 驱动器的服务器是合理的选择。ClickHouse [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 特性允许配置将新鲜的热数据保留在快速驱动器上,并随着数据老化逐渐将其移动到较慢的驱动器。如果您的需求要求,还可以对更旧的数据进行汇总或删除。

尽管这与 ClickHouse 存储和处理原始数据的理念相悖,但您可以使用[物化视图](../../sql-reference/statements/create/view.md)来满足更严格的延迟或成本要求。
