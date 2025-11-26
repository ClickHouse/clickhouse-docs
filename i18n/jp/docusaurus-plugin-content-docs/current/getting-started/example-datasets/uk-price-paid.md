---
description: 'イングランドおよびウェールズの不動産物件の支払価格データを含む UK property データセットを使用して、頻繁に実行するクエリのパフォーマンスを projections 機能で向上させる方法を解説します'
sidebar_label: 'UK 不動産価格'
slug: /getting-started/example-datasets/uk-price-paid
title: 'UK 不動産価格データセット'
doc_type: 'guide'
keywords: ['サンプルデータセット', 'uk 不動産', 'サンプルデータ', '不動産', 'はじめに']
---

このデータには、イングランドおよびウェールズの不動産物件に対して支払われた価格が含まれています。データは 1995 年以降のものが利用可能で、データセットの非圧縮サイズは約 4 GiB です（ClickHouse では約 278 MiB で格納されます）。

- 取得元: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- 項目の説明: https://www.gov.uk/guidance/about-the-price-paid-data
- HM Land Registry のデータを含みます © Crown copyright and database right 2021。このデータは Open Government Licence v3.0 の下でライセンスされています。



## テーブルを作成

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


## データの前処理と挿入

`url` 関数を使用して、データを ClickHouse にストリーミングします。まず、受信データの一部を前処理する必要があります。内容は次のとおりです:

* `postcode` を 2 つの別のカラム `postcode1` と `postcode2` に分割する（ストレージ効率とクエリ効率が向上するため）
* `time` フィールドが 00:00 の時刻しか含まないため、日付に変換する
* 分析には不要なため、[UUID](../../sql-reference/data-types/uuid.md) フィールドを無視する
* [transform](../../sql-reference/functions/other-functions.md#transform) 関数を使用して、`type` と `duration` を、より読みやすい `Enum` フィールドに変換する
* `is_new` フィールドを、1 文字の文字列 (`Y`/`N`) から、0 または 1 を持つ [UInt8](/sql-reference/data-types/int-uint) フィールドに変換する
* すべて同じ値（0）であるため、最後の 2 つのカラムを削除する

`url` 関数は、ウェブサーバーから ClickHouse のテーブルにデータをストリーミングします。次のコマンドは、`uk_price_paid` テーブルに 500 万行を挿入します:

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

データの挿入が完了するまで待ってください。ネットワーク速度によっては、1～2分ほどかかることがあります。


## データを検証する

挿入された行数を確認して、正しく動作したかどうかを検証します。

```sql runnable
SELECT count()
FROM uk.uk_price_paid
```

このクエリを実行した時点で、データセットの行数は 27,450,499 行でした。ClickHouse のテーブルのストレージサイズを確認してみましょう。

```sql runnable
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = 'uk_price_paid'
```

テーブルサイズがわずか 221.43 MiB であることに注目してください。


## いくつかのクエリを実行する

データを分析するために、いくつかのクエリを実行します。

### クエリ 1. 年ごとの平均価格

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

### クエリ 2. ロンドンの年ごとの平均価格

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

2020年には住宅価格に何かが起きました！とはいえ、おそらく驚くことではないでしょう……

### クエリ3. 最も価格の高い地域

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

これらのクエリはプロジェクションを使用することで高速化できます。このデータセットを使った例については [Projections](/data-modeling/projections) を参照してください。

### Playground で試してみる {#playground}

このデータセットは [Online Playground](https://sql.clickhouse.com?query_id=TRCWH5ZETY4SEEK8ISCCAX) からも利用できます。
