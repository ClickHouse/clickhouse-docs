---
title: 'Вывод схемы JSON'
slug: /integrations/data-formats/json/inference
description: 'Как использовать вывод схемы JSON'
keywords: ['json', 'schema', 'inference', 'schema inference']
---

ClickHouse может автоматически определить структуру данных JSON. Это можно использовать для запросов к данным JSON непосредственно, например, на диске с помощью `clickhouse-local` или S3-бакетов, и/или автоматически создавать схемы перед загрузкой данных в ClickHouse.

## Когда использовать вывод типов {#when-to-use-type-inference}

* **Последовательная структура** - Данные, из которых вы собираетесь выводить типы, содержат все колонки, которые вас интересуют. Данные с добавленными дополнительными колонками после вывода типов будут проигнорированы и не могут быть запрошены.
* **Совместимые типы** - Типы данных для определенных колонок должны быть совместимыми.

:::note Важно
Если у вас более динамичный JSON, в который новые ключи добавляются без достаточного предупреждения для изменения схемы, например, метки Kubernetes в логах, мы рекомендуем прочитать [**Разработка схемы JSON**](/integrations/data-formats/json/schema).
:::

## Обнаружение типов {#detecting-types}

В наших предыдущих примерах использовалась простая версия набора данных [Python PyPI](https://clickpy.clickhouse.com/) в формате NDJSON. В этом разделе мы исследуем более сложный набор данных с вложенными структурами - набор данных [arXiv](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download), содержащий 2.5 миллиона научных статей. Каждая строка в этом наборе данных, распределенном как NDJSON, представляет собой опубликованную академическую статью. Пример строки показан ниже:

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "Number Parsing at a Gigabyte per Second",
  "comments": "Software at https://github.com/fastfloat/fast_float and\n  https://github.com/lemire/simple_fastfloat_benchmark/",
  "journal-ref": "Software: Practice and Experience 51 (8), 2021",
  "doi": "10.1002/spe.2984",
  "report-no": null,
  "categories": "cs.DS cs.MS",
  "license": "http://creativecommons.org/licenses/by/4.0/",
  "abstract": "With disks and networks providing gigabytes per second ....\n",
  "versions": [
    {
      "created": "Mon, 11 Jan 2021 20:31:27 GMT",
      "version": "v1"
    },
    {
      "created": "Sat, 30 Jan 2021 23:57:29 GMT",
      "version": "v2"
    }
  ],
  "update_date": "2022-11-07",
  "authors_parsed": [
    [
      "Lemire",
      "Daniel",
      ""
    ]
  ]
}
```

Эти данные требуют гораздо более сложной схемы, чем предыдущие примеры. Мы описываем процесс определения этой схемы ниже, вводя сложные типы, такие как `Tuple` и `Array`.

Этот набор данных хранится в публичном S3-бакете по адресу `s3://datasets-documentation/arxiv/arxiv.json.gz`.

Вы можете увидеть, что указанный набор данных содержит вложенные объекты JSON. Хотя пользователи должны разрабатывать и версии их схем, вывод типов позволяет выводить типы из данных. Это позволяет автоматически генерировать DDL схемы, избегая необходимости создавать ее вручную и ускоряя процесс разработки.

:::note Автоопределение формата
Кроме определения схемы, вывод схемы JSON автоматически выводит формат данных по расширению файла и содержимому. Указанный файл автоматически определяется как NDJSON в результате.
:::

Использование функции [s3](/sql-reference/table-functions/s3) с командой `DESCRIBE` показывает типы, которые будут выведены.

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS describe_compact_output = 1
```
```response
┌─name───────────┬─type────────────────────────────────────────────────────────────────────┐
│ id             │ Nullable(String)                                                        │
│ submitter      │ Nullable(String)                                                        │
│ authors        │ Nullable(String)                                                        │
│ title          │ Nullable(String)                                                        │
│ comments       │ Nullable(String)                                                        │
│ journal-ref    │ Nullable(String)                                                        │
│ doi            │ Nullable(String)                                                        │
│ report-no      │ Nullable(String)                                                        │
│ categories     │ Nullable(String)                                                        │
│ license        │ Nullable(String)                                                        │
│ abstract       │ Nullable(String)                                                        │
│ versions       │ Array(Tuple(created Nullable(String),version Nullable(String)))         │
│ update_date    │ Nullable(Date)                                                          │
│ authors_parsed │ Array(Array(Nullable(String)))                                          │
└────────────────┴─────────────────────────────────────────────────────────────────────────┘
```
:::note Избегайте null
Вы можете видеть, что многие колонки определены как Nullable. Мы [не рекомендуем использовать тип Nullable](/sql-reference/data-types/nullable#storage-features), когда это не абсолютно необходимо. Вы можете использовать [schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable), чтобы контролировать поведение, когда применяется Nullable.
:::

Мы можем видеть, что большинство колонок автоматически определены как `String`, а колонка `update_date` правильно определена как `Date`. Колонка `versions` была создана как `Array(Tuple(created String, version String))` для хранения списка объектов, а `authors_parsed` определяется как `Array(Array(String))` для вложенных массивов.

:::note Управление обнаружением типов
Автоопределение дат и временных отметок можно контролировать через настройки [`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates) и [`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes) соответственно (обе включены по умолчанию). Вывод объектов как кортежей контролируется настройкой [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects). Другие настройки, которые контролируют вывод схемы для JSON, такие как автоопределение чисел, можно найти [здесь](/interfaces/schema-inference#text-formats).
:::

## Запросы к JSON {#querying-json}

Мы можем полагаться на вывод схемы для запросов к данным JSON на месте. Ниже мы находим наиболее цитируемых авторов за каждый год, используя то, что даты и массивы автоматически определяются.

```sql
SELECT
    toYear(update_date) AS year,
    authors,
    count() AS c
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
GROUP BY
    year,
    authors
ORDER BY
    year ASC,
    c DESC
LIMIT 1 BY year

┌─year─┬─authors────────────────────────────────────┬───c─┐
│ 2007 │ The BABAR Collaboration, B. Aubert, et al  │  98 │
│ 2008 │ The OPAL collaboration, G. Abbiendi, et al │  59 │
│ 2009 │ Ashoke Sen                                 │  77 │
│ 2010 │ The BABAR Collaboration, B. Aubert, et al  │ 117 │
│ 2011 │ Amelia Carolina Sparavigna                 │  21 │
│ 2012 │ ZEUS Collaboration                         │ 140 │
│ 2013 │ CMS Collaboration                          │ 125 │
│ 2014 │ CMS Collaboration                          │  87 │
│ 2015 │ ATLAS Collaboration                        │ 118 │
│ 2016 │ ATLAS Collaboration                        │ 126 │
│ 2017 │ CMS Collaboration                          │ 122 │
│ 2018 │ CMS Collaboration                          │ 138 │
│ 2019 │ CMS Collaboration                          │ 113 │
│ 2020 │ CMS Collaboration                          │  94 │
│ 2021 │ CMS Collaboration                          │  69 │
│ 2022 │ CMS Collaboration                          │  62 │
│ 2023 │ ATLAS Collaboration                        │ 128 │
│ 2024 │ ATLAS Collaboration                        │ 120 │
└──────┴────────────────────────────────────────────┴─────┘

18 rows in set. Elapsed: 20.172 sec. Processed 2.52 million rows, 1.39 GB (124.72 thousand rows/s., 68.76 MB/s.)
```

Вывод схемы позволяет нам запрашивать JSON-файлы без необходимости указывать схему, ускоряя выполнение задач анализа данных ad-hoc.

## Создание таблиц {#creating-tables}

Мы можем полагаться на вывод схемы для создания схемы таблицы. Следующая команда `CREATE AS EMPTY` вызывает вывод DDL для таблицы и создает таблицу. Это не загружает никаких данных:

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS schema_inference_make_columns_nullable = 0
```

Чтобы подтвердить схему таблицы, мы используем команду `SHOW CREATE TABLE`:

```sql
SHOW CREATE TABLE arxiv

CREATE TABLE arxiv
(
    `id` String,
    `submitter` String,
    `authors` String,
    `title` String,
    `comments` String,
    `journal-ref` String,
    `doi` String,
    `report-no` String,
    `categories` String,
    `license` String,
    `abstract` String,
    `versions` Array(Tuple(created String, version String)),
    `update_date` Date,
    `authors_parsed` Array(Array(String))
)
ENGINE = MergeTree
ORDER BY update_date
```

Выше приведена правильная схема для этих данных. Вывод схемы основан на выборке данных и чтении данных по строкам. Значения колонок извлекаются в соответствии с форматом, при этом используются рекурсивные парсеры и эвристики для определения типа каждого значения. Максимальное количество строк и байтов, читаемых из данных во время вывода схемы, контролируется настройками [`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference) (по умолчанию 25000) и [`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference) (по умолчанию 32MB). В случае неправильного обнаружения пользователи могут предоставить подсказки, как указано [здесь](/operations/settings/formats#schema_inference_make_columns_nullable).

### Создание таблиц из фрагментов {#creating-tables-from-snippets}

В приведенном выше примере используется файл на S3 для создания схемы таблицы. Пользователи могут захотеть создать схему из фрагмента с одной строкой. Это можно сделать, используя функцию [format](/sql-reference/table-functions/format), как показано ниже:

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM format(JSONEachRow, '{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Number Parsing at a Gigabyte per Second","comments":"Software at https://github.com/fastfloat/fast_float and","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"Withdisks and networks providing gigabytes per second ","versions":[{"created":"Mon, 11 Jan 2021 20:31:27 GMT","version":"v1"},{"created":"Sat, 30 Jan 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}') SETTINGS schema_inference_make_columns_nullable = 0

SHOW CREATE TABLE arxiv

CREATE TABLE arxiv
(
    `id` String,
    `submitter` String,
    `authors` String,
    `title` String,
    `comments` String,
    `doi` String,
    `report-no` String,
    `categories` String,
    `license` String,
    `abstract` String,
    `versions` Array(Tuple(created String, version String)),
    `update_date` Date,
    `authors_parsed` Array(Array(String))
)
ENGINE = MergeTree
ORDER BY update_date
```

## Загрузка данных JSON {#loading-json-data}

Предыдущие команды создали таблицу, в которую можно загружать данные. Теперь вы можете вставить данные в вашу таблицу, используя следующее `INSERT INTO SELECT`:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

Для примеров загрузки данных из других источников, например, файла, смотрите [здесь](/sql-reference/statements/insert-into).

После загрузки мы можем запрашивать наши данные, по желанию используя формат `PrettyJSONEachRow`, чтобы показать строки в их первоначальной структуре:

```sql
SELECT *
FROM arxiv
LIMIT 1
FORMAT PrettyJSONEachRow

{
    "id": "0704.0004",
    "submitter": "David Callan",
    "authors": "David Callan",
    "title": "A determinant of Stirling cycle numbers counts unlabeled acyclic",
    "comments": "11 pages",
    "journal-ref": "",
    "doi": "",
    "report-no": "",
    "categories": "math.CO",
    "license": "",
    "abstract": "  We show that a determinant of Stirling cycle numbers counts unlabeled acyclic\nsingle-source automata.",
    "versions": [
        {
            "created": "Sat, 31 Mar 2007 03:16:14 GMT",
            "version": "v1"
        }
    ],
    "update_date": "2007-05-23",
    "authors_parsed": [
        [
            "Callan",
            "David"
        ]
    ]
}

1 row in set. Elapsed: 0.009 sec.
```

## Обработка ошибок {#handling-errors}

Иногда у вас могут быть некорректные данные. Например, определенные колонки могут не иметь правильного типа или неправильно отформатированный JSON. Для этого вы можете использовать настройку [`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio), чтобы разрешить игнорирование определенного числа строк, если данные вызывают ошибки вставки. Кроме того, [подсказки](/operations/settings/formats#schema_inference_hints) могут быть предоставлены для помощи в выводе.

## Дополнительные материалы {#further-reading}

Чтобы узнать больше о выводе типов данных, вы можете обратиться к [этой странице документации](/interfaces/schema-inference).
