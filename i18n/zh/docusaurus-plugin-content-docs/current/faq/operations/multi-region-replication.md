---
'slug': '/faq/operations/multi-region-replication'
'title': 'ClickHouse 是否支持多区域复制？'
'toc_hidden': true
'toc_priority': 30
'description': '本页面回答 ClickHouse 是否支持多区域复制'
'doc_type': 'reference'
---


# ClickHouse 是否支持多区域复制？ {#does-clickhouse-support-multi-region-replication}

简短的回答是“是的”。然而，我们建议在所有区域/数据中心之间保持两位数范围内的延迟，否则写入性能将受到影响，因为它会通过分布式共识协议进行。例如，美国海岸之间的复制可能会正常工作，但美国与欧洲之间则不会。

在配置方面，与单区域复制没有差别，只需为副本使用位于不同位置的主机即可。

有关更多信息，请参阅 [完整的数据复制文章](../../engines/table-engines/mergetree-family/replication.md)。
