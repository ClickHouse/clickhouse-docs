---
sidebar_label: 'SQL ダンプ'
slug: /integrations/data-formats/sql
title: 'ClickHouse への SQL データの挿入とダンプ'
description: '他のデータベースと ClickHouse の間で、SQL ダンプを使用してデータを転送する方法を説明するページです。'
doc_type: 'guide'
keywords: ['SQL 形式', 'データエクスポート', 'データインポート', 'バックアップ', 'SQL ダンプ']
---

# ClickHouse での SQL データの挿入とダンプ \{#inserting-and-dumping-sql-data-in-clickhouse\}

ClickHouse は、さまざまな方法で OLTP データベース基盤に容易に統合できます。その 1 つの方法として、SQL ダンプを使用して他のデータベースと ClickHouse 間でデータを転送することが挙げられます。

## SQL ダンプの作成 \{#creating-sql-dumps\}

[SQLInsert](/interfaces/formats/SQLInsert) を使用すると、データを SQL 形式でダンプできます。ClickHouse はデータを `INSERT INTO &lt;table name&gt; VALUES(...` 形式で出力し、テーブル名として [`output_format_sql_insert_table_name`](/operations/settings/settings-formats.md/#output_format_sql_insert_table_name) 設定オプションを使用します。

```sql
SET output_format_sql_insert_table_name = 'some_table';
SELECT * FROM some_data
INTO OUTFILE 'dump.sql'
FORMAT SQLInsert
```

[`output_format_sql_insert_include_column_names`](/operations/settings/settings-formats.md/#output_format_sql_insert_include_column_names) オプションを無効にすると、カラム名を省略できます。

```sql
SET output_format_sql_insert_include_column_names = 0
```

これで、[dump.sql](assets/dump.sql) ファイルを別の OLTP データベースに読み込ませることができます。

```bash
mysql some_db < dump.sql
```

`some_db` MySQL データベース内に `some_table` テーブルが存在していることを前提とします。

一部の DBMS には、1 回のバッチで処理できる値の数に制限がある場合があります。デフォルトでは、ClickHouse は 1 バッチあたり 65k 個の値を含むバッチを作成しますが、これは [`output_format_sql_insert_max_batch_size`](/operations/settings/settings-formats.md/#output_format_sql_insert_max_batch_size) オプションで変更できます。

```sql
SET output_format_sql_insert_max_batch_size = 1000;
```

### 値の集合のエクスポート \{#exporting-a-set-of-values\}

ClickHouse には [Values](/interfaces/formats/Values) フォーマットがあり、SQL の INSERT 文に似ていますが、`INSERT INTO table VALUES` の部分を省き、値の集合だけを返します。

```sql
SELECT * FROM some_data LIMIT 3 FORMAT Values
```

```response
('Bangor_City_Forest','2015-07-01',34),('Alireza_Afzal','2017-02-01',24),('Akhaura-Laksam-Chittagong_Line','2015-09-01',30)
```

## SQLダンプからのデータ挿入 \{#inserting-data-from-sql-dumps\}

SQL ダンプを読み込むには、[MySQLDump](/interfaces/formats/MySQLDump) を使用します。

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

デフォルトでは、ClickHouse は未知のカラムをスキップし（[input&#95;format&#95;skip&#95;unknown&#95;fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields) オプションで制御）、ダンプ内で最初に見つかったテーブルのデータのみを処理します（複数のテーブルが 1 つのファイルにダンプされている場合）。DDL ステートメントはスキップされます。MySQL のダンプ（[mysql.sql](assets/mysql.sql) ファイル）からテーブルにデータをロードするには、次のようにします：

```sql
INSERT INTO some_data
FROM INFILE 'mysql.sql' FORMAT MySQLDump
```

MySQL のダンプファイルからテーブルを自動作成することもできます。

```sql
CREATE TABLE table_from_mysql
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('mysql.sql', MySQLDump)
```

ここでは、ClickHouse が自動的に推論したスキーマに基づいて、`table_from_mysql` という名前のテーブルを作成しました。ClickHouse は、データに基づいて型を判別するか、DDL が利用可能な場合にはその定義を使用します。

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

## その他のフォーマット \{#other-formats\}

ClickHouse は多くのフォーマットをサポートしており、テキスト形式とバイナリ形式の両方を提供して、さまざまなユースケースやプラットフォームをカバーします。以下の記事では、さらに多くのフォーマットとその扱い方を紹介します。

- [CSV と TSV フォーマット](csv-tsv.md)
- [Parquet](parquet.md)
- [JSON フォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [Regex とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリフォーマット](binary.md)
- **SQL フォーマット**

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) も参照してください。ClickHouse サーバーを起動することなく、ローカル／リモートファイルを扱うことができる移植性の高いフル機能ツールです。
