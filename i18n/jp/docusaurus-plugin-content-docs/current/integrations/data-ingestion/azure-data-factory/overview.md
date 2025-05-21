---
sidebar_label: '概要'
slug: /integrations/azure-data-factory/overview
description: 'AzureデータをClickHouseに取り込む - 概要'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: 'AzureデータをClickHouseに取り込む'
---


# AzureデータをClickHouseに取り込む

Microsoft Azureは、データを保存、変換、分析するための幅広いツールを提供しています。しかし、多くのシナリオにおいて、ClickHouseは低遅延のクエリや巨大なデータセットの処理に対して大幅に優れたパフォーマンスを提供することができます。さらに、ClickHouseの列指向ストレージと圧縮は、一般的なAzureデータベースと比較して、大量の分析データをクエリするコストを大幅に削減できます。

このドキュメントのセクションでは、Microsoft AzureからClickHouseにデータを取り込むための2つの方法を探ります。

| 方法                                                                      | 説明                                                                                                                                                                                                             |
|---------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [ `azureBlobStorage` テーブル関数を使用](./using_azureblobstorage.md)  | ClickHouseの[`azureBlobStorage` テーブル関数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)を使用して、Azure Blob Storageからデータを直接転送します。                                    |
| [ClickHouse HTTPインターフェースを使用](./using_http_interface.md)       | [ClickHouse HTTPインターフェース](https://clickhouse.com/docs/interfaces/http)をデータソースとしてAzure Data Factory内で使用し、パイプラインの一部としてデータをコピーしたり、データフローアクティビティで使用したりします。 |
