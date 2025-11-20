---
slug: /integrations/azure-data-factory
description: 'Azure データを ClickHouse に取り込む'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: 'Azure データを ClickHouse に取り込む'
doc_type: 'guide'
---

| Page                                                                              | Description                                                                                                                                                                 |
|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Overview](./overview.md)                                                         | Azure データを ClickHouse に取り込むために使用される 2 つのアプローチの概要                                                                                                 |
| [Using ClickHouse's azureBlobStorage table function](./using_azureblobstorage.md) | オプション 1 - `azureBlobStorage` テーブル関数を使用して、Azure Blob Storage または Azure Data Lake Storage から ClickHouse にデータをコピーする、効率的でシンプルな方法 |
| [Using ClickHouse's HTTP interface](./using_http_interface.md)                    | オプション 2 - ClickHouse 側で Azure からデータを取得するのではなく、Azure Data Factory が HTTP インターフェイスを使用して ClickHouse にデータをプッシュする方法          |