---
sidebar_label: Parquet
sidebar_position: 3
slug: /integrations/data-formats/parquet
---

# ClickHouseでのParquetの利用

Parquetは、データを列指向の方法で保存するための効率的なファイルフォーマットです。ClickHouseは、Parquetファイルの読み書きをサポートしています。

:::tip
クエリ内でファイルパスを参照する際、ClickHouseが読み取ろうとする場所は、使用しているClickHouseのバリアントによって異なります。

[`clickhouse-local`](/operations/utilities/clickhouse-local.md)を使用している場合は、ClickHouse Localを起動した場所を基準にして読み取ります。
ClickHouse Serverまたは`clickhouse client`を介してClickHouse Cloudを使用している場合は、サーバ上の`/var/lib/clickhouse/user_files/`ディレクトリを基準にして読み取ります。
:::

## Parquetからのインポート {#importing-from-parquet}

データをロードする前に、[file()](/sql-reference/functions/files.md/#file)関数を使用して、[サンプルParquetファイル](assets/data.parquet)の構造を確認できます:

```sql
DESCRIBE TABLE file('data.parquet', Parquet);
```

[Parquet](/interfaces/formats.md/#data-format-parquet)を第二引数として使ったので、ClickHouseはファイルフォーマットを認識します。これにより、以下のようにカラムのタイプが印刷されます:

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

実際にデータをインポートする前に、SQLの力を使ってファイルを探ることもできます:

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
`file()`や`INFILE`/`OUTFILE`の明示的なフォーマット設定を省略することができます。
その場合、ClickHouseはファイル拡張子に基づいてフォーマットを自動的に検出します。
:::

## 既存のテーブルへのインポート {#importing-to-an-existing-table}

Parquetデータをインポートするためのテーブルを作成しましょう:

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

次に、`FROM INFILE`句を使用してデータをインポートできます:

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

ClickHouseがParquetの文字列（`date`カラム内）を`Date`型に自動的に変換したことに注目してください。これは、ClickHouseがターゲットテーブルの型に基づいて自動的に型変換を行うためです。

## ローカルファイルをリモートサーバに挿入する {#inserting-a-local-file-to-remote-server}

ローカルのParquetファイルをリモートのClickHouseサーバに挿入したい場合、以下のようにファイルの内容を`clickhouse-client`にパイプして行うことができます:

```sql
clickhouse client -q "INSERT INTO sometable FORMAT Parquet" < data.parquet
```

## Parquetファイルから新しいテーブルを作成する {#creating-new-tables-from-parquet-files}

ClickHouseはParquetファイルのスキーマを読み取るため、テーブルをその場で作成できます:

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

これにより、指定されたParquetファイルから自動的にテーブルが作成され、データがポピュレートされます:

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

デフォルトでは、ClickHouseはカラム名、型、値に対して厳格ですが、インポート中に存在しないカラムや未対応の値を省略することもできます。これは[Parquet設定](/interfaces/formats.md/#parquet-format-settings)で管理できます。

## Parquet形式へのエクスポート {#exporting-to-parquet-format}

:::tip
ClickHouse Cloudで`INTO OUTFILE`を使用する場合、ファイルが書き込まれるマシンで`clickhouse client`コマンドを実行する必要があります。
:::

任意のテーブルまたはクエリ結果をParquetファイルにエクスポートするには、`INTO OUTFILE`句を使用します:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

これにより、作業ディレクトリに`export.parquet`ファイルが作成されます。

## ClickHouseとParquetデータ型 {#clickhouse-and-parquet-data-types}
ClickHouseとParquetのデータ型はほぼ同一ですが、[いくつかの違いがあります](/interfaces/formats.md/#data-types-matching-parquet)。たとえば、ClickHouseは`DateTime`型をParquetの`int64`としてエクスポートします。これをClickHouseに再インポートすると、数字が表示されます（[time.parquetファイル](assets/time.parquet)）:

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

この場合、[型変換](/sql-reference/functions/type-conversion-functions.md)を使用できます:

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


## さらなる学習 {#further-reading}

ClickHouseは、多くのテキストおよびバイナリフォーマットをサポートしており、さまざまなシナリオやプラットフォームをカバーしています。以下の記事で、より多くのフォーマットや取り扱い方法を探ってみてください:

- [CSVおよびTSVフォーマット](csv-tsv.md)
- [Avro、Arrow、およびORC](arrow-avro-orc.md)
- [JSONフォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリフォーマット](binary.md)
- [SQLフォーマット](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)もチェックしてください。これは、ClickHouseサーバーなしにローカル/リモートファイルで作業するためのポータブルでフル機能のツールです。
