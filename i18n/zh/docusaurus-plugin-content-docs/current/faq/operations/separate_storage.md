---
slug: /faq/operations/deploy-separate-storage-and-compute
title: '是否可以以存储与计算分离的方式部署 ClickHouse？'
sidebar_label: '是否可以以存储与计算分离的方式部署 ClickHouse？'
toc_hidden: true
toc_priority: 20
description: '本页说明是否可以以存储与计算分离的方式部署 ClickHouse'
doc_type: 'guide'
keywords: ['存储', '磁盘配置', '数据组织', '卷管理', '存储层级']
---

简而言之，答案是“可以”。

对象存储（S3、GCS）可以作为 ClickHouse 表数据的弹性主存储后端。我们已经发布了 [基于 S3 的 MergeTree](/integrations/data-ingestion/s3/index.md) 和 [基于 GCS 的 MergeTree](/integrations/data-ingestion/gcs/index.md) 指南。在这种配置下，计算节点本地只存储元数据。您可以在该架构下轻松扩缩计算资源，因为新增节点只需要复制元数据即可。