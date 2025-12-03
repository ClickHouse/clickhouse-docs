---
slug: /integrations/data-formats
sidebar_label: '概要'
sidebar_position: 1
keywords: ['clickhouse', 'CSV', 'TSV', 'Parquet', 'clickhouse-client', 'clickhouse-local']
title: 'さまざまなデータ形式から ClickHouse へデータをインポート'
description: 'さまざまなデータ形式を ClickHouse にインポートする方法を説明するページ'
show_related_blogs: true
doc_type: 'guide'
---



# 様々なデータ形式から ClickHouse へインポートする {#importing-from-various-data-formats-to-clickhouse}

本セクションでは、様々なファイル形式からデータを読み込む例を確認できます。

### [**Binary**](/integrations/data-ingestion/data-formats/binary.md) {#binary}

ClickHouse Native、MessagePack、Protocol Buffers、Cap'n Proto などのバイナリ形式をエクスポートおよび読み込みます。

### [**CSV and TSV**](/integrations/data-ingestion/data-formats/csv-tsv.md) {#csv-and-tsv}

TSV を含む CSV ファミリーを、カスタムヘッダーや区切り文字を指定してインポートおよびエクスポートします。

### [**JSON**](/integrations/data-ingestion/data-formats/json/intro.md) {#json}

オブジェクト形式や行区切りの NDJSON など、様々な形式の JSON を読み込みおよびエクスポートします。

### [**Parquet data**](/integrations/data-ingestion/data-formats/parquet.md) {#parquet-data}

Parquet や Arrow などの一般的な Apache 形式を扱います。

### [**SQL data**](/integrations/data-ingestion/data-formats/sql.md) {#sql-data}

MySQL や PostgreSQL にインポートするための SQL ダンプが必要ですか？ こちらを参照してください。

Grafana や Tableau などの BI ツールと接続したい場合は、ドキュメントの [Visualize カテゴリ](../../data-visualization/index.md) を参照してください。
