---
slug: /integrations/azure-data-factory
description: '将 Azure 数据导入 ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: '将 Azure 数据导入 ClickHouse'
doc_type: 'guide'
---

| Page                                                                              | Description                                                                                                                                                                 |
|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Overview](./overview.md)                                                         | 将 Azure 数据导入 ClickHouse 的两种方法概览                                                                                                                                |
| [Using ClickHouse's azureBlobStorage table function](./using_azureblobstorage.md) | 方案 1 —— 使用 `azureBlobStorage` 表函数，以高效且简便的方式将数据从 Azure Blob Storage 或 Azure Data Lake Storage 复制到 ClickHouse                                         |
| [Using ClickHouse's HTTP interface](./using_http_interface.md)                    | 方案 2 —— 不由 ClickHouse 从 Azure 拉取数据，而是通过其 HTTP 接口由 Azure Data Factory 将数据推送到 ClickHouse                                                              |