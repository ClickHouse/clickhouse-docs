---
description: 'イングランドおよびウェールズの不動産売買価格データを含む UK 不動産価格データセットを使って、頻繁に実行するクエリのパフォーマンスをプロジェクションで向上させる方法を学びます'
sidebar_label: 'UK 不動産価格'
slug: /getting-started/example-datasets/uk-price-paid
title: 'UK 不動産価格データセット'
doc_type: 'guide'
keywords: ['example dataset', 'uk property', 'sample data', 'real estate', 'getting started']
---

このデータには、イングランドおよびウェールズの不動産に対して支払われた価格が含まれています。データは 1995 年以降のものが利用可能で、非圧縮形式でのデータセットのサイズは約 4 GiB あります（ClickHouse では約 278 MiB にまで圧縮されます）。

- 出典: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- 項目の説明: https://www.gov.uk/guidance/about-the-price-paid-data
- HM Land Registry のデータを含みます © Crown copyright and database right 2021。このデータは Open Government Licence v3.0 の下でライセンスされています。



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

`url`関数を使用してClickHouseにデータをストリーミングします。まず、受信データの一部を前処理する必要があります。これには以下が含まれます：

- `postcode`を2つの異なる列（`postcode1`と`postcode2`）に分割します。これにより、ストレージとクエリの効率が向上します
- `time`フィールドを日付に変換します。このフィールドには00:00の時刻のみが含まれているためです
- [UUid](../../sql-reference/data-types/uuid.md)フィールドは分析に不要なため無視します
- [transform](../../sql-reference/functions/other-functions.md#transform)関数を使用して、`type`と`duration`をより読みやすい`Enum`フィールドに変換します
- `is_new`フィールドを単一文字の文字列（`Y`/`N`）から0または1の値を持つ[UInt8](/sql-reference/data-types/int-uint)フィールドに変換します
- 最後の2つの列はすべて同じ値（0）を持つため削除します

`url`関数は、Webサーバーからデータをストリーミングし、ClickHouseテーブルに挿入します。以下のコマンドは、`uk_price_paid`テーブルに500万行を挿入します：

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

データの挿入が完了するまでお待ちください。ネットワーク速度によっては1～2分かかります。


## データの検証 {#validate-data}

挿入された行数を確認して、正常に動作したか検証しましょう:

```sql runnable
SELECT count()
FROM uk.uk_price_paid
```

このクエリを実行した時点で、データセットには27,450,499行が含まれていました。ClickHouseでのテーブルのストレージサイズを確認しましょう:

```sql runnable
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'uk_price_paid'
```

テーブルのサイズはわずか221.43 MiBです!


## クエリを実行する {#run-queries}

データを分析するためにいくつかのクエリを実行してみましょう:

### クエリ1. 年別の平均価格 {#average-price}

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

### クエリ2. ロンドンにおける年別の平均価格 {#average-price-london}

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

2020年に住宅価格に何かが起こりました!しかし、それはおそらく驚くことではないでしょう...

### クエリ3. 最も高額な地域 {#most-expensive-neighborhoods}

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


## プロジェクションによるクエリの高速化 {#speeding-up-queries-with-projections}

プロジェクションを使用してこれらのクエリを高速化できます。このデータセットを使用した例については、["プロジェクション"](/data-modeling/projections)を参照してください。

### プレイグラウンドで試す {#playground}

このデータセットは[オンラインプレイグラウンド](https://sql.clickhouse.com?query_id=TRCWH5ZETY4SEEK8ISCCAX)でも利用できます。
