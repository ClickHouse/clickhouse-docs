---
sidebar_label: 'SQL ダンプ'
slug: /integrations/data-formats/sql
title: 'ClickHouse での SQL データの挿入とダンプ'
description: 'SQL ダンプを使用して、他のデータベースと ClickHouse の間でデータを転送する方法を説明するページ。'
doc_type: 'guide'
keywords: ['sql format', 'data export', 'data import', 'backup', 'sql dumps']
---



# ClickHouse への SQL データの挿入とダンプ

ClickHouse は、さまざまな方法で OLTP データベース基盤に容易に統合することができます。その方法の 1 つとして、SQL ダンプを使用して他のデータベースと ClickHouse の間でデータを転送できます。



## SQLダンプの作成 {#creating-sql-dumps}

データは[SQLInsert](/interfaces/formats/SQLInsert)を使用してSQL形式でダンプできます。ClickHouseは`INSERT INTO <table name> VALUES(...`の形式でデータを書き込み、テーブル名として[`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name)設定オプションを使用します:

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

[`output_format_sql_insert_include_column_names`](/operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names)オプションを無効にすることで、カラム名を省略できます:

```sql
SET output_format_sql_insert_include_column_names = 0
```

これで[dump.sql](assets/dump.sql)ファイルを別のOLTPデータベースに投入できます:

```bash
mysql some_db < dump.sql
```

ここでは、`some_table`テーブルが`some_db` MySQLデータベースに存在することを前提としています。

一部のDBMSでは、単一バッチ内で処理できる値の数に制限がある場合があります。デフォルトでは、ClickHouseは65,000個の値のバッチを作成しますが、[`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size)オプションで変更できます:

```sql
SET output_format_sql_insert_max_batch_size = 1000;
```

### 値のセットのエクスポート {#exporting-a-set-of-values}

ClickHouseには[Values](/interfaces/formats/Values)形式があり、SQLInsertに似ていますが、`INSERT INTO table VALUES`の部分を省略し、値のセットのみを返します:

```sql
SELECT * FROM some_data LIMIT 3 FORMAT Values
```

```response
('Bangor_City_Forest','2015-07-01',34),('Alireza_Afzal','2017-02-01',24),('Akhaura-Laksam-Chittagong_Line','2015-09-01',30)
```


## SQLダンプからのデータ挿入 {#inserting-data-from-sql-dumps}

SQLダンプを読み込むには、[MySQLDump](/interfaces/formats/MySQLDump)を使用します:

```sql
SELECT *
FROM file('dump.sql', MySQLDump)
LIMIT 5
```

```response
┌─path───────────────────────────┬──────month─┬─hits─┐
│ Bangor_City_Forest             │ 2015-07-01 │   34 │
│ Alireza_Afzal                  │ 2017-02-01 │   24 │
│ Akhaura-Laksam-Chittagong_Line │ 2015-09-01 │   30 │
│ 1973_National_500              │ 2017-10-01 │   80 │
│ Attachment                     │ 2017-09-01 │ 1356 │
└────────────────────────────────┴────────────┴──────┘
```

デフォルトでは、ClickHouseは不明なカラムをスキップし([input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)オプションで制御)、ダンプ内で最初に見つかったテーブルのデータを処理します(複数のテーブルが単一のファイルにダンプされている場合)。DDL文はスキップされます。MySQLダンプからテーブルにデータをロードするには([mysql.sql](assets/mysql.sql)ファイル):

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

MySQLダンプファイルからテーブルを自動的に作成することもできます:

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

ここでは、ClickHouseが自動的に推測した構造に基づいて`table_from_mysql`という名前のテーブルを作成しました。ClickHouseはデータに基づいて型を検出するか、利用可能な場合はDDLを使用します:

```sql
DESCRIBE TABLE table_from_mysql;
```

```response
┌─name──┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path  │ Nullable(String) │              │                    │         │                  │                │
│ month │ Nullable(Date32) │              │                    │         │                  │                │
│ hits  │ Nullable(UInt32) │              │                    │         │                  │                │
└───────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```


## その他のフォーマット {#other-formats}

ClickHouseは、さまざまなシナリオやプラットフォームに対応するため、テキスト形式とバイナリ形式の両方で多数のフォーマットをサポートしています。以下の記事で、より多くのフォーマットとその使用方法を確認できます:

- [CSVおよびTSVフォーマット](csv-tsv.md)
- [Parquet](parquet.md)
- [JSONフォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリフォーマット](binary.md)
- **SQLフォーマット**

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)もご確認ください。これはClickHouseサーバーを必要とせずにローカル/リモートファイルを操作できる、ポータブルでフル機能を備えたツールです。
