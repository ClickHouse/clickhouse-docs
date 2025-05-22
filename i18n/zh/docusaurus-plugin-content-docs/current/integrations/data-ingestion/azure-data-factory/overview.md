---
'sidebar_label': '概览'
'slug': '/integrations/azure-data-factory/overview'
'description': '将 Azure 数据导入 ClickHouse - 概览'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
'title': '将 Azure 数据导入 ClickHouse'
---


# 将 Azure 数据导入 ClickHouse

Microsoft Azure 提供了广泛的工具来存储、转换和分析数据。 然而，在许多场景中，ClickHouse 可以为低延迟查询和处理巨大数据集提供显著更好的性能。此外，与通用 Azure 数据库相比，ClickHouse 的列式存储和压缩可以大大降低查询大量分析数据的成本。

在本节文档中，我们将探讨两种将数据从 Microsoft Azure 导入 ClickHouse 的方法：

| 方法                                                                     | 描述                                                                                                                                                                                                          |
|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [使用 `azureBlobStorage` 表函数](./using_azureblobstorage.md) | 涉及使用 ClickHouse 的 [`azureBlobStorage` 表函数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage) 直接从 Azure Blob 存储传输数据。                       |
| [使用 ClickHouse HTTP 接口](./using_http_interface.md)           | 使用 [ClickHouse HTTP 接口](https://clickhouse.com/docs/interfaces/http) 作为 Azure 数据工厂中的数据源，允许您在数据流活动中复制数据或将其用作管道的一部分。 |
