---
'slug': '/integrations/azure-data-factory'
'description': '将 Azure 数据引入 ClickHouse'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
'title': '将 Azure 数据引入 ClickHouse'
'doc_type': 'guide'
---

| 页面                                                                                 | 描述                                                                                                                                                                         |
|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [概述](./overview.md)                                                            | 概述了将 Azure 数据导入 ClickHouse 的两种方法                                                                                                                             |
| [使用 ClickHouse 的 azureBlobStorage 表函数](./using_azureblobstorage.md)          | 选项 1 - 一种高效且简单的方法，通过 `azureBlobStorage` 表函数将数据从 Azure Blob 存储或 Azure 数据湖存储复制到 ClickHouse                                                     |
| [使用 ClickHouse 的 HTTP 接口](./using_http_interface.md)                         | 选项 2 - 而不是让 ClickHouse 从 Azure 拉取数据，而是让 Azure 数据工厂通过其 HTTP 接口将数据推送到 ClickHouse                                                               |
