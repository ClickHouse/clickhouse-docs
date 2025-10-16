---
'slug': '/faq/operations/deploy-separate-storage-and-compute'
'title': '是否可以部署 ClickHouse 以实现存储和计算分离？'
'sidebar_label': '是否可以部署 ClickHouse 以实现存储和计算分离？'
'toc_hidden': true
'toc_priority': 20
'description': '本页面提供关于是否可以部署 ClickHouse 以实现存储和计算分离的答案'
'doc_type': 'guide'
---

简短的回答是“是的”。

对象存储 (S3, GCS) 可以作为 ClickHouse 表中数据的弹性主存储后端。我们已发布 [基于 S3 的 MergeTree](/integrations/data-ingestion/s3/index.md) 和 [基于 GCS 的 MergeTree](/integrations/data-ingestion/gcs/index.md) 指南。在此配置中，仅在计算节点上本地存储元数据。您可以轻松地在此设置中扩展和缩减计算资源，因为额外的节点仅需要复制元数据。
