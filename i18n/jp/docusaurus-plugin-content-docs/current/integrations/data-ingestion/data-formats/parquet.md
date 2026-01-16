---
sidebar_label: 'Parquet'
sidebar_position: 3
slug: /integrations/data-formats/parquet
title: 'ClickHouse での Parquet の利用'
description: 'ClickHouse での Parquet の扱い方について説明するページ'
doc_type: 'guide'
keywords: ['parquet', 'columnar format', 'data format', 'compression', 'apache parquet']
---

# ClickHouse での Parquet の利用 \\{#working-with-parquet-in-clickhouse\\}

Parquet は、データをカラム指向で効率的に保存できるファイル形式です。
ClickHouse は、Parquet ファイルの読み取りと書き込みの両方をサポートします。

:::tip
クエリ内でファイルパスを参照する場合、ClickHouse がどこから読み込むかは、使用している ClickHouse の実行形態によって異なります。

[`clickhouse-local`](/operations/utilities/clickhouse-local.md) を使用している場合は、ClickHouse Local を起動した場所からの相対パスとして読み込みます。
`clickhouse client` 経由で ClickHouse Server または ClickHouse Cloud を使用している場合は、サーバー上の `/var/lib/clickhouse/user_files/` ディレクトリからの相対パスとして読み込みます。
:::

## Parquet からのインポート \\{#importing-from-parquet\\}

データをロードする前に、[file()](/sql-reference/functions/files.md/#file) 関数を使用して、[Parquet 形式のサンプルファイル](assets/data.parquet) の構造を確認できます。

```sql
DESCRIBE TABLE file('data.parquet', Parquet);
```

第 2 引数として [Parquet](/interfaces/formats/Parquet) を指定しているため、ClickHouse はファイル形式を認識できます。これにより、列とそのデータ型が出力されます。

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

実際にデータをインポートする前に、SQL の全機能を活用してファイルを探索することもできます。

```sql
SELECT *
FROM file('data.parquet', Parquet)
LIMIT 3;
```

```response
┌─path──────────────────────┬─date───────┬─hits─┐
│ Akiba_Hebrew_Academy      │ 2017-08-01 │  241 │
│ Aegithina_tiphia          │ 2018-02-01 │   34 │
│ 1971-72_Utah_Stars_season │ 2016-10-01 │    1 │
└───────────────────────────┴────────────┴──────┘
```

:::tip
`file()` と `INFILE`/`OUTFILE` では、フォーマットの明示的な指定を省略できます。
その場合、ClickHouse がファイル拡張子に基づいてフォーマットを自動的に判別します。
:::

## 既存テーブルへのインポート \\{#importing-to-an-existing-table\\}

Parquet データをインポートするためのテーブルを作成します。

```sql
CREATE TABLE sometable
(
    `path` String,
    `date` Date,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY (date, path);
```

これで、`FROM INFILE` 句を使用してデータをインポートできます。

```sql
INSERT INTO sometable
FROM INFILE 'data.parquet' FORMAT Parquet;

SELECT *
FROM sometable
LIMIT 5;
```

```response
┌─path──────────────────────────┬───────date─┬─hits─┐
│ 1988_in_philosophy            │ 2015-05-01 │   70 │
│ 2004_Green_Bay_Packers_season │ 2015-05-01 │  970 │
│ 24_hours_of_lemans            │ 2015-05-01 │   37 │
│ 25604_Karlin                  │ 2015-05-01 │   20 │
│ ASCII_ART                     │ 2015-05-01 │    9 │
└───────────────────────────────┴────────────┴──────┘
```

ClickHouse が `date` 列の Parquet の文字列データを自動的に `Date` 型へ変換していることに注目してください。これは、ClickHouse がターゲットテーブルの列の型に基づいて自動的に型変換を行うためです。

## ローカルファイルをリモートサーバーに挿入する \\{#inserting-a-local-file-to-remote-server\\}

ローカルの Parquet ファイルをリモートの ClickHouse サーバーに挿入したい場合は、次のようにファイルの内容を `clickhouse-client` にパイプすることで行えます。

```sql
clickhouse client -q "INSERT INTO sometable FORMAT Parquet" < data.parquet
```

## Parquet ファイルから新しいテーブルを作成する \\{#creating-new-tables-from-parquet-files\\}

ClickHouse は Parquet ファイルのスキーマを読み取ることができるため、テーブルを動的に作成できます。

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

これにより、指定した Parquet ファイルからテーブルが自動的に作成され、データが投入されます。

```sql
DESCRIBE TABLE imported_from_parquet;
```

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

デフォルトでは、ClickHouse はカラム名やデータ型、値に対して厳格に動作します。ただし、状況によっては、インポート時に存在しないカラムやサポートされていない値をスキップすることができます。これは [Parquet 設定](/interfaces/formats/Parquet#format-settings) で制御できます。

## Parquet 形式へのエクスポート \\{#exporting-to-parquet-format\\}

:::tip
ClickHouse Cloud で `INTO OUTFILE` を使用する場合、ファイルが書き込まれるマシン上で `clickhouse client` を使ってコマンドを実行する必要があります。
:::

任意のテーブルまたはクエリ結果を Parquet ファイルにエクスポートするには、`INTO OUTFILE` 句を使用します。

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

これにより、作業ディレクトリに `export.parquet` ファイルが作成されます。

## ClickHouse と Parquet のデータ型 \\{#clickhouse-and-parquet-data-types\\}

ClickHouse と Parquet のデータ型はほとんど同一ですが、[いくつか違いがあります](/interfaces/formats/Parquet#data-types-matching-parquet)。たとえば、ClickHouse は `DateTime` 型を Parquet 側の `int64` としてエクスポートします。その後それを ClickHouse にインポートし直すと、（[time.parquet ファイル](assets/time.parquet) のように）数値として表示されます：

```sql
SELECT * FROM file('time.parquet', Parquet);
```

```response
┌─n─┬───────time─┐
│ 0 │ 1673622611 │
│ 1 │ 1673622610 │
│ 2 │ 1673622609 │
│ 3 │ 1673622608 │
│ 4 │ 1673622607 │
└───┴────────────┘
```

この場合には、[型変換](/sql-reference/functions/type-conversion-functions.md) を利用できます。

```sql
SELECT
    n,
    toDateTime(time)                 <--- int to time
FROM file('time.parquet', Parquet);
```

```response
┌─n─┬────toDateTime(time)─┐
│ 0 │ 2023-01-13 15:10:11 │
│ 1 │ 2023-01-13 15:10:10 │
│ 2 │ 2023-01-13 15:10:09 │
│ 3 │ 2023-01-13 15:10:08 │
│ 4 │ 2023-01-13 15:10:07 │
└───┴─────────────────────┘
```

## さらに読む \\{#further-reading\\}

ClickHouse は、さまざまなシナリオやプラットフォームをカバーするために、テキストおよびバイナリを含む多くのフォーマットをサポートしています。以下の記事で、より多くのフォーマットとその扱い方について参照してください。

- [CSV および TSV フォーマット](csv-tsv.md)
- [Avro、Arrow、ORC](arrow-avro-orc.md)
- [JSON フォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリフォーマット](binary.md)
- [SQL フォーマット](sql.md)

あわせて [clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local) も参照してください。ClickHouse サーバーを用意することなく、ローカル／リモートファイルを扱えるポータブルでフル機能のツールです。
