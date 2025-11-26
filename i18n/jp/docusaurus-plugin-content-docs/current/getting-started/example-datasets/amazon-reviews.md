---
description: '1億5,000万件を超えるAmazon商品のカスタマーレビュー'
sidebar_label: 'Amazon カスタマーレビュー'
slug: /getting-started/example-datasets/amazon-reviews
title: 'Amazon カスタマーレビュー'
doc_type: 'guide'
keywords: ['Amazon reviews', 'customer reviews dataset', 'e-commerce data', 'example dataset', 'getting started']
---

このデータセットには、1億5,000万件を超える Amazon 商品のカスタマーレビューが含まれています。データは、合計 49GB（圧縮時）の Snappy で圧縮された Parquet ファイルとして AWS S3 上に保存されています。これを ClickHouse に挿入する手順を順に見ていきます。

:::note
以下のクエリは、**Production** インスタンスの ClickHouse Cloud 上で実行されました。詳細については
["Playground specifications"](/getting-started/playground#specifications)
を参照してください。
:::



## データセットの読み込み

1. データを ClickHouse に挿入しなくても、その場でクエリできます。どのようなデータか確認するために、いくつか行を取得してみましょう。

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet')
LIMIT 3
```

行は次のような形式です。

```response
Row 1:
──────
review_date:       16462
marketplace:       US
customer_id:       25444946 -- 2544万
review_id:         R146L9MMZYG0WA
product_id:        B00NV85102
product_parent:    908181913 -- 9億818万
product_title:     XIKEZAN iPhone 6 Plus 5.5インチ防水ケース、耐衝撃・防塵・防雪フルボディ保護カバー ハンドストラップ・ヘッドフォンアダプター・キックスタンド付き
product_category:  Wireless
star_rating:       4
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   ケースは頑丈で期待通りの保護性能
review_body:       防水機能は期待していない(底部のゴムシールが煩わしかったので外した)。しかしケースは頑丈で期待通りの保護性能がある。

Row 2:
──────
review_date:       16462
marketplace:       US
customer_id:       1974568 -- 197万
review_id:         R2LXDXT293LG1T
product_id:        B00OTFZ23M
product_parent:    951208259 -- 9億5121万
product_title:     Season.C Chicago Bulls Marilyn Monroe No.1 ハードバックケースカバー Samsung Galaxy S5 i9600用
product_category:  Wireless
star_rating:       1
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   星1つ
review_body:       ケースが携帯電話に対して大きすぎて使えない。金の無駄!

Row 3:
──────
review_date:       16462
marketplace:       US
customer_id:       24803564 -- 2480万
review_id:         R7K9U5OEIRJWR
product_id:        B00LB8C4U4
product_parent:    524588109 -- 5億2459万
product_title:     iPhone 5sケース、BUDDIBOX [Shield] スリム二層保護ケース キックスタンド付き Apple iPhone 5および5s用
product_category:  Wireless
star_rating:       4
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   しかし全体的にこのケースはかなり頑丈で携帯電話をしっかり保護してくれる
review_body:       最初は前面パーツを携帯電話に固定するのが少し難しかったが、全体的にこのケースはかなり頑丈で携帯電話をしっかり保護してくれる。これは私が求めていたものだ。このケースをまた購入したい。
```

2. このデータを ClickHouse に保存するため、`amazon_reviews` という名前の新しい `MergeTree` テーブルを定義します。

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

3. 次の `INSERT` コマンドは `s3Cluster` テーブル関数を使用しており、クラスター内のすべてのノードを使って複数の S3 ファイルを並列に処理できます。また、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet` という名前で始まるあらゆるファイルを挿入するためにワイルドカードも使用しています。

```sql
INSERT INTO amazon.amazon_reviews SELECT *
FROM s3Cluster('default', 
'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet')
```


:::tip
ClickHouse Cloud では、クラスタ名は `default` です。`default` をご利用のクラスタ名に変更するか、クラスタをお持ちでない場合は、`s3Cluster` の代わりに `s3` テーブル関数を使用してください。
:::

5. このクエリはそれほど時間はかからず、平均して毎秒約 300,000 行の速度で実行されます。5 分もすれば、すべての行が挿入されているはずです。

```sql runnable
SELECT formatReadableQuantity(count())
FROM amazon.amazon_reviews
```

6. データがどの程度の容量を使用しているか確認します:

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

元のデータは約 70G でしたが、ClickHouse で圧縮すると約 30G に収まります。


## クエリ例

7. いくつかクエリを実行してみましょう。以下は、このデータセット内で最も役立つレビューのトップ 10 件です。

```sql runnable
SELECT
    product_title,
    review_headline
FROM amazon.amazon_reviews
ORDER BY helpful_votes DESC
LIMIT 10
```

:::note
このクエリは、パフォーマンスを向上させるために [プロジェクション](/data-modeling/projections) を使用しています。
:::

8. Amazon でレビュー数が最も多い商品の上位 10 件は次のとおりです。

```sql runnable
SELECT
    any(product_title),
    count()
FROM amazon.amazon_reviews
GROUP BY product_id
ORDER BY 2 DESC
LIMIT 10;
```

9. 各商品の月別平均レビュー評価は次のとおりです（これは実際の [Amazon の採用面接の質問](https://datalemur.com/questions/sql-avg-review-ratings)です！）：

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

10. 以下は製品カテゴリごとの投票数の合計です。`product_category` が主キーに含まれているため、このクエリは高速に実行できます。

```sql runnable
SELECT
    sum(total_votes),
    product_category
FROM amazon.amazon_reviews
GROUP BY product_category
ORDER BY 1 DESC
```

11. レビューで **「awful」** という単語が最も頻繁に使われている商品を探します。これは大規模な処理で、1 億 5,100 万以上の文字列を対象に、1 つの単語を探して解析する必要があります。

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

このような大量のデータに対するクエリ時間に注目してください。結果も読んでいてなかなか面白い内容です。

12. 同じクエリをもう一度実行しますが、今度はレビュー内の **awesome** を検索します。

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
