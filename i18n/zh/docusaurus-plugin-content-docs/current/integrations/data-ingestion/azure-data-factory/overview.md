---
sidebar_label: '概览'
slug: /integrations/azure-data-factory/overview
description: '将 Azure 数据引入 ClickHouse - 概览'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: '将 Azure 数据引入 ClickHouse'
doc_type: 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 将 Azure 数据引入 ClickHouse

<ClickHouseSupportedBadge/>

Microsoft Azure 提供了丰富的工具来存储、转换和分析数据。然而，在许多场景下，ClickHouse 在低延迟查询和处理海量数据集方面能够提供显著更高的性能。此外，与通用的 Azure 数据库相比，ClickHouse 的列式存储和压缩机制在查询大规模分析型数据时可以大幅降低成本。

在本文档的这一部分，我们将介绍两种将 Microsoft Azure 中的数据导入 ClickHouse 的方式：

| Method                                                                     | Description                                                                                                                                                                                                          |
|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Using the `azureBlobStorage` Table Function](./using_azureblobstorage.md) | 使用 ClickHouse 的 [`azureBlobStorage` 表函数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)，将数据直接从 Azure Blob Storage 传输到 ClickHouse。                                      |
| [Using the ClickHouse HTTP interface](./using_http_interface.md)           | 在 Azure Data Factory 中将 [ClickHouse HTTP 接口](https://clickhouse.com/docs/interfaces/http) 用作数据源，使你能够在管道中复制数据，或在数据流活动中将其用作输入数据。                                              |