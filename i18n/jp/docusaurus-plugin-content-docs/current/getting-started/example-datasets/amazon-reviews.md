---
description: '1億5,000万件以上のAmazon商品のカスタマーレビュー'
sidebar_label: 'Amazonカスタマーレビュー'
slug: /getting-started/example-datasets/amazon-reviews
title: 'Amazonカスタマーレビュー'
doc_type: 'guide'
keywords: ['Amazon reviews', 'customer reviews dataset', 'e-commerce data', 'example dataset', 'getting started']
---

このデータセットには、Amazon商品のカスタマーレビューが1億5,000万件以上含まれています。データはAWS S3上のSnappy圧縮されたParquetファイルとして提供されており、圧縮後の合計サイズは49GBです。これをClickHouseに取り込む手順を順を追って説明します。

:::note
以下のクエリは、ClickHouse Cloudの**Production**インスタンス上で実行されました。詳細については
["Playground specifications"](/getting-started/playground#specifications) を参照してください。
:::



## データセットの読み込み {#loading-the-dataset}

1. ClickHouseにデータを挿入することなく、その場でクエリを実行できます。いくつかの行を取得して、どのような内容か確認してみましょう:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet')
LIMIT 3
```

行は次のようになります:

```response
Row 1:
──────
review_date:       16462
marketplace:       US
customer_id:       25444946 -- 25.44 million
review_id:         R146L9MMZYG0WA
product_id:        B00NV85102
product_parent:    908181913 -- 908.18 million
product_title:     XIKEZAN iPhone 6 Plus 5.5 inch Waterproof Case, Shockproof Dirtproof Snowproof Full Body Skin Case Protective Cover with Hand Strap & Headphone Adapter & Kickstand
product_category:  Wireless
star_rating:       4
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   ケースは頑丈で、望み通りに保護してくれる
review_body:       防水機能は当てにしていません(底部のゴムシールは気になったので外しました)。しかし、ケースは頑丈で、望み通りに保護してくれます。

Row 2:
──────
review_date:       16462
marketplace:       US
customer_id:       1974568 -- 1.97 million
review_id:         R2LXDXT293LG1T
product_id:        B00OTFZ23M
product_parent:    951208259 -- 951.21 million
product_title:     Season.C Chicago Bulls Marilyn Monroe No.1 Hard Back Case Cover for Samsung Galaxy S5 i9600
product_category:  Wireless
star_rating:       1
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   星1つ
review_body:       ケースが携帯電話に対して大きすぎて使えません。お金の無駄でした!

Row 3:
──────
review_date:       16462
marketplace:       US
customer_id:       24803564 -- 24.80 million
review_id:         R7K9U5OEIRJWR
product_id:        B00LB8C4U4
product_parent:    524588109 -- 524.59 million
product_title:     iPhone 5s Case, BUDDIBOX [Shield] Slim Dual Layer Protective Case with Kickstand for Apple iPhone 5 and 5s
product_category:  Wireless
star_rating:       4
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   しかし全体的にこのケースはかなり頑丈で、携帯電話をしっかり保護してくれる
review_body:       最初は前面部分を携帯電話に固定するのが少し難しかったですが、全体的にこのケースはかなり頑丈で、携帯電話をしっかり保護してくれます。これが私の必要としているものです。このケースをまた購入したいと思います。
```

2. このデータをClickHouseに保存するために、`amazon_reviews`という名前の新しい`MergeTree`テーブルを定義しましょう:

```sql
CREATE DATABASE amazon

CREATE TABLE amazon.amazon_reviews
(
    `review_date` Date,
    `marketplace` LowCardinality(String),
    `customer_id` UInt64,
    `review_id` String,
    `product_id` String,
    `product_parent` UInt64,
    `product_title` String,
    `product_category` LowCardinality(String),
    `star_rating` UInt8,
    `helpful_votes` UInt32,
    `total_votes` UInt32,
    `vine` Bool,
    `verified_purchase` Bool,
    `review_headline` String,
    `review_body` String,
    PROJECTION helpful_votes
    (
        SELECT *
        ORDER BY helpful_votes
    )
)
ENGINE = MergeTree
ORDER BY (review_date, product_category)
```

3. 以下の`INSERT`コマンドは`s3Cluster`テーブル関数を使用しており、クラスタのすべてのノードを使用して複数のS3ファイルを並列処理できます。また、ワイルドカードを使用して、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet`という名前で始まるすべてのファイルを挿入します:

```sql
INSERT INTO amazon.amazon_reviews SELECT *
FROM s3Cluster('default',
'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet')
```


:::tip
ClickHouse Cloud では、クラスタ名は `default` です。`default` をお使いのクラスタ名に変更するか、クラスタがない場合は `s3Cluster` の代わりに `s3` テーブル関数を使用してください。
:::

5. このクエリはそれほど時間がかからず、平均で毎秒約 300,000 行を処理します。5 分程度で、すべての行が挿入されていることを確認できるはずです。

```sql runnable
SELECT formatReadableQuantity(count())
FROM amazon.amazon_reviews
```

6. データがどれくらいの領域を使用しているか確認してみましょう。

```sql runnable
SELECT
    disk_name,
    formatReadableSize(sum(data_compressed_bytes) AS size) AS compressed,
    formatReadableSize(sum(data_uncompressed_bytes) AS usize) AS uncompressed,
    round(usize / size, 2) AS compr_rate,
    sum(rows) AS rows,
    count() AS part_count
FROM system.parts
WHERE (active = 1) AND (table = 'amazon_reviews')
GROUP BY disk_name
ORDER BY size DESC
```

元のデータは約 70G でしたが、ClickHouse で圧縮すると約 30G に収まりました。


## クエリ例 {#example-queries}

7. いくつかのクエリを実行してみましょう。データセット内で最も役立つレビューのトップ10は以下の通りです：

```sql runnable
SELECT
    product_title,
    review_headline
FROM amazon.amazon_reviews
ORDER BY helpful_votes DESC
LIMIT 10
```

:::note
このクエリは、パフォーマンスを向上させるために[プロジェクション](/data-modeling/projections)を使用しています。
:::

8. Amazonで最もレビュー数が多い製品のトップ10は以下の通りです：

```sql runnable
SELECT
    any(product_title),
    count()
FROM amazon.amazon_reviews
GROUP BY product_id
ORDER BY 2 DESC
LIMIT 10;
```

9. 各製品の月ごとの平均レビュー評価は以下の通りです（実際の[Amazonの面接問題](https://datalemur.com/questions/sql-avg-review-ratings)です！）：

```sql runnable
SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon.amazon_reviews
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20;
```

10. 製品カテゴリごとの総投票数は以下の通りです。このクエリは、`product_category`がプライマリキーに含まれているため高速に実行されます：

```sql runnable
SELECT
    sum(total_votes),
    product_category
FROM amazon.amazon_reviews
GROUP BY product_category
ORDER BY 1 DESC
```

11. レビュー内で**「awful」**という単語が最も頻繁に出現する製品を見つけてみましょう。これは大規模なタスクです - 1億5100万以上の文字列を解析して1つの単語を検索する必要があります：

```sql runnable settings={'enable_parallel_replicas':1}
SELECT
    product_id,
    any(product_title),
    avg(star_rating),
    count() AS count
FROM amazon.amazon_reviews
WHERE position(review_body, 'awful') > 0
GROUP BY product_id
ORDER BY count DESC
LIMIT 50;
```

このような大量のデータに対するクエリ時間に注目してください。結果も興味深い内容です！

12. 同じクエリを再度実行できますが、今回はレビュー内で**「awesome」**を検索します：

```sql runnable settings={'enable_parallel_replicas':1}
SELECT
    product_id,
    any(product_title),
    avg(star_rating),
    count() AS count
FROM amazon.amazon_reviews
WHERE position(review_body, 'awesome') > 0
GROUP BY product_id
ORDER BY count DESC
LIMIT 50;
```
