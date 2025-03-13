---
slug: /faq/operations/multi-region-replication
title: ClickHouse 是否支持多区域复制？
toc_hidden: true
toc_priority: 30
---


# ClickHouse 是否支持多区域复制？ {#does-clickhouse-support-multi-region-replication}

简短的答案是“是”。然而，我们建议保持所有区域/数据中心之间的延迟在两位数范围内，否则写入性能会因经过分布式共识协议而受到影响。例如，位于美国东海岸之间的复制可能会正常工作，但在美国与欧洲之间则可能不行。

在配置方面，与单区域复制没有区别，只需为副本使用位于不同位置的主机即可。

有关更多信息，请参见 [数据复制的完整文章](../../engines/table-engines/mergetree-family/replication.md)。
