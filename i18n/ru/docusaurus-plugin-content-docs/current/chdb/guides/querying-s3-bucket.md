---
title: 'Как запрашивать данные в бакете S3'
sidebar_label: 'Запрос данных в S3'
slug: /chdb/guides/querying-s3
description: 'Узнайте, как запрашивать данные в бакете S3 с помощью chDB.'
keywords: ['chdb', 's3']
---

Большая часть данных в мире хранится в бакетах Amazon S3.
В этом руководстве мы научимся запрашивать эти данные, используя chDB.

## Настройка {#setup}

Сначала создадим виртуальное окружение:

```bash
python -m venv .venv
source .venv/bin/activate
```

А теперь установим chDB.
Убедитесь, что у вас версия 2.0.2 или выше:

```bash
pip install "chdb>=2.0.2"
```

Теперь мы установим IPython:

```bash
pip install ipython
```

Мы будем использовать `ipython` для выполнения команд в остальной части руководства, который можно запустить, выполнив:

```bash
ipython
```

Вы также можете использовать код в Python-скрипте или в вашем любимом блокноте.

## Перечисление файлов в бакете S3 {#listing-files-in-an-s3-bucket}

Давайте начнем с перечисления всех файлов в [бакете S3, который содержит отзывы Amazon](/getting-started/example-datasets/amazon-reviews).
Для этого мы можем использовать [`s3` табличную функцию](/sql-reference/table-functions/s3) и передать путь к файлу или шаблон для набора файлов.

:::tip
Если вы передадите только имя бакета, возникнет исключение.
:::

Мы также будем использовать [`One`](/interfaces/formats#data-format-one) формат ввода, чтобы файл не разбирался, вместо этого возвращалась одна строка на файл, и мы могли получить доступ к файлу через виртуальную колонку `_file`, а путь через виртуальную колонку `_path`.

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

Этот бакет содержит только файлы Parquet.

## Запрос файлов в бакете S3 {#querying-files-in-an-s3-bucket}

Теперь давайте узнаем, как запрашивать эти файлы.
Если мы хотим подсчитать количество строк в каждом из этих файлов, мы можем выполнить следующий запрос:

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

Мы также можем передать HTTP URI для бакета S3 и получить те же результаты:

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

Давайте взглянем на схему этих файлов Parquet, используя оператор `DESCRIBE`:

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

Теперь давайте вычислим топовые категории продуктов на основе количества отзывов, а также вычислим среднюю звезду:

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

## Запрос файлов в приватном бакете S3 {#querying-files-in-a-private-s3-bucket}

Если мы запрашиваем файлы в приватном бакете S3, нам нужно передать ключ доступа и секрет.
Мы можем передать эти учетные данные в таблицу `s3`:

```python
chdb.query("""
SELECT product_category, count() AS reviews, round(avg(star_rating), 2) as avg
FROM s3('s3://datasets-documentation/amazon_reviews/*.parquet', 'access-key', 'secret')
GROUP BY ALL
LIMIT 10
""", 'PrettyCompact')
```

:::note
Этот запрос не будет работать, потому что это публичный бакет!
:::

Альтернативный способ - использовать [именованные коллекции](/operations/named-collections), но этот подход пока не поддерживается chDB.
