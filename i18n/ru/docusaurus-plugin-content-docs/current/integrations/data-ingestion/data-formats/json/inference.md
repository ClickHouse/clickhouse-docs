---
title: 'Выведение схемы JSON'
slug: /integrations/data-formats/json/inference
description: 'Как использовать выведение схемы JSON'
keywords: ['json', 'schema', 'inference', 'schema inference']
doc_type: 'guide'
---

ClickHouse может автоматически определять структуру данных в формате JSON. Это можно использовать для непосредственного выполнения запросов к JSON-данным, например на локальном диске с помощью `clickhouse-local` или в S3-бакетах, и/или для автоматического создания схем перед загрузкой данных в ClickHouse.

## Когда использовать вывод типов \{#when-to-use-type-inference\}

* **Однородная структура** — данные, на основе которых вы собираетесь выводить типы, содержат все ключи, которые вас интересуют. Вывод типов основан на выборке данных до [максимального числа строк](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference) или [байт](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference). Данные после выборки, с дополнительными столбцами, будут игнорироваться и будут недоступны для запросов.
* **Однородные типы** — типы данных для конкретных ключей должны быть совместимы, то есть должна быть возможность автоматически привести один тип к другому.

Если у вас более динамический JSON, в который добавляются новые ключи и для одного и того же пути возможны несколько типов, см. раздел ["Работа с полуструктурированными и динамическими данными"](/integrations/data-formats/json/inference#working-with-semi-structured-data).

## Определение типов \{#detecting-types\}

Далее предполагается, что JSON имеет согласованную структуру и один тип для каждого пути.

В наших предыдущих примерах использовалась упрощённая версия [набора данных Python PyPI](https://clickpy.clickhouse.com/) в формате `NDJSON`. В этом разделе мы рассматриваем более сложный набор данных с вложенными структурами — [набор данных arXiv](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download), содержащий 2,5 млн научных статей. Каждая строка этого набора данных, распространяемого в формате `NDJSON`, представляет собой опубликованную научную работу. Пример строки показан ниже:

```json
{
  "id": "2101.11408",
  "submitter": "Daniel Lemire",
  "authors": "Daniel Lemire",
  "title": "Number Parsing at a Gigabyte per Second",
  "comments": "Software at https://github.com/fastfloat/fast_float and\n https://github.com/lemire/simple_fastfloat_benchmark/",
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

Эти данные требуют гораздо более сложной схемы, чем предыдущие примеры. Ниже мы описываем процесс её определения, вводя сложные типы, такие как `Tuple` и `Array`.

Этот набор данных хранится в публичном бакете S3 по адресу `s3://datasets-documentation/arxiv/arxiv.json.gz`.

Как видно, приведённый выше набор данных содержит вложенные объекты JSON. Хотя вам следует разрабатывать и версионировать свои схемы, механизм вывода типов позволяет автоматически определять типы по самим данным. Это даёт возможность автоматически генерировать DDL-описание схемы, устраняя необходимость создавать её вручную и ускоряя процесс разработки.

:::note Автоопределение формата
Помимо определения схемы, механизм вывода схемы JSON автоматически определит формат данных по расширению файла и его содержимому. В результате приведённый выше файл автоматически распознаётся как NDJSON.
:::

Использование [функции s3](/sql-reference/table-functions/s3) с командой `DESCRIBE` показывает типы, которые будут автоматически определены.

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

:::note Избегайте значений NULL
Вы можете заметить, что многие столбцы определены как Nullable. Мы [не рекомендуем использовать тип Nullable](/sql-reference/data-types/nullable#storage-features), если в этом нет строгой необходимости. Вы можете использовать [schema&#95;inference&#95;make&#95;columns&#95;nullable](/operations/settings/formats#schema_inference_make_columns_nullable), чтобы управлять тем, в каких случаях применяется Nullable.
:::

Мы видим, что большинство столбцов были автоматически определены как `String`, при этом столбец `update_date` корректно определён как `Date`. Столбец `versions` был создан как `Array(Tuple(created String, version String))` для хранения списка объектов, а `authors_parsed` определён как `Array(Array(String))` для вложенных массивов.


:::note Контроль определения типов
Автоопределение значений типов `date` и `datetime` настраивается с помощью параметров [`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates) и [`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes) соответственно (оба включены по умолчанию). Интерпретация объектов как кортежей контролируется параметром [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects). Другие параметры, управляющие определением схемы для JSON (например, автоопределением чисел), можно найти [здесь](/interfaces/schema-inference#text-formats).
:::

## Запросы к JSON \{#querying-json\}

Далее предполагается, что JSON имеет единообразную структуру и один тип данных для каждого пути.

Мы можем полагаться на вывод схемы, чтобы выполнять запросы непосредственно к JSON-данным. Ниже мы находим топ‑авторов для каждого года, используя то, что даты и массивы автоматически распознаются.

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

Автоматическое определение схемы позволяет выполнять запросы к JSON-файлам без необходимости явно её задавать, что ускоряет выполнение разовых задач по анализу данных.


## Создание таблиц \{#creating-tables\}

Мы можем использовать вывод схемы для автоматического создания структуры таблицы. Следующая команда `CREATE AS EMPTY` заставляет систему вывести DDL для таблицы и создать её. При этом данные не загружаются:

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS schema_inference_make_columns_nullable = 0
```

Чтобы проверить структуру таблицы, используем команду `SHOW CREATE TABLE`:

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

Выше приведена корректная схема для этих данных. Определение схемы основано на выборочном построчном чтении данных. Значения столбцов извлекаются в соответствии с форматом, а для определения типа каждого значения используются рекурсивные парсеры и эвристики. Максимальное количество строк и байт, читаемых из данных при определении схемы, контролируется настройками [`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference) (по умолчанию 25000) и [`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference) (по умолчанию 32 МБ). Если определение окажется некорректным, пользователи могут задать подсказки, как описано [здесь](/operations/settings/formats#schema_inference_make_columns_nullable).


### Создание таблиц из фрагментов \{#creating-tables-from-snippets\}

В приведённом выше примере используется файл на S3 для создания схемы таблицы. При необходимости можно создать схему из однострочного фрагмента данных. Это можно сделать с помощью функции [format](/sql-reference/table-functions/format), как показано ниже:

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


## Загрузка JSON-данных \{#loading-json-data\}

Далее предполагается, что JSON имеет единообразную структуру и содержит один тип значений для каждого пути.

Предыдущие команды создали таблицу, в которую можно загружать данные. Теперь вы можете вставить данные в таблицу, используя следующую команду `INSERT INTO SELECT`:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

Примеры загрузки данных из других источников, например из файла, см. [здесь](/sql-reference/statements/insert-into).

После загрузки можно выполнять запросы к данным, при желании используя формат `PrettyJSONEachRow`, чтобы отображать строки в их исходной структуре:

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


## Обработка ошибок \{#handling-errors\}

Иногда во входных данных могут встречаться ошибки. Например, отдельные столбцы могут иметь неверный тип или JSON-объект может быть некорректно отформатирован. Для таких случаев вы можете использовать настройки [`input_format_allow_errors_num`](/operations/settings/formats#input_format_allow_errors_num) и [`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio), чтобы разрешить игнорирование определённого числа строк, если данные вызывают ошибки операции вставки. Дополнительно можно задать [подсказки](/operations/settings/formats#schema_inference_hints), чтобы упростить вывод схемы.

## Работа с полуструктурированными и динамическими данными \{#working-with-semi-structured-data\}

В нашем предыдущем примере использовался JSON с фиксированной схемой, с хорошо известными именами ключей и типами. На практике это часто не так — ключи могут добавляться, а их типы меняться. Это типично, например, для данных для наблюдаемости (Observability).

ClickHouse обрабатывает такие случаи с помощью специализированного типа [`JSON`](/sql-reference/data-types/newjson).

Если вы знаете, что ваш JSON очень динамичен, содержит множество уникальных ключей и несколько типов для одних и тех же ключей, мы не рекомендуем использовать вывод схемы с помощью `JSONEachRow`, пытаясь вывести отдельный столбец для каждого ключа — даже если данные находятся в формате JSON с разделением по строкам (newline-delimited JSON).

Рассмотрим следующий пример из расширенной версии указанного выше набора данных [Python PyPI dataset](https://clickpy.clickhouse.com/). Здесь мы добавили произвольный столбец `tags` со случайными парами ключ–значение.

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

Образец этих данных публично доступен в формате JSON с разделением по строкам. Если выполнить вывод схемы для этого файла, вы обнаружите, что производительность низкая, а ответ — крайне подробный:

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz')

-- result omitted for brevity

9 rows in set. Elapsed: 127.066 sec.
```

Основная проблема здесь заключается в том, что для вывода типов используется формат `JSONEachRow`. Он пытается вывести **тип столбца для каждого ключа в JSON** — по сути, пытаясь применить статическую схему к данным без использования типа [`JSON`](/sql-reference/data-types/newjson).

При наличии тысяч уникальных столбцов такой подход к выводу типов работает медленно. В качестве альтернативы пользователи могут использовать формат `JSONAsObject`.

`JSONAsObject` рассматривает весь входной JSON как один объект и сохраняет его в одном столбце типа [`JSON`](/sql-reference/data-types/newjson), что делает его более подходящим для высокодинамичных или вложенных JSON-нагрузок.

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz', 'JSONAsObject')
SETTINGS describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.005 sec.
```

Этот формат также необходим в случаях, когда столбцы имеют несколько типов данных, которые невозможно привести к общему виду. Например, рассмотрим файл `sample.json` со следующим JSON, в котором каждая запись находится на отдельной строке:

```json
{"a":1}
{"a":"22"}
```

В этом случае ClickHouse может устранить конфликт типов и интерпретировать столбец `a` как `Nullable(String)`.

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/sample.json')
SETTINGS describe_compact_output = 1

┌─name─┬─type─────────────┐
│ a    │ Nullable(String) │
└──────┴──────────────────┘

1 row in set. Elapsed: 0.081 sec.
```

:::note Приведение типов
Это приведение типов можно контролировать с помощью ряда настроек. Приведённый выше пример зависит от настройки [`input_format_json_read_numbers_as_strings`](/operations/settings/formats#input_format_json_read_numbers_as_strings).
:::

Однако некоторые типы несовместимы. Рассмотрим следующий пример:

```json
{"a":1}
{"a":{"b":2}}
```

В этом случае невозможно выполнить какое-либо приведение типов. Команда `DESCRIBE` завершится с ошибкой:


```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json')

Elapsed: 0.755 sec.

Received exception from server (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: The table structure cannot be extracted from a JSON format file. Error:
Code: 53. DB::Exception: Automatically defined type Tuple(b Int64) for column 'a' in row 1 differs from type defined by previous rows: Int64. You can specify the type for this column using setting schema_inference_hints.
```

В данном случае `JSONAsObject` рассматривает каждую строку как единый тип [`JSON`](/sql-reference/data-types/newjson) (который поддерживает использование нескольких типов в одном столбце). Это важно:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json', JSONAsObject)
SETTINGS enable_json_type = 1, describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.010 sec.
```


## Дополнительные материалы \{#further-reading\}

Подробнее о выводе типов данных см. на [этой странице документации](/interfaces/schema-inference).