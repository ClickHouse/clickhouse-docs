---
'slug': '/faq/operations/multi-region-replication'
'title': 'Does ClickHouse support multi-region replication?'
'toc_hidden': true
'toc_priority': 30
'description': 'This page answers whether ClickHouse supports multi-region replication'
---




# ClickHouse 是否支持多区域复制？ {#does-clickhouse-support-multi-region-replication}

简短的回答是“是”。然而，我们建议保持所有区域/数据中心之间的延迟在两位数范围内，否则写入性能会受到影响，因为它要经过分布式共识协议。例如，美国两岸之间的复制可能工作良好，但美国和欧洲之间则不然。

在配置方面，与单区域复制没有区别，只需使用位于不同位置的主机作为副本。

有关更多信息，请参阅 [关于数据复制的完整文章](../../engines/table-engines/mergetree-family/replication.md)。
