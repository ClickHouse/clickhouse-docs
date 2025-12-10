---
slug: /faq/operations/multi-region-replication
title: 'ClickHouse 是否支持多区域复制？'
toc_hidden: true
toc_priority: 30
description: '本页解答 ClickHouse 是否支持多区域复制的问题'
doc_type: 'reference'
keywords: ['多区域', '复制', '地理分布式', '分布式系统', '数据同步']
---



# ClickHouse 是否支持多区域复制？ {#does-clickhouse-support-multi-region-replication}

简要回答是“支持”。不过，我们建议各区域 / 机房之间的时延保持在两位数毫秒级范围内，否则由于需要经过分布式共识协议，写入性能会受到影响。比如，美国东西海岸之间的复制通常可以正常工作，但美国和欧洲之间则不太适合。

在配置方面，与单区域复制没有区别，只需将位于不同位置的主机配置为副本即可。

更多信息，参见[关于数据复制的完整文章](../../engines/table-engines/mergetree-family/replication.md)。
