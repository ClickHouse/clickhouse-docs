---
'sidebar_label': 'SQL ダンプ'
'slug': '/integrations/data-formats/sql'
'title': 'ClickHouse で SQL データの挿入とダンプ'
'description': '他のデータベースと ClickHouse 間でデータを SQL ダンプを使用して転送する方法について説明するページ。'
---




# ClickHouseへのSQLデータの挿入とダンプ

ClickHouseは、様々な方法でOLTPデータベースインフラに簡単に統合できます。1つの方法は、他のデータベースとClickHouseの間でSQLダンプを使用してデータを転送することです。

## SQLダンプの作成 {#creating-sql-dumps}

データは、[SQLInsert](/interfaces/formats.md/#sqlinsert)を使用してSQL形式でダンプできます。ClickHouseは、`INSERT INTO <table name> VALUES(...` 形式でデータを書き込み、[`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name)設定オプションをテーブル名として使用します：

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

カラム名は、[`output_format_sql_insert_include_column_names`](/operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names)オプションを無効にすることで省略できます：

```sql
SET output_format_sql_insert_include_column_names = 0
```

これで、[dump.sql](assets/dump.sql)ファイルを別のOLTPデータベースに供給できます：

```bash
mysql some_db < dump.sql
```

`some_db` MySQLデータベースに`some_table`テーブルが存在することを前提としています。

一部のDBMSは、一度のバッチで処理できる値の数に制限がある場合があります。デフォルトでは、ClickHouseは65k値のバッチを作成しますが、これは[`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size)オプションで変更可能です：

```sql
SET output_format_sql_insert_max_batch_size = 1000;
```

### 値のセットをエクスポートする {#exporting-a-set-of-values}

ClickHouseには、[Values](/interfaces/formats.md/#data-format-values)形式があり、これはSQLInsertに似ていますが、`INSERT INTO table VALUES`部分を省略し、値のセットのみを返します：

```sql
SELECT * FROM some_data LIMIT 3 FORMAT Values
```
```response
('Bangor_City_Forest','2015-07-01',34),('Alireza_Afzal','2017-02-01',24),('Akhaura-Laksam-Chittagong_Line','2015-09-01',30)
```

## SQLダンプからデータを挿入する {#inserting-data-from-sql-dumps}

SQLダンプを読み込むために、[MySQLDump](/interfaces/formats.md/#mysqldump)が使用されます：

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

デフォルトでは、ClickHouseは不明なカラムをスキップします（これは、[input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)オプションで制御されます）及びダンプ内の最初に見つかったテーブルについてデータを処理します（複数のテーブルが単一ファイルにダンプされた場合）。DDLステートメントはスキップされます。MySQLダンプからテーブルへのデータのロードは次のように行います（[mysql.sql](assets/mysql.sql)ファイル）：

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

MySQLダンプファイルから自動的にテーブルを作成することもできます：

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

ここでは、ClickHouseが自動的に推測した構造に基づいて`table_from_mysql`という名前のテーブルを作成しました。ClickHouseはデータに基づいて型を検出するか、DDLが利用可能な場合はそれを使用します：

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

## 他の形式 {#other-formats}

ClickHouseは、多様なシナリオやプラットフォームをカバーするために、多くの形式のサポートを導入しています。以下の文書で、さまざまな形式や、それらとの作業方法について詳しく探求してください：

- [CSVおよびTSV形式](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON形式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリ形式](binary.md)
- **SQL形式**

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)を確認してください - ClickHouseサーバーなしでローカル/リモートファイルで作業するためのポータブルなフル機能ツールです。
