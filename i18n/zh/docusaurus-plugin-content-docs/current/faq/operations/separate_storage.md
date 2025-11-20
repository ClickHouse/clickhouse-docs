---
slug: /faq/operations/deploy-separate-storage-and-compute
title: '是否可以以存储与计算分离的方式部署 ClickHouse？'
sidebar_label: '是否可以以存储与计算分离的方式部署 ClickHouse？'
toc_hidden: true
toc_priority: 20
description: '本页说明是否可以以存储与计算分离的方式部署 ClickHouse'
doc_type: 'guide'
keywords: ['storage', 'disk configuration', 'data organization', 'volume management', 'storage tiers']
---

简短回答是“可以”。

对象存储（S3、GCS）可以作为 ClickHouse 表数据的弹性主存储后端。我们已提供 [基于 S3 的 MergeTree](/integrations/data-ingestion/s3/index.md) 和 [基于 GCS 的 MergeTree](/integrations/data-ingestion/gcs/index.md) 指南。在这种配置中，本地计算节点上只存储元数据。你可以在此架构中轻松扩缩容计算资源，因为新增节点只需复制元数据即可。