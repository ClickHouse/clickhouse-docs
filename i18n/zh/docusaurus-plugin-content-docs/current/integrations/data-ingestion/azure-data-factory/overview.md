---
sidebar_label: '概述'
slug: /integrations/azure-data-factory/overview
description: '将 Azure 数据导入 ClickHouse - 概述'
keywords: ['azure data factory', 'azure', 'microsoft', '数据']
title: '将 Azure 数据导入 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

<ClickHouseSupportedBadge />

Microsoft Azure 提供了丰富的工具来存储、转换和分析数据。然而，在许多场景下，ClickHouse 在对海量数据集进行低延迟查询和处理时，性能会显著更优。此外，相较于通用型 Azure 数据库，ClickHouse 的列式存储和压缩能力能够大幅降低大规模分析数据的查询成本。

在本节文档中，我们将介绍两种将数据从 Microsoft Azure 摄取到 ClickHouse 的方式：

| Method                                                                     | Description                                                                                                                                            |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Using the `azureBlobStorage` Table Function](./using_azureblobstorage.md) | 使用 ClickHouse 的 [`azureBlobStorage` Table Function](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)，直接从 Azure Blob 存储传输数据。 |
| [Using the ClickHouse HTTP interface](./using_http_interface.md)           | 将 [ClickHouse HTTP interface](https://clickhouse.com/docs/interfaces/http) 作为 Azure Data Factory 中的一个数据源，以便复制数据，或在数据流活动中将其用作管道的一部分。                    |