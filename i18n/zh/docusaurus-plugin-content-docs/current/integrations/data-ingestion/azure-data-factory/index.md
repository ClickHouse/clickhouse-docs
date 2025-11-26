---
slug: /integrations/azure-data-factory
description: '将 Azure 数据引入 ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: '将 Azure 数据引入 ClickHouse'
doc_type: 'guide'
---

| Page                                                                              | Description                                                                                                                                                                 |
|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Overview](./overview.md)                                                         | 用于将 Azure 数据引入 ClickHouse 的两种方法概览                                                                                                                             |
| [Using ClickHouse's azureBlobStorage table function](./using_azureblobstorage.md) | 选项 1 —— 使用 `azureBlobStorage` 表函数，以一种高效且简便的方式将数据从 Azure Blob Storage 或 Azure Data Lake Storage 复制到 ClickHouse                                     |
| [Using ClickHouse's HTTP interface](./using_http_interface.md)                    | 选项 2 —— 不再由 ClickHouse 从 Azure 拉取数据，而是由 Azure Data Factory 通过其 HTTP 接口将数据推送到 ClickHouse                                                             |