---
'sidebar_label': 'SQLダンプ'
'slug': '/integrations/data-formats/sql'
'title': 'ClickHouseへのSQLデータの挿入とダンプ'
'description': '他のデータベースとClickHouseの間でSQLダンプを使用してデータを転送する方法を説明するページ。'
'doc_type': 'guide'
---


# ClickHouseにおけるSQLデータの挿入とダンプ

ClickHouseは、OLTPデータベースインフラストラクチャに多くの方法で簡単に統合できます。1つの方法は、SQLダンプを使用して他のデータベースとClickHouseの間でデータを転送することです。

## SQLダンプの作成 {#creating-sql-dumps}

データは、[SQLInsert](/interfaces/formats.md/#sqlinsert)を使用してSQL形式でダンプできます。ClickHouseは、`INSERT INTO <table name> VALUES(...`形式でデータを書き込み、[`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name)設定オプションをテーブル名として使用します。

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

カラム名は、[`output_format_sql_insert_include_column_names`](/operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names)オプションを無効にすることで省略できます。

```sql
SET output_format_sql_insert_include_column_names = 0
```

これで、[dump.sql](assets/dump.sql)ファイルを別のOLTPデータベースに渡すことができます。

```bash
mysql some_db < dump.sql
```

`some_db` MySQLデータベース内に`some_table`テーブルが存在すると仮定します。

一部のDBMSには、単一のバッチ内で処理できる値の制限があるかもしれません。デフォルトでは、ClickHouseは65k値のバッチを作成しますが、これは[`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size)オプションで変更できます。

```sql
SET output_format_sql_insert_max_batch_size = 1000;
```

### 値のセットをエクスポートする {#exporting-a-set-of-values}

ClickHouseには、[Values](/interfaces/formats.md/#data-format-values)形式があり、これはSQLInsertに似ていますが、`INSERT INTO table VALUES`部分を省略し、値のセットのみを返します。

```sql
SELECT * FROM some_data LIMIT 3 FORMAT Values
```
```response
('Bangor_City_Forest','2015-07-01',34),('Alireza_Afzal','2017-02-01',24),('Akhaura-Laksam-Chittagong_Line','2015-09-01',30)
```

## SQLダンプからのデータの挿入 {#inserting-data-from-sql-dumps}

SQLダンプを読み取るために、[MySQLDump](/interfaces/formats.md/#mysqldump)が使用されます。

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

デフォルトでは、ClickHouseは不明なカラムをスキップし（[input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields)オプションで制御）、ダンプ内の最初に見つかったテーブル用にデータを処理します（複数のテーブルが単一のファイルにダンプされた場合）。DDLステートメントはスキップされます。MySQLダンプからテーブルにデータを読み込むには、([mysql.sql](assets/mysql.sql)ファイル):

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

また、MySQLダンプファイルから自動的にテーブルを作成することもできます。

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

ここでは、ClickHouseが自動的に推測した構造に基づいて`table_from_mysql`という名前のテーブルを作成しました。ClickHouseは、データに基づいて型を検出するか、利用可能な場合はDDLを使用します。

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

ClickHouseは、さまざまなシナリオやプラットフォームをカバーするために、テキストおよびバイナリの多くのフォーマットをサポートしています。以下の文書で、さらなるフォーマットとそれに関する作業方法を探ってください。

- [CSVおよびTSVフォーマット](csv-tsv.md)
- [Parquet](parquet.md)
- [JSONフォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリフォーマット](binary.md)
- **SQLフォーマット**

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)もチェックしてください - ClickHouseサーバーがなくても、ローカル/リモートファイルで作業するためのポータブルな多機能ツールです。
