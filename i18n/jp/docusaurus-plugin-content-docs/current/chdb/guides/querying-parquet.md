---
'title': 'Parquetファイルをクエリする方法'
'sidebar_label': 'Parquetファイルのクエリ'
'slug': '/chdb/guides/querying-parquet'
'description': 'chDBを使ってParquetファイルをクエリする方法を学びましょう。'
'keywords':
- 'chdb'
- 'parquet'
'doc_type': 'guide'
---

A lot of the world's data lives in Amazon S3 buckets.  
このガイドでは、chDBを使用してそのデータをクエリする方法を学びます。

## Setup {#setup}

まず、仮想環境を作成しましょう：

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、chDBをインストールします。  
バージョン2.0.2以上を使用していることを確認してください：

```bash
pip install "chdb>=2.0.2"
```

次に、IPythonをインストールします：

```bash
pip install ipython
```

このガイドの残りの部分でコマンドを実行するために `ipython` を使用します。  
`ipython` を起動するには、次のコマンドを実行します：

```bash
ipython
```

Pythonスクリプトまたはお気に入りのノートブックでもコードを使用できます。

## Exploring Parquet metadata {#exploring-parquet-metadata}

[Amazon reviews](/getting-started/example-datasets/amazon-reviews) データセットのParquetファイルを探りますが、まずは `chDB` をインストールしましょう：

```python
import chdb
```

Parquetファイルをクエリする際、[`ParquetMetadata`](/interfaces/formats/ParquetMetadata) 入力フォーマットを使用して、ファイルの内容ではなくParquetメタデータを返すことができます。  
このフォーマットを使用したときに返されるフィールドを見るために `DESCRIBE` 句を使用してみましょう：

```python
query = """
DESCRIBE s3(
  'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet', 
  ParquetMetadata
)
SETTINGS describe_compact_output=1
"""

chdb.query(query, 'TabSeparated')
```

```text
num_columns     UInt64
num_rows        UInt64
num_row_groups  UInt64
format_version  String
metadata_size   UInt64
total_uncompressed_size UInt64
total_compressed_size   UInt64
columns Array(Tuple(name String, path String, max_definition_level UInt64, max_repetition_level UInt64, physical_type String, logical_type String, compression String, total_uncompressed_size UInt64, total_compressed_size UInt64, space_saved String, encodings Array(String)))
row_groups      Array(Tuple(num_columns UInt64, num_rows UInt64, total_uncompressed_size UInt64, total_compressed_size UInt64, columns Array(Tuple(name String, path String, total_compressed_size UInt64, total_uncompressed_size UInt64, have_statistics Bool, statistics Tuple(num_values Nullable(UInt64), null_count Nullable(UInt64), distinct_count Nullable(UInt64), min Nullable(String), max Nullable(String))))))
```

このファイルのメタデータを見てみましょう。  
`columns` と `row_groups` は多くのプロパティを含むタプルの配列を持っているため、今はそれらを除外します。

```python
query = """
SELECT * EXCEPT(columns, row_groups)
FROM s3(
  'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet', 
  ParquetMetadata
)
"""

chdb.query(query, 'Vertical')
```

```text
Row 1:
──────
num_columns:             15
num_rows:                41905631
num_row_groups:          42
format_version:          2.6
metadata_size:           79730
total_uncompressed_size: 14615827169
total_compressed_size:   9272262304
```

この出力から、このParquetファイルには4,000万行以上があり、42の行グループに分割され、各行に15のカラムのデータがあることがわかります。  
行グループは、データを行に水平に論理的にパーティショニングしたものです。  
各行グループには関連するメタデータがあり、クエリツールはそのメタデータを利用してファイルを効率的にクエリすることができます。

行グループの1つを見てみましょう：

```python
query = """
WITH rowGroups AS (
    SELECT rg
    FROM s3(
    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet',
    ParquetMetadata
    )
    ARRAY JOIN row_groups AS rg
    LIMIT 1
)
SELECT tupleElement(c, 'name') AS name, tupleElement(c, 'total_compressed_size') AS total_compressed_size, 
       tupleElement(c, 'total_uncompressed_size') AS total_uncompressed_size,
       tupleElement(tupleElement(c, 'statistics'), 'min') AS min,
       tupleElement(tupleElement(c, 'statistics'), 'max') AS max
FROM rowGroups
ARRAY JOIN tupleElement(rg, 'columns') AS c
"""

chdb.query(query, 'DataFrame')
```

```text
                 name  total_compressed_size  total_uncompressed_size                                                min                                                max
0         review_date                    493                      646                                              16455                                              16472
1         marketplace                     66                       64                                                 US                                                 US
2         customer_id                5207967                  7997207                                              10049                                           53096413
3           review_id               14748425                 17991290                                     R10004U8OQDOGE                                      RZZZUTBAV1RYI
4          product_id                8003456                 13969668                                         0000032050                                         BT00DDVMVQ
5      product_parent                5758251                  7974737                                                645                                          999999730
6       product_title               41068525                 63355320  ! Small S 1pc Black 1pc Navy (Blue) Replacemen...                            🌴 Vacation On The Beach
7    product_category                   1726                     1815                                            Apparel                                       Pet Products
8         star_rating                 369036                   374046                                                  1                                                  5
9       helpful_votes                 538940                  1022990                                                  0                                               3440
10        total_votes                 610902                  1080520                                                  0                                               3619
11               vine                  11426                   125999                                                  0                                                  1
12  verified_purchase                 102634                   125999                                                  0                                                  1
13    review_headline               16538189                 27634740                                                     🤹🏽‍♂️🎤Great product. Practice makes perfect. D...
14        review_body              145886383                232457911                                                                                              🚅 +🐧=💥 😀
```

## Querying Parquet files {#querying-parquet-files}

次に、ファイルの内容をクエリします。  
上記のクエリを調整して `ParquetMetadata` を削除し、全てのレビューの中で最も人気のある `star_rating` を計算することができます：

```python
query = """
SELECT star_rating, count() AS count, formatReadableQuantity(count)
FROM s3(
  'https://datasets-documentation.s3.eu-west-3.amazonaws.com/amazon_reviews/amazon_reviews_2015.snappy.parquet'
)
GROUP BY ALL
ORDER BY star_rating
"""

chdb.query(query, 'DataFrame')
```

```text
   star_rating     count formatReadableQuantity(count())
0            1   3253070                    3.25 million
1            2   1865322                    1.87 million
2            3   3130345                    3.13 million
3            4   6578230                    6.58 million
4            5  27078664                   27.08 million
```

興味深いことに、5つ星のレビューはすべての他の評価の合計よりも多いです！  
人々はAmazonの商品を好きなのか、そうでなければ評価を提出しないだけのようです。
