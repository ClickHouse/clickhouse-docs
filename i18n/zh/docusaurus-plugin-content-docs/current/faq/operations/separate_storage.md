---
'slug': '/faq/operations/deploy-separate-storage-and-compute'
'title': '是否可以部署具有单独的存储和计算的ClickHouse?'
'sidebar_label': '是否可以部署具有单独的存储和计算的ClickHouse?'
'toc_hidden': true
'toc_priority': 20
'description': '本页面提供了关于是否可以部署具有单独的存储和计算的ClickHouse的答案'
---



简短的回答是“是的”。

对象存储（S3，GCS）可以作为 ClickHouse 表中数据的弹性主存储后端。已发布 [S3-backed MergeTree](/integrations/data-ingestion/s3/index.md) 和 [GCS-backed MergeTree](/integrations/data-ingestion/gcs/index.md) 指南。在这种配置中，仅在计算节点上本地存储元数据。您可以轻松地在此设置中上下调整计算资源，因为额外的节点只需要复制元数据。
