---
slug: /integrations/azure-data-factory
description: '将 Azure 数据导入 ClickHouse'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: '将 Azure 数据导入 ClickHouse'
doc_type: 'guide'
---

| Page                                                                              | Description                                                                                                                                                                 |
|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Overview](./overview.md)                                                         | 将 Azure 数据导入 ClickHouse 的两种方法概览                                                                                                                                  |
| [Using ClickHouse's azureBlobStorage table function](./using_azureblobstorage.md) | 选项 1——使用 `azureBlobStorage` 表函数，以高效且直接的方式将 Azure Blob Storage 或 Azure Data Lake Storage 中的数据复制到 ClickHouse 中                                      |
| [Using ClickHouse's HTTP interface](./using_http_interface.md)                    | 选项 2——让 Azure Data Factory 使用 ClickHouse 的 HTTP 接口将数据推送到 ClickHouse，而不是由 ClickHouse 从 Azure 中拉取数据                                                   |