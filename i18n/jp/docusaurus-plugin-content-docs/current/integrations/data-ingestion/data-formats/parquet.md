---
sidebar_label: 'Parquet'
sidebar_position: 3
slug: /integrations/data-formats/parquet
title: 'ClickHouse での Parquet の扱い方'
description: 'ClickHouse で Parquet を扱う方法を説明するページ'
doc_type: 'guide'
keywords: ['parquet', 'columnar format', 'data format', 'compression', 'apache parquet']
---



# ClickHouse での Parquet の利用

Parquet は、データを列指向で格納するための効率的なファイル形式です。
ClickHouse は、Parquet ファイルの読み込みと書き込みの両方をサポートしています。

:::tip
クエリ内でファイルパスを指定した場合に、ClickHouse がどこから読み込もうとするかは、使用している ClickHouse の種類によって異なります。

[`clickhouse-local`](/operations/utilities/clickhouse-local.md) を使用している場合は、ClickHouse Local を起動した場所からの相対パスとして読み込みます。
`clickhouse client` 経由で ClickHouse Server または ClickHouse Cloud を使用している場合は、サーバー上の `/var/lib/clickhouse/user_files/` ディレクトリからの相対パスとして読み込みます。
:::



## Parquetからのインポート {#importing-from-parquet}

データをロードする前に、[file()](/sql-reference/functions/files.md/#file)関数を使用して[サンプルparquetファイル](assets/data.parquet)の構造を確認できます：

```sql
DESCRIBE TABLE file('data.parquet', Parquet);
```

第2引数に[Parquet](/interfaces/formats/Parquet)を指定することで、ClickHouseがファイル形式を認識します。これにより、カラムとその型が出力されます：

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

また、SQLの機能を活用して、実際にデータをインポートする前にファイルの内容を確認することもできます：

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
`file()`および`INFILE`/`OUTFILE`では、形式の明示的な指定を省略できます。
その場合、ClickHouseはファイル拡張子に基づいて形式を自動的に検出します。
:::


## 既存のテーブルへのインポート {#importing-to-an-existing-table}

Parquetデータをインポートするテーブルを作成します：

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

次に、`FROM INFILE`句を使用してデータをインポートします：

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

ClickHouseが`date`カラムのParquet文字列を自動的に`Date`型に変換していることに注目してください。これは、ClickHouseがターゲットテーブルの型に基づいて自動的に型キャストを行うためです。


## ローカルファイルをリモートサーバーに挿入する {#inserting-a-local-file-to-remote-server}

ローカルのParquetファイルをリモートのClickHouseサーバーに挿入したい場合は、以下のようにファイルの内容を`clickhouse-client`にパイプすることで実行できます:

```sql
clickhouse client -q "INSERT INTO sometable FORMAT Parquet" < data.parquet
```


## Parquetファイルから新しいテーブルを作成する {#creating-new-tables-from-parquet-files}

ClickHouseはParquetファイルのスキーマを読み取るため、テーブルを動的に作成できます:

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

これにより、指定したParquetファイルからテーブルが自動的に作成され、データが投入されます:

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

デフォルトでは、ClickHouseはカラム名、型、値に対して厳格です。ただし、インポート時に存在しないカラムやサポートされていない値をスキップすることもできます。これは[Parquet設定](/interfaces/formats/Parquet#format-settings)で管理できます。


## Parquet形式へのエクスポート {#exporting-to-parquet-format}

:::tip
ClickHouse Cloudで`INTO OUTFILE`を使用する場合、ファイルの書き込み先となるマシン上で`clickhouse client`のコマンドを実行する必要があります。
:::

任意のテーブルまたはクエリ結果をParquetファイルにエクスポートするには、`INTO OUTFILE`句を使用できます:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

これにより、作業ディレクトリに`export.parquet`ファイルが作成されます。


## ClickHouseとParquetのデータ型 {#clickhouse-and-parquet-data-types}

ClickHouseとParquetのデータ型はほぼ同一ですが、[若干の違い](/interfaces/formats/Parquet#data-types-matching-parquet)があります。例えば、ClickHouseは`DateTime`型をParquetの`int64`としてエクスポートします。これをClickHouseに再度インポートすると、数値が表示されます（[time.parquetファイル](assets/time.parquet)）：

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

この場合、[型変換](/sql-reference/functions/type-conversion-functions.md)を使用できます：

```sql
SELECT
    n,
    toDateTime(time)                 <--- intから日時へ
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


## 参考資料 {#further-reading}

ClickHouseは、さまざまなシナリオやプラットフォームに対応するため、テキスト形式とバイナリ形式の両方で多数のフォーマットをサポートしています。以下の記事で、より多くのフォーマットとその操作方法を確認できます:

- [CSVおよびTSV形式](csv-tsv.md)
- [Avro、Arrow、ORC](arrow-avro-orc.md)
- [JSON形式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブ形式とバイナリ形式](binary.md)
- [SQL形式](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)もご確認ください。これは、ClickHouseサーバーを必要とせずにローカル/リモートファイルを操作できる、ポータブルでフル機能を備えたツールです。
