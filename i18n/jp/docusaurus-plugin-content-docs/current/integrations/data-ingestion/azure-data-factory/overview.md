---
'sidebar_label': '概要'
'slug': '/integrations/azure-data-factory/overview'
'description': 'Azure データを ClickHouse に取り込む - 概要'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
'title': 'Azure データを ClickHouse に取り込む'
'doc_type': 'guide'
---


# Azure データを ClickHouse に取り込む

Microsoft Azure は、データを保存、変換、分析するための幅広いツールを提供しています。しかし、多くのシナリオにおいて、ClickHouse は巨大なデータセットの低遅延クエリ処理に対して、著しく優れたパフォーマンスを提供できます。さらに、ClickHouse の列指向ストレージと圧縮は、汎用の Azure データベースと比較して、大量の分析データをクエリする際のコストを大幅に削減できます。

このドキュメントのセクションでは、Microsoft Azure から ClickHouse にデータを取り込む2つの方法を探索します。

| 方法                                                                                     | 説明                                                                                                                                                                                                                 |
|------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`azureBlobStorage` テーブル関数を使用する](./using_azureblobstorage.md)               | ClickHouse の [`azureBlobStorage` テーブル関数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage) を使用して、Azure Blob Storage からデータを直接転送することを含みます。                          |
| [ClickHouse HTTP インターフェースを使用する](./using_http_interface.md)                | [ClickHouse HTTP インターフェース](https://clickhouse.com/docs/interfaces/http) を Azure Data Factory 内でデータソースとして使用し、データをコピーしたり、パイプラインの一部としてデータフローアクティビティで使用できるようにします。 |
