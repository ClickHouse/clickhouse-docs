---
'description': '150M以上のアマゾン製品のカスタマー レビュー'
'sidebar_label': 'アマゾン カスタマー レビュー'
'slug': '/getting-started/example-datasets/amazon-reviews'
'title': 'アマゾン カスタマー レビュー'
'doc_type': 'reference'
---

このデータセットには、Amazon製品に関する1億5千万件以上の顧客レビューが含まれています。データはAWS S3内のスナッピー圧縮されたParquetファイルにあり、合計サイズは49GB（圧縮後）です。このデータをClickHouseに挿入する手順を見ていきましょう。

:::note
以下のクエリは**Production**インスタンスのClickHouse Cloudで実行されました。詳細については
["Playground specifications"](/getting-started/playground#specifications)を参照してください。
:::

## データセットの読み込み {#loading-the-dataset}

1. データをClickHouseに挿入せずに、その場でクエリを実行できます。いくつかの行を取得して、どのように見えるか確認しましょう：

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet')
LIMIT 3
```

行は次のようになります：

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
review_headline:   case is sturdy and protects as I want
review_body:       I won't count on the waterproof part (I took off the rubber seals at the bottom because the got on my nerves). But the case is sturdy and protects as I want.

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
review_headline:   One Star
review_body:       Cant use the case because its big for the phone. Waist of money!

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
review_headline:   but overall this case is pretty sturdy and provides good protection for the phone
review_body:       The front piece was a little difficult to secure to the phone at first, but overall this case is pretty sturdy and provides good protection for the phone, which is what I need. I would buy this case again.
```

2. このデータをClickHouseに格納するために、`amazon_reviews`という新しい`MergeTree`テーブルを定義しましょう：

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

3. 次の`INSERT`コマンドは、`s3Cluster`テーブル関数を使用しています。これにより、クラスターのすべてのノードを使用して複数のS3ファイルを並行して処理できます。また、`https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet`という名前で始まる任意のファイルを挿入するためにワイルドカードも使用します：

```sql
INSERT INTO amazon.amazon_reviews SELECT *
FROM s3Cluster('default', 
'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_*.snappy.parquet')
```

:::tip
ClickHouse Cloudでは、クラスターの名前は`default`です。`default`をクラスターの名前に変更するか、クラスターがない場合は`s3`テーブル関数を使用してください（`s3Cluster`の代わりに）。
:::

5. このクエリはあまり時間がかからず、平均して約30万行/秒で処理されます。5分ほどで全ての行が挿入されるはずです：

```sql runnable
SELECT formatReadableQuantity(count())
FROM amazon.amazon_reviews
```

6. データがどれくらいのスペースを使用しているか見てみましょう：

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

元のデータは約70Gでしたが、ClickHouseで圧縮されると約30Gを占めます。

## サンプルクエリ {#example-queries}

7. いくつかのクエリを実行してみましょう。データセット内で最も役立つレビューの上位10件は次のとおりです：

```sql runnable
SELECT
    product_title,
    review_headline
FROM amazon.amazon_reviews
ORDER BY helpful_votes DESC
LIMIT 10
```

:::note
このクエリはパフォーマンスを向上させるために[プロジェクション](/data-modeling/projections)を使用しています。
:::

8. Amazonでレビュー数が最も多い上位10製品は次のとおりです：

```sql runnable
SELECT
    any(product_title),
    count()
FROM amazon.amazon_reviews
GROUP BY product_id
ORDER BY 2 DESC
LIMIT 10;
```

9. 各製品の月ごとの平均レビュー評価は次のとおりです（実際の[Amazonのジョブ面接問題](https://datalemur.com/questions/sql-avg-review-ratings)!）：

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

10. 製品カテゴリごとの合計票数は次のとおりです。このクエリは`product_category`が主キーに含まれているため高速です：

```sql runnable
SELECT
    sum(total_votes),
    product_category
FROM amazon.amazon_reviews
GROUP BY product_category
ORDER BY 1 DESC
```

11. レビューに最も頻繁に出現する**"awful"**という単語が含まれる製品を見つけましょう。これは大きなタスクで、1億5千万以上の文字列を解析して単語を探す必要があります：

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

このような大量のデータのクエリ時間に注意してください。結果はまた楽しい読み物でもあります！

12. 同じクエリを再度実行できますが、今回はレビュー内で**awesome**を検索します：

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
