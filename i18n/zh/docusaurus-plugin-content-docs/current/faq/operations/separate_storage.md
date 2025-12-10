---
slug: /faq/operations/deploy-separate-storage-and-compute
title: '是否可以在存储和计算分离的情况下部署 ClickHouse？'
sidebar_label: '是否可以在存储和计算分离的情况下部署 ClickHouse？'
toc_hidden: true
toc_priority: 20
description: '本页解答是否可以在存储和计算分离的情况下部署 ClickHouse'
doc_type: 'guide'
keywords: ['存储', '磁盘配置', '数据组织', '卷管理', '存储层级']
---

简要回答是“可以”。

对象存储（S3、GCS）可以作为 ClickHouse 表数据的弹性主存储后端。我们已经发布了 [基于 S3 的 MergeTree](/integrations/data-ingestion/s3/index.md) 和 [基于 GCS 的 MergeTree](/integrations/data-ingestion/gcs/index.md) 指南。在此配置中，只有元数据存储在计算节点本地。由于新增节点只需要复制元数据，因此在这种架构下可以轻松对计算资源进行扩容和缩减。