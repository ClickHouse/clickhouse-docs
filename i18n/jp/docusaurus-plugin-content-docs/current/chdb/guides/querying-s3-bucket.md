---
title: S3バケット内のデータをクエリする方法
sidebar_label: S3でのデータクエリ
slug: /chdb/guides/querying-s3
description: chDBを使ってS3バケット内のデータをクエリする方法を学びます。
keywords: [chdb, s3]
---

世界中の多くのデータはAmazon S3バケット内に存在しています。
このガイドでは、chDBを使用してそのデータをクエリする方法を学びます。

## セットアップ {#setup}

まずは仮想環境を作成しましょう：

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

ガイドの残りの部分ではコマンドを実行するために`ipython`を使用します。次のように実行して起動できます：

```bash
ipython
```

Pythonスクリプトやお気に入りのノートブックでコードを使うこともできます。

## S3バケット内のファイルのリストを取得する {#listing-files-in-an-s3-bucket}

まずは、[Amazonレビューを含むS3バケット](/getting-started/example-datasets/amazon-reviews)内のすべてのファイルをリストアップします。
これを行うために、[`s3`テーブル関数](/sql-reference/table-functions/s3)を使用し、ファイルのパスまたはファイルセットのワイルドカードを渡すことができます。

:::tip
バケット名だけを渡すと例外が発生します。
:::

また、`One`という入力フォーマットを使用して、ファイルを解析せず、ファイルごとに単一の行を返し、`_file`仮想カラムを通じてファイルにアクセスし、`_path`仮想カラムを通じてパスにアクセスできるようにします。

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

## S3バケット内のファイルをクエリする {#querying-files-in-an-s3-bucket}

次に、これらのファイルをクエリする方法を学びましょう。
各ファイルの行数をカウントする場合、以下のクエリを実行します：

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

HTTP URIをS3バケットに渡すと、同じ結果が得られます：

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

`DESCRIBE`句を使ってこれらのParquetファイルのスキーマを確認してみましょう：

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

レビュー数に基づいて主要な製品カテゴリを計算し、平均星評価を計算してみましょう：

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

## プライベートS3バケット内のファイルをクエリする {#querying-files-in-a-private-s3-bucket}

プライベートS3バケット内のファイルをクエリする場合、アクセスキーとシークレットを渡す必要があります。
これらの認証情報を`s3`テーブル関数に渡すことができます：

```python
chdb.query("""
SELECT product_category, count() AS reviews, round(avg(star_rating), 2) as avg
FROM s3('s3://datasets-documentation/amazon_reviews/*.parquet', 'access-key', 'secret')
GROUP BY ALL
LIMIT 10
""", 'PrettyCompact')
```

:::note
このクエリは、パブリックバケットなので動作しません！
:::

別の方法として、[名前付きコレクション](/operations/named-collections)を使用することができますが、このアプローチはchDBではまだサポートされていません。
