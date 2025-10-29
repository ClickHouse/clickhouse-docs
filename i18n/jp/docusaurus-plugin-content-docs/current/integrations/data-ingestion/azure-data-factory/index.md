---
'slug': '/integrations/azure-data-factory'
'description': 'Azure データを ClickHouse に取り込む'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
'title': 'Azure データを ClickHouse に取り込む'
'doc_type': 'guide'
---

| ページ                                                                                 | 説明                                                                                                                                                                     |
|--------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [概要](./overview.md)                                                           | AzureデータをClickHouseに取り込むために使用される2つのアプローチの概要                                                                                                        |
| [ClickHouseのazureBlobStorageテーブル関数の使用](./using_azureblobstorage.md)      | オプション1 - `azureBlobStorage`テーブル関数を使用して、Azure Blob StorageまたはAzure Data Lake StorageからClickHouseにデータをコピーする効率的で簡単な方法                      |
| [ClickHouseのHTTPインターフェースの使用](./using_http_interface.md)                | オプション2 - ClickHouseがAzureからデータを引き出すのではなく、Azure Data FactoryがそのHTTPインターフェースを使用してデータをClickHouseにプッシュします                                    |
