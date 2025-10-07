---
slug: '/integrations/data-formats/json/other-formats'
sidebar_label: 'Обработка других форматов'
description: 'Обработка других JSON форматов'
title: 'Обработка других форматов JSON'
keywords: ['json', 'форматы', 'форматы json']
doc_type: guide
---
# Обработка других форматов JSON

Предыдущие примеры загрузки данных JSON предполагают использование [`JSONEachRow`](/interfaces/formats/JSONEachRow) (`NDJSON`). Этот формат читает ключи в каждой строке JSON как колонки. Например:

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

Хотя это, как правило, самый распространенный формат для JSON, пользователи могут столкнуться с другими форматами или нуждаться в чтении JSON как единого объекта.

Мы предоставляем примеры чтения и загрузки JSON в других распространенных форматах ниже.

## Чтение JSON как объекта {#reading-json-as-an-object}

Наши предыдущие примеры показывают, как `JSONEachRow` читает JSON, разделенный переносами строк, где каждая строка читается как отдельный объект, отображенный на строку таблицы, а каждый ключ — на колонку. Это идеально подходит для случаев, когда JSON предсказуем и имеет единственные типы для каждой колонки.

Напротив, `JSONAsObject` обрабатывает каждую строку как один `JSON` объект и сохраняет его в одной колонке типа [`JSON`](/sql-reference/data-types/newjson), что делает его более подходящим для вложенных JSON-данных и случаев, когда ключи динамичны и могут иметь более одного типа.

Используйте `JSONEachRow` для вставок построчно и [`JSONAsObject`](/interfaces/formats/JSONAsObject) при хранении гибких или динамичных данных JSON.

Сравните приведенный выше пример с следующим запросом, который читает те же данные как JSON-объект на каждую строку:

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

`JSONAsObject` полезен для вставки строк в таблицу с использованием одной колонки JSON-объекта, например.

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

Формат `JSONAsObject` также может быть полезен для чтения JSON, разделенного переносами строк, в случаях, когда структура объектов непостоянна. Например, если ключ варьируется по типу между строками (он может иногда быть строкой, а в другие — объектом). В таких случаях ClickHouse не может вывести стабильную схему, используя `JSONEachRow`, и `JSONAsObject` позволяет загружать данные без строгой проверки типов, сохраняя каждую строку JSON целиком в одной колонке. Например, обратите внимание, как `JSONEachRow` не работает в следующем примере:

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

Напротив, `JSONAsObject` может быть использован в этом случае, поскольку тип `JSON` поддерживает несколько типов для одного подколонки.

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONAsObject')

┌─count()─┐
│ 1000000 │
└─────────┘

1 row in set. Elapsed: 0.480 sec. Processed 1.00 million rows, 256.00 B (2.08 million rows/s., 533.76 B/s.)
```

## Массив JSON объектов {#array-of-json-objects}

Одна из самых популярных форматов данных JSON — это наличие списка JSON объектов в массиве JSON, как в [этом примере](../assets/list.json):

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

Давайте создадим таблицу для этого типа данных:

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

Чтобы импортировать список JSON объектов, мы можем использовать формат [`JSONEachRow`](/interfaces/formats.md/#jsoneachrow) (вставляя данные из файла [list.json](../assets/list.json)):

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

Мы использовали оператор [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) для загрузки данных из локального файла, и мы видим, что импорт прошел успешно:

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

## Ключи объектов JSON {#json-object-keys}

В некоторых случаях список JSON объектов может быть закодирован как свойства объектов вместо элементов массива (см. [objects.json](../assets/objects.json) в качестве примера):

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

ClickHouse может загружать данные из такого рода данных, используя формат [`JSONObjectEachRow`](/interfaces/formats.md/#jsonobjecteachrow):

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

### Указание значений ключей родительского объекта {#specifying-parent-object-key-values}

Предположим, мы также хотим сохранить значения в ключах родительского объекта в таблицу. В этом случае мы можем использовать [следующий параметр](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name), чтобы определить имя колонки, в которую мы хотим сохранить значения ключей:

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

Теперь мы можем проверить, какие данные будут загружены из исходного JSON файла, используя функцию [`file()`](/sql-reference/functions/files.md/#file):

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

Обратите внимание, как колонка `id` была правильно заполнена значениями ключей.

## Массивы JSON {#json-arrays}

Иногда, для экономии места, JSON файлы кодируются в массивы вместо объектов. В этом случае мы имеем дело со [списком JSON массивов](../assets/arrays.json):

```bash
cat arrays.json
```
```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

В этом случае ClickHouse загрузит эти данные и сопоставит каждое значение с соответствующей колонкой в зависимости от его порядка в массиве. Мы используем формат [`JSONCompactEachRow`](/interfaces/formats.md/#jsoncompacteachrow) для этого:

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

### Импорт отдельных колонок из JSON массивов {#importing-individual-columns-from-json-arrays}

В некоторых случаях данные могут быть закодированы по колонкам вместо по строкам. В этом случае родительский JSON объект содержит колонки со значениями. Обратите внимание на [следующий файл](../assets/columns.json):

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

ClickHouse использует формат [`JSONColumns`](/interfaces/formats.md/#jsoncolumns) для разбора данных, отформатированных таким образом:

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

Более компактный формат также поддерживается для работы со [массивом колонок](../assets/columns-array.json) вместо объекта, используя формат [`JSONCompactColumns`](/interfaces/formats.md/#jsoncompactcolumns):

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

## Сохранение JSON объектов вместо разбора {#saving-json-objects-instead-of-parsing}

Существуют случаи, когда вы можете захотеть сохранить JSON объекты в одной колонке `String` (или `JSON`), а не разбирать их. Это может быть полезно при работе со списком JSON объектов различных структур. Рассмотрим [этот файл](../assets/custom.json) в качестве примера, где у нас есть несколько различных JSON объектов внутри родительского списка:

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

Мы хотим сохранить исходные JSON объекты в следующую таблицу:

```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```

Теперь мы можем загрузить данные из файла в эту таблицу, используя формат [`JSONAsString`](/interfaces/formats.md/#jsonasstring), чтобы сохранить JSON объекты вместо разбора их:

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

И мы можем использовать [функции JSON](/sql-reference/functions/json-functions.md) для запроса сохраненных объектов:

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

Обратите внимание, что `JSONAsString` отлично работает в случаях, когда у нас есть файлы, форматированные как JSON объект на строку (обычно используемые с форматом `JSONEachRow`).

## Схема для вложенных объектов {#schema-for-nested-objects}

В случаях, когда мы имеем дело с [вложенными JSON объектами](../assets/list-nested.json), мы можем дополнительно определить явную схему и использовать сложные типы ([`Array`](/sql-reference/data-types/array.md), [`JSON`](/integrations/data-formats/json/overview) или [`Tuple`](/sql-reference/data-types/tuple.md)) для загрузки данных:

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

## Доступ к вложенным JSON объектам {#accessing-nested-json-objects}

Мы можем ссылаться на [вложенные JSON ключи](../assets/list-nested.json), включив [следующий параметр настройки](/operations/settings/settings-formats.md/#input_format_import_nested_json):

```sql
SET input_format_import_nested_json = 1
```

Это позволяет нам ссылаться на ключи вложенного JSON объекта, используя точечную нотацию (не забудьте обернуть их в символы обратной кавычки для работы):

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

Таким образом, мы можем уплощать вложенные JSON объекты или использовать некоторые вложенные значения, чтобы сохранить их в качестве отдельных колонок.

## Пропуск неизвестных колонок {#skipping-unknown-columns}

По умолчанию ClickHouse будет игнорировать неизвестные колонки при импорте данных JSON. Давайте попробуем импортировать исходный файл в таблицу без колонки `month`:

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

Мы все равно можем вставить [исходные JSON данные](../assets/list.json) с 3 колонками в эту таблицу:

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

ClickHouse будет игнорировать неизвестные колонки при импорте. Это можно отключить с помощью параметра [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields):

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```
```response
Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

ClickHouse вызовет исключения в случае несоответствия структуры JSON и таблицы.

## BSON {#bson}

ClickHouse позволяет экспортировать и импортировать данные из закодированных в [BSON](https://bsonspec.org/) файлов. Этот формат используется некоторыми СУБД, например, базой данных [MongoDB](https://github.com/mongodb/mongo).

Чтобы импортировать данные BSON, мы используем формат [BSONEachRow](/interfaces/formats.md/#bsoneachrow). Давайте импортируем данные из [этого BSON файла](../assets/data.bson):

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

Мы также можем экспортировать в BSON файлы, используя тот же формат:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

После этого наши данные будут экспортированы в файл `out.bson`.