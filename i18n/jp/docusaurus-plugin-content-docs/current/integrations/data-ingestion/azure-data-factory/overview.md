---
sidebar_label: '概要'
slug: /integrations/azure-data-factory/overview
description: 'Azure のデータを ClickHouse に取り込む - 概要'
keywords: ['azure data factory', 'azure', 'microsoft', 'data']
title: 'Azure のデータを ClickHouse に取り込む'
doc_type: 'guide'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Azure のデータを ClickHouse に取り込む

<ClickHouseSupportedBadge/>

Microsoft Azure は、データの保存、変換、分析のための幅広いツールを提供しています。しかし多くのシナリオにおいて、ClickHouse は低レイテンシで巨大なデータセットをクエリおよび処理する際に、はるかに優れたパフォーマンスを発揮できます。さらに、ClickHouse のカラム型ストレージと圧縮機能により、汎用的な Azure データベースと比較して、大量の分析データをクエリするコストを大幅に削減できます。

本セクションでは、Microsoft Azure から ClickHouse にデータを取り込む 2つの方法を説明します：

| Method                                                                     | Description                                                                                                                                                                                                          |
|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Using the `azureBlobStorage` Table Function](./using_azureblobstorage.md) | ClickHouse の [`azureBlobStorage` Table Function](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage) を使用して、Azure Blob Storage から直接データを転送します。                       |
| [Using the ClickHouse HTTP interface](./using_http_interface.md)           | [ClickHouse HTTP interface](https://clickhouse.com/docs/interfaces/http) を Azure Data Factory 内のデータソースとして利用し、パイプライン内でのデータ コピーやデータ フロー アクティビティに使用できます。 |