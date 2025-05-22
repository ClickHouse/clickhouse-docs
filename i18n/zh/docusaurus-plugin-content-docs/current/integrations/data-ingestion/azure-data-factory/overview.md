---
'sidebar_label': '概述'
'slug': '/integrations/azure-data-factory/overview'
'description': '将Azure数据引入ClickHouse - 概述'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
'title': '将Azure数据引入ClickHouse'
---


# 将 Azure 数据引入 ClickHouse

Microsoft Azure 提供了广泛的工具来存储、转换和分析数据。然而，在许多场景中，ClickHouse 可以提供显著更好的低延迟查询和处理海量数据集的性能。此外，与通用的 Azure 数据库相比，ClickHouse 的列式存储和压缩大大降低了查询大量分析数据的成本。

在本节文档中，我们将探讨从 Microsoft Azure 向 ClickHouse 导入数据的两种方法：

| 方法                                                                     | 描述                                                                                                                                                                                                          |
|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [使用 `azureBlobStorage` 表函数](./using_azureblobstorage.md) | 涉及使用 ClickHouse 的 [`azureBlobStorage` 表函数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage) 直接从 Azure Blob 存储传输数据。                       |
| [使用 ClickHouse HTTP 接口](./using_http_interface.md)           | 使用 [ClickHouse HTTP 接口](https://clickhouse.com/docs/interfaces/http) 作为 Azure Data Factory 中的数据源，允许您在管道中复制数据或将其用于数据流活动。 |
