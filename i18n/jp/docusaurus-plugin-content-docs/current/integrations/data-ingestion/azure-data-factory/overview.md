---
'sidebar_label': '概要'
'slug': '/integrations/azure-data-factory/overview'
'description': 'Azure データを ClickHouse に取り込む - 概要'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
'title': 'Bringing Azure Data into ClickHouse'
---




# AzureデータをClickHouseに取り込む

Microsoft Azureは、データを保存、変換、分析するための広範なツールを提供しています。しかし、多くのシナリオにおいて、ClickHouseは低遅延のクエリ処理と巨大なデータセットの処理においてはるかに優れたパフォーマンスを提供できます。さらに、ClickHouseの列指向ストレージと圧縮は、一般的なAzureデータベースと比較して、大量の分析データをクエリするコストを大幅に削減できます。

このセクションでは、Microsoft AzureからClickHouseにデータを取り込む2つの方法を探ります。

| 方法                                                                       | 説明                                                                                                                                                                        |
|----------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`azureBlobStorage`テーブル関数を使用](./using_azureblobstorage.md)        | ClickHouseの[`azureBlobStorage`テーブル関数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)を使用して、Azure Blob Storageから直接データを転送します。                                              |
| [ClickHouse HTTPインターフェースを使用](./using_http_interface.md)        | [ClickHouse HTTPインターフェース](https://clickhouse.com/docs/interfaces/http)をAzure Data Factory内のデータソースとして利用し、データをコピーしたり、パイプラインの一部としてデータフローアクティビティで使用します。            |
