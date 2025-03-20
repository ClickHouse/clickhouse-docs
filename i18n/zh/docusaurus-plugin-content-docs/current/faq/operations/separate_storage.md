---
slug: /faq/operations/deploy-separate-storage-and-compute
title: 是否可以部署具有独立存储和计算的 ClickHouse？
sidebar_label: 是否可以部署具有独立存储和计算的 ClickHouse？
toc_hidden: true
toc_priority: 20
---

简单的答案是“是的”。

对象存储（S3，GCS）可以用作 ClickHouse 表中数据的弹性主存储后端。[基于 S3 的 MergeTree](/integrations/data-ingestion/s3/index.md) 和 [基于 GCS 的 MergeTree](/integrations/data-ingestion/gcs/index.md) 指南已发布。在这种配置中，仅在计算节点上存储元数据。您可以轻松地在此设置中扩展和缩减计算资源，因为额外节点只需要复制元数据。
