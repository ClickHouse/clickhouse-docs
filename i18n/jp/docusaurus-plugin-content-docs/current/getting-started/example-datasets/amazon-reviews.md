description: 'Amazon商品の顧客レビューが1.5億件以上'
sidebar_label: 'Amazon顧客レビュー'
slug: /getting-started/example-datasets/amazon-reviews
title: 'Amazon顧客レビュー'
```

このデータセットには、Amazon商品の顧客レビューが1.5億件以上含まれています。データは、AWS S3のsnappy圧縮されたParquetファイルにあり、合計サイズは49GB（圧縮済み）です。データをClickHouseに挿入する手順を見ていきましょう。

:::note
以下のクエリは、**Production**インスタンスのClickHouse Cloud上で実行されました。詳細については、["Playground specifications"](/getting-started/playground#specifications)を参照してください。
:::

## データセットの読み込み {#loading-the-dataset}

1. データをClickHouseに挿入せずに、インプレースでクエリできます。幾つかの行を取得して、どのようなものか見てみましょう：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet')
LIMIT 3
```

行は以下のようになります：

```response
行 1:
──────
review_date:       16462
marketplace:       US
customer_id:       25444946 -- 25.44百万
review_id:         R146L9MMZYG0WA
product_id:        B00NV85102
product_parent:    908181913 -- 908.18百万
product_title:     XIKEZAN iPhone 6 Plus 5.5 inch Waterproof Case, Shockproof Dirtproof Snowproof Full Body Skin Case Protective Cover with Hand Strap & Headphone Adapter & Kickstand
product_category:  Wireless
star_rating:       4
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   ケースは頑丈で、私が望むように保護します
review_body:       防水部分をあまり信頼していません（下のゴムシールが煩わしくて取り外しました）。でも、ケースは頑丈で、私が望むように保護します。

行 2:
──────
review_date:       16462
marketplace:       US
customer_id:       1974568 -- 1.97百万
review_id:         R2LXDXT293LG1T
product_id:        B00OTFZ23M
product_parent:    951208259 -- 951.21百万
product_title:     Season.C Chicago Bulls Marilyn Monroe No.1 Hard Back Case Cover for Samsung Galaxy S5 i9600
product_category:  Wireless
star_rating:       1
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   一つ星
review_body:       ケースが電話に対して大きすぎて使えません。お金の無駄です！

行 3:
──────
review_date:       16462
marketplace:       US
customer_id:       24803564 -- 24.80百万
review_id:         R7K9U5OEIRJWR
product_id:        B00LB8C4U4
product_parent:    524588109 -- 524.59百万
product_title:     iPhone 5s Case, BUDDIBOX [Shield] Slim Dual Layer Protective Case with Kickstand for Apple iPhone 5 and 5s
product_category:  Wireless
star_rating:       4
helpful_votes:     0
total_votes:       0
vine:              false
verified_purchase: true
review_headline:   でも全体的にこのケースはかなり頑丈で電話を良く保護します
review_body:       前面のパーツは最初電話に固定するのが少し難しかったですが、全体的にこのケースはかなり頑丈で電話を良く保護します。私が必要としているものです。このケースをもう一度買います。
```

2. 次に、ClickHouseにこのデータを保存するために、新しい `MergeTree` テーブル `amazon_reviews` を定義します：

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

3. 次の `INSERT` コマンドは `s3Cluster` テーブル関数を使用しており、クラスタの全ノードを使用して複数のS3ファイルを並行処理できます。また、ワイルドカードを使用して、名前が `https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet` で始まるファイルを挿入します：

```sql
INSERT INTO amazon.amazon_reviews SELECT *
FROM s3Cluster('default', 
'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet')
```

:::tip
ClickHouse Cloudでは、クラスタの名前は `default` です。自分のクラスタ名に `default` を変更するか、クラスタがなくても `s3` テーブル関数（`s3Cluster` の代わりに）を使用してください。
:::

5. このクエリにはあまり時間がかからず、平均して1秒あたり約30万行が処理されます。5分程度で全ての行が挿入されるはずです：

```sql runnable
SELECT formatReadableQuantity(count())
FROM amazon.amazon_reviews
```

6. データがどれくらいのスペースを使用しているか確認しましょう：

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

元のデータは約70Gでしたが、ClickHouseでは圧縮されて約30Gを占めています。

## 例のクエリ {#example-queries}

7. クエリをいくつか実行してみましょう。データセット内の最も助けになるレビュー上位10件です：

```sql runnable
SELECT
    product_title,
    review_headline
FROM amazon.amazon_reviews
ORDER BY helpful_votes DESC
LIMIT 10
```

:::note
このクエリはパフォーマンスを向上させるための[プロジェクション](/data-modeling/projections)を使用しています。
:::

8. Amazonでレビューが最も多い商品上位10件です：

```sql runnable
SELECT
    any(product_title),
    count()
FROM amazon.amazon_reviews
GROUP BY product_id
ORDER BY 2 DESC
LIMIT 10;
```

9. 各商品の月ごとの平均レビュー評価を表示します（実際の[Amazonの面接質問](https://datalemur.com/questions/sql-avg-review-ratings)!）：

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

10. 商品カテゴリごとの投票数の合計です。このクエリは `product_category` が主キーにあるため高速です：

```sql runnable
SELECT
    sum(total_votes),
    product_category
FROM amazon.amazon_reviews
GROUP BY product_category
ORDER BY 1 DESC
```

11. レビューに「**awful**」という単語が最も頻繁に出現する商品を見つけましょう。これは大きな作業で、1.51億件以上の文字列を解析して特定の単語を探す必要があります：

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

このような大規模なデータの場合、クエリ時間に注目してください。結果も楽しい読み物です！

12. 今度は同じクエリを実行しますが、レビューの中で「**awesome**」を検索します：

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
