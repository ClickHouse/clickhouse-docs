---
description: '1億5,000万件以上のAmazon商品のカスタマーレビュー'
sidebar_label: 'Amazon カスタマーレビュー'
slug: /getting-started/example-datasets/amazon-reviews
title: 'Amazon カスタマーレビュー'
doc_type: 'guide'
keywords: ['Amazon レビュー', 'カスタマーレビュー データセット', 'eコマース データ', 'サンプルデータセット', 'はじめに']
---

このデータセットには、Amazon 商品に対する1億5,000万件以上のカスタマーレビューが含まれています。データは AWS S3 上の snappy で圧縮された Parquet ファイルとして提供されており、圧縮後の合計サイズは 49GB です。これを ClickHouse に取り込む手順を順を追って確認していきます。

:::note
以下のクエリは、**Production** 環境の ClickHouse Cloud インスタンス上で実行されています。詳細については
["Playground specifications"](/getting-started/playground#specifications)
を参照してください。
:::

## データセットの読み込み

1. データを ClickHouse に挿入しなくても、元の場所に対して直接クエリを実行できます。どのようなデータか確認するために、いくつか行を取得してみましょう。

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet')
LIMIT 3
```

行は次のような形になります：

```response
Row 1:
──────
review_date:       16462
marketplace:       US
customer_id:       25444946 -- 2544万
review_id:         R146L9MMZYG0WA
product_id:        B00NV85102
product_parent:    908181913 -- 9億818万
product_title:     XIKEZAN iPhone 6 Plus 5.5 inch Waterproof Case, Shockproof Dirtproof Snowproof Full Body Skin Case Protective Cover with Hand Strap & Headphone Adapter & Kickstand
product_category:  Wireless
star_rating:       4
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   ケースは頑丈で期待通りの保護性能
review_body:       防水機能は期待していない(底部のゴムシールが煩わしかったので外した)。しかしケースは頑丈で、期待通りの保護性能を発揮してくれる。

Row 2:
──────
review_date:       16462
marketplace:       US
customer_id:       1974568 -- 197万
review_id:         R2LXDXT293LG1T
product_id:        B00OTFZ23M
product_parent:    951208259 -- 9億5121万
product_title:     Season.C Chicago Bulls Marilyn Monroe No.1 Hard Back Case Cover for Samsung Galaxy S5 i9600
product_category:  Wireless
star_rating:       1
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   星1つ
review_body:       ケースがスマートフォンに対して大きすぎて使用できない。金の無駄!

Row 3:
──────
review_date:       16462
marketplace:       US
customer_id:       24803564 -- 2480万
review_id:         R7K9U5OEIRJWR
product_id:        B00LB8C4U4
product_parent:    524588109 -- 5億2459万
product_title:     iPhone 5s Case, BUDDIBOX [Shield] Slim Dual Layer Protective Case with Kickstand for Apple iPhone 5 and 5s
product_category:  Wireless
star_rating:       4
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   全体的にはかなり頑丈でスマートフォンをしっかり保護してくれる
review_body:       最初は前面パーツをスマートフォンに固定するのが少し難しかったが、全体的にはこのケースはかなり頑丈で、スマートフォンをしっかり保護してくれる。これが私に必要なものだ。このケースをまた購入するだろう。
```

2. このデータを格納するために、ClickHouse に `amazon_reviews` という名前の新しい `MergeTree` テーブルを定義します。

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

3. 次の `INSERT` コマンドでは、`s3Cluster` テーブル関数を使用します。これにより、クラスター内のすべてのノードを使って複数の S3 ファイルを並列に処理できます。また、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet` という名前で始まるすべてのファイルを挿入するために、ワイルドカードも使用します。

```sql
INSERT INTO amazon.amazon_reviews SELECT *
FROM s3Cluster('default', 
'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet')
```


:::tip
ClickHouse Cloud では、クラスター名は `default` です。`default` を環境のクラスター名に置き換えてください。クラスターがない場合は、`s3Cluster` の代わりに `s3` テーブル関数を使用してください。
:::

5. このクエリはそれほど時間がかからず、平均で毎秒約 300,000 行を処理します。およそ 5 分以内に、すべての行が挿入されていることを確認できるはずです。

```sql runnable
SELECT formatReadableQuantity(count())
FROM amazon.amazon_reviews
```

6. データがどれくらいの容量を使用しているか確認しましょう。

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

元のデータは約 70G ありましたが、ClickHouse で圧縮されると約 30G に収まります。


## クエリ例

7. クエリをいくつか実行してみましょう。こちらは、このデータセットで最も役に立ったレビューの上位 10 件です。

```sql runnable
SELECT
    product_title,
    review_headline
FROM amazon.amazon_reviews
ORDER BY helpful_votes DESC
LIMIT 10
```

:::note
このクエリは、パフォーマンスを向上させるために [projection](/data-modeling/projections) を使用しています。
:::

8. Amazon でレビュー数が最も多い商品のトップ 10 は次のとおりです。

```sql runnable
SELECT
    any(product_title),
    count()
FROM amazon.amazon_reviews
GROUP BY product_id
ORDER BY 2 DESC
LIMIT 10;
```

9. 各商品の月ごとの平均レビュー評価は次のとおりです（実際の[Amazonの採用面接で出題された質問](https://datalemur.com/questions/sql-avg-review-ratings)！）：

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

10. 各商品カテゴリごとの投票総数は次のとおりです。`product_category` が主キーに含まれているため、このクエリは高速です。

```sql runnable
SELECT
    sum(total_votes),
    product_category
FROM amazon.amazon_reviews
GROUP BY product_category
ORDER BY 1 DESC
```

11. レビューの中で単語 **&quot;awful&quot;** が最も頻繁に出現している商品を探します。これは大規模な処理で、単一の単語を探すために 1 億 5,100 万以上の文字列をパースする必要があります。

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

このような大量のデータに対するクエリ時間に注目してください。結果も読んでみるとなかなか楽しいはずです。

12. 同じクエリをもう一度実行しますが、今度はレビューの中から **awesome** を検索してみます。

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
