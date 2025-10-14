---
'sidebar_label': '概述'
'slug': '/integrations/azure-data-factory/overview'
'description': '将 Azure 数据引入 ClickHouse - 概述'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
'title': '将 Azure 数据引入 ClickHouse'
'doc_type': 'guide'
---


# 将 Azure 数据引入 ClickHouse

Microsoft Azure 提供了一系列工具来存储、转换和分析数据。然而，在许多场景中，ClickHouse 可以提供显著更好的低延迟查询和处理大规模数据集的性能。此外，ClickHouse 的列式存储和压缩可以大大降低与通用 Azure 数据库相比查询大量分析数据的成本。

在本节文档中，我们将探讨将 Microsoft Azure 中的数据引入 ClickHouse 的两种方法：

| 方法                                                                       | 描述                                                                                                                                                                                              |
|----------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [使用 `azureBlobStorage` 表函数](./using_azureblobstorage.md)          | 涉及使用 ClickHouse 的 [`azureBlobStorage` 表函数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage) 直接从 Azure Blob 存储传输数据。                                |
| [使用 ClickHouse HTTP 接口](./using_http_interface.md)                   | 在 Azure 数据工厂中将 [ClickHouse HTTP 接口](https://clickhouse.com/docs/interfaces/http) 用作数据源，允许您复制数据或在数据流活动中使用它，作为管道的一部分。                          |
