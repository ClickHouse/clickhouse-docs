---
sidebar_label: Parquet
sidebar_position: 3
slug: /integrations/data-formats/parquet
---


# ClickHouseでのParquetの取り扱い

Parquetは、データを列指向の方法で効率的に保存するためのファイル形式です。ClickHouseはParquetファイルの読み書きをサポートしています。

:::tip
クエリ内でファイルパスを参照する場合、ClickHouseが読み取ろうとする位置は、利用しているClickHouseのバリアントによって異なります。

[`clickhouse-local`](/operations/utilities/clickhouse-local.md)を使用している場合、ClickHouse Localを起動した場所を基準にして読み取ります。
ClickHouse Serverまたは`clickhouse client`経由でClickHouse Cloudを使用している場合、サーバーの`/var/lib/clickhouse/user_files/`ディレクトリを基準にして読み取ります。
:::

## Parquetからのインポート {#importing-from-parquet}

データをロードする前に、[file()](/sql-reference/functions/files.md/#file)関数を使用して、[例のparquetファイル](assets/data.parquet)の構造を確認できます:

```sql
DESCRIBE TABLE file('data.parquet', Parquet);
```

第二引数として[Parquet](/interfaces/formats.md/#data-format-parquet)を使用しているので、ClickHouseはファイル形式を認識します。これにより、列とその型が表示されます:

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

データを実際にインポートする前に、SQLのパワーを使用してファイルを探索することもできます:

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
`file()`および`INFILE`/`OUTFILE`に対して明示的な形式設定をスキップすることができます。
その場合、ClickHouseはファイル拡張子に基づいて形式を自動的に検出します。
:::

## 既存のテーブルへのインポート {#importing-to-an-existing-table}

Parquetデータをインポートするテーブルを作成しましょう:

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

ClickHouseがParquetの文字列（`date`カラム内）を`Date`型に自動的に変換したことに注意してください。これは、ClickHouseがターゲットテーブル内の型に基づいて自動的に型変換を行うためです。

## ローカルファイルをリモートサーバーに挿入する {#inserting-a-local-file-to-remote-server}

ローカルのParquetファイルをリモートのClickHouseサーバーに挿入したい場合、以下のようにファイルの内容を`clickhouse-client`にパイプすることで実行できます:

```sql
clickhouse client -q "INSERT INTO sometable FORMAT Parquet" < data.parquet
```

## Parquetファイルから新しいテーブルを作成する {#creating-new-tables-from-parquet-files}

ClickHouseはparquetファイルのスキーマを読み取るため、即座にテーブルを作成できます:

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

これにより、指定されたparquetファイルから自動的にテーブルが作成され、データが挿入されます:

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

デフォルトでは、ClickHouseはカラム名、型、値に厳格です。しかし、インポート中に存在しないカラムやサポートされていない値をスキップする場合もあります。これは[Parquet設定](/interfaces/formats/Parquet#format-settings)で管理できます。

## Parquet形式へのエクスポート {#exporting-to-parquet-format}

:::tip
ClickHouse Cloudで`INTO OUTFILE`を使用する場合、ファイルが書き込まれるマシン上で`clickhouse client`でコマンドを実行する必要があります。
:::

任意のテーブルやクエリ結果をParquetファイルにエクスポートするには、`INTO OUTFILE`句を使用できます:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

これにより、作業ディレクトリに`export.parquet`ファイルが作成されます。

## ClickHouseとParquetデータ型 {#clickhouse-and-parquet-data-types}
ClickHouseとParquetのデータ型はほぼ同じですが、[若干の違い](https://clickhouse.com/docs/en/interfaces/formats/Parquet/#data-types-matching-parquet)があります。例えば、ClickHouseは`DateTime`型をParquetの`int64`としてエクスポートします。その後、再びClickHouseにインポートすると、数字が表示されます（[time.parquetファイル](assets/time.parquet)）:

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

この場合、[型変換](/sql-reference/functions/type-conversion-functions.md)を使用することができます:

```sql
SELECT
    n,
    toDateTime(time)                 <--- intをtimeに変換
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


## さらなる読み物 {#further-reading}

ClickHouseは、さまざまなシナリオやプラットフォームをカバーするために、テキストおよびバイナリの多くの形式をサポートしています。以下の記事で、その他の形式やそれらとの連携方法について詳しく探求してください:

- [CSVおよびTSV形式](csv-tsv.md)
- [Avro、ArrowおよびORC](arrow-avro-orc.md)
- [JSON形式](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブ形式およびバイナリ形式](binary.md)
- [SQL形式](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)も確認してください。これは、Clickhouseサーバーを必要とせずにローカル/リモートファイルで作業するためのポータブルな完全機能ツールです。
