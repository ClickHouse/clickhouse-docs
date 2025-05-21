---
description: '頻繁に実行するクエリのパフォーマンスを向上させるために、UKの不動産データセットを使用してプロジェクションの使い方を学びます。このデータセットには、イングランドとウェールズにおける不動産の価格に関するデータが含まれています。'
sidebar_label: 'UKの不動産価格'
sidebar_position: 1
slug: /getting-started/example-datasets/uk-price-paid
title: 'UKの不動産価格データセット'
---

このデータには、イングランドとウェールズの不動産に対して支払われた価格が含まれています。データは1995年以降利用可能で、未圧縮のデータセットサイズは約4 GiB（ClickHouseでは約278 MiBしか必要ありません）。

- ソース: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- フィールドの説明: https://www.gov.uk/guidance/about-the-price-paid-data
- HM土地登記のデータを含む © Crown copyright and database right 2021。このデータは、Open Government Licence v3.0の下でライセンスされています。

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

`url` 関数を使用してデータをClickHouseにストリーミングします。まず、一部の incoming データを前処理する必要があります。これには以下が含まれます：
- `postcode` を2つの異なるカラム、つまり `postcode1` と `postcode2` に分割します。これはストレージとクエリに適しています。
- `time` フィールドを日付に変換します。ここには00:00のみが含まれています。
- 分析には必要ないため、[UUid](../../sql-reference/data-types/uuid.md) フィールドを無視します。
- [transform](../../sql-reference/functions/other-functions.md#transform) 関数を使用して `type` と `duration` をより読みやすい `Enum` フィールドに変換します。
- `is_new` フィールドを一文字の文字列（`Y`/`N`）から `[UInt8](/sql-reference/data-types/int-uint)` フィールドに変換します。値は0または1です。
- 最後の2つのカラムを削除します。すべての値が同じ（つまり0）だからです。

`url` 関数は、ウェブサーバーからClickHouseテーブルにデータをストリーミングします。以下のコマンドは `uk_price_paid` テーブルに500万行を挿入します：

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

データが挿入されるのを待ちます - ネットワーク速度によっては1、2分かかるでしょう。

## データの検証 {#validate-data}

動作確認のために挿入された行数を確認しましょう：

```sql runnable
SELECT count()
FROM uk.uk_price_paid
```

このクエリを実行した時点で、データセットには27,450,499行がありました。ClickHouseでのテーブルのストレージサイズを確認してみましょう：

```sql runnable
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'uk_price_paid'
```

テーブルのサイズはわずか221.43 MiBです！

## クエリの実行 {#run-queries}

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

2020年に住宅価格に何かが起こりました！しかし、それは驚くことではないでしょう…

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

プロジェクションを使用してこれらのクエリを高速化できます。このデータセットの例については["Projections"](/data-modeling/projections)を参照してください。

### Playgroundでテスト {#playground}

データセットは[オンラインプレイグラウンド](https://sql.clickhouse.com?query_id=TRCWH5ZETY4SEEK8ISCCAX)でも利用可能です。
