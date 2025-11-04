---
'sidebar_label': 'Parquet'
'sidebar_position': 3
'slug': '/integrations/data-formats/parquet'
'title': 'ClickHouseでのParquetの操作'
'description': 'ClickHouseでParquetを操作する方法を説明するページ'
'doc_type': 'guide'
---


# ClickHouseでのParquetの操作

Parquetはデータを列指向で効率的に保存するためのファイルフォーマットです。
ClickHouseはParquetファイルの読み書きをサポートしています。

:::tip
クエリ内でファイルパスを参照する際、ClickHouseが読み取ろうとする場所は、使用しているClickHouseのバリアントによって異なります。

[`clickhouse-local`](/operations/utilities/clickhouse-local.md)を使用している場合、ClickHouse Localを起動した場所に相対する場所から読み取ります。
ClickHouse Serverまたは`clickhouse client`経由でClickHouse Cloudを使用している場合、サーバーの`/var/lib/clickhouse/user_files/`ディレクトリに相対する場所から読み取ります。
:::

## Parquetからのインポート {#importing-from-parquet}

データをロードする前に、[file()](/sql-reference/functions/files.md/#file)関数を使用して[例のParquetファイル](assets/data.parquet)の構造を探ることができます：

```sql
DESCRIBE TABLE file('data.parquet', Parquet);
```

第二引数に[Parquet](/interfaces/formats.md/#data-format-parquet)を指定したので、ClickHouseはファイルフォーマットを認識します。これにより、カラムとそのタイプが出力されます：

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

実際にデータをインポートする前に、SQLの力を使ってファイルを探ることもできます：

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
`file()`や`INFILE`/`OUTFILE`の明示的なフォーマット指定を省略することができます。
その場合、ClickHouseはファイル拡張子に基づいてフォーマットを自動的に検出します。
:::

## 既存テーブルへのインポート {#importing-to-an-existing-table}

Parquetデータをインポートするテーブルを作成しましょう：

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

これで、`FROM INFILE`句を使用してデータをインポートできます：

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

ClickHouseがParquetの文字列（`date`カラム内）を`Date`型に自動的に変換したことに注目してください。これは、ClickHouseがターゲットテーブルの型に基づいて自動的に型キャストを行うためです。

## ローカルファイルをリモートサーバーに挿入する {#inserting-a-local-file-to-remote-server}

ローカルのParquetファイルをリモートのClickHouseサーバーに挿入したい場合は、ファイルの内容を`clickhouse-client`にパイプすることで実行できます。以下のようにします：

```sql
clickhouse client -q "INSERT INTO sometable FORMAT Parquet" < data.parquet
```

## Parquetファイルから新しいテーブルを作成する {#creating-new-tables-from-parquet-files}

ClickHouseはParquetファイルのスキーマを読み取るため、テーブルを即座に作成することができます：

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

これにより、指定したParquetファイルから自動的にテーブルが作成され、データが入力されます：

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

デフォルトでは、ClickHouseはカラム名、型、および値に対して厳格です。しかし、時にはインポート中に存在しないカラムやサポートされていない値を省略することができます。これは[Parquet設定](/interfaces/formats/Parquet#format-settings)で管理できます。

## Parquetフォーマットへのエクスポート {#exporting-to-parquet-format}

:::tip
ClickHouse Cloudで`INTO OUTFILE`を使用する場合、ファイルが書き込まれるマシンの`clickhouse client`でコマンドを実行する必要があります。
:::

任意のテーブルまたはクエリ結果をParquetファイルにエクスポートするには、`INTO OUTFILE`句を使用します：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

これにより、作業ディレクトリに`export.parquet`ファイルが作成されます。

## ClickHouseとParquetデータ型 {#clickhouse-and-parquet-data-types}
ClickHouseとParquetのデータ型はほとんど同一ですが、[少し異なる点](/interfaces/formats/Parquet#data-types-matching-parquet)もあります。例えば、ClickHouseは`DateTime`型をParquetの`int64`としてエクスポートします。その後、再度ClickHouseにインポートすると、数値が表示されます（[time.parquetファイル](assets/time.parquet)）：

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

## さらなる読書 {#further-reading}

ClickHouseは、多くのフォーマットをサポートしており、さまざまなシナリオやプラットフォームをカバーしています。次の資料で、さらに多くのフォーマットやそれらの操作方法を探ってみてください：

- [CSVおよびTSVフォーマット](csv-tsv.md)
- [Avro、ArrowおよびORC](arrow-avro-orc.md)
- [JSONフォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現とテンプレート](templates-regex.md)
- [ネイティブおよびバイナリフォーマット](binary.md)
- [SQLフォーマット](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)をチェックしてください。これは、Clickhouseサーバーがなくてもローカル/リモートファイルで作業できる完全機能のポータブルツールです。
