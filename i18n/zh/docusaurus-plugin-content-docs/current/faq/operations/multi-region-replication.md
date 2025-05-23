---
'slug': '/faq/operations/multi-region-replication'
'title': 'ClickHouse 是否支持多区域复制？'
'toc_hidden': true
'toc_priority': 30
'description': '本页面回答 ClickHouse 是否支持多区域复制'
---


# Does ClickHouse support multi-region replication? {#does-clickhouse-support-multi-region-replication}

简短的回答是“是的”。然而，我们建议保持所有区域/数据中心之间的延迟在两位数范围内，否则写性能会受到影响，因为它经过分布式共识协议。例如，美国东海岸之间的复制可能会运行良好，但在美国和欧洲之间则不然。

在配置方面，与单区域复制没有区别，只需使用位于不同位置的主机作为副本。

有关更多信息，请参见 [full article on data replication](../../engines/table-engines/mergetree-family/replication.md)。
