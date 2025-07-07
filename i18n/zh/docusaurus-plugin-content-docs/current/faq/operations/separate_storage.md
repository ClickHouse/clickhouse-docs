---
'slug': '/faq/operations/deploy-separate-storage-and-compute'
'title': '将 ClickHouse 部署在单独的存储和计算上是否可能？'
'sidebar_label': '将 ClickHouse 部署在单独的存储和计算上是否可能？'
'toc_hidden': true
'toc_priority': 20
'description': '此页面提供了关于是否可以将 ClickHouse 部署在单独的存储和计算上的答案。'
---

简短的回答是“是的”。

对象存储（S3, GCS）可以作为 ClickHouse 表中数据的弹性主存储后端。已发布 [S3-backed MergeTree](/integrations/data-ingestion/s3/index.md) 和 [GCS-backed MergeTree](/integrations/data-ingestion/gcs/index.md) 指南。在这种配置中，仅将元数据存储在计算节点的本地。您可以轻松地在此设置中扩展和缩减计算资源，因为附加节点只需复制元数据。
