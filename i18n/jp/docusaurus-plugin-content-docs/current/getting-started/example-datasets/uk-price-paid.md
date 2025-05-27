---
'description': 'Learn how to use projections to improve the performance of queries
  that you run frequently using the UK property dataset, which contains data about
  prices paid for real-estate property in England and Wales'
'sidebar_label': 'UK Property Prices'
'sidebar_position': 1
'slug': '/getting-started/example-datasets/uk-price-paid'
'title': 'The UK property prices dataset'
---



このデータには、イングランドおよびウェールズにおける不動産物件の購入価格が含まれています。このデータは1995年から利用可能で、圧縮されていない形のデータセットサイズは約4 GiB（ClickHouseでは約278 MiBしかかかりません）。

- ソース: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- フィールドの説明: https://www.gov.uk/guidance/about-the-price-paid-data
- HM土地台帳データ © Crown copyright and database right 2021. このデータはOpen Government Licence v3.0のもとでライセンスされています。

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

`url` 関数を使用して、データをClickHouseにストリーミングします。まず、一部の受信データを前処理する必要があります。これには以下が含まれます。
- `postcode` を2つの異なるカラム - `postcode1` と `postcode2` に分割し、ストレージとクエリのために最適化します。
- `time` フィールドを日付に変換します。これは0:00の時間だけを含むためです。
- 分析に必要ないため、[UUid](../../sql-reference/data-types/uuid.md) フィールドを無視します。
- `type` と `duration` をより読みやすい `Enum` フィールドに変換します。これは [transform](../../sql-reference/functions/other-functions.md#transform) 関数を使用します。
- `is_new` フィールドを単一文字列（`Y`/`N`）から [UInt8](../../sql-reference/data-types/int-uint) フィールドに変換し、0または1にします。
- 最後の2つのカラムは全て同じ値（0）を持つため、削除します。

`url` 関数は、ウェブサーバーからのデータをClickHouseのテーブルにストリーミングします。次のコマンドは、`uk_price_paid` テーブルに500万行を挿入します。

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

データが挿入されるのを待ちます - ネットワーク速度によっては1分か2分かかるでしょう。

## データの検証 {#validate-data}

挿入された行数を確認して、動作が正しかったか確かめます。

```sql runnable
SELECT count()
FROM uk.uk_price_paid
```

このクエリが実行された時点で、データセットには27,450,499行がありました。ClickHouseでのテーブルのストレージサイズを確認してみましょう。

```sql runnable
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'uk_price_paid'
```

テーブルのサイズはわずか221.43 MiBです！

## クエリの実行 {#run-queries}

データを分析するためにいくつかのクエリを実行します。

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

### クエリ2. ロンドンの年ごとの平均価格 {#average-price-london}

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

2020年に住宅価格に何かが起こりました！しかし、それはおそらく驚くべきことではないでしょう...

### クエリ3. 最も高価な地域 {#most-expensive-neighborhoods}

```sql
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

## プロジェクションを使用したクエリの高速化 {#speeding-up-queries-with-projections}

プロジェクションを使用することで、これらのクエリの速度を向上させることができます。このデータセットの例については、["Projections"](/data-modeling/projections) を参照してください。

### Playgroundでテスト {#playground}

データセットは、[オンラインプレイグラウンド](https://sql.clickhouse.com?query_id=TRCWH5ZETY4SEEK8ISCCAX)でも利用可能です。
