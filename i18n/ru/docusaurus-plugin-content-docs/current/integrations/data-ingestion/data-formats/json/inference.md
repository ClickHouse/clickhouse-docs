---
title: 'Вывод схемы JSON'
slug: /integrations/data-formats/json/inference
description: 'Как использовать вывод схемы JSON'
keywords: ['json', 'schema', 'inference', 'schema inference']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

ClickHouse может автоматически определить структуру JSON-данных. Это можно использовать для запроса JSON-данных напрямую, например, на диске с помощью `clickhouse-local` или на S3, и/или для автоматического создания схем перед загрузкой данных в ClickHouse.

## Когда использовать вывод типов {#when-to-use-type-inference}

* **Последовательная структура** - Данные, из которых вы собираетесь выводить типы, содержат все ключи, которые вас интересуют. Вывод типов основан на выборке данных до [максимального количества строк](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference) или [байтов](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference). Данные после выборки с дополнительными столбцами будут игнорироваться и не могут быть запрошены.
* **Совместимые типы** - Типы данных для конкретных ключей должны быть совместимыми, т.е. должно быть возможно автоматически преобразовать один тип в другой.

Если у вас более динамический JSON, в который добавляются новые ключи и для одного и того же пути возможны несколько типов, смотрите ["Работа с полуструктурированными и динамическими данными"](/integrations/data-formats/json/inference#working-with-semi-structured-data).

## Определение типов {#detecting-types}

Следующее предполагает, что JSON имеет последовательную структуру и имеет единственный тип для каждого пути.

Наши предыдущие примеры использовали простую версию [наборов данных Python PyPI](https://clickpy.clickhouse.com/) в формате `NDJSON`. В этом разделе мы исследуем более сложный набор данных со вложенными структурами - [набор данных arXiv](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download), содержащий 2.5 миллиона научных работ. Каждая строка в этом наборе данных, распределенная в формате `NDJSON`, представляет собой опубликованную академическую статью. Пример строки показан ниже:

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "Обработка чисел со скоростью одного гигабайта в секунду",
  "comments": "Программное обеспечение на https://github.com/fastfloat/fast_float и\n https://github.com/lemire/simple_fastfloat_benchmark/",
  "journal-ref": "Software: Practice and Experience 51 (8), 2021",
  "doi": "10.1002/spe.2984",
  "report-no": null,
  "categories": "cs.DS cs.MS",
  "license": "http://creativecommons.org/licenses/by/4.0/",
  "abstract": "С дисками и сетями, обеспечивающими гигабайты в секунду ....\n",
  "versions": [
    {
      "created": "Пн, 11 Янв 2021 20:31:27 GMT",
      "version": "v1"
    },
    {
      "created": "Сб, 30 Янв 2021 23:57:29 GMT",
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

Эти данные требуют значительно более сложной схемы, чем предыдущие примеры. Мы описываем процесс определения этой схемы ниже, вводя сложные типы, такие как `Tuple` и `Array`.

Этот набор данных хранится в публичном S3 bucket по адресу `s3://datasets-documentation/arxiv/arxiv.json.gz`.

Вы можете увидеть, что вышеуказанный набор данных содержит вложенные JSON-объекты. Хотя пользователи должны составить и версионировать свои схемы, вывод позволяет типам быть выведенными из данных. Это позволяет автоматически генерировать DDL схемы, избегая необходимости создавать ее вручную и ускоряя процесс разработки.

:::note Автоопределение формата
Кроме определения схемы, вывод схемы JSON автоматически выведет формат данных из расширения файла и содержимого. Вышеуказанный файл определяется как NDJSON автоматически.
:::

Используя [функцию s3](/sql-reference/table-functions/s3) с командой `DESCRIBE`, мы можем увидеть типы, которые будут выведены.

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
Вы можете заметить, что многие столбцы определены как Nullable. Мы [не рекомендуем использовать Nullable](/sql-reference/data-types/nullable#storage-features) тип, когда это не абсолютно необходимо. Вы можете использовать [schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable), чтобы контролировать поведение, когда применяется Nullable.
:::

Мы видим, что большинство столбцов были автоматически определены как `String`, с правильно определенным столбцом `update_date` как `Date`. Столбец `versions` был создан как `Array(Tuple(created String, version String))`, чтобы хранить список объектов, а `authors_parsed` определяется как `Array(Array(String))` для вложенных массивов.

:::note Контроль определения типов
Автоопределение дат и временных меток можно контролировать с помощью настроек [`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates) и [`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes) соответственно (оба включены по умолчанию). Вывод объектов как кортежей контролируется настройкой [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects). Другие настройки, которые контролируют вывод схемы для JSON, такие как автоопределение чисел, можно найти [здесь](/interfaces/schema-inference#text-formats).
:::

## Запрос JSON {#querying-json}

Следующее предполагает, что JSON имеет последовательную структуру и имеет единственный тип для каждого пути.

Мы можем полагаться на вывод схемы для запроса JSON-данных на месте. Ниже мы находим ведущих авторов за каждый год, используя тот факт, что даты и массивы автоматически определяются.

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

Вывод схемы позволяет нам запрашивать JSON-файлы без необходимости указывать схему, ускоряя задачи анализа данных по запросу.

## Создание таблиц {#creating-tables}

Мы можем полагаться на вывод схемы для создания схемы таблицы. Следующая команда `CREATE AS EMPTY` вызывает вывод DDL для таблицы и создается таблица. Это не загружает никаких данных:

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

Выше представлена правильная схема для этих данных. Вывод схемы основан на выборке данных и чтении данных построчно. Значения столбцов извлекаются в соответствии с форматом, с использованием рекурсивных парсеров и эвристик для определения типа для каждого значения. Максимальное количество строк и байтов, считываемых из данных в выводе схемы, контролируется настройками [`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference) (по умолчанию 25000) и [`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference) (по умолчанию 32 МБ). В случае, если обнаружение не прошло успешно, пользователи могут предоставлять подсказки, как описано [здесь](/operations/settings/formats#schema_inference_make_columns_nullable).

### Создание таблиц из фрагментов {#creating-tables-from-snippets}

Вышеуказанный пример использует файл на S3 для создания схемы таблицы. Пользователи могут захотеть создать схему из фрагмента с единственной строкой. Это можно сделать с помощью функции [format](/sql-reference/table-functions/format), как показано ниже:

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM format(JSONEachRow, '{"id":"2101.11408","submitter":"Daniel Lemire","authors":"Daniel Lemire","title":"Обработка чисел со скоростью одного гигабайта в секунду","comments":"Программное обеспечение на https://github.com/fastfloat/fast_float и","doi":"10.1002/spe.2984","report-no":null,"categories":"cs.DS cs.MS","license":"http://creativecommons.org/licenses/by/4.0/","abstract":"С дисками и сетями, обеспечивающими гигабайты в секунду ","versions":[{"created":"Пн, 11 Янв 2021 20:31:27 GMT","version":"v1"},{"created":"Сб, 30 Янв 2021 23:57:29 GMT","version":"v2"}],"update_date":"2022-11-07","authors_parsed":[["Lemire","Daniel",""]]}') SETTINGS schema_inference_make_columns_nullable = 0

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

Следующее предполагает, что JSON имеет последовательную структуру и имеет единственный тип для каждого пути.

Предыдущие команды создали таблицу, в которую можно загружать данные. Теперь вы можете вставить данные в свою таблицу с помощью следующего `INSERT INTO SELECT`:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

Для примеров загрузки данных из других источников, например, файла, смотрите [здесь](/sql-reference/statements/insert-into).

После загрузки мы можем запрашивать наши данные, при необходимости используя формат `PrettyJSONEachRow`, чтобы показать строки в их оригинальной структуре:

```sql
SELECT *
FROM arxiv
LIMIT 1
FORMAT PrettyJSONEachRow

{
  "id": "0704.0004",
  "submitter": "David Callan",
  "authors": "David Callan",
  "title": "Определитель циклов Стирлинга учитывает неразмеченные ациклические",
  "comments": "11 страниц",
  "journal-ref": "",
  "doi": "",
  "report-no": "",
  "categories": "math.CO",
  "license": "",
  "abstract": "  Мы показываем, что определитель чисел циклов Стирлинга учитывает неразмеченные ациклические\nодномерные автоматы.",
  "versions": [
    {
      "created": "Сб, 31 Мар 2007 03:16:14 GMT",
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

Иногда у вас могут быть неверные данные. Например, в определенных столбцах данные могут не соответствовать правильному типу или JSON-объект может быть неправильно отформатирован. Для этого вы можете использовать настройки [`input_format_allow_errors_num`](/operations/settings/formats#input_format_allow_errors_num) и [`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio), чтобы разрешить определенное количество строк игнорировать, если данные вызывают ошибки вставки. Кроме того, [подсказки](/operations/settings/formats#schema_inference_hints) могут быть предоставлены для помощи в выводе.

## Работа с полуструктурированными и динамическими данными {#working-with-semi-structured-data}

<PrivatePreviewBadge/>

Наш предыдущий пример использовал JSON, который был статичным с известными именами и типами ключей. Однако это часто не так - ключи могут добавляться или их типы могут изменяться. Это распространено в таких случаях, как данные наблюдаемости.

ClickHouse справляется с этим через выделенный тип [`JSON`](/sql-reference/data-types/newjson).

Если вы знаете, что ваш JSON сильно динамичен с множеством уникальных ключей и несколькими типами для тех же ключей, мы рекомендуем не использовать вывод схемы с `JSONEachRow`, чтобы пытаться вывести столбец для каждого ключа, даже если данные находятся в формате JSON с разделителями строк.

Рассмотрим следующий пример из расширенной версии вышеуказанного набора данных [Python PyPI](https://clickpy.clickhouse.com/). Здесь мы добавили произвольный столбец `tags` с случайными парами ключ-значение.

```json
{
  "date": "2022-09-22",
  "country_code": "IN",
  "project": "clickhouse-connect",
  "type": "bdist_wheel",
  "installer": "bandersnatch",
  "python_minor": "",
  "system": "",
  "version": "0.2.8",
  "tags": {
    "5gTux": "f3to*PMvaTYZsz!*rtzX1",
    "nD8CV": "value"
  }
}
```

Образец этих данных доступен в открытом доступе в формате JSON с разделителями строк. Если мы попытаемся вывести типы для этого файла, вы обнаружите, что производительность плохая с крайне многословным ответом:

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz')

-- result omitted for brevity

9 rows in set. Elapsed: 127.066 sec.
```

Основная проблема здесь заключается в том, что формат `JSONEachRow` используется для вывода. Это пытается вывести **тип столбца для каждого ключа в JSON** - фактически пытаясь применить статическую схему к данным без использования типа [`JSON`](/sql-reference/data-types/newjson). 

С тысячами уникальных столбцов этот подход к выводу замедляет процесс. В качестве альтернативы пользователи могут использовать формат `JSONAsObject`.

`JSONAsObject` рассматривает весь вход как один JSON-объект и хранит его в единственном столбце типа [`JSON`](/sql-reference/data-types/newjson), что лучше подходит для сильно динамичных или вложенных JSON-данных.

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz', 'JSONAsObject')
SETTINGS describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.005 sec.
```

Этот формат также необходим в случаях, когда столбцы имеют несколько типов, которые невозможно согласовать. Например, рассмотрите файл `sample.json` со следующим JSON с разделителями строк:

```json
{"a":1}
{"a":"22"}
```

В этом случае ClickHouse может преобразовать столкновение типов и разрешить столбец `a` как `Nullable(String)`.

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/sample.json')
SETTINGS describe_compact_output = 1

┌─name─┬─type─────────────┐
│ a    │ Nullable(String) │
└──────┴──────────────────┘

1 row in set. Elapsed: 0.081 sec.
```

:::note Преобразование типов
Это преобразование типов можно контролировать с помощью нескольких настроек. Приведенный выше пример зависит от настройки [`input_format_json_read_numbers_as_strings`](/operations/settings/formats#input_format_json_read_numbers_as_strings).
:::

Однако некоторые типы несовместимы. Рассмотрим следующий пример:

```json
{"a":1}
{"a":{"b":2}}
```

В этом случае любая форма преобразования типов невозможна. Команда `DESCRIBE` таким образом завершится неудачно:

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json')

Elapsed: 0.755 sec.

Received exception from server (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: The table structure cannot be extracted from a JSON format file. Error:
Code: 53. DB::Exception: Automatically defined type Tuple(b Int64) for column 'a' in row 1 differs from type defined by previous rows: Int64. You can specify the type for this column using setting schema_inference_hints.
```

В этом случае `JSONAsObject` рассматривает каждую строку как единый тип [`JSON`](/sql-reference/data-types/newjson) (который поддерживает одинаковый столбец с несколькими типами). Это важно:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json', JSONAsObject)
SETTINGS enable_json_type = 1, describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.010 sec.
```

## Дополнительные материалы {#further-reading}

Чтобы узнать больше о выводе типов данных, вы можете обратиться к [этой](https://docs.clickhouse.com/interfaces/schema-inference) странице документации.
