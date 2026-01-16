---
title: 'Обработка других форматов JSON'
slug: /integrations/data-formats/json/other-formats
description: 'Обработка других форматов JSON'
sidebar_label: 'Обработка других форматов'
keywords: ['json', 'formats', 'json formats']
doc_type: 'guide'
---

# Обработка других форматов JSON \{#handling-other-json-formats\}

В предыдущих примерах загрузки данных в формате JSON предполагается использование формата [`JSONEachRow`](/interfaces/formats/JSONEachRow) (`NDJSON`). Этот формат считывает ключи в каждой строке JSON как названия столбцов. Например:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
LIMIT 5

┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8   │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

5 rows in set. Elapsed: 0.449 sec.
```

Хотя это, как правило, наиболее распространённый формат JSON, вы можете столкнуться с другими форматами или вам может понадобиться прочитать JSON как единый объект.

Ниже мы приводим примеры чтения и загрузки JSON в других распространённых форматах.

## Чтение JSON как объекта \{#reading-json-as-an-object\}

Наши предыдущие примеры показывают, как `JSONEachRow` читает JSON, в котором каждая запись находится на отдельной строке: каждая строка интерпретируется как отдельный объект, сопоставляемый со строкой таблицы, а каждый ключ — со столбцом. Это идеально подходит для случаев, когда структура JSON предсказуема и для каждого столбца используется один тип.

В отличие от этого, `JSONAsObject` обрабатывает каждую строку как один объект `JSON` и сохраняет его в одном столбце типа [`JSON`](/sql-reference/data-types/newjson), что делает его более подходящим для вложенных JSON‑данных и случаев, когда ключи динамические, а значения по ним потенциально могут иметь более одного типа.

Используйте `JSONEachRow` для построчных вставок, а [`JSONAsObject`](/interfaces/formats/JSONAsObject) — при хранении гибких или динамических JSON-данных.

Сравните приведённый выше пример со следующим запросом, который читает те же данные как JSON-объект на строку:

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONAsObject)
LIMIT 5

┌─json─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

5 rows in set. Elapsed: 0.338 sec.
```

`JSONAsObject` подходит для вставки строк в таблицу с использованием одного столбца с JSON-объектом, например:

```sql
CREATE TABLE pypi
(
    `json` JSON
)
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO pypi SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONAsObject)
LIMIT 5;

SELECT *
FROM pypi
LIMIT 2;

┌─json─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
│ {"country_code":"CN","date":"2022-11-15","installer":"bandersnatch","project":"clickhouse-connect","python_minor":"","system":"","type":"bdist_wheel","version":"0.2.8"} │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

2 rows in set. Elapsed: 0.003 sec.
```

Формат `JSONAsObject` также может быть полезен для чтения JSON, где каждая запись находится на отдельной строке, в случаях, когда структура объектов неоднородна. Например, если тип значения по какому‑то ключу отличается в разных строках (иногда это строка, а иногда объект). В таких случаях ClickHouse не может вывести стабильную схему с помощью `JSONEachRow`, и `JSONAsObject` позволяет выполнять приём данных без жёсткого контроля типов, сохраняя каждую JSON‑строку целиком в одном столбце. Например, обратите внимание, как `JSONEachRow` выдаёт ошибку на следующем примере:

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONEachRow')

Elapsed: 1.198 sec.

Received exception from server (version 24.12.1):
Code: 636. DB::Exception: Received from sql-clickhouse.clickhouse.com:9440. DB::Exception: The table structure cannot be extracted from a JSONEachRow format file. Error:
Code: 117. DB::Exception: JSON objects have ambiguous data: in some objects path 'record.subject' has type 'String' and in some - 'Tuple(`$type` String, cid String, uri String)'. You can enable setting input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects to use String type for path 'record.subject'. (INCORRECT_DATA) (version 24.12.1.18239 (official build))
To increase the maximum number of rows/bytes to read for structure determination, use setting input_format_max_rows_to_read_for_schema_inference/input_format_max_bytes_to_read_for_schema_inference.
You can specify the structure manually: (in file/uri bluesky/file_0001.json.gz). (CANNOT_EXTRACT_TABLE_STRUCTURE)
```

В данном случае можно использовать `JSONAsObject`, поскольку тип `JSON` поддерживает несколько типов для одной и той же подколонки.

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONAsObject')

┌─count()─┐
│ 1000000 │
└─────────┘

1 row in set. Elapsed: 0.480 sec. Processed 1.00 million rows, 256.00 B (2.08 million rows/s., 533.76 B/s.)
```

## Массив JSON-объектов \{#array-of-json-objects\}

Одна из самых распространённых форм представления данных в JSON — это список JSON-объектов в JSON-массиве, как в [этом примере](../assets/list.json):

```bash
> cat list.json
[
  {
    "path": "Akiba_Hebrew_Academy",
    "month": "2017-08-01",
    "hits": 241
  },
  {
    "path": "Aegithina_tiphia",
    "month": "2018-02-01",
    "hits": 34
  },
  ...
]
```

Давайте создадим таблицу для таких данных:

```sql
CREATE TABLE sometable
(
    `path` String,
    `month` Date,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY tuple(month, path)
```

Чтобы импортировать список JSON-объектов, можно использовать формат [`JSONEachRow`](/interfaces/formats/JSONEachRow) (вставляя данные из файла [list.json](../assets/list.json)):

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

Мы использовали предложение [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) для загрузки данных из локального файла и видим, что импорт прошёл успешно:

```sql
SELECT *
FROM sometable
```

```response
┌─path──────────────────────┬──────month─┬─hits─┐
│ 1971-72_Utah_Stars_season │ 2016-10-01 │    1 │
│ Akiba_Hebrew_Academy      │ 2017-08-01 │  241 │
│ Aegithina_tiphia          │ 2018-02-01 │   34 │
└───────────────────────────┴────────────┴──────┘
```

## Ключи объектов JSON \{#json-object-keys\}

В некоторых случаях список объектов JSON может быть представлен в виде свойств объекта, а не элементов массива (см. [objects.json](../assets/objects.json) в качестве примера):

```bash
cat objects.json
```

```response
{
  "a": {
    "path":"April_25,_2017",
    "month":"2018-01-01",
    "hits":2
  },
  "b": {
    "path":"Akahori_Station",
    "month":"2016-06-01",
    "hits":11
  },
  ...
}
```

ClickHouse может загружать данные этого типа с помощью формата [`JSONObjectEachRow`](/interfaces/formats/JSONObjectEachRow):

```sql
INSERT INTO sometable FROM INFILE 'objects.json' FORMAT JSONObjectEachRow;
SELECT * FROM sometable;
```

```response
┌─path────────────┬──────month─┬─hits─┐
│ Abducens_palsy  │ 2016-05-01 │   28 │
│ Akahori_Station │ 2016-06-01 │   11 │
│ April_25,_2017  │ 2018-01-01 │    2 │
└─────────────────┴────────────┴──────┘
```

### Указание значений ключей родительского объекта \{#specifying-parent-object-key-values\}

Предположим, мы также хотим сохранять значения ключей родительского объекта в таблице. В этом случае мы можем использовать [следующую настройку](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name), чтобы указать имя столбца, в который будут сохраняться значения ключей:

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

Теперь мы можем проверить, какие данные будут загружены из исходного JSON-файла с помощью функции [`file()`](/sql-reference/functions/files.md/#file):

```sql
SELECT * FROM file('objects.json', JSONObjectEachRow)
```

```response
┌─id─┬─path────────────┬──────month─┬─hits─┐
│ a  │ April_25,_2017  │ 2018-01-01 │    2 │
│ b  │ Akahori_Station │ 2016-06-01 │   11 │
│ c  │ Abducens_palsy  │ 2016-05-01 │   28 │
└────┴─────────────────┴────────────┴──────┘
```

Обратите внимание, что столбец `id` правильно заполнен значениями ключей.

## Массивы JSON \{#json-arrays\}

Иногда в целях экономии места файлы JSON кодируются как массивы вместо объектов. В этом случае мы имеем дело со [списком массивов JSON](../assets/arrays.json):

```bash
cat arrays.json
```

```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

В этом случае ClickHouse загрузит эти данные и сопоставит каждое значение соответствующему столбцу в соответствии с его порядком в массиве. Для этого мы используем формат [`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow):

```sql
SELECT * FROM sometable
```

```response
┌─c1────────────────────────┬─────────c2─┬──c3─┐
│ Akiba_Hebrew_Academy      │ 2017-08-01 │ 241 │
│ Aegithina_tiphia          │ 2018-02-01 │  34 │
│ 1971-72_Utah_Stars_season │ 2016-10-01 │   1 │
└───────────────────────────┴────────────┴─────┘
```

### Импорт отдельных столбцов из JSON-массивов \{#importing-individual-columns-from-json-arrays\}

В некоторых случаях данные могут быть закодированы по столбцам, а не по строкам. В этом случае родительский JSON-объект содержит столбцы со значениями. Рассмотрим [следующий файл](../assets/columns.json):

```bash
cat columns.json
```

```response
{
  "path": ["2007_Copa_America", "Car_dealerships_in_the_USA", "Dihydromyricetin_reductase"],
  "month": ["2016-07-01", "2015-07-01", "2015-07-01"],
  "hits": [178, 11, 1]
}
```

ClickHouse использует формат [`JSONColumns`](/interfaces/formats/JSONColumns) для разбора данных в таком формате:

```sql
SELECT * FROM file('columns.json', JSONColumns)
```

```response
┌─path───────────────────────┬──────month─┬─hits─┐
│ 2007_Copa_America          │ 2016-07-01 │  178 │
│ Car_dealerships_in_the_USA │ 2015-07-01 │   11 │
│ Dihydromyricetin_reductase │ 2015-07-01 │    1 │
└────────────────────────────┴────────────┴──────┘
```

При работе с [массивом столбцов](../assets/columns-array.json) вместо объекта также поддерживается более компактный формат — [`JSONCompactColumns`](/interfaces/formats/JSONCompactColumns):

```sql
SELECT * FROM file('columns-array.json', JSONCompactColumns)
```

```response
┌─c1──────────────┬─────────c2─┬─c3─┐
│ Heidenrod       │ 2017-01-01 │ 10 │
│ Arthur_Henrique │ 2016-11-01 │ 12 │
│ Alan_Ebnother   │ 2015-11-01 │ 66 │
└─────────────────┴────────────┴────┘
```

## Сохранение объектов JSON без разбора \{#saving-json-objects-instead-of-parsing\}

Иногда может потребоваться сохранять объекты JSON в одном столбце типа `String` (или `JSON`), а не разбирать их. Это может быть полезно при работе со списком объектов JSON с разной структурой. Возьмём [этот файл](../assets/custom.json) в качестве примера, где внутри родительского списка содержится несколько различных объектов JSON:

```bash
cat custom.json
```

```response
[
  {"name": "Joe", "age": 99, "type": "person"},
  {"url": "/my.post.MD", "hits": 1263, "type": "post"},
  {"message": "Warning on disk usage", "type": "log"}
]
```

Мы хотим сохранить оригинальные JSON-объекты в следующей таблице:

```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```

Теперь мы можем загрузить данные из файла в эту таблицу, используя формат [`JSONAsString`](/interfaces/formats/JSONAsString), чтобы хранить JSON-объекты в исходном виде, не разбирая их:

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

Мы можем использовать [функции JSON](/sql-reference/functions/json-functions.md) для выполнения запросов к сохранённым объектам:

```sql
SELECT
    JSONExtractString(data, 'type') AS type,
    data
FROM events
```

```response
┌─type───┬─data─────────────────────────────────────────────────┐
│ person │ {"name": "Joe", "age": 99, "type": "person"}         │
│ post   │ {"url": "/my.post.MD", "hits": 1263, "type": "post"} │
│ log    │ {"message": "Warning on disk usage", "type": "log"}  │
└────────┴──────────────────────────────────────────────────────┘
```

Обратите внимание, что `JSONAsString` отлично подходит для файлов, где каждая строка содержит один JSON-объект (обычно используется с форматом `JSONEachRow`).

## Схема для вложенных объектов \{#schema-for-nested-objects\}

В случае работы с [вложенными объектами JSON](../assets/list-nested.json) мы можем дополнительно явно задать схему и использовать составные типы данных ([`Array`](/sql-reference/data-types/array.md), [`JSON`](/integrations/data-formats/json/overview) или [`Tuple`](/sql-reference/data-types/tuple.md)) для загрузки данных:

```sql
SELECT *
FROM file('list-nested.json', JSONEachRow, 'page Tuple(path String, title String, owner_id UInt16), month Date, hits UInt32')
LIMIT 1
```

```response
┌─page───────────────────────────────────────────────┬──────month─┬─hits─┐
│ ('Akiba_Hebrew_Academy','Akiba Hebrew Academy',12) │ 2017-08-01 │  241 │
└────────────────────────────────────────────────────┴────────────┴──────┘
```

## Доступ к вложенным JSON-объектам \{#accessing-nested-json-objects\}

Мы можем обращаться к [вложенным ключам JSON](../assets/list-nested.json), включив [следующий параметр настройки](/operations/settings/settings-formats.md/#input_format_import_nested_json):

```sql
SET input_format_import_nested_json = 1
```

Это позволяет ссылаться на вложенные ключи JSON-объектов, используя точечный синтаксис (не забудьте заключить их в обратные кавычки, чтобы это работало):

```sql
SELECT *
FROM file('list-nested.json', JSONEachRow, '`page.owner_id` UInt32, `page.title` String, month Date, hits UInt32')
LIMIT 1
```

```results
┌─page.owner_id─┬─page.title───────────┬──────month─┬─hits─┐
│            12 │ Akiba Hebrew Academy │ 2017-08-01 │  241 │
└───────────────┴──────────────────────┴────────────┴──────┘
```

Таким образом мы можем преобразовывать вложенные JSON-объекты в плоский вид или использовать отдельные вложенные значения и сохранять их в отдельных столбцах.

## Пропуск неизвестных столбцов \{#skipping-unknown-columns\}

По умолчанию ClickHouse будет игнорировать неизвестные столбцы при импорте JSON-данных. Давайте попробуем импортировать исходный файл в таблицу без столбца `month`:

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

Мы по‑прежнему можем вставить в эту таблицу [исходные данные в формате JSON](../assets/list.json) с тремя столбцами:

```sql
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
SELECT * FROM shorttable
```

```response
┌─path──────────────────────┬─hits─┐
│ 1971-72_Utah_Stars_season │    1 │
│ Aegithina_tiphia          │   34 │
│ Akiba_Hebrew_Academy      │  241 │
└───────────────────────────┴──────┘
```

ClickHouse будет игнорировать неизвестные столбцы при импорте данных. Это можно отключить с помощью параметра настройки [input&#95;format&#95;skip&#95;unknown&#95;fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields):

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```

```response
Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

ClickHouse будет выдавать исключения, если структура JSON не соответствует структуре столбцов таблицы.

## BSON \{#bson\}

ClickHouse позволяет экспортировать данные в файлы, закодированные в формате [BSON](https://bsonspec.org/), и импортировать данные из них. Этот формат используется некоторыми СУБД, например базой данных [MongoDB](https://github.com/mongodb/mongo).

Для импорта данных в формате BSON мы используем формат [BSONEachRow](/interfaces/formats/BSONEachRow). Давайте импортируем данные из [этого BSON‑файла](../assets/data.bson):

```sql
SELECT * FROM file('data.bson', BSONEachRow)
```

```response
┌─path──────────────────────┬─month─┬─hits─┐
│ Bob_Dolman                │ 17106 │  245 │
│ 1-krona                   │ 17167 │    4 │
│ Ahmadabad-e_Kalij-e_Sofla │ 17167 │    3 │
└───────────────────────────┴───────┴──────┘
```

Мы также можем экспортировать данные в файлы BSON в том же формате:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

После этого наши данные будут экспортированы в файл `out.bson`.
