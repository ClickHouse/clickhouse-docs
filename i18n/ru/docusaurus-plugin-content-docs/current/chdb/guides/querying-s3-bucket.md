---
title: 'Как выполнять запросы к данным в бакете S3'
sidebar_label: 'Запросы к данным в S3'
slug: /chdb/guides/querying-s3
description: 'Узнайте, как выполнять запросы к данным в бакете S3 с помощью chDB.'
keywords: ['chdb', 's3']
doc_type: 'guide'
---

Значительная часть данных в мире хранится в бакетах Amazon S3.
В этом руководстве вы узнаете, как выполнять запросы к этим данным с помощью chDB.



## Настройка {#setup}

Сначала создадим виртуальное окружение:

```bash
python -m venv .venv
source .venv/bin/activate
```

Теперь установим chDB.
Убедитесь, что установлена версия 2.0.2 или выше:

```bash
pip install "chdb>=2.0.2"
```

Теперь установим IPython:

```bash
pip install ipython
```

Для выполнения команд в остальной части руководства мы будем использовать `ipython`. Запустить его можно следующей командой:

```bash
ipython
```

Код также можно использовать в скрипте Python или в вашей любимой среде для работы с ноутбуками.


## Получение списка файлов в S3-бакете {#listing-files-in-an-s3-bucket}

Начнем с получения списка всех файлов в [S3-бакете, содержащем отзывы Amazon](/getting-started/example-datasets/amazon-reviews).
Для этого можно использовать [табличную функцию `s3`](/sql-reference/table-functions/s3) и передать путь к файлу или шаблон для набора файлов.

:::tip
Если передать только имя бакета, будет выброшено исключение.
:::

Также будет использован входной формат [`One`](/interfaces/formats/One), чтобы файл не парсился. Вместо этого для каждого файла возвращается одна строка, и можно получить доступ к имени файла через виртуальную колонку `_file`, а к пути — через виртуальную колонку `_path`.

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

Далее рассмотрим, как выполнять запросы к этим файлам.
Чтобы подсчитать количество строк в каждом из этих файлов, можно выполнить следующий запрос:

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

Также можно передать HTTP URI бакета S3 и получить те же результаты:

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

Рассмотрим схему этих файлов Parquet с помощью оператора `DESCRIBE`:

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

Теперь вычислим топ категорий товаров по количеству отзывов, а также рассчитаем средний рейтинг:

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
 1. │ Игрушки          │  4864056 │ 4.21 │
 2. │ Одежда           │  5906085 │ 4.11 │
 3. │ Багаж            │   348644 │ 4.22 │
 4. │ Кухня            │  4880297 │ 4.21 │
 5. │ Книги            │ 19530930 │ 4.34 │
 6. │ Товары для отдыха│  2302327 │ 4.24 │
 7. │ Видео            │   380596 │ 4.19 │
 8. │ Продукты         │  2402365 │ 4.31 │
 9. │ Обувь            │  4366757 │ 4.24 │
10. │ Ювелирные изделия│  1767667 │ 4.14 │
    └──────────────────┴──────────┴──────┘
```


## Запрос файлов из приватного S3-бакета {#querying-files-in-a-private-s3-bucket}

Для запроса файлов из приватного S3-бакета необходимо передать ключ доступа и секретный ключ.
Эти учетные данные можно передать в табличную функцию `s3`:

```python
chdb.query("""
SELECT product_category, count() AS reviews, round(avg(star_rating), 2) as avg
FROM s3('s3://datasets-documentation/amazon_reviews/*.parquet', 'access-key', 'secret')
GROUP BY ALL
LIMIT 10
""", 'PrettyCompact')
```

:::note
Этот запрос не будет работать, так как это публичный бакет!
:::

Альтернативный способ — использование [именованных коллекций](/operations/named-collections), однако этот подход пока не поддерживается в chDB.
