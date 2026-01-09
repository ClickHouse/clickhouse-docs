---
sidebar_label: '概要'
slug: /integrations/azure-data-factory/overview
description: 'Azure のデータを ClickHouse に取り込む ― 概要'
keywords: ['Azure Data Factory', 'Azure', 'Microsoft', 'データ']
title: 'Azure のデータを ClickHouse に取り込む'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Azure データを ClickHouse に取り込む {#bringing-azure-data-into-clickhouse}

<ClickHouseSupportedBadge />

Microsoft Azure には、データを保存・変換・分析するための幅広いツールが用意されています。しかし、多くのシナリオにおいて、ClickHouse は巨大なデータセットに対する低レイテンシーなクエリや処理で、はるかに優れたパフォーマンスを提供できます。さらに、ClickHouse の列指向ストレージと圧縮機能により、汎用的な Azure のデータベース サービスと比較して、大量の分析データをクエリするコストを大幅に削減できます。

このドキュメントの本セクションでは、Microsoft Azure から ClickHouse にデータを取り込む 2 つの方法を説明します。

| 方法                                                                       | 説明                                                                                                                                                                                                                 |
|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [azureBlobStorage テーブル関数を使用](./using_azureblobstorage.md)        | ClickHouse の [`azureBlobStorage` テーブル関数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage) を使用して、Azure Blob Storage からデータを直接転送します。                         |
| [ClickHouse HTTP interface を使用](./using_http_interface.md)             | Azure Data Factory 内で [ClickHouse HTTP interface](https://clickhouse.com/docs/interfaces/http) をデータ ソースとして使用し、パイプラインの一部としてデータをコピーしたり、データ フロー アクティビティで利用できるようにします。 |