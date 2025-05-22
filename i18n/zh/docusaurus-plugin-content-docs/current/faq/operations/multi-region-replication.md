---
'slug': '/faq/operations/multi-region-replication'
'title': 'ClickHouse 是否支持多区域复制？'
'toc_hidden': true
'toc_priority': 30
'description': '本页面解答 ClickHouse 是否支持多区域复制'
---


# ClickHouse 是否支持多区域复制？ {#does-clickhouse-support-multi-region-replication}

简短的回答是“是”。然而，我们建议在所有区域/数据中心之间保持两位数的延迟，否则写入性能将受到影响，因为它需要通过分布式共识协议进行处理。例如，美国两岸之间的复制可能会正常工作，但美国和欧洲之间的复制就不会。

在配置方面，与单区域复制没有区别，只需使用位于不同位置的主机作为副本。

有关更多信息，请参见 [有关数据复制的完整文章](../../engines/table-engines/mergetree-family/replication.md)。
