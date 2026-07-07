---
sidebar_label: '概要'
slug: /integrations/azure-data-factory/overview
description: 'Azure のデータを ClickHouse に取り込む - 概要'
keywords: ['azure data factory', 'azure', 'microsoft', 'データ']
title: 'Azure のデータを ClickHouse に取り込む'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

<ClickHouseSupportedBadge />

Microsoft Azure には、データの保存、変換、分析のための幅広いツールが用意されています。とはいえ、多くのケースでは、巨大なデータセットに対する低レイテンシのクエリや処理において、ClickHouse のほうが大幅に優れたパフォーマンスを発揮します。さらに、ClickHouse の列指向ストレージと圧縮により、汎用的な Azure データベースと比べて、大量の分析データをクエリするコストを大きく削減できます。

このドキュメントのこのセクションでは、Microsoft Azure から ClickHouse にデータを取り込む 2 つの方法を紹介します。

| Method                                                        | Description                                                                                                                                                          |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`azureBlobStorage` テーブル関数を使用する](./using_azureblobstorage.md) | ClickHouse の [`azureBlobStorage` Table Function](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage) を使用して、Azure Blob Storage からデータを直接転送します。 |
| [ClickHouse HTTP インターフェイスを使用する](./using_http_interface.md)    | Azure Data Factory 内のデータソースとして [ClickHouse HTTP インターフェイス](https://clickhouse.com/docs/interfaces/http) を使用し、パイプラインの一部としてデータをコピーしたり、データフローアクティビティで利用したりできます。          |