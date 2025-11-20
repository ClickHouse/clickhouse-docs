---
sidebar_label: '概要'
slug: /integrations/azure-data-factory/overview
description: 'Azure データを ClickHouse に取り込む - 概要'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: 'Azure データを ClickHouse に取り込む'
doc_type: 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Azure のデータを ClickHouse に取り込む

<ClickHouseSupportedBadge/>

Microsoft Azure は、データの保存、変換、分析のための幅広いツールを提供しています。しかし、多くのシナリオにおいては、大規模データセットに対する低レイテンシーなクエリや処理に関して、ClickHouse の方がはるかに優れたパフォーマンスを発揮します。さらに、ClickHouse のカラムナ型ストレージと圧縮機能により、汎用的な Azure データベースと比較して、大量の分析データをクエリする際のコストを大きく削減できます。

このドキュメントのこのセクションでは、Microsoft Azure から ClickHouse にデータを取り込む 2 つの方法を紹介します。

| Method                                                                     | Description                                                                                                                                                                                                          |
|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Using the `azureBlobStorage` Table Function](./using_azureblobstorage.md) | ClickHouse の [`azureBlobStorage` テーブル関数](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage) を使用して、Azure Blob Storage から直接データを転送する方法です。                       |
| [Using the ClickHouse HTTP interface](./using_http_interface.md)           | [ClickHouse HTTP インターフェイス](https://clickhouse.com/docs/interfaces/http) を Azure Data Factory 内のデータソースとして使用し、パイプラインの一部としてデータのコピーやデータフロー アクティビティで利用できるようにします。 |