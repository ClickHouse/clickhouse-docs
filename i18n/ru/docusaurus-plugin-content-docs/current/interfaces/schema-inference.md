---
slug: '/interfaces/schema-inference'
sidebar_label: 'Вывод схемы'
description: 'Страница, описывающая автоматический вывод схемы из входных данных'
title: 'Автоматический вывод схемы из входных данных'
doc_type: reference
---
ClickHouse может автоматически определить структуру входных данных почти для всех поддерживаемых [форматов ввода](formats.md). Этот документ описывает, когда используется вывод схемы, как он работает с различными форматами ввода и какие настройки могут его контролировать.

## Использование {#usage}

Вывод схемы используется, когда ClickHouse нужно прочитать данные в определенном формате, и структура неизвестна.

## Табличные функции [file](../sql-reference/table-functions/file.md), [s3](../sql-reference/table-functions/s3.md), [url](../sql-reference/table-functions/url.md), [hdfs](../sql-reference/table-functions/hdfs.md), [azureBlobStorage](../sql-reference/table-functions/azureBlobStorage.md). {#table-functions-file-s3-url-hdfs-azureblobstorage}

Эти табличные функции имеют опциональный аргумент `structure` с структурой входных данных. Если этот аргумент не указан или установлен в `auto`, структура будет определена на основе данных.

**Пример:**

Предположим, у нас есть файл `hobbies.jsonl` в формате JSONEachRow в директории `user_files` со следующим содержимым:
```json
{"id" :  1, "age" :  25, "name" :  "Josh", "hobbies" :  ["football", "cooking", "music"]}
{"id" :  2, "age" :  19, "name" :  "Alan", "hobbies" :  ["tennis", "art"]}
{"id" :  3, "age" :  32, "name" :  "Lana", "hobbies" :  ["fitness", "reading", "shopping"]}
{"id" :  4, "age" :  47, "name" :  "Brayan", "hobbies" :  ["movies", "skydiving"]}
```

ClickHouse может прочитать эти данные без указания его структуры:
```sql
SELECT * FROM file('hobbies.jsonl')
```
```response
┌─id─┬─age─┬─name───┬─hobbies──────────────────────────┐
│  1 │  25 │ Josh   │ ['football','cooking','music']   │
│  2 │  19 │ Alan   │ ['tennis','art']                 │
│  3 │  32 │ Lana   │ ['fitness','reading','shopping'] │
│  4 │  47 │ Brayan │ ['movies','skydiving']           │
└────┴─────┴────────┴──────────────────────────────────┘
```

Примечание: формат `JSONEachRow` был автоматически определен на основе расширения файла `.jsonl`.

Вы можете увидеть автоматически определенную структуру, используя запрос `DESCRIBE`:
```sql
DESCRIBE file('hobbies.jsonl')
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ Nullable(Int64)         │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

## Табличные движки [File](../engines/table-engines/special/file.md), [S3](../engines/table-engines/integrations/s3.md), [URL](../engines/table-engines/special/url.md), [HDFS](../engines/table-engines/integrations/hdfs.md), [azureBlobStorage](../engines/table-engines/integrations/azureBlobStorage.md) {#table-engines-file-s3-url-hdfs-azureblobstorage}

Если список столбцов не указан в запросе `CREATE TABLE`, структура таблицы будет автоматически определена на основе данных.

**Пример:**

Используем файл `hobbies.jsonl`. Мы можем создать таблицу с движком `File` с данными из этого файла:
```sql
CREATE TABLE hobbies ENGINE=File(JSONEachRow, 'hobbies.jsonl')
```
```response
Ok.
```
```sql
SELECT * FROM hobbies
```
```response
┌─id─┬─age─┬─name───┬─hobbies──────────────────────────┐
│  1 │  25 │ Josh   │ ['football','cooking','music']   │
│  2 │  19 │ Alan   │ ['tennis','art']                 │
│  3 │  32 │ Lana   │ ['fitness','reading','shopping'] │
│  4 │  47 │ Brayan │ ['movies','skydiving']           │
└────┴─────┴────────┴──────────────────────────────────┘
```
```sql
DESCRIBE TABLE hobbies
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ Nullable(Int64)         │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

## clickhouse-local {#clickhouse-local}

`clickhouse-local` имеет опциональный параметр `-S/--structure` с структурой входных данных. Если этот параметр не указан или установлен в `auto`, структура будет определена на основе данных.

**Пример:**

Используем файл `hobbies.jsonl`. Мы можем запросить данные из этого файла, используя `clickhouse-local`:
```shell
clickhouse-local --file='hobbies.jsonl' --table='hobbies' --query='DESCRIBE TABLE hobbies'
```
```response
id    Nullable(Int64)
age    Nullable(Int64)
name    Nullable(String)
hobbies    Array(Nullable(String))
```
```shell
clickhouse-local --file='hobbies.jsonl' --table='hobbies' --query='SELECT * FROM hobbies'
```
```response
1    25    Josh    ['football','cooking','music']
2    19    Alan    ['tennis','art']
3    32    Lana    ['fitness','reading','shopping']
4    47    Brayan    ['movies','skydiving']
```

## Использование структуры из таблицы вставки {#using-structure-from-insertion-table}

Когда табличные функции `file/s3/url/hdfs` используются для вставки данных в таблицу, есть возможность использовать структуру из таблицы вставки вместо извлечения ее из данных. Это может улучшить производительность вставки, так как извлечение схемы может занять некоторое время. Также это будет полезно, когда таблица имеет оптимизированную схему, поэтому преобразования между типами не будут выполняться.

Существует специальная настройка [use_structure_from_insertion_table_in_table_functions](/operations/settings/settings.md/#use_structure_from_insertion_table_in_table_functions), которая контролирует это поведение. Она имеет 3 возможных значения:
- 0 - табличная функция извлечет структуру из данных.
- 1 - табличная функция будет использовать структуру из таблицы вставки.
- 2 - ClickHouse автоматически определит, возможно ли использовать структуру из таблицы вставки или использовать вывод схемы. Значение по умолчанию.

**Пример 1:**

Создадим таблицу `hobbies1` с следующей структурой:
```sql
CREATE TABLE hobbies1
(
    `id` UInt64,
    `age` LowCardinality(UInt8),
    `name` String,
    `hobbies` Array(String)
)
ENGINE = MergeTree
ORDER BY id;
```

И вставим данные из файла `hobbies.jsonl`:

```sql
INSERT INTO hobbies1 SELECT * FROM file(hobbies.jsonl)
```

В этом случае все столбцы из файла вставляются в таблицу без изменений, поэтому ClickHouse будет использовать структуру из таблицы вставки вместо вывода схемы.

**Пример 2:**

Создадим таблицу `hobbies2` с следующей структурой:
```sql
CREATE TABLE hobbies2
(
  `id` UInt64,
  `age` LowCardinality(UInt8),
  `hobbies` Array(String)
)
  ENGINE = MergeTree
ORDER BY id;
```

И вставим данные из файла `hobbies.jsonl`:

```sql
INSERT INTO hobbies2 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

В этом случае все столбцы в запросе `SELECT` присутствуют в таблице, так что ClickHouse будет использовать структуру из таблицы вставки. Обратите внимание, что это будет работать только для форматов ввода, которые поддерживают чтение подмножества столбцов, таких как JSONEachRow, TSKV, Parquet и т.д. (поэтому это не сработает, например, для формата TSV).

**Пример 3:**

Создадим таблицу `hobbies3` с следующей структурой:
```sql
CREATE TABLE hobbies3
(
  `identifier` UInt64,
  `age` LowCardinality(UInt8),
  `hobbies` Array(String)
)
  ENGINE = MergeTree
ORDER BY identifier;
```

И вставим данные из файла `hobbies.jsonl`:

```sql
INSERT INTO hobbies3 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

В этом случае столбец `id` используется в запросе `SELECT`, но в таблице нет этого столбца (в ней есть столбец с именем `identifier`), поэтому ClickHouse не может использовать структуру из таблицы вставки, и будет использован вывод схемы.

**Пример 4:**

Создадим таблицу `hobbies4` с следующей структурой:
```sql
CREATE TABLE hobbies4
(
  `id` UInt64,
  `any_hobby` Nullable(String)
)
  ENGINE = MergeTree
ORDER BY id;
```

И вставим данные из файла `hobbies.jsonl`:

```sql
INSERT INTO hobbies4 SELECT id, empty(hobbies) ? NULL : hobbies[1] FROM file(hobbies.jsonl)
```

В этом случае выполняются некоторые операции со столбцом `hobbies` в запросе `SELECT`, чтобы вставить его в таблицу, поэтому ClickHouse не может использовать структуру из таблицы вставки, и будет использован вывод схемы.

## Кэш вывода схемы {#schema-inference-cache}

Для большинства форматов ввода вывод схемы читает некоторые данные, чтобы определить его структуру, и этот процесс может занять некоторое время. Чтобы избежать повторного вывода одной и той же схемы каждый раз, когда ClickHouse читает данные из одного и того же файла, извлеченная схема кэшируется, и при повторном доступе к тому же файлу ClickHouse будет использовать схему из кэша.

Существуют специальные настройки для управления этим кэшем:
- `schema_inference_cache_max_elements_for_{file/s3/hdfs/url/azure}` - максимальное количество кэшированных схем для соответствующей табличной функции. Значение по умолчанию - `4096`. Эти настройки должны быть установлены в конфигурации сервера.
- `schema_inference_use_cache_for_{file,s3,hdfs,url,azure}` - позволяет включать/выключать использование кэша для вывода схемы. Эти настройки могут использоваться в запросах.

Схема файла может быть изменена путем изменения данных или настройки формата. По этой причине кэш вывода схемы идентифицирует схему по источнику файла, имени формата, используемым настройкам формата и времени последнего изменения файла.

Примечание: некоторые файлы, доступные по URL в табличной функции `url`, могут не содержать информацию о времени последнего изменения; для этого случая существует специальная настройка `schema_inference_cache_require_modification_time_for_url`. Отключение этой настройки позволяет использовать схему из кэша без времени последнего изменения для таких файлов.

Также существует системная таблица [schema_inference_cache](../operations/system-tables/schema_inference_cache.md) со всеми текущими схемами в кэше и системный запрос `SYSTEM DROP SCHEMA CACHE [FOR File/S3/URL/HDFS]`, который позволяет очистить кэш схем для всех источников или для конкретного источника.

**Примеры:**

Давайте попытаемся определить структуру выборки данных из s3 `github-2022.ndjson.gz` и посмотрим, как работает кэш вывода схемы:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
SETTINGS allow_experimental_object_type = 1
```
```response
┌─name───────┬─type─────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ type       │ Nullable(String)         │              │                    │         │                  │                │
│ actor      │ Object(Nullable('json')) │              │                    │         │                  │                │
│ repo       │ Object(Nullable('json')) │              │                    │         │                  │                │
│ created_at │ Nullable(String)         │              │                    │         │                  │                │
│ payload    │ Object(Nullable('json')) │              │                    │         │                  │                │
└────────────┴──────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

5 rows in set. Elapsed: 0.601 sec.
```
```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
SETTINGS allow_experimental_object_type = 1
```
```response
┌─name───────┬─type─────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ type       │ Nullable(String)         │              │                    │         │                  │                │
│ actor      │ Object(Nullable('json')) │              │                    │         │                  │                │
│ repo       │ Object(Nullable('json')) │              │                    │         │                  │                │
│ created_at │ Nullable(String)         │              │                    │         │                  │                │
│ payload    │ Object(Nullable('json')) │              │                    │         │                  │                │
└────────────┴──────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

5 rows in set. Elapsed: 0.059 sec.
```

Как видите, второй запрос прошел практически мгновенно.

Попробуем изменить некоторые настройки, которые могут повлиять на вывод схемы:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
SETTINGS input_format_json_read_objects_as_strings = 1

┌─name───────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ type       │ Nullable(String) │              │                    │         │                  │                │
│ actor      │ Nullable(String) │              │                    │         │                  │                │
│ repo       │ Nullable(String) │              │                    │         │                  │                │
│ created_at │ Nullable(String) │              │                    │         │                  │                │
│ payload    │ Nullable(String) │              │                    │         │                  │                │
└────────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

5 rows in set. Elapsed: 0.611 sec
```

Как видно, схема из кэша не была использована для того же файла, потому что настройка, которая может повлиять на вывод схемы, была изменена.

Давайте проверим содержимое таблицы `system.schema_inference_cache`:

```sql
SELECT schema, format, source FROM system.schema_inference_cache WHERE storage='S3'
```
```response
┌─schema──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─format─┬─source───────────────────────────────────────────────────────────────────────────────────────────────────┐
│ type Nullable(String), actor Object(Nullable('json')), repo Object(Nullable('json')), created_at Nullable(String), payload Object(Nullable('json')) │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
│ type Nullable(String), actor Nullable(String), repo Nullable(String), created_at Nullable(String), payload Nullable(String)                         │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Как видно, для одного и того же файла существуют две разные схемы.

Мы можем очистить кэш схемы, используя системный запрос:
```sql
SYSTEM DROP SCHEMA CACHE FOR S3
```
```response
Ok.
```
```sql
SELECT count() FROM system.schema_inference_cache WHERE storage='S3'
```
```response
┌─count()─┐
│       0 │
└─────────┘
```

## Текстовые форматы {#text-formats}

Для текстовых форматов ClickHouse читает данные построчно, извлекает значения столбцов в соответствии с форматом, а затем использует некоторые рекурсивные парсеры и эвристики для определения типа для каждого значения. Максимальное количество строк и байт, читаемых из данных при выводе схемы, контролируется настройками `input_format_max_rows_to_read_for_schema_inference` (по умолчанию 25000) и `input_format_max_bytes_to_read_for_schema_inference` (по умолчанию 32Mb). По умолчанию все выведенные типы являются [Nullable](../sql-reference/data-types/nullable.md), но вы можете изменить это, установив `schema_inference_make_columns_nullable` (см. примеры в разделе [настроек](#settings-for-text-formats)).

### JSON форматы {#json-formats}

В JSON форматах ClickHouse разбирает значения в соответствии со спецификацией JSON и затем пытается найти наиболее подходящий тип данных для них.

Давайте посмотрим, как это работает, какие типы могут быть выведены и какие конкретные настройки могут использоваться в JSON форматах.

**Примеры**

Здесь и далее будет использоваться табличная функция [формат](../sql-reference/table-functions/format.md) в примерах.

Целые числа, числа с плавающей запятой, логические значения, строки:
```sql
DESC format(JSONEachRow, '{"int" : 42, "float" : 42.42, "string" : "Hello, World!"}');
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ int    │ Nullable(Int64)   │              │                    │         │                  │                │
│ float  │ Nullable(Float64) │              │                    │         │                  │                │
│ bool   │ Nullable(Bool)    │              │                    │         │                  │                │
│ string │ Nullable(String)  │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Даты, Даты и Время:

```sql
DESC format(JSONEachRow, '{"date" : "2022-01-01", "datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}')
```
```response
┌─name───────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date       │ Nullable(Date)          │              │                    │         │                  │                │
│ datetime   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ datetime64 │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└────────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Массивы:
```sql
DESC format(JSONEachRow, '{"arr" : [1, 2, 3], "nested_arrays" : [[1, 2, 3], [4, 5, 6], []]}')
```
```response
┌─name──────────┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr           │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ nested_arrays │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────────────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Если массив содержит `null`, ClickHouse будет использовать типы из других элементов массива:
```sql
DESC format(JSONEachRow, '{"arr" : [null, 42, null]}')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Если массив содержит значения разных типов и настройка `input_format_json_infer_array_of_dynamic_from_array_of_different_types` включена (по умолчанию включена), то он будет иметь тип `Array(Dynamic)`:
```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types=1;
DESC format(JSONEachRow, '{"arr" : [42, "hello", [1, 2, 3]]}');
```

```response
┌─name─┬─type───────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Dynamic) │              │                    │         │                  │                │
└──────┴────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Именованные кортежи:

Когда настройка `input_format_json_try_infer_named_tuples_from_objects` включена, во время вывода схемы ClickHouse будет пытаться вывести именованный кортеж из объектов JSON. Результирующий именованный кортеж будет содержать все элементы из всех соответствующих объектов JSON из выборки данных.

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

```response
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Неименованные кортежи:

Если настройка `input_format_json_infer_array_of_dynamic_from_array_of_different_types` отключена, мы будем рассматривать массивы с элементами разных типов как неименованные кортежи в JSON форматах.
```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types = 0;
DESC format(JSONEachRow, '{"tuple" : [1, "Hello, World!", [1, 2, 3]]}')
```
```response
┌─name──┬─type─────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ tuple │ Tuple(Nullable(Int64), Nullable(String), Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Если некоторые значения равны `null` или пустые, мы используем типы соответствующих значений из других строк:
```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types=0;
DESC format(JSONEachRow, $$
                              {"tuple" : [1, null, null]}
                              {"tuple" : [null, "Hello, World!", []]}
                              {"tuple" : [null, null, [1, 2, 3]]}
                         $$)
```
```response
┌─name──┬─type─────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ tuple │ Tuple(Nullable(Int64), Nullable(String), Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Карты:

В JSON мы можем читать объекты со значениями одного и того же типа как тип карты. Примечание: это будет работать только при отключенных настройках `input_format_json_read_objects_as_strings` и `input_format_json_try_infer_named_tuples_from_objects`.

```sql
SET input_format_json_read_objects_as_strings = 0, input_format_json_try_infer_named_tuples_from_objects = 0;
DESC format(JSONEachRow, '{"map" : {"key1" : 42, "key2" : 24, "key3" : 4}}')
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ map  │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Тип объекта JSON (если настройка `allow_experimental_object_type` включена):

```sql
SET allow_experimental_object_type = 1
DESC format(JSONEachRow, $$
                            {"obj" : {"key1" : 42}}
                            {"obj" : {"key2" : "Hello, World!"}}
                            {"obj" : {"key1" : 24, "key3" : {"a" : 42, "b" : null}}}
                         $$)
```
```response
┌─name─┬─type─────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Object(Nullable('json')) │              │                    │         │                  │                │
└──────┴──────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Вложенные сложные типы:
```sql
DESC format(JSONEachRow, '{"value" : [[[42, 24], []], {"key1" : 42, "key2" : 24}]}')
```
```response
┌─name──┬─type─────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Tuple(Array(Array(Nullable(String))), Tuple(key1 Nullable(Int64), key2 Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Если ClickHouse не может определить тип для какого-то ключа, потому что данные содержат только null/пустые объекты/пустые массивы, будет использован тип `String`, если настройка `input_format_json_infer_incomplete_types_as_strings` включена, или будет выброшено исключение в противном случае:
```sql
DESC format(JSONEachRow, '{"arr" : [null, null]}') SETTINGS input_format_json_infer_incomplete_types_as_strings = 1;
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Nullable(String)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, '{"arr" : [null, null]}') SETTINGS input_format_json_infer_incomplete_types_as_strings = 0;
```
```response
Code: 652. DB::Exception: Received from localhost:9000. DB::Exception:
Cannot determine type for column 'arr' by first 1 rows of data,
most likely this column contains only Nulls or empty Arrays/Maps.
...
```

#### JSON настройки {#json-settings}
##### input_format_json_try_infer_numbers_from_strings {#input_format_json_try_infer_numbers_from_strings}

Включение этой настройки позволяет извлекать числа из строковых значений.

Эта настройка по умолчанию отключена.

**Пример:**

```sql
SET input_format_json_try_infer_numbers_from_strings = 1;
DESC format(JSONEachRow, $$
                              {"value" : "42"}
                              {"value" : "424242424242"}
                         $$)
```
```response
┌─name──┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(Int64) │              │                    │         │                  │                │
└───────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_try_infer_named_tuples_from_objects {#input_format_json_try_infer_named_tuples_from_objects}

Включение этой настройки позволяет извлекать именованные кортежи из объектов JSON. Результирующий именованный кортеж будет содержать все элементы из всех соответствующих объектов JSON из выборки данных. Это может быть полезно, когда данные JSON не разрежены, поэтому выборка данных будет содержать все возможные ключи объектов.

Эта настройка по умолчанию включена.

**Пример**

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

Результат:

```response
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"array" : [{"a" : 42, "b" : "Hello"}, {}, {"c" : [1,2,3]}, {"d" : "2020-01-01"}]}')
```

Результат:

```markdown
┌─name──┬─type────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ array │ Array(Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Nullable(Date))) │              │                    │         │                  │                │
└───────┴─────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects {#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects}

Включение этой настройки позволяет использовать тип String для неоднозначных путей при выводе именованных кортежей из объектов JSON (когда `input_format_json_try_infer_named_tuples_from_objects` включена) вместо исключения. Это позволяет читать объекты JSON как именованные кортежи, даже если есть неоднозначные пути.

По умолчанию отключена.

**Примеры**

При отключенной настройке:
```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
SET input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects = 0;
DESC format(JSONEachRow, '{"obj" : {"a" : 42}}, {"obj" : {"a" : {"b" : "Hello"}}}');
```
Результат:

```response
Code: 636. DB::Exception: The table structure cannot be extracted from a JSONEachRow format file. Error:
Code: 117. DB::Exception: JSON objects have ambiguous data: in some objects path 'a' has type 'Int64' and in some - 'Tuple(b String)'. You can enable setting input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects to use String type for path 'a'. (INCORRECT_DATA) (version 24.3.1.1).
You can specify the structure manually. (CANNOT_EXTRACT_TABLE_STRUCTURE)
```

При включенной настройке:
```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
SET input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : "a" : 42}, {"obj" : {"a" : {"b" : "Hello"}}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : 42}}, {"obj" : {"a" : {"b" : "Hello"}}}');
```

Результат:
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(String))     │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
┌─obj─────────────────┐
│ ('42')              │
│ ('{"b" : "Hello"}') │
└─────────────────────┘
```
##### input_format_json_read_objects_as_strings {#input_format_json_read_objects_as_strings}

Включение этой настройки позволяет читать вложенные объекты JSON как строки. Эта настройка может использоваться для чтения вложенных объектов JSON без использования типа объекта JSON.

Эта настройка по умолчанию включена.

Примечание: включение этой настройки будет иметь эффект только если настройка `input_format_json_try_infer_named_tuples_from_objects` отключена.

```sql
SET input_format_json_read_objects_as_strings = 1, input_format_json_try_infer_named_tuples_from_objects = 0;
DESC format(JSONEachRow, $$
                             {"obj" : {"key1" : 42, "key2" : [1,2,3,4]}}
                             {"obj" : {"key3" : {"nested_key" : 1}}}
                         $$)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_numbers_as_strings {#input_format_json_read_numbers_as_strings}

Включение этой настройки позволяет читать числовые значения как строки.

Эта настройка по умолчанию включена.

**Пример**

```sql
SET input_format_json_read_numbers_as_strings = 1;
DESC format(JSONEachRow, $$
                                {"value" : 1055}
                                {"value" : "unknown"}
                         $$)
```
```response
┌─name──┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(String) │              │                    │         │                  │                │
└───────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_bools_as_numbers {#input_format_json_read_bools_as_numbers}

Включение этой настройки позволяет читать логические значения как числа.

Эта настройка по умолчанию включена.

**Пример:**

```sql
SET input_format_json_read_bools_as_numbers = 1;
DESC format(JSONEachRow, $$
                                {"value" : true}
                                {"value" : 42}
                         $$)
```
```response
┌─name──┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(Int64) │              │                    │         │                  │                │
└───────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_bools_as_strings {#input_format_json_read_bools_as_strings}

Включение этой настройки позволяет читать логические значения как строки.

Эта настройка по умолчанию включена.

**Пример:**

```sql
SET input_format_json_read_bools_as_strings = 1;
DESC format(JSONEachRow, $$
                                {"value" : true}
                                {"value" : "Hello, World"}
                         $$)
```
```response
┌─name──┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Nullable(String) │              │                    │         │                  │                │
└───────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
##### input_format_json_read_arrays_as_strings {#input_format_json_read_arrays_as_strings}

Включение этой настройки позволяет читать массивы JSON как строки.

Эта настройка по умолчанию включена.

**Пример**

```sql
SET input_format_json_read_arrays_as_strings = 1;
SELECT arr, toTypeName(arr), JSONExtractArrayRaw(arr)[3] from format(JSONEachRow, 'arr String', '{"arr" : [1, "Hello", [1,2,3]]}');
```
```response
┌─arr───────────────────┬─toTypeName(arr)─┬─arrayElement(JSONExtractArrayRaw(arr), 3)─┐
│ [1, "Hello", [1,2,3]] │ String          │ [1,2,3]                                   │
└───────────────────────┴─────────────────┴───────────────────────────────────────────┘
```
##### input_format_json_infer_incomplete_types_as_strings {#input_format_json_infer_incomplete_types_as_strings}

Включение этой настройки позволяет использовать тип String для ключей JSON, которые содержат только `Null`/`{}`/`[]` в выборке данных при выводе схемы. В JSON форматах любое значение может быть прочитано как String, если все соответствующие настройки включены (они все включены по умолчанию), и мы можем избежать ошибок, таких как `Не удается определить тип для столбца 'column_name' по первым 25000 строкам данных, скорее всего, этот столбец содержит только Null или пустые Массивы/Карты` при выводе схемы, используем String тип для ключей с неизвестными типами.

Пример:

```sql
SET input_format_json_infer_incomplete_types_as_strings = 1, input_format_json_try_infer_named_tuples_from_objects = 1;
DESCRIBE format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
```

Результат:
```markdown
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Array(Nullable(Int64)), b Nullable(String), c Nullable(String), d Nullable(String), e Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

┌─obj────────────────────────────┐
│ ([1,2,3],'hello',NULL,'{}',[]) │
└────────────────────────────────┘
```

### CSV {#csv}

В формате CSV ClickHouse извлекает значения столбцов из строки в соответствии с разделителями. ClickHouse ожидает, что все типы, кроме чисел и строк, будут заключены в двойные кавычки. Если значение в двойных кавычках, ClickHouse пытается разобрать данные внутри кавычек, используя рекурсивный парсер, а затем пытается найти наиболее подходящий тип данных для него. Если значение не в двойных кавычках, ClickHouse пытается разобрать его как число, а если значение не является числом, ClickHouse рассматривает его как строку.

Если вы не хотите, чтобы ClickHouse пытался определить сложные типы, используя некоторые парсеры и эвристики, вы можете отключить настройку `input_format_csv_use_best_effort_in_schema_inference`, и ClickHouse будет рассматривать все столбцы как строки.

Если настройка `input_format_csv_detect_header` включена, ClickHouse попытается обнаружить заголовок с именами столбцов (и, возможно, типами) при выводе схемы. Эта настройка по умолчанию включена.

**Примеры:**

Целые числа, числа с плавающей запятой, логические значения, строки:
```sql
DESC format(CSV, '42,42.42,true,"Hello,World!"')
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
│ c3   │ Nullable(Bool)    │              │                    │         │                  │                │
│ c4   │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Строки без кавычек:
```sql
DESC format(CSV, 'Hello world!,World hello!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Даты, Даты и Время:

```sql
DESC format(CSV, '"2020-01-01","2020-01-01 00:00:00","2022-01-01 00:00:00.000"')
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Date)          │              │                    │         │                  │                │
│ c2   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ c3   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Массивы:
```sql
DESC format(CSV, '"[1,2,3]","[[1, 2], [], [3, 4]]"')
```
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(CSV, $$"['Hello', 'world']","[['Abc', 'Def'], []]"$$)
```
```response
┌─name─┬─type───────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(String))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Если массив содержит null, ClickHouse будет использовать типы из других элементов массива:
```sql
DESC format(CSV, '"[NULL, 42, NULL]"')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Карты:
```sql
DESC format(CSV, $$"{'key1' : 42, 'key2' : 24}"$$)
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Вложенные массивы и карты:
```sql
DESC format(CSV, $$"[{'key1' : [[42, 42], []], 'key2' : [[null], [42]]}]"$$)
```
```response
┌─name─┬─type──────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Array(Nullable(Int64))))) │              │                    │         │                  │                │
└──────┴───────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Если ClickHouse не может определить тип внутри кавычек, потому что данные содержат только null, ClickHouse будет считать его строкой:
```sql
DESC format(CSV, '"[NULL, NULL]"')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Пример с отключенной настройкой `input_format_csv_use_best_effort_in_schema_inference`:
```sql
SET input_format_csv_use_best_effort_in_schema_inference = 0
DESC format(CSV, '"[1,2,3]",42.42,Hello World!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
│ c3   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Примеры автоматического определения заголовка (когда `input_format_csv_detect_header` включен):

Только имена:
```sql
SELECT * FROM format(CSV,
$$"number","string","array"
42,"Hello","[1, 2, 3]"
43,"World","[4, 5, 6]"
$$)
```

```response
┌─number─┬─string─┬─array───┐
│     42 │ Hello  │ [1,2,3] │
│     43 │ World  │ [4,5,6] │
└────────┴────────┴─────────┘
```

Имена и типы:

```sql
DESC format(CSV,
$$"number","string","array"
"UInt32","String","Array(UInt16)"
42,"Hello","[1, 2, 3]"
43,"World","[4, 5, 6]"
$$)
```

```response
┌─name───┬─type──────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ UInt32        │              │                    │         │                  │                │
│ string │ String        │              │                    │         │                  │                │
│ array  │ Array(UInt16) │              │                    │         │                  │                │
└────────┴───────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Обратите внимание, что заголовок можно определить только если имеется хотя бы один столбец с нестроковым типом. Если все столбцы имеют строковый тип, заголовок не определяется:

```sql
SELECT * FROM format(CSV,
$$"first_column","second_column"
"Hello","World"
"World","Hello"
$$)
```

```response
┌─c1───────────┬─c2────────────┐
│ first_column │ second_column │
│ Hello        │ World         │
│ World        │ Hello         │
└──────────────┴───────────────┘
```

#### CSV настройки {#csv-settings}
##### input_format_csv_try_infer_numbers_from_strings {#input_format_csv_try_infer_numbers_from_strings}

Включение этой настройки позволяет извлекать числа из строковых значений.

Эта настройка по умолчанию отключена.

**Пример:**

```sql
SET input_format_json_try_infer_numbers_from_strings = 1;
DESC format(CSV, '42,42.42');
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

### TSV/TSKV {#tsv-tskv}

В форматах TSV/TSKV ClickHouse извлекает значение столбцов из строки в соответствии с табличными разделителями, а затем разбирает извлеченное значение с помощью рекурсивного парсера, чтобы определить наиболее подходящий тип. Если тип не может быть определен, ClickHouse рассматривает это значение как строку.

Если вы не хотите, чтобы ClickHouse пытался определить сложные типы, используя некоторые парсеры и эвристики, вы можете отключить настройку `input_format_tsv_use_best_effort_in_schema_inference`, и ClickHouse будет рассматривать все столбцы как строки.

Если настройка `input_format_tsv_detect_header` включена, ClickHouse попытается обнаружить заголовок с именами столбцов (и, возможно, типами) при выводе схемы. Эта настройка по умолчанию включена.

**Примеры:**

Целые числа, числа с плавающей запятой, логические значения, строки:
```sql
DESC format(TSV, '42    42.42    true    Hello,World!')
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
│ c3   │ Nullable(Bool)    │              │                    │         │                  │                │
│ c4   │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(TSKV, 'int=42    float=42.42    bool=true    string=Hello,World!\n')
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ int    │ Nullable(Int64)   │              │                    │         │                  │                │
│ float  │ Nullable(Float64) │              │                    │         │                  │                │
│ bool   │ Nullable(Bool)    │              │                    │         │                  │                │
│ string │ Nullable(String)  │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Даты, Даты и Время:

```sql
DESC format(TSV, '2020-01-01    2020-01-01 00:00:00    2022-01-01 00:00:00.000')
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Date)          │              │                    │         │                  │                │
│ c2   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ c3   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Массивы:
```sql
DESC format(TSV, '[1,2,3]    [[1, 2], [], [3, 4]]')
```
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(TSV, '[''Hello'', ''world'']    [[''Abc'', ''Def''], []]')
```
```response
┌─name─┬─type───────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(String))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Если массив содержит null, ClickHouse будет использовать типы из других элементов массива:
```sql
DESC format(TSV, '[NULL, 42, NULL]')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Кортежи:
```sql
DESC format(TSV, $$(42, 'Hello, world!')$$)
```
```response
┌─name─┬─type─────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Tuple(Nullable(Int64), Nullable(String)) │              │                    │         │                  │                │
└──────┴──────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Карты:
```sql
DESC format(TSV, $${'key1' : 42, 'key2' : 24}$$)
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Вложенные массивы, кортежи и карты:
```sql
DESC format(TSV, $$[{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}]$$)
```
```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Если ClickHouse не может определить тип, потому что данные содержат только null, ClickHouse будет рассматривать его как строку:
```sql
DESC format(TSV, '[NULL, NULL]')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Пример с отключенной настройкой `input_format_tsv_use_best_effort_in_schema_inference`:
```sql
SET input_format_tsv_use_best_effort_in_schema_inference = 0
DESC format(TSV, '[1,2,3]    42.42    Hello World!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
│ c3   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Примеры автоматического определения заголовка (когда `input_format_tsv_detect_header` включен):

Только имена:
```sql
SELECT * FROM format(TSV,
$$number    string    array
42    Hello    [1, 2, 3]
43    World    [4, 5, 6]
$$);
```

```response
┌─number─┬─string─┬─array───┐
│     42 │ Hello  │ [1,2,3] │
│     43 │ World  │ [4,5,6] │
└────────┴────────┴─────────┘
```

Имена и типы:

```sql
DESC format(TSV,
$$number    string    array
UInt32    String    Array(UInt16)
42    Hello    [1, 2, 3]
43    World    [4, 5, 6]
$$)
```

```response
┌─name───┬─type──────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ UInt32        │              │                    │         │                  │                │
│ string │ String        │              │                    │         │                  │                │
│ array  │ Array(UInt16) │              │                    │         │                  │                │
└────────┴───────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Обратите внимание, что заголовок можно определить только если имеется хотя бы один столбец с нестроковым типом. Если все столбцы имеют строковый тип, заголовок не определяется:

```sql
SELECT * FROM format(TSV,
$$first_column    second_column
Hello    World
World    Hello
$$)
```

```response
┌─c1───────────┬─c2────────────┐
│ first_column │ second_column │
│ Hello        │ World         │
│ World        │ Hello         │
└──────────────┴───────────────┘
```

### Значения {#values}

В формате значений ClickHouse извлекает значение столбца из строки, а затем разбирает его, используя рекурсивный парсер, аналогично тому, как разбираются литералы.

**Примеры:**

Целые числа, числа с плавающей запятой, логические значения, строки:
```sql
DESC format(Values, $$(42, 42.42, true, 'Hello,World!')$$)
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)   │              │                    │         │                  │                │
│ c2   │ Nullable(Float64) │              │                    │         │                  │                │
│ c3   │ Nullable(Bool)    │              │                    │         │                  │                │
│ c4   │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Даты, Даты и Время:

```sql
DESC format(Values, $$('2020-01-01', '2020-01-01 00:00:00', '2022-01-01 00:00:00.000')$$)
```
```response
┌─name─┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Date)          │              │                    │         │                  │                │
│ c2   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ c3   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└──────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Массивы:
```sql
DESC format(Values, '([1,2,3], [[1, 2], [], [3, 4]])')
```
```response
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64))        │              │                    │         │                  │                │
│ c2   │ Array(Array(Nullable(Int64))) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Если массив содержит null, ClickHouse будет использовать типы из других элементов массива:
```sql
DESC format(Values, '([NULL, 42, NULL])')
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Кортежи:
```sql
DESC format(Values, $$((42, 'Hello, world!'))$$)
```
```response
┌─name─┬─type─────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Tuple(Nullable(Int64), Nullable(String)) │              │                    │         │                  │                │
└──────┴──────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Карты:
```sql
DESC format(Values, $$({'key1' : 42, 'key2' : 24})$$)
```
```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Вложенные массивы, кортежи и карты:
```sql
DESC format(Values, $$([{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}])$$)
```
```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Если ClickHouse не может определить тип, потому что данные содержат только null, будет выброшено исключение:
```sql
DESC format(Values, '([NULL, NULL])')
```
```response
Code: 652. DB::Exception: Received from localhost:9000. DB::Exception:
Cannot determine type for column 'c1' by first 1 rows of data,
most likely this column contains only Nulls or empty Arrays/Maps.
...
```

Пример с отключенной настройкой `input_format_tsv_use_best_effort_in_schema_inference`:
```sql
SET input_format_tsv_use_best_effort_in_schema_inference = 0
DESC format(TSV, '[1,2,3]    42.42    Hello World!')
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
│ c3   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

### CustomSeparated {#custom-separated}

В формате CustomSeparated ClickHouse сначала извлекает все значения столбцов из строки в соответствии с указанными разделителями, а затем пытается вывести тип данных для каждого значения в соответствии с правилом экранирования.

Если настройка `input_format_custom_detect_header` включена, ClickHouse попытается обнаружить заголовок с именами столбцов (и, возможно, типами) при выводе схемы. Эта настройка по умолчанию включена.

**Пример**

```sql
SET format_custom_row_before_delimiter = '<row_before_delimiter>',
       format_custom_row_after_delimiter = '<row_after_delimiter>\n',
       format_custom_row_between_delimiter = '<row_between_delimiter>\n',
       format_custom_result_before_delimiter = '<result_before_delimiter>\n',
       format_custom_result_after_delimiter = '<result_after_delimiter>\n',
       format_custom_field_delimiter = '<field_delimiter>',
       format_custom_escaping_rule = 'Quoted'

DESC format(CustomSeparated, $$<result_before_delimiter>
<row_before_delimiter>42.42<field_delimiter>'Some string 1'<field_delimiter>[1, NULL, 3]<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>NULL<field_delimiter>'Some string 3'<field_delimiter>[1, 2, NULL]<row_after_delimiter>
<result_after_delimiter>
$$)
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Float64)      │              │                    │         │                  │                │
│ c2   │ Nullable(String)       │              │                    │         │                  │                │
│ c3   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Пример автоматического определения заголовка (когда `input_format_custom_detect_header` включен):

```sql
SET format_custom_row_before_delimiter = '<row_before_delimiter>',
       format_custom_row_after_delimiter = '<row_after_delimiter>\n',
       format_custom_row_between_delimiter = '<row_between_delimiter>\n',
       format_custom_result_before_delimiter = '<result_before_delimiter>\n',
       format_custom_result_after_delimiter = '<result_after_delimiter>\n',
       format_custom_field_delimiter = '<field_delimiter>',
       format_custom_escaping_rule = 'Quoted'

DESC format(CustomSeparated, $$<result_before_delimiter>
<row_before_delimiter>'number'<field_delimiter>'string'<field_delimiter>'array'<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>42.42<field_delimiter>'Some string 1'<field_delimiter>[1, NULL, 3]<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>NULL<field_delimiter>'Some string 3'<field_delimiter>[1, 2, NULL]<row_after_delimiter>
<result_after_delimiter>
$$)
```

```response
┌─number─┬─string────────┬─array──────┐
│  42.42 │ Some string 1 │ [1,NULL,3] │
│   ᴺᵁᴸᴸ │ Some string 3 │ [1,2,NULL] │
└────────┴───────────────┴────────────┘
```

### Шаблон {#template}

В формате Template ClickHouse сначала извлекает все значения столбцов из строки в соответствии с указанным шаблоном, а затем пытается вывести тип данных для каждого значения в соответствии с его правилом экранирования.

**Пример**

Предположим, у нас есть файл `resultset` со следующим содержимым:
```bash
<result_before_delimiter>
${data}<result_after_delimiter>
```

И файл `row_format` со следующим содержимым:

```text
<row_before_delimiter>${column_1:CSV}<field_delimiter_1>${column_2:Quoted}<field_delimiter_2>${column_3:JSON}<row_after_delimiter>
```

Тогда мы можем выполнить следующие запросы:

```sql
SET format_template_rows_between_delimiter = '<row_between_delimiter>\n',
       format_template_row = 'row_format',
       format_template_resultset = 'resultset_format'

DESC format(Template, $$<result_before_delimiter>
<row_before_delimiter>42.42<field_delimiter_1>'Some string 1'<field_delimiter_2>[1, null, 2]<row_after_delimiter>
<row_between_delimiter>
<row_before_delimiter>\N<field_delimiter_1>'Some string 3'<field_delimiter_2>[1, 2, null]<row_after_delimiter>
<result_after_delimiter>
$$)
```
```response
┌─name─────┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ column_1 │ Nullable(Float64)      │              │                    │         │                  │                │
│ column_2 │ Nullable(String)       │              │                    │         │                  │                │
│ column_3 │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

### Регулярное выражение {#regexp}

Аналогично формату Template, в формате Regexp ClickHouse сначала извлекает все значения столбцов из строки в соответствии с указанным регулярным выражением, а затем пытается вывести тип данных для каждого значения в соответствии с указанным правилом экранирования.

**Пример**

```sql
SET format_regexp = '^Line: value_1=(.+?), value_2=(.+?), value_3=(.+?)',
       format_regexp_escaping_rule = 'CSV'

DESC format(Regexp, $$Line: value_1=42, value_2="Some string 1", value_3="[1, NULL, 3]"
Line: value_1=2, value_2="Some string 2", value_3="[4, 5, NULL]"$$)
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)        │              │                    │         │                  │                │
│ c2   │ Nullable(String)       │              │                    │         │                  │                │
│ c3   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

### Настройки для текстовых форматов {#settings-for-text-formats}
#### input_format_max_rows_to_read_for_schema_inference/input_format_max_bytes_to_read_for_schema_inference {#input-format-max-rows-to-read-for-schema-inference}

Эти настройки контролируют количество данных, которые будут прочитаны во время вывода схемы. Чем больше строк/байт читается, тем больше времени уходит на вывод схемы, но тем больше шансов правильно определить типы (особенно когда данные содержат много null).

Значения по умолчанию:
- `25000` для `input_format_max_rows_to_read_for_schema_inference`.
- `33554432` (32 Mb) для `input_format_max_bytes_to_read_for_schema_inference`.

#### column_names_for_schema_inference {#column-names-for-schema-inference}

Список имен столбцов, используемых при выводе схемы для форматов без явных имен столбцов. Указанные имена будут использоваться вместо значений по умолчанию `c1,c2,c3,...`. Формат: `column1,column2,column3,...`.

**Пример**

```sql
DESC format(TSV, 'Hello, World!    42    [1, 2, 3]') settings column_names_for_schema_inference = 'str,int,arr'
```
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ str  │ Nullable(String)       │              │                    │         │                  │                │
│ int  │ Nullable(Int64)        │              │                    │         │                  │                │
│ arr  │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

#### schema_inference_hints {#schema-inference-hints}

Список имен столбцов и типов, используемых при выводе схемы вместо автоматически определенных типов. Формат: 'column_name1 column_type1, column_name2 column_type2, ...'. Эта настройка может использоваться для указания типов столбцов, которые не удалось определить автоматически, или для оптимизации схемы.

**Пример**

```sql
DESC format(JSONEachRow, '{"id" : 1, "age" : 25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}') SETTINGS schema_inference_hints = 'age LowCardinality(UInt8), status Nullable(String)', allow_suspicious_low_cardinality_types=1
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ LowCardinality(UInt8)   │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ status  │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

#### schema_inference_make_columns_nullable {#schema-inference-make-columns-nullable}

Контролирует вывод типов как `Nullable` при выводе схемы для форматов без информации о нулевости. Возможные значения:
* 0 - выведенный тип никогда не будет `Nullable`,
* 1 - все выведенные типы будут `Nullable`,
* 2 или 'auto' - для текстовых форматов выведенный тип будет `Nullable` только если столбец содержит `NULL` в выборке, разбираемой во время вывода схемы; для форматов с жесткой типизацией (Parquet, ORC, Arrow) информация о нулевости берется из метаданных файла,
* 3 - для текстовых форматов используйте `Nullable`; для форматов с жесткой типизацией используйте метаданные файла.

Значение по умолчанию: 3.

**Примеры**

```sql
SET schema_inference_make_columns_nullable = 1
DESC format(JSONEachRow, $$
                                {"id" :  1, "age" :  25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}
                                {"id" :  2, "age" :  19, "name" :  "Alan", "status" : "married", "hobbies" :  ["tennis", "art"]}
                         $$)
```
```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Int64)         │              │                    │         │                  │                │
│ age     │ Nullable(Int64)         │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ status  │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET schema_inference_make_columns_nullable = 'auto';
DESC format(JSONEachRow, $$
                                {"id" :  1, "age" :  25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}
                                {"id" :  2, "age" :  19, "name" :  "Alan", "status" : "married", "hobbies" :  ["tennis", "art"]}
                         $$)
```
```response
┌─name────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Int64            │              │                    │         │                  │                │
│ age     │ Int64            │              │                    │         │                  │                │
│ name    │ String           │              │                    │         │                  │                │
│ status  │ Nullable(String) │              │                    │         │                  │                │
│ hobbies │ Array(String)    │              │                    │         │                  │                │
└─────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

```sql
SET schema_inference_make_columns_nullable = 0;
DESC format(JSONEachRow, $$
                                {"id" :  1, "age" :  25, "name" : "Josh", "status" : null, "hobbies" : ["football", "cooking"]}
                                {"id" :  2, "age" :  19, "name" :  "Alan", "status" : "married", "hobbies" :  ["tennis", "art"]}
                         $$)
```
```response

┌─name────┬─type──────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Int64         │              │                    │         │                  │                │
│ age     │ Int64         │              │                    │         │                  │                │
│ name    │ String        │              │                    │         │                  │                │
│ status  │ String        │              │                    │         │                  │                │
│ hobbies │ Array(String) │              │                    │         │                  │                │
└─────────┴───────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

#### input_format_try_infer_integers {#input-format-try-infer-integers}

:::note
Эта настройка не применяется к типу данных `JSON`.
:::

Если включена, ClickHouse будет пытаться вывести целые числа вместо чисел с плавающей запятой при выводе схемы для текстовых форматов. Если все числа в столбце из выборки данных являются целыми, тип результата будет `Int64`, если хотя бы одно число является числом с плавающей запятой, тип результата будет `Float64`. Если выборка данных содержит только целые числа и хотя бы одно целое число положительное и превышает `Int64`, ClickHouse выведет `UInt64`.

Включено по умолчанию.

**Примеры**

```sql
SET input_format_try_infer_integers = 0
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 2}
                         $$)
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(Float64) │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET input_format_try_infer_integers = 1
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 2}
                         $$)
```
```response
┌─name───┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(Int64) │              │                    │         │                  │                │
└────────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 18446744073709551615}
                         $$)
```
```response
┌─name───┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(UInt64) │              │                    │         │                  │                │
└────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"number" : 1}
                                {"number" : 2.2}
                         $$)
```
```response
┌─name───┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ number │ Nullable(Float64) │              │                    │         │                  │                │
└────────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

#### input_format_try_infer_datetimes {#input-format-try-infer-datetimes}

Если включена, ClickHouse будет пытаться вывести тип `DateTime` или `DateTime64` из строковых полей при выводе схемы для текстовых форматов. Если все поля из столбца в выборке данных были успешно разобраны как даты и времена, тип результата будет `DateTime` или `DateTime64(9)` (если какое-либо значение даты и времени имело дробную часть), если хотя бы одно поле не было разобрано как дата и время, тип результата будет `String`.

Включено по умолчанию.

**Примеры**

```sql
SET input_format_try_infer_datetimes = 0;
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}
                         $$)
```
```response
┌─name───────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(String) │              │                    │         │                  │                │
│ datetime64 │ Nullable(String) │              │                    │         │                  │                │
└────────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET input_format_try_infer_datetimes = 1;
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}
                         $$)
```
```response
┌─name───────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(DateTime)      │              │                    │         │                  │                │
│ datetime64 │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└────────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "unknown", "datetime64" : "unknown"}
                         $$)
```
```response
┌─name───────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(String) │              │                    │         │                  │                │
│ datetime64 │ Nullable(String) │              │                    │         │                  │                │
└────────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

#### input_format_try_infer_datetimes_only_datetime64 {#input-format-try-infer-datetimes-only-datetime64}

Если включена, ClickHouse всегда будет выводить `DateTime64(9)`, когда включена настройка `input_format_try_infer_datetimes`, даже если значения даты и времени не содержат дробной части.

Отключено по умолчанию.

**Примеры**

```sql
SET input_format_try_infer_datetimes = 1;
SET input_format_try_infer_datetimes_only_datetime64 = 1;
DESC format(JSONEachRow, $$
                                {"datetime" : "2021-01-01 00:00:00", "datetime64" : "2021-01-01 00:00:00.000"}
                                {"datetime" : "2022-01-01 00:00:00", "datetime64" : "2022-01-01 00:00:00.000"}
                         $$)
```

```response
┌─name───────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ datetime   │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
│ datetime64 │ Nullable(DateTime64(9)) │              │                    │         │                  │                │
└────────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Примечание: Разбор дат и времени при выводе схемы учитывает настройку [date_time_input_format](/operations/settings/settings-formats.md#date_time_input_format)

#### input_format_try_infer_dates {#input-format-try-infer-dates}

Если включена, ClickHouse будет пытаться вывести тип `Date` из строковых полей при выводе схемы для текстовых форматов. Если все поля из столбца в выборке данных были успешно разобраны как даты, тип результата будет `Date`, если хотя бы одно поле не было разобрано как дата, тип результата будет `String`.

Включено по умолчанию.

**Примеры**

```sql
SET input_format_try_infer_datetimes = 0, input_format_try_infer_dates = 0
DESC format(JSONEachRow, $$
                                {"date" : "2021-01-01"}
                                {"date" : "2022-01-01"}
                         $$)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
SET input_format_try_infer_dates = 1
DESC format(JSONEachRow, $$
                                {"date" : "2021-01-01"}
                                {"date" : "2022-01-01"}
                         $$)
```
```response
┌─name─┬─type───────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date │ Nullable(Date) │              │                    │         │                  │                │
└──────┴────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```
```sql
DESC format(JSONEachRow, $$
                                {"date" : "2021-01-01"}
                                {"date" : "unknown"}
                         $$)
```
```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ date │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

#### input_format_try_infer_exponent_floats {#input-format-try-infer-exponent-floats}

Если включено, ClickHouse будет пытаться вывести числа с плавающей запятой в экспоненциальной форме для текстовых форматов (за исключением JSON, где числа в экспоненциальной форме всегда выводятся).

Отключено по умолчанию.

**Пример**

```sql
SET input_format_try_infer_exponent_floats = 1;
DESC format(CSV,
$$1.1E10
2.3e-12
42E00
$$)
```
```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Float64) │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

## Самоописывающиеся форматы {#self-describing-formats}

Самоописывающиеся форматы содержат информацию о структуре данных в самих данных, это может быть какой-то заголовок с описанием, двоичное дерево типов или какая-то таблица. Чтобы автоматически вывести схему из файлов в таких форматах, ClickHouse читает часть данных, содержащих информацию о типах, и преобразует ее в схему таблицы ClickHouse.

### Форматы с суффиксом -WithNamesAndTypes {#formats-with-names-and-types}

ClickHouse поддерживает некоторые текстовые форматы с суффиксом -WithNamesAndTypes. Этот суффикс означает, что данные содержат две дополнительные строки с именами столбцов и типами перед фактическими данными. При выводе схемы для таких форматов ClickHouse читает первые две строки и извлекает имена и типы столбцов.

**Пример**

```sql
DESC format(TSVWithNamesAndTypes,
$$num    str    arr
UInt8    String    Array(UInt8)
42    Hello, World!    [1,2,3]
$$)
```
```response
┌─name─┬─type─────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ num  │ UInt8        │              │                    │         │                  │                │
│ str  │ String       │              │                    │         │                  │                │
│ arr  │ Array(UInt8) │              │                    │         │                  │                │
└──────┴──────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

### JSON форматы с метаданными {#json-with-metadata}

Некоторые JSON форматы ввода ([JSON](formats.md#json), [JSONCompact](/interfaces/formats/JSONCompact), [JSONColumnsWithMetadata](/interfaces/formats/JSONColumnsWithMetadata)) содержат метаданные с именами и типами столбцов. При выводе схемы для таких форматов ClickHouse читает эти метаданные.

**Пример**
```sql
DESC format(JSON, $$
{
    "meta":
    [
        {
            "name": "num",
            "type": "UInt8"
        },
        {
            "name": "str",
            "type": "String"
        },
        {
            "name": "arr",
            "type": "Array(UInt8)"
        }
    ],

    "data":
    [
        {
            "num": 42,
            "str": "Hello, World",
            "arr": [1,2,3]
        }
    ],

    "rows": 1,

    "statistics":
    {
        "elapsed": 0.005723915,
        "rows_read": 1,
        "bytes_read": 1
    }
}
$$)
```
```response
┌─name─┬─type─────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ num  │ UInt8        │              │                    │         │                  │                │
│ str  │ String       │              │                    │         │                  │                │
│ arr  │ Array(UInt8) │              │                    │         │                  │                │
└──────┴──────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

### Avro {#avro}

В формате Avro ClickHouse читает его схему из данных и преобразует ее в схему ClickHouse, используя следующие соответствия типов:

| Тип данных Avro                     | Тип данных ClickHouse                                                       |
|-------------------------------------|----------------------------------------------------------------------------|
| `boolean`                          | [Bool](../sql-reference/data-types/boolean.md)                             |
| `int`                              | [Int32](../sql-reference/data-types/int-uint.md)                           |
| `int (date)` \*                    | [Date32](../sql-reference/data-types/date32.md)                            |
| `long`                             | [Int64](../sql-reference/data-types/int-uint.md)                           |
| `float`                            | [Float32](../sql-reference/data-types/float.md)                            |
| `double`                           | [Float64](../sql-reference/data-types/float.md)                            |
| `bytes`, `string`                  | [String](../sql-reference/data-types/string.md)                            |
| `fixed`                            | [FixedString(N)](../sql-reference/data-types/fixedstring.md)               |
| `enum`                             | [Enum](../sql-reference/data-types/enum.md)                                |
| `array(T)`                         | [Array(T)](../sql-reference/data-types/array.md)                           |
| `union(null, T)`, `union(T, null)` | [Nullable(T)](../sql-reference/data-types/date.md)                         |
| `null`                             | [Nullable(Nothing)](../sql-reference/data-types/special-data-types/nothing.md) |
| `string (uuid)` \*                 | [UUID](../sql-reference/data-types/uuid.md)                                |
| `binary (decimal)` \*              | [Decimal(P, S)](../sql-reference/data-types/decimal.md)                   |

\* [Логические типы Avro](https://avro.apache.org/docs/current/spec.html#Logical+Types)

Другие типы Avro не поддерживаются.
### Parquet {#parquet}

В формате Parquet ClickHouse считывает свою схему из данных и преобразует её в схему ClickHouse с использованием следующих соответствий типов:

| Тип данных Parquet            | Тип данных ClickHouse                                   |
|-------------------------------|--------------------------------------------------------|
| `BOOL`                        | [Bool](../sql-reference/data-types/boolean.md)         |
| `UINT8`                      | [UInt8](../sql-reference/data-types/int-uint.md)       |
| `INT8`                       | [Int8](../sql-reference/data-types/int-uint.md)        |
| `UINT16`                     | [UInt16](../sql-reference/data-types/int-uint.md)      |
| `INT16`                      | [Int16](../sql-reference/data-types/int-uint.md)       |
| `UINT32`                     | [UInt32](../sql-reference/data-types/int-uint.md)      |
| `INT32`                      | [Int32](../sql-reference/data-types/int-uint.md)       |
| `UINT64`                     | [UInt64](../sql-reference/data-types/int-uint.md)      |
| `INT64`                      | [Int64](../sql-reference/data-types/int-uint.md)       |
| `FLOAT`                      | [Float32](../sql-reference/data-types/float.md)        |
| `DOUBLE`                     | [Float64](../sql-reference/data-types/float.md)        |
| `DATE`                       | [Date32](../sql-reference/data-types/date32.md)        |
| `TIME (ms)`                  | [DateTime](../sql-reference/data-types/datetime.md)    |
| `TIMESTAMP`, `TIME (us, ns)` | [DateTime64](../sql-reference/data-types/datetime64.md)|
| `STRING`, `BINARY`           | [String](../sql-reference/data-types/string.md)        |
| `DECIMAL`                    | [Decimal](../sql-reference/data-types/decimal.md)      |
| `LIST`                       | [Array](../sql-reference/data-types/array.md)          |
| `STRUCT`                     | [Tuple](../sql-reference/data-types/tuple.md)          |
| `MAP`                        | [Map](../sql-reference/data-types/map.md)              |

Другие типы Parquet не поддерживаются.

### Arrow {#arrow}

В формате Arrow ClickHouse считывает свою схему из данных и преобразует её в схему ClickHouse с использованием следующих соответствий типов:

| Тип данных Arrow               | Тип данных ClickHouse                                   |
|--------------------------------|--------------------------------------------------------|
| `BOOL`                         | [Bool](../sql-reference/data-types/boolean.md)         |
| `UINT8`                        | [UInt8](../sql-reference/data-types/int-uint.md)       |
| `INT8`                         | [Int8](../sql-reference/data-types/int-uint.md)        |
| `UINT16`                       | [UInt16](../sql-reference/data-types/int-uint.md)      |
| `INT16`                        | [Int16](../sql-reference/data-types/int-uint.md)       |
| `UINT32`                       | [UInt32](../sql-reference/data-types/int-uint.md)      |
| `INT32`                        | [Int32](../sql-reference/data-types/int-uint.md)       |
| `UINT64`                       | [UInt64](../sql-reference/data-types/int-uint.md)      |
| `INT64`                        | [Int64](../sql-reference/data-types/int-uint.md)       |
| `FLOAT`, `HALF_FLOAT`          | [Float32](../sql-reference/data-types/float.md)        |
| `DOUBLE`                       | [Float64](../sql-reference/data-types/float.md)        |
| `DATE32`                       | [Date32](../sql-reference/data-types/date32.md)        |
| `DATE64`                       | [DateTime](../sql-reference/data-types/datetime.md)    |
| `TIMESTAMP`, `TIME32`, `TIME64`| [DateTime64](../sql-reference/data-types/datetime64.md)|
| `STRING`, `BINARY`             | [String](../sql-reference/data-types/string.md)        |
| `DECIMAL128`, `DECIMAL256`      | [Decimal](../sql-reference/data-types/decimal.md)      |
| `LIST`                         | [Array](../sql-reference/data-types/array.md)          |
| `STRUCT`                       | [Tuple](../sql-reference/data-types/tuple.md)          |
| `MAP`                          | [Map](../sql-reference/data-types/map.md)              |

Другие типы Arrow не поддерживаются.

### ORC {#orc}

В формате ORC ClickHouse считывает свою схему из данных и преобразует её в схему ClickHouse с использованием следующих соответствий типов:

| Тип данных ORC                        | Тип данных ClickHouse                                   |
|---------------------------------------|--------------------------------------------------------|
| `Boolean`                             | [Bool](../sql-reference/data-types/boolean.md)         |
| `Tinyint`                             | [Int8](../sql-reference/data-types/int-uint.md)        |
| `Smallint`                            | [Int16](../sql-reference/data-types/int-uint.md)       |
| `Int`                                 | [Int32](../sql-reference/data-types/int-uint.md)       |
| `Bigint`                              | [Int64](../sql-reference/data-types/int-uint.md)       |
| `Float`                               | [Float32](../sql-reference/data-types/float.md)        |
| `Double`                              | [Float64](../sql-reference/data-types/float.md)        |
| `Date`                                | [Date32](../sql-reference/data-types/date32.md)        |
| `Timestamp`                           | [DateTime64](../sql-reference/data-types/datetime64.md)|
| `String`, `Char`, `Varchar`,`BINARY` | [String](../sql-reference/data-types/string.md)        |
| `Decimal`                             | [Decimal](../sql-reference/data-types/decimal.md)      |
| `List`                                | [Array](../sql-reference/data-types/array.md)          |
| `Struct`                              | [Tuple](../sql-reference/data-types/tuple.md)          |
| `Map`                                 | [Map](../sql-reference/data-types/map.md)              |

Другие типы ORC не поддерживаются.

### Native {#native}

Нативный формат используется внутри ClickHouse и содержит схему в данных. 
При выводе схемы ClickHouse считывает схему из данных без каких-либо преобразований.

## Форматы с внешней схемой {#formats-with-external-schema}

Такие форматы требуют схемы, описывающей данные в отдельном файле на специфическом языке схемы.
Чтобы автоматически вывести схему из файлов в таких форматах, ClickHouse считывает внешнюю схему из отдельного файла и преобразует её в схему таблицы ClickHouse.

### Protobuf {#protobuf}

При выводе схемы для формата Protobuf ClickHouse использует следующие соответствия типов:

| Тип данных Protobuf            | Тип данных ClickHouse                                |
|-------------------------------|-----------------------------------------------------|
| `bool`                        | [UInt8](../sql-reference/data-types/int-uint.md)   |
| `float`                       | [Float32](../sql-reference/data-types/float.md)     |
| `double`                      | [Float64](../sql-reference/data-types/float.md)     |
| `int32`, `sint32`, `sfixed32` | [Int32](../sql-reference/data-types/int-uint.md)   |
| `int64`, `sint64`, `sfixed64` | [Int64](../sql-reference/data-types/int-uint.md)   |
| `uint32`, `fixed32`           | [UInt32](../sql-reference/data-types/int-uint.md)  |
| `uint64`, `fixed64`           | [UInt64](../sql-reference/data-types/int-uint.md)  |
| `string`, `bytes`             | [String](../sql-reference/data-types/string.md)     |
| `enum`                        | [Enum](../sql-reference/data-types/enum.md)         |
| `repeated T`                  | [Array(T)](../sql-reference/data-types/array.md)    |
| `message`, `group`            | [Tuple](../sql-reference/data-types/tuple.md)       |

### CapnProto {#capnproto}

При выводе схемы для формата CapnProto ClickHouse использует следующие соответствия типов:

| Тип данных CapnProto                | Тип данных ClickHouse                                   |
|-------------------------------------|--------------------------------------------------------|
| `Bool`                              | [UInt8](../sql-reference/data-types/int-uint.md)       |
| `Int8`                              | [Int8](../sql-reference/data-types/int-uint.md)        |
| `UInt8`                             | [UInt8](../sql-reference/data-types/int-uint.md)       |
| `Int16`                             | [Int16](../sql-reference/data-types/int-uint.md)       |
| `UInt16`                            | [UInt16](../sql-reference/data-types/int-uint.md)      |
| `Int32`                             | [Int32](../sql-reference/data-types/int-uint.md)       |
| `UInt32`                            | [UInt32](../sql-reference/data-types/int-uint.md)      |
| `Int64`                             | [Int64](../sql-reference/data-types/int-uint.md)       |
| `UInt64`                            | [UInt64](../sql-reference/data-types/int-uint.md)      |
| `Float32`                           | [Float32](../sql-reference/data-types/float.md)        |
| `Float64`                           | [Float64](../sql-reference/data-types/float.md)        |
| `Text`, `Data`                      | [String](../sql-reference/data-types/string.md)        |
| `enum`                              | [Enum](../sql-reference/data-types/enum.md)            |
| `List`                              | [Array](../sql-reference/data-types/array.md)          |
| `struct`                            | [Tuple](../sql-reference/data-types/tuple.md)          |
| `union(T, Void)`, `union(Void, T)` | [Nullable(T)](../sql-reference/data-types/nullable.md) |

## Форматы с жесткой типизацией {#strong-typed-binary-formats}

В таких форматах каждое сериализованное значение содержит информацию о своем типе (и, возможно, о своем имени), но нет информации о всей таблице.
При выводе схемы для таких форматов ClickHouse считывает данные построчно (до `input_format_max_rows_to_read_for_schema_inference` строк или `input_format_max_bytes_to_read_for_schema_inference` байт) и извлекает
тип (и, возможно, имя) для каждого значения из данных, а затем преобразует эти типы в типы ClickHouse.

### MsgPack {#msgpack}

В формате MsgPack нет разделителя между строками, чтобы использовать вывод схемы для этого формата, вы должны указать количество столбцов в таблице, 
используя настройку `input_format_msgpack_number_of_columns`. ClickHouse использует следующие соответствия типов:

| Тип данных MessagePack (`INSERT`)                                     | Тип данных ClickHouse                                   |
|-----------------------------------------------------------------------|--------------------------------------------------------|
| `int N`, `uint N`, `negative fixint`, `positive fixint`              | [Int64](../sql-reference/data-types/int-uint.md)       |
| `bool`                                                                | [UInt8](../sql-reference/data-types/int-uint.md)       |
| `fixstr`, `str 8`, `str 16`, `str 32`, `bin 8`, `bin 16`, `bin 32`   | [String](../sql-reference/data-types/string.md)        |
| `float 32`                                                            | [Float32](../sql-reference/data-types/float.md)        |
| `float 64`                                                            | [Float64](../sql-reference/data-types/float.md)        |
| `uint 16`                                                             | [Date](../sql-reference/data-types/date.md)            |
| `uint 32`                                                             | [DateTime](../sql-reference/data-types/datetime.md)    |
| `uint 64`                                                             | [DateTime64](../sql-reference/data-types/datetime.md)  |
| `fixarray`, `array 16`, `array 32`                                   | [Array](../sql-reference/data-types/array.md)          |
| `fixmap`, `map 16`, `map 32`                                         | [Map](../sql-reference/data-types/map.md)              |

По умолчанию все выведенные типы находятся внутри `Nullable`, но это можно изменить с помощью настройки `schema_inference_make_columns_nullable`.

### BSONEachRow {#bsoneachrow}

В BSONEachRow каждая строка данных представляется как BSON-документ. При выводе схемы ClickHouse считывает BSON-документы по одному и извлекает
значения, имена и типы из данных, а затем преобразует эти типы в типы ClickHouse с использованием следующих соответствий типов:

| Тип BSON                                                                                         | Тип ClickHouse                                                                                                          |
|--------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| `\x08` boolean                                                                                  | [Bool](../sql-reference/data-types/boolean.md)                                                                         |
| `\x10` int32                                                                                    | [Int32](../sql-reference/data-types/int-uint.md)                                                                       |
| `\x12` int64                                                                                    | [Int64](../sql-reference/data-types/int-uint.md)                                                                       |
| `\x01` double                                                                                   | [Float64](../sql-reference/data-types/float.md)                                                                        |
| `\x09` datetime                                                                                 | [DateTime64](../sql-reference/data-types/datetime64.md)                                                                |
| `\x05` binary с подсистемой `\x00`, `\x02` строка, `\x0E` символ, `\x0D` код JavaScript       | [String](../sql-reference/data-types/string.md)                                                                        |
| `\x07` ObjectId,                                                                               | [FixedString(12)](../sql-reference/data-types/fixedstring.md)                                                          |
| `\x05` binary с подсистемой `\x04` uuid, размер = 16                                          | [UUID](../sql-reference/data-types/uuid.md)                                                                            |
| `\x04` массив                                                                                  | [Array](../sql-reference/data-types/array.md)/[Tuple](../sql-reference/data-types/tuple.md) (если вложенные типы разные)|
| `\x03` документ                                                                                 | [Named Tuple](../sql-reference/data-types/tuple.md)/[Map](../sql-reference/data-types/map.md) (с ключами String)        |

По умолчанию все выведенные типы находятся внутри `Nullable`, но это можно изменить с помощью настройки `schema_inference_make_columns_nullable`.

## Форматы с постоянной схемой {#formats-with-constant-schema}

Данные в таких форматах всегда имеют одну и ту же схему.

### LineAsString {#line-as-string}

В этом формате ClickHouse считывает всю строку из данных в один столбец с типом данных `String`. Выведенный тип для этого формата всегда `String`, а имя столбца `line`.

**Пример**

```sql
DESC format(LineAsString, 'Hello\nworld!')
```
```response
┌─name─┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ line │ String │              │                    │         │                  │                │
└──────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

### JSONAsString {#json-as-string}

В этом формате ClickHouse считывает весь JSON-объект из данных в один столбец с типом данных `String`. Выведенный тип для этого формата всегда `String`, а имя столбца `json`.

**Пример**

```sql
DESC format(JSONAsString, '{"x" : 42, "y" : "Hello, World!"}')
```
```response
┌─name─┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ json │ String │              │                    │         │                  │                │
└──────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

### JSONAsObject {#json-as-object}

В этом формате ClickHouse считывает весь JSON-объект из данных в один столбец с типом данных `Object('json')`. Выведенный тип для этого формата всегда `String`, а имя столбца `json`.

Примечание: Этот формат работает только в том случае, если включен параметр `allow_experimental_object_type`.

**Пример**

```sql
DESC format(JSONAsString, '{"x" : 42, "y" : "Hello, World!"}') SETTINGS allow_experimental_object_type=1
```
```response
┌─name─┬─type───────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ json │ Object('json') │              │                    │         │                  │                │
└──────┴────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

## Режимы вывода схемы {#schema-inference-modes}

Вывод схемы из набора файлов данных может работать в 2 различных режимах: `default` и `union`.
Режим контролируется настройкой `schema_inference_mode`.

### Режим по умолчанию {#default-schema-inference-mode}

В режиме по умолчанию ClickHouse предполагает, что все файлы имеют одну и ту же схему и пытается вывести схему, считывая файлы по одному, пока не достигнет успеха.

Пример:

Предположим, у нас есть 3 файла `data1.jsonl`, `data2.jsonl` и `data3.jsonl` со следующим содержимым:

`data1.jsonl`:
```json
{"field1" :  1, "field2" :  null}
{"field1" :  2, "field2" :  null}
{"field1" :  3, "field2" :  null}
```

`data2.jsonl`:
```json
{"field1" :  4, "field2" :  "Data4"}
{"field1" :  5, "field2" :  "Data5"}
{"field1" :  6, "field2" :  "Data5"}
```

`data3.jsonl`:
```json
{"field1" :  7, "field2" :  "Data7", "field3" :  [1, 2, 3]}
{"field1" :  8, "field2" :  "Data8", "field3" :  [4, 5, 6]}
{"field1" :  9, "field2" :  "Data9", "field3" :  [7, 8, 9]}
```

Попробуем использовать вывод схемы на этих 3 файлах:
```sql
:) DESCRIBE file('data{1,2,3}.jsonl') SETTINGS schema_inference_mode='default'
```

Результат:

```response
┌─name───┬─type─────────────┐
│ field1 │ Nullable(Int64)  │
│ field2 │ Nullable(String) │
└────────┴──────────────────┘
```

Как мы видим, у нас нет `field3` из файла `data3.jsonl`.
Это происходит потому, что ClickHouse сначала пытался вывести схему из файла `data1.jsonl`, не удалось из-за наличия только null для поля `field2`,
а затем пытался вывести схему из `data2.jsonl` и добился успеха, поэтому данные из файла `data3.jsonl` не были прочитаны.

### Режим объединения {#default-schema-inference-mode-1}

В режиме объединения ClickHouse предполагает, что файлы могут иметь разные схемы, поэтому он выводит схемы всех файлов, а затем объединяет их в общую схему.

Предположим, у нас есть 3 файла `data1.jsonl`, `data2.jsonl` и `data3.jsonl` со следующим содержимым:

`data1.jsonl`:
```json
{"field1" :  1}
{"field1" :  2}
{"field1" :  3}
```

`data2.jsonl`:
```json
{"field2" :  "Data4"}
{"field2" :  "Data5"}
{"field2" :  "Data5"}
```

`data3.jsonl`:
```json
{"field3" :  [1, 2, 3]}
{"field3" :  [4, 5, 6]}
{"field3" :  [7, 8, 9]}
```

Попробуем использовать вывод схемы на этих 3 файлах:
```sql
:) DESCRIBE file('data{1,2,3}.jsonl') SETTINGS schema_inference_mode='union'
```

Результат:

```response
┌─name───┬─type───────────────────┐
│ field1 │ Nullable(Int64)        │
│ field2 │ Nullable(String)       │
│ field3 │ Array(Nullable(Int64)) │
└────────┴────────────────────────┘
```

Как мы видим, у нас есть все поля из всех файлов.

Примечание:
- Поскольку некоторые файлы могут не содержать некоторые столбцы из результирующей схемы, режим объединения поддерживается только для форматов, которые поддерживают чтение подмножества столбцов (таких как JSONEachRow, Parquet, TSVWithNames и т. д.) и не будет работать для других форматов (таких как CSV, TSV, JSONCompactEachRow и т. д.).
- Если ClickHouse не может вывести схему из одного из файлов, будет выброшено исключение.
- Если у вас много файлов, считывание схемы из всех них может занять много времени.

## Автоматическое определение формата {#automatic-format-detection}

Если формат данных не указан и не может быть определён по расширению файла, ClickHouse попытается определить формат файла по его содержимому.

**Примеры:**

Предположим, у нас есть `data` со следующим содержимым:
```csv
"a","b"
1,"Data1"
2,"Data2"
3,"Data3"
```

Мы можем просмотреть и выполнить запрос к этому файлу без указания формата или структуры:
```sql
:) desc file(data);
```

```repsonse
┌─name─┬─type─────────────┐
│ a    │ Nullable(Int64)  │
│ b    │ Nullable(String) │
└──────┴──────────────────┘
```

```sql
:) select * from file(data);
```

```response
┌─a─┬─b─────┐
│ 1 │ Data1 │
│ 2 │ Data2 │
│ 3 │ Data3 │
└───┴───────┘
```

:::note
ClickHouse может обнаруживать только некоторые подмножества форматов, и это обнаружение занимает некоторое время, всегда лучше явно указывать формат.
:::