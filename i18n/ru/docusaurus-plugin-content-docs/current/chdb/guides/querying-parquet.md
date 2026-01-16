---
title: 'Как выполнять запросы к файлам Parquet'
sidebar_label: 'Запросы к файлам Parquet'
slug: /chdb/guides/querying-parquet
description: 'Узнайте, как выполнять запросы к файлам Parquet с помощью chDB.'
keywords: ['chdb', 'parquet']
doc_type: 'guide'
---

Значительная часть мировых данных хранится в бакетах Amazon S3.
В этом руководстве вы узнаете, как выполнять запросы к этим данным с помощью chDB.

## Настройка \\{#setup\\}

Сначала создадим виртуальное окружение:

```bash
python -m venv .venv
source .venv/bin/activate
```

Теперь установим chDB.
Убедитесь, что у вас установлена версия 2.0.2 или выше:

```bash
pip install "chdb>=2.0.2"
```

Теперь установим IPython:

```bash
pip install ipython
```

Мы будем использовать `ipython` для выполнения команд в оставшейся части этого руководства. Запустить его можно следующей командой:

```bash
ipython
```

Вы также можете использовать этот код в скрипте на Python или в вашем любимом ноутбуке (например, Jupyter Notebook).

## Исследуем метаданные Parquet \\{#exploring-parquet-metadata\\}

Мы будем исследовать файл Parquet из набора данных [Amazon reviews](/getting-started/example-datasets/amazon-reviews).
Но сначала давайте установим `chDB`:

```python
import chdb
```

При выполнении запросов к файлам Parquet мы можем использовать формат ввода [`ParquetMetadata`](/interfaces/formats/ParquetMetadata), чтобы получать метаданные Parquet вместо содержимого файла.
Давайте используем предложение `DESCRIBE`, чтобы посмотреть, какие поля возвращаются при использовании этого формата:

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

Теперь давайте посмотрим на метаданные этого файла.
И `columns`, и `row_groups` содержат массивы кортежей с множеством свойств, поэтому пока мы их опустим.

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

Из этого вывода мы узнаём, что этот файл Parquet содержит более 40 миллионов строк, разделённых на 42 группы строк, с 15 столбцами данных в каждой строке.
Группа строк — это логическое горизонтальное разбиение данных на строки.
У каждой группы строк есть связанные с ней метаданные, и инструменты для выполнения запросов могут использовать эти метаданные для эффективного выполнения запросов к файлу.

Давайте рассмотрим одну из групп строк:

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

## Запросы к файлам Parquet \\{#querying-parquet-files\\}

Теперь давайте выполним запрос к содержимому файла.
Мы можем сделать это, изменив приведённый выше запрос, убрав из него `ParquetMetadata` и затем, например, вычислив самое популярное значение `star_rating` по всем отзывам:

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

Интересно, что отзывов на 5 звёзд больше, чем всех остальных оценок вместе взятых!
Похоже, людям нравятся товары на Amazon, а если нет — они просто не ставят оценку.
