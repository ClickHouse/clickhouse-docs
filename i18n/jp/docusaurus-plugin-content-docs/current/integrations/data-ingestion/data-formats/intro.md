---
slug: /integrations/data-formats
sidebar_label: '概要'
sidebar_position: 1
keywords: ['clickhouse', 'CSV', 'TSV', 'Parquet', 'clickhouse-client', 'clickhouse-local']
title: '多様なデータ形式から ClickHouse へのインポート'
description: '多様なデータ形式を ClickHouse にインポートする方法を説明するページ'
show_related_blogs: true
doc_type: 'guide'
---



# 様々なデータ形式からClickHouseへのインポート

このセクションでは、様々なファイル形式からデータをロードする方法の例を紹介します。

### [**バイナリ**](/integrations/data-ingestion/data-formats/binary.md) {#binary}

ClickHouse Native、MessagePack、Protocol Buffers、Cap'n Protoなどのバイナリ形式のエクスポートとロード。

### [**CSVとTSV**](/integrations/data-ingestion/data-formats/csv-tsv.md) {#csv-and-tsv}

カスタムヘッダーと区切り文字を使用した、TSVを含むCSVファミリーのインポートとエクスポート。

### [**JSON**](/integrations/data-ingestion/data-formats/json/intro.md) {#json}

オブジェクト形式や行区切りのNDJSONなど、様々な形式でのJSONのロードとエクスポート。

### [**Parquetデータ**](/integrations/data-ingestion/data-formats/parquet.md) {#parquet-data}

ParquetやArrowなどの一般的なApache形式の処理。

### [**SQLデータ**](/integrations/data-ingestion/data-formats/sql.md) {#sql-data}

MySQLやPostgreSQLにインポートするためのSQLダンプが必要な場合は、こちらをご覧ください。

GrafanaやTableauなどのBIツールを接続する場合は、ドキュメントの[可視化カテゴリ](../../data-visualization/index.md)を参照してください。
