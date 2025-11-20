---
slug: /faq/operations/deploy-separate-storage-and-compute
title: '是否可以在 ClickHouse 中将存储和计算分离部署？'
sidebar_label: '是否可以在 ClickHouse 中将存储和计算分离部署？'
toc_hidden: true
toc_priority: 20
description: '本页面回答是否可以在 ClickHouse 中将存储和计算分离部署'
doc_type: 'guide'
keywords: ['storage', 'disk configuration', 'data organization', 'volume management', 'storage tiers']
---

简短的回答是“可以”。

对象存储（S3、GCS）可以作为 ClickHouse 表数据的弹性主存储后端。我们已经发布了 [基于 S3 的 MergeTree](/integrations/data-ingestion/s3/index.md) 和 [基于 GCS 的 MergeTree](/integrations/data-ingestion/gcs/index.md) 使用指南。在这种配置下，只有元数据存储在计算节点本地。由于新增节点仅需复制元数据，因此在该架构中可以轻松对计算资源进行伸缩。