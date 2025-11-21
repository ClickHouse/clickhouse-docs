---
slug: /faq/operations/multi-region-replication
title: 'ClickHouse 是否支持多地域复制？'
toc_hidden: true
toc_priority: 30
description: '本页说明 ClickHouse 是否支持多地域复制'
doc_type: 'reference'
keywords: ['多地域', '复制', '地理分布式', '分布式系统', '数据同步']
---



# ClickHouse 是否支持多区域复制？ {#does-clickhouse-support-multi-region-replication}

简单来说，答案是"支持"。但是，我们建议将所有区域/数据中心之间的延迟保持在两位数毫秒范围内，否则写入性能会因分布式共识协议而受到影响。例如，美国东西海岸之间的复制通常可以正常工作，但美国和欧洲之间的复制则不行。

在配置方面，多区域复制与单区域复制没有区别，只需为副本使用位于不同地理位置的主机即可。

有关更多信息，请参阅[数据复制完整文档](../../engines/table-engines/mergetree-family/replication.md)。
