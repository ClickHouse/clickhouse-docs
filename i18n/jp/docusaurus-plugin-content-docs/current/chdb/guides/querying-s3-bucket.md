---
title: 'S3バケット内のデータをクエリする方法'
sidebar_label: 'S3内のデータをクエリ'
slug: /chdb/guides/querying-s3
description: 'chDBを使用してS3バケット内のデータをクエリする方法を学びます。'
keywords: ['chdb', 's3']
---
```

世界のデータの多くはAmazon S3バケットに存在します。  
このガイドでは、chDBを使用してそのデータをクエリする方法を学びます。

## セットアップ {#setup}

まず、仮想環境を作成します：

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、chDBをインストールします。  
バージョン2.0.2以上が必要です：

```bash
pip install "chdb>=2.0.2"
```

次に、IPythonをインストールします：

```bash
pip install ipython
```

これからこのガイドの残りのコマンドを実行するために `ipython` を使用します。  
以下のコマンドを実行して起動できます：

```bash
ipython
```

また、Pythonスクリプトやお気に入りのノートブックでもコードを使用できます。

## S3バケット内のファイルのリスト表示 {#listing-files-in-an-s3-bucket}

まず、[Amazonレビューが含まれるS3バケット]( /getting-started/example-datasets/amazon-reviews )内のすべてのファイルをリスト表示します。  
これを行うには、[`s3` テーブル関数]( /sql-reference/table-functions/s3 )を使用し、ファイルへのパスまたはファイルのセットへのワイルドカードを渡すことができます。

:::tip
バケット名だけを渡すと例外が発生します。
:::

また、ファイルが解析されないように[`One`]( /interfaces/formats#data-format-one )入力フォーマットを使用し、ファイルごとに1行が返されるようにします。  
私たちは `_file` 仮想カラムを介してファイルにアクセスし、`_path` 仮想カラムを介してパスにアクセスできます。

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

このバケットには、Parquetファイルのみが含まれています。

## S3バケット内のファイルをクエリする {#querying-files-in-an-s3-bucket}

次に、これらのファイルをクエリする方法を学びましょう。  
各ファイルの行数をカウントしたい場合、以下のクエリを実行できます：

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

HTTP URIを使用してS3バケットを渡すこともでき、同じ結果が得られます：

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

これらのParquetファイルのスキーマを `DESCRIBE` 句を使用して確認しましょう：

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

レビュー数に基づいて主要な製品カテゴリを計算し、平均スター評価も計算してみましょう：

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
これらの資格情報を `s3` テーブル関数に渡すことができます：

```python
chdb.query("""
SELECT product_category, count() AS reviews, round(avg(star_rating), 2) as avg
FROM s3('s3://datasets-documentation/amazon_reviews/*.parquet', 'access-key', 'secret')
GROUP BY ALL
LIMIT 10
""", 'PrettyCompact')
```

:::note
このクエリは、パブリックバケットのため機能しません！
:::

代わりに、[名前付きコレクション]( /operations/named-collections )を使用する方法もありますが、このアプローチはchDBでまだサポートされていません。
