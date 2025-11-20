---
title: 'Обработка других форматов JSON'
slug: /integrations/data-formats/json/other-formats
description: 'Обработка других форматов JSON'
sidebar_label: 'Обработка других форматов'
keywords: ['json', 'formats', 'json formats']
doc_type: 'guide'
---



# Обработка других форматов JSON

В предыдущих примерах загрузки данных JSON предполагается использование формата [`JSONEachRow`](/interfaces/formats/JSONEachRow) (`NDJSON`). Этот формат интерпретирует ключи в каждой строке JSON как столбцы. Например:

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

Выбрано 5 строк. Затрачено: 0.449 сек.
```

Хотя это, как правило, самый распространённый формат JSON, пользователи могут столкнуться с другими форматами или им может понадобиться прочитать JSON как единый объект.

Ниже мы приводим примеры чтения и загрузки JSON в других распространённых форматах.


## Чтение JSON как объекта {#reading-json-as-an-object}

В предыдущих примерах показано, как `JSONEachRow` читает JSON с разделением строк символом новой строки, при этом каждая строка читается как отдельный объект, сопоставляемый со строкой таблицы, а каждый ключ — со столбцом. Это идеально подходит для случаев, когда JSON имеет предсказуемую структуру с единственным типом данных для каждого столбца.

В отличие от этого, `JSONAsObject` обрабатывает каждую строку как единый объект `JSON` и сохраняет его в одном столбце типа [`JSON`](/sql-reference/data-types/newjson), что делает его более подходящим для вложенных JSON-структур и случаев, когда ключи являются динамическими и потенциально могут иметь более одного типа.

Используйте `JSONEachRow` для построчной вставки данных и [`JSONAsObject`](/interfaces/formats/JSONAsObject) при работе с гибкими или динамическими JSON-данными.

Сравните приведенный выше пример со следующим запросом, который читает те же данные как JSON-объект в каждой строке:

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

`JSONAsObject` полезен для вставки строк в таблицу с использованием одного столбца для JSON-объектов, например:

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

Формат `JSONAsObject` также может быть полезен для чтения JSON с разделением строк символом новой строки в случаях, когда структура объектов непостоянна. Например, если ключ имеет разные типы в разных строках (иногда это может быть строка, а иногда — объект). В таких случаях ClickHouse не может определить стабильную схему с помощью `JSONEachRow`, а `JSONAsObject` позволяет загружать данные без строгого контроля типов, сохраняя каждую JSON-строку целиком в одном столбце. Например, обратите внимание, как `JSONEachRow` завершается с ошибкой в следующем примере:

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONEachRow')

Elapsed: 1.198 sec.

```


Получено исключение от сервера (версия 24.12.1):
Code: 636. DB::Exception: Получено от sql-clickhouse.clickhouse.com:9440. DB::Exception: Невозможно извлечь структуру таблицы из файла в формате JSONEachRow. Ошибка:
Code: 117. DB::Exception: Объекты JSON содержат неоднозначные данные: в одних объектах путь &#39;record.subject&#39; имеет тип &#39;String&#39;, а в других — &#39;Tuple(`$type` String, cid String, uri String)&#39;. Вы можете включить настройку input&#95;format&#95;json&#95;use&#95;string&#95;type&#95;for&#95;ambiguous&#95;paths&#95;in&#95;named&#95;tuples&#95;inference&#95;from&#95;objects, чтобы использовать тип String для пути &#39;record.subject&#39;. (INCORRECT&#95;DATA) (version 24.12.1.18239 (official build))
Чтобы увеличить максимальное количество строк/байт, считываемых для определения структуры, используйте настройку input&#95;format&#95;max&#95;rows&#95;to&#95;read&#95;for&#95;schema&#95;inference/input&#95;format&#95;max&#95;bytes&#95;to&#95;read&#95;for&#95;schema&#95;inference.
Вы можете указать структуру вручную: (в файле/URI bluesky/file&#95;0001.json.gz). (CANNOT&#95;EXTRACT&#95;TABLE&#95;STRUCTURE)

````
 
В данном случае можно использовать `JSONAsObject`, поскольку тип `JSON` поддерживает несколько типов данных для одной и той же подколонки.

```sql
SELECT count()
FROM s3('https://clickhouse-public-datasets.s3.amazonaws.com/bluesky/file_0001.json.gz', 'JSONAsObject')

┌─count()─┐
│ 1000000 │
└─────────┘

Получена 1 строка. Затрачено: 0.480 сек. Обработано 1.00 млн строк, 256.00 Б (2.08 млн строк/с., 533.76 Б/с.)
````


## Массив JSON-объектов {#array-of-json-objects}

Одна из наиболее распространённых форм JSON-данных — это список JSON-объектов в JSON-массиве, как в [этом примере](../assets/list.json):

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

Создадим таблицу для таких данных:

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

Для импорта списка JSON-объектов можно использовать формат [`JSONEachRow`](/interfaces/formats/JSONEachRow) (вставка данных из файла [list.json](../assets/list.json)):

```sql
INSERT INTO sometable
FROM INFILE 'list.json'
FORMAT JSONEachRow
```

Мы использовали конструкцию [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) для загрузки данных из локального файла. Убедимся, что импорт выполнен успешно:

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


## Ключи JSON-объектов {#json-object-keys}

В некоторых случаях список JSON-объектов может быть представлен в виде свойств объекта вместо элементов массива (см. пример [objects.json](../assets/objects.json)):

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

ClickHouse может загружать данные из таких структур, используя формат [`JSONObjectEachRow`](/interfaces/formats/JSONObjectEachRow):

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

Предположим, что необходимо также сохранить в таблицу значения ключей родительского объекта. В этом случае можно использовать [следующую настройку](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name), чтобы указать имя столбца, в который будут сохранены значения ключей:

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

Теперь можно проверить, какие данные будут загружены из исходного JSON-файла, используя функцию [`file()`](/sql-reference/functions/files.md/#file):

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

Обратите внимание, что столбец `id` корректно заполнен значениями ключей.


## JSON-массивы {#json-arrays}

Иногда для экономии места JSON-файлы кодируются в виде массивов, а не объектов. В этом случае мы имеем дело со [списком JSON-массивов](../assets/arrays.json):

```bash
cat arrays.json
```

```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

В этом случае ClickHouse загрузит данные и сопоставит каждое значение с соответствующим столбцом на основе его позиции в массиве. Для этого используется формат [`JSONCompactEachRow`](/interfaces/formats/JSONCompactEachRow):

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

### Импорт отдельных столбцов из JSON-массивов {#importing-individual-columns-from-json-arrays}

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

ClickHouse использует формат [`JSONColumns`](/interfaces/formats/JSONColumns) для разбора данных, отформатированных подобным образом:

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

Также поддерживается более компактный формат при работе с [массивом столбцов](../assets/columns-array.json) вместо объекта с использованием формата [`JSONCompactColumns`](/interfaces/formats/JSONCompactColumns):

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


## Сохранение JSON-объектов без парсинга {#saving-json-objects-instead-of-parsing}

Бывают случаи, когда необходимо сохранить JSON-объекты в одну колонку типа `String` (или `JSON`) без их парсинга. Это может быть полезно при работе со списком JSON-объектов различной структуры. Рассмотрим [этот файл](../assets/custom.json) в качестве примера, где внутри родительского списка находятся несколько различных JSON-объектов:

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

Мы хотим сохранить исходные JSON-объекты в следующую таблицу:

```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```

Теперь можно загрузить данные из файла в эту таблицу, используя формат [`JSONAsString`](/interfaces/formats/JSONAsString), чтобы сохранить JSON-объекты без их парсинга:

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

Для запросов к сохранённым объектам можно использовать [функции для работы с JSON](/sql-reference/functions/json-functions.md):

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

Обратите внимание, что `JSONAsString` отлично работает в случаях, когда файлы отформатированы с одним JSON-объектом на строку (обычно используется с форматом `JSONEachRow`).


## Схема для вложенных объектов {#schema-for-nested-objects}

При работе с [вложенными JSON-объектами](../assets/list-nested.json) можно дополнительно определить явную схему и использовать сложные типы ([`Array`](/sql-reference/data-types/array.md), [`JSON`](/integrations/data-formats/json/overview) или [`Tuple`](/sql-reference/data-types/tuple.md)) для загрузки данных:

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


## Доступ к вложенным JSON-объектам {#accessing-nested-json-objects}

Для обращения к [вложенным ключам JSON](../assets/list-nested.json) необходимо включить [следующую настройку](/operations/settings/settings-formats.md/#input_format_import_nested_json):

```sql
SET input_format_import_nested_json = 1
```

Это позволяет обращаться к ключам вложенных JSON-объектов с использованием точечной нотации (не забудьте заключать их в обратные кавычки):

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

Таким образом можно выравнивать вложенные JSON-объекты или использовать отдельные вложенные значения, сохраняя их как отдельные столбцы.


## Пропуск неизвестных столбцов {#skipping-unknown-columns}

По умолчанию ClickHouse игнорирует неизвестные столбцы при импорте данных JSON. Попробуем импортировать исходный файл в таблицу без столбца `month`:

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

Мы по-прежнему можем вставить [исходные данные JSON](../assets/list.json) с 3 столбцами в эту таблицу:

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

ClickHouse игнорирует неизвестные столбцы при импорте. Это поведение можно отключить с помощью настройки [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields):

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```

```response
Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

ClickHouse генерирует исключения в случае несоответствия структуры JSON и столбцов таблицы.


## BSON {#bson}

ClickHouse позволяет экспортировать и импортировать данные из файлов в формате [BSON](https://bsonspec.org/). Этот формат используется в некоторых СУБД, например в базе данных [MongoDB](https://github.com/mongodb/mongo).

Для импорта данных BSON используется формат [BSONEachRow](/interfaces/formats/BSONEachRow). Импортируем данные из [этого BSON-файла](../assets/data.bson):

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

Также можно экспортировать данные в BSON-файлы, используя тот же формат:

```sql
SELECT *
FROM sometable
INTO OUTFILE 'out.bson'
FORMAT BSONEachRow
```

После этого данные будут экспортированы в файл `out.bson`.
