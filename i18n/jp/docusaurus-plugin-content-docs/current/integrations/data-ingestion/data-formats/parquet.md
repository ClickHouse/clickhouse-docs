---
sidebar_label: Parquet
sidebar_position: 3
slug: /integrations/data-formats/parquet
---


# ClickHouseにおけるParquetの取り扱い

Parquetは、データを列指向で格納する効率的なファイルフォーマットです。ClickHouseはParquetファイルの読み書きをサポートしています。

:::tip
クエリ内でファイルパスを参照する場合、ClickHouseが読み込む場所は、使用しているClickHouseのバリアントによって異なります。

[`clickhouse-local`](/operations/utilities/clickhouse-local.md)を使用している場合、ClickHouse Localを起動した場所に対して相対的な場所から読み込みます。ClickHouse Serverや`clickhouse client`経由でClickHouse Cloudを使用している場合、サーバー上の`/var/lib/clickhouse/user_files/`ディレクトリに対して相対的な場所から読み込みます。
:::

## Parquetからインポートする {#importing-from-parquet}

データをロードする前に、[file()](/sql-reference/functions/files.md/#file)関数を使用して、[サンプルのparquetファイル](assets/data.parquet)の構造を調べることができます：

```sql
DESCRIBE TABLE file('data.parquet', Parquet);
```

第二引数として[Parquet](/interfaces/formats.md/#data-format-parquet)を使用しているので、ClickHouseはファイルフォーマットを認識します。これにより、タイプが付与されたカラムを表示します：

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ path │ Nullable(String) │              │                    │         │                  │                │
│ date │ Nullable(String) │              │                    │         │                  │                │
│ hits │ Nullable(Int64)  │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

データを実際にインポートする前に、SQLの全機能を活用してファイルを調べることもできます：

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
`file()`や`INFILE`/`OUTFILE`の明示的なフォーマット設定を省略することができます。その場合、ClickHouseはファイル拡張子に基づいてフォーマットを自動的に検出します。
:::

## 既存のテーブルにインポートする {#importing-to-an-existing-table}

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

次に、`FROM INFILE`句を使用してデータをインポートできます：

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

ClickHouseがParquetの文字列（`date`カラム内）を`Date`タイプに自動で変換したことに注意してください。これは、ClickHouseがターゲットテーブルのタイプに基づいて自動的に型変換を行うためです。

## ローカルファイルをリモートサーバーに挿入する {#inserting-a-local-file-to-remote-server}

ローカルのParquetファイルをリモートのClickHouseサーバーに挿入したい場合、次のようにファイルの内容を`clickhouse-client`にパイプすることで実行できます：

```sql
clickhouse client -q "INSERT INTO sometable FORMAT Parquet" < data.parquet
```

## Parquetファイルから新しいテーブルを作成する {#creating-new-tables-from-parquet-files}

ClickHouseはparquetファイルのスキーマを読み取るため、テーブルを即座に作成できます：

```sql
CREATE TABLE imported_from_parquet
ENGINE = MergeTree
ORDER BY tuple() AS
SELECT *
FROM file('data.parquet', Parquet)
```

これにより、指定したparquetファイルから自動的にテーブルが作成され、データが投入されます：

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

デフォルトでは、ClickHouseはカラム名、タイプ、および値に対して厳格です。しかし、インポート中に存在しないカラムやサポートされていない値をスキップすることもできます。これは[Parquet設定](/interfaces/formats.md/#parquet-format-settings)で管理できます。

## Parquetフォーマットへのエクスポート {#exporting-to-parquet-format}

:::tip
ClickHouse Cloudで`INTO OUTFILE`を使用する場合、ファイルが書き込まれるマシン上で`clickhouse client`でコマンドを実行する必要があります。
:::

任意のテーブルまたはクエリ結果をParquetファイルにエクスポートするには、`INTO OUTFILE`句を使用します：

```sql
SELECT *
FROM sometable
INTO OUTFILE 'export.parquet'
FORMAT Parquet
```

これにより、作業ディレクトリに`export.parquet`ファイルが作成されます。

## ClickHouseとParquetデータタイプ {#clickhouse-and-parquet-data-types}
ClickHouseとParquetのデータタイプはほとんど同一ですが、[若干の違い](/interfaces/formats.md/#data-types-matching-parquet)があります。例えば、ClickHouseは`DateTime`タイプをParquetの`int64`としてエクスポートします。その後、再びClickHouseにインポートすると、数値が表示されます（[time.parquetファイル](assets/time.parquet)）：

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
    toDateTime(time)                 <--- intを時間に変換
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

ClickHouseは、さまざまなシナリオやプラットフォームをカバーするために、多くのフォーマット、テキスト及びバイナリをサポートしています。以下の記事で、より多くのフォーマットやそれらの取り扱い方法を探ってください：

- [CSVおよびTSVフォーマット](csv-tsv.md)
- [Avro、ArrowおよびORC](arrow-avro-orc.md)
- [JSONフォーマット](/integrations/data-ingestion/data-formats/json/intro.md)
- [正規表現およびテンプレート](templates-regex.md)
- [ネイティブおよびバイナリフォーマット](binary.md)
- [SQLフォーマット](sql.md)

また、[clickhouse-local](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)もチェックしてください。これは、ClickHouseサーバーを必要とせずにローカルおよびリモートファイルで作業するためのポータブルでフル機能のツールです。
