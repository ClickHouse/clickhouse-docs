---
'title': 'S3バケット内のデータをクエリする方法'
'sidebar_label': 'S3でのデータクエリ'
'slug': '/chdb/guides/querying-s3'
'description': 'chDBを使用してS3バケット内のデータをクエリする方法を学びましょう。'
'keywords':
- 'chdb'
- 's3'
'doc_type': 'guide'
---

A lot of the world's data lives in Amazon S3 buckets.  
このガイドでは、chDBを使用してそのデータをクエリする方法を学びます。

## Setup {#setup}

まず、仮想環境を作成します：

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、chDBをインストールします。  
バージョン2.0.2以上であることを確認してください：

```bash
pip install "chdb>=2.0.2"
```

次に、IPythonをインストールします：

```bash
pip install ipython
```

このガイドの残りの部分のコマンドを実行するために`ipython`を使用します。次のコマンドを実行して起動できます：

```bash
ipython
```

コードはPythonスクリプトやお気に入りのノートブックでも使用できます。

## Listing files in an S3 bucket {#listing-files-in-an-s3-bucket}

最初に、[Amazonレビューを含むS3バケット](/getting-started/example-datasets/amazon-reviews)内のすべてのファイルをリストします。  
これを行うために、[`s3` テーブル関数](/sql-reference/table-functions/s3)を使用し、ファイルへのパスまたは一連のファイルに対するワイルドカードを渡します。

:::tip  
バケット名だけを渡すと、例外が発生します。  
:::

また、ファイルが解析されず、ファイルごとに1行が返され、`_file`仮想カラムを使用してファイルにアクセスし、`_path`仮想カラムを使用してパスにアクセスできるように[`One`](/interfaces/formats#data-format-one)入力フォーマットを使用します。

```python
import chdb

chdb.query("""
SELECT
    _file,
    _path
FROM s3('s3://datasets-documentation/amazon_reviews/*.parquet', One)
SETTINGS output_format_pretty_row_numbers=0
""", 'PrettyCompact')
```

```text
┌─_file───────────────────────────────┬─_path─────────────────────────────────────────────────────────────────────┐
│ amazon_reviews_2010.snappy.parquet  │ datasets-documentation/amazon_reviews/amazon_reviews_2010.snappy.parquet  │
│ amazon_reviews_1990s.snappy.parquet │ datasets-documentation/amazon_reviews/amazon_reviews_1990s.snappy.parquet │
│ amazon_reviews_2013.snappy.parquet  │ datasets-documentation/amazon_reviews/amazon_reviews_2013.snappy.parquet  │
│ amazon_reviews_2015.snappy.parquet  │ datasets-documentation/amazon_reviews/amazon_reviews_2015.snappy.parquet  │
│ amazon_reviews_2014.snappy.parquet  │ datasets-documentation/amazon_reviews/amazon_reviews_2014.snappy.parquet  │
│ amazon_reviews_2012.snappy.parquet  │ datasets-documentation/amazon_reviews/amazon_reviews_2012.snappy.parquet  │
│ amazon_reviews_2000s.snappy.parquet │ datasets-documentation/amazon_reviews/amazon_reviews_2000s.snappy.parquet │
│ amazon_reviews_2011.snappy.parquet  │ datasets-documentation/amazon_reviews/amazon_reviews_2011.snappy.parquet  │
└─────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────┘
```

このバケットにはParquetファイルのみが含まれています。

## Querying files in an S3 bucket {#querying-files-in-an-s3-bucket}

次に、それらのファイルをクエリする方法を学びます。  
各ファイルの行数をカウントしたい場合は、次のクエリを実行できます：

```python
chdb.query("""
SELECT
    _file,
    count() AS count,
    formatReadableQuantity(count) AS readableCount    
FROM s3('s3://datasets-documentation/amazon_reviews/*.parquet')
GROUP BY ALL
SETTINGS output_format_pretty_row_numbers=0
""", 'PrettyCompact')
```

```text
┌─_file───────────────────────────────┬────count─┬─readableCount───┐
│ amazon_reviews_2013.snappy.parquet  │ 28034255 │ 28.03 million   │
│ amazon_reviews_1990s.snappy.parquet │   639532 │ 639.53 thousand │
│ amazon_reviews_2011.snappy.parquet  │  6112495 │ 6.11 million    │
│ amazon_reviews_2015.snappy.parquet  │ 41905631 │ 41.91 million   │
│ amazon_reviews_2012.snappy.parquet  │ 11541011 │ 11.54 million   │
│ amazon_reviews_2000s.snappy.parquet │ 14728295 │ 14.73 million   │
│ amazon_reviews_2014.snappy.parquet  │ 44127569 │ 44.13 million   │
│ amazon_reviews_2010.snappy.parquet  │  3868472 │ 3.87 million    │
└─────────────────────────────────────┴──────────┴─────────────────┘
```

HTTP URIをS3バケットに渡すこともでき、同じ結果が得られます：

```python
chdb.query("""
SELECT
    _file,
    count() AS count,
    formatReadableQuantity(count) AS readableCount    
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/*.parquet')
GROUP BY ALL
SETTINGS output_format_pretty_row_numbers=0
""", 'PrettyCompact')
```

`DESCRIBE`句を使用してこれらのParquetファイルのスキーマを確認してみましょう：

```python
chdb.query("""
DESCRIBE s3('s3://datasets-documentation/amazon_reviews/*.parquet')
SETTINGS describe_compact_output=1
""", 'PrettyCompact')
```

```text
    ┌─name──────────────┬─type─────────────┐
 1. │ review_date       │ Nullable(UInt16) │
 2. │ marketplace       │ Nullable(String) │
 3. │ customer_id       │ Nullable(UInt64) │
 4. │ review_id         │ Nullable(String) │
 5. │ product_id        │ Nullable(String) │
 6. │ product_parent    │ Nullable(UInt64) │
 7. │ product_title     │ Nullable(String) │
 8. │ product_category  │ Nullable(String) │
 9. │ star_rating       │ Nullable(UInt8)  │
10. │ helpful_votes     │ Nullable(UInt32) │
11. │ total_votes       │ Nullable(UInt32) │
12. │ vine              │ Nullable(Bool)   │
13. │ verified_purchase │ Nullable(Bool)   │
14. │ review_headline   │ Nullable(String) │
15. │ review_body       │ Nullable(String) │
    └───────────────────┴──────────────────┘
```

では、レビュー数に基づいてトップ商品カテゴリを計算し、平均スター評価を計算します：

```python
chdb.query("""
SELECT product_category, count() AS reviews, round(avg(star_rating), 2) as avg
FROM s3('s3://datasets-documentation/amazon_reviews/*.parquet')
GROUP BY ALL
LIMIT 10
""", 'PrettyCompact')
```

```text
    ┌─product_category─┬──reviews─┬──avg─┐
 1. │ Toys             │  4864056 │ 4.21 │
 2. │ Apparel          │  5906085 │ 4.11 │
 3. │ Luggage          │   348644 │ 4.22 │
 4. │ Kitchen          │  4880297 │ 4.21 │
 5. │ Books            │ 19530930 │ 4.34 │
 6. │ Outdoors         │  2302327 │ 4.24 │
 7. │ Video            │   380596 │ 4.19 │
 8. │ Grocery          │  2402365 │ 4.31 │
 9. │ Shoes            │  4366757 │ 4.24 │
10. │ Jewelry          │  1767667 │ 4.14 │
    └──────────────────┴──────────┴──────┘
```

## Querying files in a private S3 bucket {#querying-files-in-a-private-s3-bucket}

プライベートS3バケット内のファイルをクエリする場合、アクセスキーとシークレットを渡す必要があります。  
これらの資格情報を`s3`テーブル関数に渡すことができます：

```python
chdb.query("""
SELECT product_category, count() AS reviews, round(avg(star_rating), 2) as avg
FROM s3('s3://datasets-documentation/amazon_reviews/*.parquet', 'access-key', 'secret')
GROUP BY ALL
LIMIT 10
""", 'PrettyCompact')
```

:::note  
このクエリは、パブリックバケットであるため機能しません！  
:::

別の方法は、[名前付きコレクション](/operations/named-collections)を使用することですが、このアプローチはまだchDBではサポートされていません。
