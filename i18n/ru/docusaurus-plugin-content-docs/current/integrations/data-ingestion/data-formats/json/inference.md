---
title: 'Автоматическое определение схемы JSON'
slug: /integrations/data-formats/json/inference
description: 'Как использовать автоматическое определение схемы JSON'
keywords: ['json', 'schema', 'inference', 'schema inference']
doc_type: 'guide'
---

ClickHouse может автоматически определять структуру JSON-данных. Это можно использовать для выполнения запросов к JSON-данным напрямую, например, к файлам на диске с помощью `clickhouse-local` или к объектам в S3, и/или для автоматического создания схем перед загрузкой данных в ClickHouse.



## Когда использовать вывод типов {#when-to-use-type-inference}

- **Согласованная структура** — данные, из которых вы собираетесь выводить типы, содержат все интересующие вас ключи. Вывод типов основан на выборке данных до [максимального количества строк](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference) или [байтов](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference). Данные после выборки с дополнительными столбцами будут проигнорированы и не смогут быть запрошены.
- **Согласованные типы** — типы данных для конкретных ключей должны быть совместимы, т. е. должна быть возможность автоматического приведения одного типа к другому.

Если у вас более динамичный JSON, в который добавляются новые ключи и для одного пути возможны несколько типов, см. [«Работа с полуструктурированными и динамическими данными»](/integrations/data-formats/json/inference#working-with-semi-structured-data).


## Определение типов {#detecting-types}

Далее предполагается, что JSON имеет согласованную структуру и единственный тип для каждого пути.

В предыдущих примерах мы использовали упрощённую версию [набора данных Python PyPI](https://clickpy.clickhouse.com/) в формате `NDJSON`. В этом разделе мы рассмотрим более сложный набор данных с вложенными структурами — [набор данных arXiv](https://www.kaggle.com/datasets/Cornell-University/arxiv?resource=download), содержащий 2,5 млн научных статей. Каждая строка в этом наборе данных, распространяемом в формате `NDJSON`, представляет собой опубликованную научную работу. Пример строки показан ниже:

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
  "authors_parsed": [["Lemire", "Daniel", ""]]
}
```

Эти данные требуют гораздо более сложной схемы, чем в предыдущих примерах. Ниже мы описываем процесс определения этой схемы, вводя сложные типы, такие как `Tuple` и `Array`.

Этот набор данных хранится в публичном бакете S3 по адресу `s3://datasets-documentation/arxiv/arxiv.json.gz`.

Как видно, приведённый выше набор данных содержит вложенные объекты JSON. Хотя пользователям рекомендуется разрабатывать и версионировать свои схемы, автоматический вывод типов позволяет определять типы на основе данных. Это позволяет автоматически генерировать DDL схемы, избегая необходимости создавать её вручную и ускоряя процесс разработки.

:::note Автоматическое определение формата
Помимо определения схемы, механизм вывода схемы JSON автоматически определяет формат данных по расширению файла и его содержимому. В результате приведённый выше файл автоматически определяется как NDJSON.
:::

Использование [функции s3](/sql-reference/table-functions/s3) с командой `DESCRIBE` показывает типы, которые будут выведены.

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

:::note Избегайте null-значений
Как видно, многие столбцы определены как Nullable. Мы [не рекомендуем использовать тип Nullable](/sql-reference/data-types/nullable#storage-features), если в этом нет абсолютной необходимости. Вы можете использовать настройку [schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable) для управления поведением применения Nullable.
:::

Видно, что большинство столбцов автоматически определены как `String`, а столбец `update_date` правильно определён как `Date`. Столбец `versions` создан как `Array(Tuple(created String, version String))` для хранения списка объектов, а `authors_parsed` определён как `Array(Array(String))` для вложенных массивов.


:::note Контроль определения типов
Автоматическое определение дат и значений типа `datetime` можно контролировать с помощью настроек [`input_format_try_infer_dates`](/operations/settings/formats#input_format_try_infer_dates) и [`input_format_try_infer_datetimes`](/operations/settings/formats#input_format_try_infer_datetimes) соответственно (обе по умолчанию включены). Интерпретация объектов как кортежей (`tuple`) контролируется настройкой [`input_format_json_try_infer_named_tuples_from_objects`](/operations/settings/formats#input_format_json_try_infer_named_tuples_from_objects). Другие настройки, управляющие выводом схемы для JSON, такие как автоматическое определение чисел, можно найти [здесь](/interfaces/schema-inference#text-formats).
:::



## Запросы к JSON {#querying-json}

Далее предполагается, что JSON имеет согласованную структуру и единый тип данных для каждого пути.

Мы можем использовать автоматическое определение схемы для выполнения запросов к JSON-данным напрямую. Ниже мы находим самых публикуемых авторов для каждого года, используя тот факт, что даты и массивы определяются автоматически.

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

Автоматическое определение схемы позволяет выполнять запросы к JSON-файлам без необходимости указывать схему, ускоряя задачи ad-hoc анализа данных.


## Создание таблиц {#creating-tables}

Для создания схемы таблицы можно использовать автоматический вывод схемы. Следующая команда `CREATE AS EMPTY` автоматически определяет DDL таблицы и создает её. При этом данные не загружаются:

```sql
CREATE TABLE arxiv
ENGINE = MergeTree
ORDER BY update_date EMPTY
AS SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')
SETTINGS schema_inference_make_columns_nullable = 0
```

Для проверки схемы таблицы используется команда `SHOW CREATE TABLE`:

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

Приведенная выше схема корректна для этих данных. Вывод схемы основан на выборке данных и их построчном чтении. Значения столбцов извлекаются в соответствии с форматом, при этом для определения типа каждого значения используются рекурсивные парсеры и эвристики. Максимальное количество строк и байтов, считываемых из данных при выводе схемы, контролируется настройками [`input_format_max_rows_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_rows_to_read_for_schema_inference) (по умолчанию 25000) и [`input_format_max_bytes_to_read_for_schema_inference`](/operations/settings/formats#input_format_max_bytes_to_read_for_schema_inference) (по умолчанию 32 МБ). Если определение типа выполнено некорректно, пользователи могут предоставить подсказки, как описано [здесь](/operations/settings/formats#schema_inference_make_columns_nullable).

### Создание таблиц из фрагментов {#creating-tables-from-snippets}

В приведенном выше примере для создания схемы таблицы используется файл на S3. Пользователи могут создать схему из однострочного фрагмента. Это можно сделать с помощью функции [format](/sql-reference/table-functions/format), как показано ниже:

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

Далее предполагается, что JSON имеет согласованную структуру и один тип данных для каждого пути.

Предыдущие команды создали таблицу, в которую можно загрузить данные. Теперь вы можете вставить данные в таблицу с помощью следующего запроса `INSERT INTO SELECT`:

```sql
INSERT INTO arxiv SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/arxiv/arxiv.json.gz')

0 rows in set. Elapsed: 38.498 sec. Processed 2.52 million rows, 1.39 GB (65.35 thousand rows/s., 36.03 MB/s.)
Peak memory usage: 870.67 MiB.
```

Примеры загрузки данных из других источников, например, из файла, см. [здесь](/sql-reference/statements/insert-into).

После загрузки можно выполнять запросы к данным, при необходимости используя формат `PrettyJSONEachRow` для отображения строк в их исходной структуре:

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

Иногда данные могут содержать ошибки. Например, отдельные столбцы могут иметь неправильный тип или объект JSON может быть некорректно отформатирован. В таких случаях можно использовать настройки [`input_format_allow_errors_num`](/operations/settings/formats#input_format_allow_errors_num) и [`input_format_allow_errors_ratio`](/operations/settings/formats#input_format_allow_errors_ratio), чтобы разрешить игнорирование определённого количества строк при возникновении ошибок вставки. Кроме того, можно указать [подсказки](/operations/settings/formats#schema_inference_hints) для помощи в определении схемы.


## Работа с полуструктурированными и динамическими данными {#working-with-semi-structured-data}

В предыдущем примере использовался JSON со статической структурой с известными именами ключей и типами. Часто это не так — ключи могут добавляться, а их типы могут изменяться. Это характерно для таких сценариев использования, как данные мониторинга (Observability).

ClickHouse обрабатывает такие данные с помощью специального типа [`JSON`](/sql-reference/data-types/newjson).

Если ваш JSON является высокодинамичным с множеством уникальных ключей и несколькими типами для одних и тех же ключей, мы рекомендуем не использовать автоматическое определение схемы с форматом `JSONEachRow` для попытки вывести колонку для каждого ключа — даже если данные представлены в формате JSON с разделением строк.

Рассмотрим следующий пример из расширенной версии набора данных [Python PyPI dataset](https://clickpy.clickhouse.com/). Здесь мы добавили произвольную колонку `tags` со случайными парами ключ-значение.

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

Образец этих данных общедоступен в формате JSON с разделением строк. Если попытаться выполнить автоматическое определение схемы для этого файла, производительность будет низкой, а ответ — чрезвычайно подробным:

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz')

-- результат опущен для краткости

9 rows in set. Elapsed: 127.066 sec.
```

Основная проблема здесь заключается в том, что для определения схемы используется формат `JSONEachRow`. Он пытается вывести **тип колонки для каждого ключа в JSON** — фактически пытаясь применить статическую схему к данным без использования типа [`JSON`](/sql-reference/data-types/newjson).

При наличии тысяч уникальных колонок такой подход к определению схемы работает медленно. В качестве альтернативы можно использовать формат `JSONAsObject`.

`JSONAsObject` обрабатывает весь ввод как единый объект JSON и сохраняет его в одной колонке типа [`JSON`](/sql-reference/data-types/newjson), что делает его более подходящим для высокодинамичных или вложенных JSON-данных.

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample_rows.json.gz', 'JSONAsObject')
SETTINGS describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.005 sec.
```

Этот формат также необходим в случаях, когда колонки имеют несколько типов, которые невозможно согласовать. Например, рассмотрим файл `sample.json` со следующим JSON с разделением строк:

```json
{"a":1}
{"a":"22"}
```

В этом случае ClickHouse способен разрешить конфликт типов и определить колонку `a` как `Nullable(String)`.

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/sample.json')
SETTINGS describe_compact_output = 1

┌─name─┬─type─────────────┐
│ a    │ Nullable(String) │
└──────┴──────────────────┘

1 row in set. Elapsed: 0.081 sec.
```

:::note Приведение типов
Это приведение типов можно контролировать с помощью ряда настроек. Приведенный выше пример зависит от настройки [`input_format_json_read_numbers_as_strings`](/operations/settings/formats#input_format_json_read_numbers_as_strings).
:::

Однако некоторые типы несовместимы. Рассмотрим следующий пример:

```json
{"a":1}
{"a":{"b":2}}
```

В этом случае любая форма преобразования типов невозможна. Поэтому команда `DESCRIBE` завершается с ошибкой:

```sql
DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json')

Elapsed: 0.755 sec.

```


Получено исключение с сервера (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: Структуру таблицы не удалось извлечь из файла в формате JSON. Ошибка:
Code: 53. DB::Exception: Автоматически определённый тип Tuple(b Int64) для столбца &#39;a&#39; в строке 1 отличается от типа, определённого предыдущими строками: Int64. Вы можете задать тип для этого столбца с помощью настройки schema&#95;inference&#95;hints.

````

В данном случае `JSONAsObject` рассматривает каждую строку как единый тип [`JSON`](/sql-reference/data-types/newjson) (который поддерживает хранение различных типов данных в одном столбце). Это существенно:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/json/conflict_sample.json', JSONAsObject)
SETTINGS enable_json_type = 1, describe_compact_output = 1

┌─name─┬─type─┐
│ json │ JSON │
└──────┴──────┘

1 row in set. Elapsed: 0.010 sec.
````


## Дополнительная информация {#further-reading}

Подробнее о выводе типов данных можно узнать на [этой](/interfaces/schema-inference) странице документации.
