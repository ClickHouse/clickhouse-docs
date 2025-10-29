---
'description': 'よく実行するクエリのパフォーマンスを向上させるためにプロジェクションを使用する方法を学びます。これは、イングランドとウェールズの不動産に対して支払われた価格に関するデータを含むUK
  property datasetです。'
'sidebar_label': 'UK Property Prices'
'sidebar_position': 1
'slug': '/getting-started/example-datasets/uk-price-paid'
'title': '英国の不動産価格データセット'
'doc_type': 'tutorial'
---

このデータには、イングランドとウェールズにおける不動産の価格が含まれています。データは1995年以降利用可能で、未圧縮の状態でデータセットのサイズは約4 GiB（ClickHouseでは約278 MiBのみを消費します）。

- 出典: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- フィールドの説明: https://www.gov.uk/guidance/about-the-price-paid-data
- HM土地登記データを含む © Crown copyright and database right 2021。このデータはOpen Government Licence v3.0の下でライセンスされています。

## テーブルの作成 {#create-table}

```sql
CREATE DATABASE uk;

CREATE TABLE uk.uk_price_paid
(
    price UInt32,
    date Date,
    postcode1 LowCardinality(String),
    postcode2 LowCardinality(String),
    type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
    is_new UInt8,
    duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
    addr1 String,
    addr2 String,
    street LowCardinality(String),
    locality LowCardinality(String),
    town LowCardinality(String),
    district LowCardinality(String),
    county LowCardinality(String)
)
ENGINE = MergeTree
ORDER BY (postcode1, postcode2, addr1, addr2);
```

## データの前処理と挿入 {#preprocess-import-data}

`url` 関数を使用してデータをClickHouseにストリーミングします。まず、いくつかの受信データを前処理する必要があります。これには以下が含まれます：
- `postcode` を2つの異なるカラム - `postcode1` と `postcode2` に分割します。これはストレージとクエリにとって適しています
- `time` フィールドを00:00の時間のみを含むため、日付に変換します
- 分析に必要ないため、[UUid](../../sql-reference/data-types/uuid.md) フィールドを無視します
- [transform](../../sql-reference/functions/other-functions.md#transform) 関数を使用して、`type` と `duration` をより読みやすい `Enum` フィールドに変換します
- `is_new` フィールドを単一文字列（`Y`/`N`）から [UInt8](/sql-reference/data-types/int-uint) フィールドに0または1として変換します
- 最後の2つのカラムを削除します。すべて同じ値（0）を持っているためです

`url` 関数は、ウェブサーバーからデータをClickHouseのテーブルにストリーミングします。以下のコマンドは、`uk_price_paid` テーブルに500万行を挿入します：

```sql
INSERT INTO uk.uk_price_paid
SELECT
    toUInt32(price_string) AS price,
    parseDateTimeBestEffortUS(time) AS date,
    splitByChar(' ', postcode)[1] AS postcode1,
    splitByChar(' ', postcode)[2] AS postcode2,
    transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
    b = 'Y' AS is_new,
    transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
    addr1,
    addr2,
    street,
    locality,
    town,
    district,
    county
FROM url(
    'http://prod1.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
    'CSV',
    'uuid_string String,
    price_string String,
    time String,
    postcode String,
    a String,
    b String,
    c String,
    addr1 String,
    addr2 String,
    street String,
    locality String,
    town String,
    district String,
    county String,
    d String,
    e String'
) SETTINGS max_http_get_redirects=10;
```

データの挿入を待ちます。ネットワーク速度によっては、1分か2分かかります。

## データの検証 {#validate-data}

挿入された行数を確認して、うまくいったかどうかを確認しましょう：

```sql runnable
SELECT count()
FROM uk.uk_price_paid
```

このクエリが実行された時点で、データセットには27,450,499行がありました。ClickHouseでのテーブルのストレージサイズを見てみましょう：

```sql runnable
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'uk_price_paid'
```

テーブルのサイズは221.43 MiBに過ぎないことに注意してください！

## クエリを実行する {#run-queries}

データを分析するためにいくつかのクエリを実行しましょう：

### クエリ1. 年ごとの平均価格 {#average-price}

```sql runnable
SELECT
   toYear(date) AS year,
   round(avg(price)) AS price,
   bar(price, 0, 1000000, 80
)
FROM uk.uk_price_paid
GROUP BY year
ORDER BY year
```

### クエリ2. ロンドンにおける年ごとの平均価格 {#average-price-london}

```sql runnable
SELECT
   toYear(date) AS year,
   round(avg(price)) AS price,
   bar(price, 0, 2000000, 100
)
FROM uk.uk_price_paid
WHERE town = 'LONDON'
GROUP BY year
ORDER BY year
```

2020年に住宅価格に何かが起こりました！しかし、それは驚きではないでしょう...

### クエリ3. 最も高価な地域 {#most-expensive-neighborhoods}

```sql runnable
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM uk.uk_price_paid
WHERE date >= '2020-01-01'
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 100
```

## プロジェクションを使ったクエリの高速化 {#speeding-up-queries-with-projections}

プロジェクションを使用することで、これらのクエリを高速化できます。このデータセットの例については、["プロジェクション"](/data-modeling/projections) を参照してください。

### プレイグラウンドで試す {#playground}

データセットは[オンラインプレイグラウンド](https://sql.clickhouse.com?query_id=TRCWH5ZETY4SEEK8ISCCAX)でも利用可能です。
