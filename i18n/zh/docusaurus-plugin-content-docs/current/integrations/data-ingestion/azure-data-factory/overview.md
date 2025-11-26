---
sidebar_label: '概览'
slug: /integrations/azure-data-factory/overview
description: '将 Azure 数据导入 ClickHouse - 概览'
keywords: ['Azure Data Factory', 'Azure', 'Microsoft', '数据']
title: '将 Azure 数据导入 ClickHouse'
doc_type: 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 将 Azure 数据引入 ClickHouse

<ClickHouseSupportedBadge/>

Microsoft Azure 提供了丰富的工具，用于存储、转换和分析数据。然而，在许多场景中，ClickHouse 在低延迟查询和处理海量数据集方面可以提供显著更好的性能。此外，与通用的 Azure 数据库相比，ClickHouse 的列式存储和压缩可以大幅降低大规模分析型数据查询的成本。

在本节文档中，我们将介绍两种将 Microsoft Azure 中的数据摄取到 ClickHouse 的方式：

| 方法                                                                       | 描述                                                                                                                                                                                                                |
|----------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Using the `azureBlobStorage` Table Function](./using_azureblobstorage.md) | 通过使用 ClickHouse 的 [`azureBlobStorage` 表函数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)，将数据直接从 Azure Blob Storage 传输到 ClickHouse。                               |
| [Using the ClickHouse HTTP interface](./using_http_interface.md)           | 将 [ClickHouse HTTP interface](https://clickhouse.com/docs/interfaces/http) 作为 Azure Data Factory 中的数据源使用，以便在管道中复制数据或在数据流活动中使用。                                                     |