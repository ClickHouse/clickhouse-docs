---
slug: /integrations/azure-data-factory
description: 'Azure のデータを ClickHouse に取り込む'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: 'Azure のデータを ClickHouse に取り込む'
doc_type: 'guide'
---

| Page                                                                              | Description                                                                                                                                                                 |
|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Overview](./overview.md)                                                         | Azure のデータを ClickHouse に取り込むために使用される 2 つのアプローチの概要                                                                                               |
| [Using ClickHouse's azureBlobStorage table function](./using_azureblobstorage.md) | オプション 1 - `azureBlobStorage` テーブル関数を使用して、Azure Blob Storage または Azure Data Lake Storage から ClickHouse へデータをコピーする、効率的でシンプルな方法 |
| [Using ClickHouse's HTTP interface](./using_http_interface.md)                    | オプション 2 - ClickHouse が Azure からデータを取得する代わりに、Azure Data Factory が HTTP インターフェースを使用して ClickHouse にデータを送信する方法                   |