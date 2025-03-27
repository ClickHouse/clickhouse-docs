---
title: 'Обработка других форматов JSON'
slug: /integrations/data-formats/json/other-formats
description: 'Обработка других форматов JSON'
keywords: ['json', 'форматы', 'форматы json']
---


# Обработка других форматов

Ранее приведенные примеры загрузки данных JSON предполагают использование [`JSONEachRow`](/interfaces/formats#jsoneachrow) (ndjson). Мы предлагаем примеры загрузки JSON в других популярных форматах ниже.

## Массив JSON объектов {#array-of-json-objects}

Одна из самых популярных форм JSON данных — это наличие списка JSON объектов в массиве JSON, как в [этом примере](../assets/list.json):

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

Создадим таблицу для такого рода данных:

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

Мы использовали [FROM INFILE](/sql-reference/statements/insert-into.md/#inserting-data-from-a-file) для загрузки данных из локального файла, и мы можем увидеть, что импорт прошел успешно:

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

## Обработка NDJSON (JSON с разделением по строкам) {#handling-ndjson-line-delimited-json}

Многие приложения могут записывать данные в формате JSON, так что каждая строка лога является отдельным JSON объектом, как в [этом файле](../assets/object-per-line.json):

```bash
cat object-per-line.json
```
```response
{"path":"1-krona","month":"2017-01-01","hits":4}
{"path":"Ahmadabad-e_Kalij-e_Sofla","month":"2017-01-01","hits":3}
{"path":"Bob_Dolman","month":"2016-11-01","hits":245}
```

Тот же формат `JSONEachRow` способен работать с такими файлами:

```sql
INSERT INTO sometable FROM INFILE 'object-per-line.json' FORMAT JSONEachRow;
SELECT * FROM sometable;
```
```response
┌─path──────────────────────┬──────month─┬─hits─┐
│ Bob_Dolman                │ 2016-11-01 │  245 │
│ 1-krona                   │ 2017-01-01 │    4 │
│ Ahmadabad-e_Kalij-e_Sofla │ 2017-01-01 │    3 │
└───────────────────────────┴────────────┴──────┘
```

## Ключи объектов JSON {#json-object-keys}

В некоторых случаях список JSON объектов может быть закодирован как свойства объекта, а не как элементы массива (см. [objects.json](../assets/objects.json) для примера):

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

Предположим, мы также хотим сохранить значения ключей родительского объекта в таблице. В этом случае мы можем использовать [следующий параметр](/operations/settings/settings-formats.md/#format_json_object_each_row_column_for_object_name) для определения имени столбца, в который мы хотим сохранить значения ключей:

```sql
SET format_json_object_each_row_column_for_object_name = 'id'
```

Теперь мы можем проверить, какие данные будут загружены из оригинального JSON файла, используя функцию [`file()`](/sql-reference/functions/files.md/#file):

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

Обратите внимание, что столбец `id` заполнился значениями ключей корректно.

## JSON Массивы {#json-arrays}

Иногда, ради экономии места, JSON файлы кодируются в массивы вместо объектов. В этом случае мы имеем [список JSON массивов](../assets/arrays.json):

```bash
cat arrays.json
```
```response
["Akiba_Hebrew_Academy", "2017-08-01", 241],
["Aegithina_tiphia", "2018-02-01", 34],
["1971-72_Utah_Stars_season", "2016-10-01", 1]
```

В этом случае ClickHouse загрузит эти данные и назначит каждое значение соответствующему столбцу на основе их порядка в массиве. Мы используем формат [`JSONCompactEachRow`](/interfaces/formats.md/#jsoncompacteachrow) для этого:

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

### Импорт отдельных столбцов из JSON массивов {#importing-individual-columns-from-json-arrays}

В некоторых случаях данные могут быть закодированы по столбцам вместо по строкам. В этом случае родительский JSON объект содержит столбцы со значениями. Посмотрите на [следующий файл](../assets/columns.json):

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

Также поддерживается более компактный формат, когда мы имеем [массив столбцов](../assets/columns-array.json) вместо объекта, используя формат [`JSONCompactColumns`](/interfaces/formats.md/#jsoncompactcolumns):

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

Есть случаи, когда вы можете захотеть сохранить JSON объекты в одном столбце `String` (или JSON), а не разбирать его. Это может быть полезно при работе со списком JSON объектов с различными структурами. Рассмотрим [этот файл](../assets/custom.json), в котором у нас есть несколько различных JSON объектов внутри родительского списка:

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

Мы хотим сохранить оригинальные JSON объекты в следующей таблице:

```sql
CREATE TABLE events
(
    `data` String
)
ENGINE = MergeTree
ORDER BY ()
```

Теперь мы можем загрузить данные из файла в эту таблицу, используя формат [`JSONAsString`](/interfaces/formats.md/#jsonasstring), чтобы сохранить JSON объекты, а не разбирать их:

```sql
INSERT INTO events (data)
FROM INFILE 'custom.json'
FORMAT JSONAsString
```

И мы можем использовать [функции JSON](/sql-reference/functions/json-functions.md), чтобы запросить сохраненные объекты:

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

Обратите внимание, что `JSONAsString` прекрасно работает в случаях, когда у нас есть JSON файлы, отформатированные по одной строке на объект (обычно используемые с форматом `JSONEachRow`).

## Схема для вложенных объектов {#schema-for-nested-objects}

В случаях, когда мы имеем дело с [вложенными JSON объектами](../assets/list-nested.json), мы можем дополнительно определить схему и использовать сложные типы ([`Array`](/sql-reference/data-types/array.md), [`Object Data Type`](/sql-reference/data-types/object-data-type) или [`Tuple`](/sql-reference/data-types/tuple.md)), чтобы загрузить данные:

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

Мы можем ссылаться на [вложенные JSON ключи](../assets/list-nested.json), включив [следующую настройку](/operations/settings/settings-formats.md/#input_format_import_nested_json):

```sql
SET input_format_import_nested_json = 1
```

Это позволяет нам ссылаться на ключи вложенных JSON объектов, используя нотацию с точками (не забудьте обернуть их в символы обратной кавычки, чтобы это работало):

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

Таким образом, мы можем развернуть вложенные JSON объекты или использовать некоторые вложенные значения, чтобы сохранить их в отдельных столбцах.

## Пропуск неизвестных столбцов {#skipping-unknown-columns}

По умолчанию ClickHouse будет игнорировать неизвестные столбцы при импорте JSON данных. Давайте попробуем импортировать оригинальный файл в таблицу без столбца `month`:

```sql
CREATE TABLE shorttable
(
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY path
```

Мы все еще можем вставить [оригинальные JSON данные](../assets/list.json) с 3 столбцами в эту таблицу:

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

ClickHouse будет игнорировать неизвестные столбцы во время импорта. Это можно отключить с помощью параметра [input_format_skip_unknown_fields](/operations/settings/settings-formats.md/#input_format_skip_unknown_fields):

```sql
SET input_format_skip_unknown_fields = 0;
INSERT INTO shorttable FROM INFILE 'list.json' FORMAT JSONEachRow;
```
```response
Ok.
Exception on client:
Code: 117. DB::Exception: Unknown field found while parsing JSONEachRow format: month: (in file/uri /data/clickhouse/user_files/list.json): (at row 1)
```

ClickHouse выдаст исключения в случаях несоответствия структуры JSON и структуры столбцов таблицы.

## BSON {#bson}

ClickHouse позволяет экспортировать и импортировать данные из файлов, закодированных в [BSON](https://bsonspec.org/). Этот формат используется некоторыми СУБД, например [MongoDB](https://github.com/mongodb/mongo).

Для импорта данных BSON мы используем формат [BSONEachRow](/interfaces/formats.md/#bsoneachrow). Давайте импортируем данные из [этого BSON файла](../assets/data.bson):

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

После этого мы получим наши данные, экспортированные в файл `out.bson`.
