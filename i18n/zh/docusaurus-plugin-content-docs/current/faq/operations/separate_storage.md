---
'slug': '/faq/operations/deploy-separate-storage-and-compute'
'title': '是否可以将 ClickHouse 部署为独立存储和计算？'
'sidebar_label': '是否可以将 ClickHouse 部署为独立存储和计算？'
'toc_hidden': true
'toc_priority': 20
'description': '本页面提供了有关是否可以将 ClickHouse 部署为独立存储和计算的答案。'
---

简短的回答是“是”。

对象存储（S3，GCS）可以作为 ClickHouse 表中数据的弹性主存储后端。[S3-backed MergeTree](/integrations/data-ingestion/s3/index.md) 和 [GCS-backed MergeTree](/integrations/data-ingestion/gcs/index.md) 指南已发布。在这种配置下，仅在计算节点上本地存储元数据。您可以轻松地在此设置中扩展和缩减计算资源，因为额外的节点只需复制元数据。
