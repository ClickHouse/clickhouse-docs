---
description: 'Страница, описывающая автоматическое определение схемы по входным данным в ClickHouse'
sidebar_label: 'Определение схемы'
slug: /interfaces/schema-inference
title: 'Автоматическое определение схемы по входным данным'
doc_type: 'reference'
---

ClickHouse может автоматически определять структуру входных данных практически во всех поддерживаемых [входных форматах](formats.md).
В этом документе описано, когда используется автоматическое определение схемы, как оно работает с различными входными форматами и какие настройки
его контролируют.



## Использование {#usage}

Автоматическое определение схемы используется, когда ClickHouse должен прочитать данные в определённом формате, но их структура неизвестна.



## Табличные функции [file](../sql-reference/table-functions/file.md), [s3](../sql-reference/table-functions/s3.md), [url](../sql-reference/table-functions/url.md), [hdfs](../sql-reference/table-functions/hdfs.md), [azureBlobStorage](../sql-reference/table-functions/azureBlobStorage.md). {#table-functions-file-s3-url-hdfs-azureblobstorage}

Эти табличные функции имеют необязательный аргумент `structure`, задающий структуру входных данных. Если этот аргумент не указан или имеет значение `auto`, структура будет выведена из данных.

**Пример:**

Предположим, у нас есть файл `hobbies.jsonl` в формате JSONEachRow в каталоге `user_files` со следующим содержимым:

```json
{"id" :  1, "age" :  25, "name" :  "Josh", "hobbies" :  ["футбол", "кулинария", "музыка"]}
{"id" :  2, "age" :  19, "name" :  "Alan", "hobbies" :  ["теннис", "искусство"]}
{"id" :  3, "age" :  32, "name" :  "Lana", "hobbies" :  ["фитнес", "чтение", "шопинг"]}
{"id" :  4, "age" :  47, "name" :  "Brayan", "hobbies" :  ["кино", "прыжки с парашютом"]}
```

ClickHouse может читать эти данные без необходимости задавать их структуру:

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

Примечание: формат `JSONEachRow` был автоматически определён на основе расширения файла `.jsonl`.

Вы можете увидеть автоматически определённую структуру с помощью запроса `DESCRIBE`:

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


## Движки таблиц [File](../engines/table-engines/special/file.md), [S3](../engines/table-engines/integrations/s3.md), [URL](../engines/table-engines/special/url.md), [HDFS](../engines/table-engines/integrations/hdfs.md), [azureBlobStorage](../engines/table-engines/integrations/azureBlobStorage.md) {#table-engines-file-s3-url-hdfs-azureblobstorage}

Если в запросе `CREATE TABLE` не указан список столбцов, структура таблицы будет автоматически определена по данным.

**Пример:**

Используем файл `hobbies.jsonl`. Мы можем создать таблицу с движком `File` на основе данных из этого файла:

```sql
CREATE TABLE hobbies ENGINE=File(JSONEachRow, 'hobbies.jsonl')
```

```response
Ок.
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

У `clickhouse-local` есть необязательный параметр `-S/--structure`, задающий структуру входных данных. Если этот параметр не указан или имеет значение `auto`, структура будет определена по данным.

**Пример:**

Возьмём файл `hobbies.jsonl`. Мы можем выполнить запрос к данным из этого файла с помощью `clickhouse-local`:

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


## Использование структуры из таблицы-вставки {#using-structure-from-insertion-table}

Когда табличные функции `file/s3/url/hdfs` используются для вставки данных в таблицу,
можно использовать структуру из таблицы-вставки вместо извлечения её из данных.
Это может улучшить производительность вставки, поскольку определение схемы может занимать некоторое время. Кроме того, это будет полезно, когда у таблицы оптимизированная схема, так что
не будут выполняться преобразования между типами.

Существует специальная настройка [use&#95;structure&#95;from&#95;insertion&#95;table&#95;in&#95;table&#95;functions](/operations/settings/settings.md/#use_structure_from_insertion_table_in_table_functions),
которая управляет этим поведением. Она может принимать три значения:

* 0 — табличная функция будет извлекать структуру из данных.
* 1 — табличная функция будет использовать структуру из таблицы-вставки.
* 2 — ClickHouse автоматически определит, возможно ли использовать структуру из таблицы-вставки, или необходимо определять схему по данным. Значение по умолчанию.

**Пример 1:**

Создадим таблицу `hobbies1` со следующей структурой:

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

И загрузите данные из файла `hobbies.jsonl`:

```sql
INSERT INTO hobbies1 SELECT * FROM file(hobbies.jsonl)
```

В этом случае все столбцы из файла вставляются в таблицу без изменений, поэтому ClickHouse будет использовать структуру таблицы, в которую выполняется вставка, вместо автоматического определения схемы.

**Пример 2:**

Создадим таблицу `hobbies2` со следующей структурой:

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

А затем вставьте данные из файла `hobbies.jsonl`:

```sql
INSERT INTO hobbies2 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

В этом случае все столбцы в запросе `SELECT` присутствуют в таблице, поэтому ClickHouse будет использовать структуру из таблицы, в которую выполняется вставка.
Обратите внимание, что это будет работать только для входных форматов, поддерживающих чтение подмножества столбцов, таких как JSONEachRow, TSKV, Parquet и т. д. (то есть, например, это не будет работать для формата TSV).

**Пример 3:**

Создадим таблицу `hobbies3` со следующей структурой:

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

Теперь вставьте данные из файла `hobbies.jsonl`:

```sql
INSERT INTO hobbies3 SELECT id, age, hobbies FROM file(hobbies.jsonl)
```

В этом случае столбец `id` используется в запросе `SELECT`, но в таблице нет этого столбца (в ней есть столбец с именем `identifier`),
поэтому ClickHouse не может использовать структуру таблицы, в которую выполняется вставка, и будет применено автоматическое определение схемы.

**Пример 4:**

Создадим таблицу `hobbies4` со следующей структурой:

```sql
CREATE TABLE hobbies4
(
  `id` UInt64,
  `any_hobby` Nullable(String)
)
  ENGINE = MergeTree
ORDER BY id;
```

И вставьте данные из файла `hobbies.jsonl`:

```sql
INSERT INTO hobbies4 SELECT id, empty(hobbies) ? NULL : hobbies[1] FROM file(hobbies.jsonl)
```

В этом случае в запросе `SELECT` выполняются некоторые операции со столбцом `hobbies` перед его вставкой в таблицу, поэтому ClickHouse не может использовать структуру целевой таблицы и будет использовано автоматическое определение схемы.


## Кэш автоопределения схемы {#schema-inference-cache}

Для большинства форматов ввода автоопределение схемы читает часть данных, чтобы определить их структуру, и этот процесс может занять некоторое время.
Чтобы не определять одну и ту же схему каждый раз, когда ClickHouse читает данные из одного и того же файла, полученная схема кэшируется, и при повторном обращении к тому же файлу ClickHouse использует схему из кэша.

Существуют специальные настройки, управляющие этим кэшем:
- `schema_inference_cache_max_elements_for_{file/s3/hdfs/url/azure}` — максимальное количество кэшируемых схем для соответствующей табличной функции. Значение по умолчанию — `4096`. Эти настройки следует задавать в конфигурации сервера.
- `schema_inference_use_cache_for_{file,s3,hdfs,url,azure}` — позволяет включать/отключать использование кэша для автоопределения схемы. Эти настройки можно указывать в запросах.

Схема файла может быть изменена путём модификации данных или изменением настроек формата.
По этой причине кэш автоопределения схемы идентифицирует схему по источнику файла, имени формата, используемым настройкам формата и времени последней модификации файла.

Примечание: некоторые файлы, к которым осуществляется доступ по URL в табличной функции `url`, могут не содержать информации о времени последней модификации; для этого случая существует специальная настройка
`schema_inference_cache_require_modification_time_for_url`. Отключение этой настройки позволяет использовать схему из кэша без учёта времени последней модификации для таких файлов.

Также существует системная таблица [schema_inference_cache](../operations/system-tables/schema_inference_cache.md) со всеми текущими схемами в кэше и системный запрос `SYSTEM DROP SCHEMA CACHE [FOR File/S3/URL/HDFS]`,
который позволяет очистить кэш схем для всех источников или для конкретного источника.

**Примеры:**

Попробуем определить структуру примерного набора данных из S3 `github-2022.ndjson.gz` и посмотрим, как работает кэш автоопределения схемы:



```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
```

```response
┌─name───────┬─type─────────────────────────────────────────┐
│ type       │ Nullable(String)                             │
│ actor      │ Tuple(                                      ↴│
│            │↳    avatar_url Nullable(String),            ↴│
│            │↳    display_login Nullable(String),         ↴│
│            │↳    id Nullable(Int64),                     ↴│
│            │↳    login Nullable(String),                 ↴│
│            │↳    url Nullable(String))                    │
│ repo       │ Tuple(                                      ↴│
│            │↳    id Nullable(Int64),                     ↴│
│            │↳    name Nullable(String),                  ↴│
│            │↳    url Nullable(String))                    │
│ created_at │ Nullable(String)                             │
│ payload    │ Tuple(                                      ↴│
│            │↳    action Nullable(String),                ↴│
│            │↳    distinct_size Nullable(Int64),          ↴│
│            │↳    pull_request Tuple(                     ↴│
│            │↳        author_association Nullable(String),↴│
│            │↳        base Tuple(                         ↴│
│            │↳            ref Nullable(String),           ↴│
│            │↳            sha Nullable(String)),          ↴│
│            │↳        head Tuple(                         ↴│
│            │↳            ref Nullable(String),           ↴│
│            │↳            sha Nullable(String)),          ↴│
│            │↳        number Nullable(Int64),             ↴│
│            │↳        state Nullable(String),             ↴│
│            │↳        title Nullable(String),             ↴│
│            │↳        updated_at Nullable(String),        ↴│
│            │↳        user Tuple(                         ↴│
│            │↳            login Nullable(String))),       ↴│
│            │↳    ref Nullable(String),                   ↴│
│            │↳    ref_type Nullable(String),              ↴│
│            │↳    size Nullable(Int64))                    │
└────────────┴──────────────────────────────────────────────┘
5 строк в наборе. Затрачено: 0.601 сек.
```

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
```

```response
┌─name───────┬─type─────────────────────────────────────────┐
│ type       │ Nullable(String)                             │
│ actor      │ Tuple(                                      ↴│
│            │↳    avatar_url Nullable(String),            ↴│
│            │↳    display_login Nullable(String),         ↴│
│            │↳    id Nullable(Int64),                     ↴│
│            │↳    login Nullable(String),                 ↴│
│            │↳    url Nullable(String))                    │
│ repo       │ Tuple(                                      ↴│
│            │↳    id Nullable(Int64),                     ↴│
│            │↳    name Nullable(String),                  ↴│
│            │↳    url Nullable(String))                    │
│ created_at │ Nullable(String)                             │
│ payload    │ Tuple(                                      ↴│
│            │↳    action Nullable(String),                ↴│
│            │↳    distinct_size Nullable(Int64),          ↴│
│            │↳    pull_request Tuple(                     ↴│
│            │↳        author_association Nullable(String),↴│
│            │↳        base Tuple(                         ↴│
│            │↳            ref Nullable(String),           ↴│
│            │↳            sha Nullable(String)),          ↴│
│            │↳        head Tuple(                         ↴│
│            │↳            ref Nullable(String),           ↴│
│            │↳            sha Nullable(String)),          ↴│
│            │↳        number Nullable(Int64),             ↴│
│            │↳        state Nullable(String),             ↴│
│            │↳        title Nullable(String),             ↴│
│            │↳        updated_at Nullable(String),        ↴│
│            │↳        user Tuple(                         ↴│
│            │↳            login Nullable(String))),       ↴│
│            │↳    ref Nullable(String),                   ↴│
│            │↳    ref_type Nullable(String),              ↴│
│            │↳    size Nullable(Int64))                    │
└────────────┴──────────────────────────────────────────────┘
```

5 строк в наборе. Затрачено: 0,059 сек.

````

Как видите, второй запрос выполнился практически мгновенно.

Попробуем изменить некоторые настройки, которые могут повлиять на автоматически определённую схему:

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/github/github-2022.ndjson.gz')
SETTINGS input_format_json_try_infer_named_tuples_from_objects=0, input_format_json_read_objects_as_strings = 1

┌─name───────┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ type       │ Nullable(String) │              │                    │         │                  │                │
│ actor      │ Nullable(String) │              │                    │         │                  │                │
│ repo       │ Nullable(String) │              │                    │         │                  │                │
│ created_at │ Nullable(String) │              │                    │         │                  │                │
│ payload    │ Nullable(String) │              │                    │         │                  │                │
└────────────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

Получено 5 строк. Затрачено: 0.611 сек
````

Как видите, схема из кэша не была использована для того же файла, потому что была изменена настройка, которая может влиять на автоматически определяемую схему.

Проверим содержимое таблицы `system.schema_inference_cache`:

```sql
SELECT schema, format, source FROM system.schema_inference_cache WHERE storage='S3'
```

```response
┌─schema──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─format─┬─source───────────────────────────────────────────────────────────────────────────────────────────────────┐
│ type Nullable(String), actor Tuple(avatar_url Nullable(String), display_login Nullable(String), id Nullable(Int64), login Nullable(String), url Nullable(String)), repo Tuple(id Nullable(Int64), name Nullable(String), url Nullable(String)), created_at Nullable(String), payload Tuple(action Nullable(String), distinct_size Nullable(Int64), pull_request Tuple(author_association Nullable(String), base Tuple(ref Nullable(String), sha Nullable(String)), head Tuple(ref Nullable(String), sha Nullable(String)), number Nullable(Int64), state Nullable(String), title Nullable(String), updated_at Nullable(String), user Tuple(login Nullable(String))), ref Nullable(String), ref_type Nullable(String), size Nullable(Int64)) │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
│ type Nullable(String), actor Nullable(String), repo Nullable(String), created_at Nullable(String), payload Nullable(String)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 │ NDJSON │ datasets-documentation.s3.eu-west-3.amazonaws.com443/datasets-documentation/github/github-2022.ndjson.gz │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Как видите, для одного и того же файла существуют две разные схемы.

Мы можем очистить кэш схем с помощью системного запроса:

```sql
SYSTEM DROP SCHEMA CACHE FOR S3
```

```response
Готово.
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

Для текстовых форматов ClickHouse читает данные построчно, извлекает значения столбцов в соответствии с форматом,
а затем использует рекурсивные парсеры и эвристики, чтобы определить тип для каждого значения. Максимальное количество строк и байт, читаемых из данных при определении схемы,
управляется настройками `input_format_max_rows_to_read_for_schema_inference` (по умолчанию 25000) и `input_format_max_bytes_to_read_for_schema_inference` (по умолчанию 32 МБ).
По умолчанию все определённые типы являются [Nullable](../sql-reference/data-types/nullable.md), но вы можете изменить это, настроив `schema_inference_make_columns_nullable` (см. примеры в разделе [настройках](#settings-for-text-formats)).

### Форматы JSON {#json-formats}

В форматах JSON ClickHouse разбирает значения в соответствии со спецификацией JSON, а затем пытается подобрать для них наиболее подходящий тип данных.

Рассмотрим, как это работает, какие типы могут быть выведены и какие отдельные настройки могут использоваться в форматах JSON.

**Примеры**

Здесь и далее в примерах будет использоваться табличная функция [format](../sql-reference/table-functions/format.md).

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

Date и DateTime:

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

Если массив содержит `null`, ClickHouse определит тип по другим элементам массива:

```sql
DESC format(JSONEachRow, '{"arr" : [null, 42, null]}')
```

```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ arr  │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```


Если массив содержит значения разных типов и параметр `input_format_json_infer_array_of_dynamic_from_array_of_different_types` включён (по умолчанию он включён), то его тип будет `Array(Dynamic)`:

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

Когда настройка `input_format_json_try_infer_named_tuples_from_objects` включена, во время определения схемы ClickHouse пытается вывести именованный Tuple из объектов JSON.
Получившийся именованный Tuple будет содержать все элементы из всех соответствующих объектов JSON во входной выборке данных.

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

Если параметр `input_format_json_infer_array_of_dynamic_from_array_of_different_types` отключён, массивы с элементами разных типов рассматриваются как неименованные кортежи в форматах JSON.

```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types = 0;
DESC format(JSONEachRow, '{"tuple" : [1, "Hello, World!", [1, 2, 3]]}')
```

```response
┌─name──┬─type─────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ tuple │ Tuple(Nullable(Int64), Nullable(String), Array(Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Если некоторые значения равны `null` или пусты, мы используем типы соответствующих значений из других строк:

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

Map:

В JSON можно читать объекты, значения которых имеют один и тот же тип, как значения типа Map.
Примечание: это будет работать только в том случае, если настройки `input_format_json_read_objects_as_strings` и `input_format_json_try_infer_named_tuples_from_objects` отключены.


```sql
SET input_format_json_read_objects_as_strings = 0, input_format_json_try_infer_named_tuples_from_objects = 0;
DESC format(JSONEachRow, '{"map" : {"key1" : 42, "key2" : 24, "key3" : 4}}')
```

```response
┌─name─┬─type─────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ map  │ Map(String, Nullable(Int64)) │              │                    │         │                  │                │
└──────┴──────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Вложенные сложные типы данных:

```sql
DESC format(JSONEachRow, '{"value" : [[[42, 24], []], {"key1" : 42, "key2" : 24}]}')
```

```response
┌─name──┬─type─────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ value │ Tuple(Array(Array(Nullable(String))), Tuple(key1 Nullable(Int64), key2 Nullable(Int64))) │              │                    │         │                  │                │
└───────┴──────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Если ClickHouse не может определить тип для некоторого ключа, потому что данные содержат только значения null/пустые объекты/пустые массивы, будет использован тип `String`, если включена настройка `input_format_json_infer_incomplete_types_as_strings`, в противном случае будет сгенерировано исключение:

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
Код: 652. DB::Exception: Получено от localhost:9000. DB::Exception:
Невозможно определить тип для столбца 'arr' по первой строке данных,
вероятно, этот столбец содержит только значения Null или пустые массивы/словари.
...
```

#### Настройки JSON {#json-settings}

##### input&#95;format&#95;json&#95;try&#95;infer&#95;numbers&#95;from&#95;strings {#input_format_json_try_infer_numbers_from_strings}

Включение этого параметра позволяет распознавать числа в строковых значениях.

По умолчанию этот параметр отключен.

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

##### input&#95;format&#95;json&#95;try&#95;infer&#95;named&#95;tuples&#95;from&#95;objects {#input_format_json_try_infer_named_tuples_from_objects}

Включение этого параметра позволяет выводить именованные `Tuple` из JSON-объектов. Получившийся именованный `Tuple` будет содержать все элементы из всех соответствующих JSON-объектов из выборки данных.
Это может быть полезно, когда JSON-данные не разрежены, и выборка данных содержит все возможные ключи объектов.

Этот параметр включен по умолчанию.

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

##### input&#95;format&#95;json&#95;use&#95;string&#95;type&#95;for&#95;ambiguous&#95;paths&#95;in&#95;named&#95;tuples&#95;inference&#95;from&#95;objects {#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects}

Включение этого параметра позволяет использовать тип String для неоднозначных путей при выводе именованных кортежей из JSON-объектов (когда `input_format_json_try_infer_named_tuples_from_objects` включён) вместо выбрасывания исключения.
Это позволяет читать JSON-объекты как именованные кортежи, даже если присутствуют неоднозначные пути.

По умолчанию параметр отключён.

**Примеры**

При отключённом параметре:

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
SET input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects = 0;
DESC format(JSONEachRow, '{"obj" : {"a" : 42}}, {"obj" : {"a" : {"b" : "Hello"}}}');
```

Результат:

```response
Код: 636. DB::Exception: Не удалось извлечь структуру таблицы из файла формата JSONEachRow. Ошибка:
Код: 117. DB::Exception: JSON-объекты содержат неоднозначные данные: в некоторых объектах путь 'a' имеет тип 'Int64', а в других — 'Tuple(b String)'. Вы можете включить параметр input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects, чтобы использовать тип String для пути 'a'. (INCORRECT_DATA) (версия 24.3.1.1).
Структуру можно указать вручную. (CANNOT_EXTRACT_TABLE_STRUCTURE)
```

При включённой настройке:

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

##### input&#95;format&#95;json&#95;read&#95;objects&#95;as&#95;strings {#input_format_json_read_objects_as_strings}

Включение этой настройки позволяет читать вложенные объекты JSON как строки.
Эту настройку можно использовать для чтения вложенных объектов JSON без использования типа JSON Object.

Эта настройка включена по умолчанию.

Примечание: включение этой настройки будет иметь эффект только в том случае, если настройка `input_format_json_try_infer_named_tuples_from_objects` отключена.


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

##### input&#95;format&#95;json&#95;read&#95;numbers&#95;as&#95;strings {#input_format_json_read_numbers_as_strings}

Включение этого параметра позволяет считывать числовые значения в виде строк.

Этот параметр включен по умолчанию.

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

##### input&#95;format&#95;json&#95;read&#95;bools&#95;as&#95;numbers {#input_format_json_read_bools_as_numbers}

Включение этого параметра позволяет считывать логические значения типа Bool как числа.

Этот параметр включён по умолчанию.

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

##### input&#95;format&#95;json&#95;read&#95;bools&#95;as&#95;strings {#input_format_json_read_bools_as_strings}

Включение этого параметра позволяет считывать логические значения типа Bool как строки.

Этот параметр включён по умолчанию.

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

##### input&#95;format&#95;json&#95;read&#95;arrays&#95;as&#95;strings {#input_format_json_read_arrays_as_strings}

Включение этого параметра позволяет считывать значения JSON-массивов как строки.

Этот параметр включён по умолчанию.

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

##### input&#95;format&#95;json&#95;infer&#95;incomplete&#95;types&#95;as&#95;strings {#input_format_json_infer_incomplete_types_as_strings}


Включение этого параметра позволяет использовать тип данных String для JSON-ключей, которые в выборке данных при определении схемы содержат только `Null`/`{}`/`[]`.
В JSON-форматах любое значение может быть считано как String, если включены все соответствующие настройки (по умолчанию они включены), и мы можем избежать ошибок вида `Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps` при определении схемы, используя тип String для ключей с неизвестными типами.

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

В формате CSV ClickHouse извлекает значения столбцов из строки в соответствии с разделителями. ClickHouse ожидает, что все типы, кроме чисел и строк, будут заключены в двойные кавычки. Если значение находится в двойных кавычках, ClickHouse пытается разобрать
данные внутри кавычек с помощью рекурсивного парсера, а затем определить для них наиболее подходящий тип данных. Если значение не в двойных кавычках, ClickHouse пытается разобрать его как число,
и если значение не является числом, ClickHouse рассматривает его как строку.

Если вы не хотите, чтобы ClickHouse пытался определять сложные типы с помощью различных парсеров и эвристик, вы можете отключить настройку `input_format_csv_use_best_effort_in_schema_inference`,
и ClickHouse будет рассматривать все столбцы как строки (String).

Если настройка `input_format_csv_detect_header` включена, ClickHouse попытается обнаружить заголовок с именами столбцов (и, возможно, типами) при определении схемы. Эта настройка включена по умолчанию.

**Примеры:**

Целые числа (Integers), числа с плавающей запятой (Floats), булевы значения (Bools), строки (Strings):

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

Date и DateTime:


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

Если массив содержит null, ClickHouse будет определять тип по другим элементам массива:

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

Вложенные массивы и отображения (Map):

```sql
DESC format(CSV, $$"[{'key1' : [[42, 42], []], 'key2' : [[null], [42]]}]"$$)
```

```response
┌─name─┬─type──────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Array(Nullable(Int64))))) │              │                    │         │                  │                │
└──────┴───────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```


Если ClickHouse не может определить тип значения в кавычках, потому что данные содержат только значения NULL, он будет интерпретировать его как String:

```sql
DESC format(CSV, '"[NULL, NULL]"')
```

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Пример с отключённым параметром `input_format_csv_use_best_effort_in_schema_inference`:

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

Примеры автоматического определения заголовков (при включённом `input_format_csv_detect_header`):

Только имена столбцов:

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

Обратите внимание, что заголовок может быть распознан только в том случае, если есть хотя бы один столбец с типом, отличным от String. Если все столбцы имеют тип String, заголовок не распознаётся:

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

#### Настройки CSV {#csv-settings}

##### input&#95;format&#95;csv&#95;try&#95;infer&#95;numbers&#95;from&#95;strings {#input_format_csv_try_infer_numbers_from_strings}

Включение этого параметра позволяет выводить числовые значения из строковых.

По умолчанию этот параметр отключён.

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

В форматах TSV/TSKV ClickHouse извлекает значение столбца из строки в соответствии с табуляцией как разделителем, а затем разбирает извлечённое значение с помощью
рекурсивного парсера, чтобы определить наиболее подходящий тип. Если тип не удаётся определить, ClickHouse рассматривает это значение как String.

Если вы не хотите, чтобы ClickHouse пытался определять сложные типы с использованием парсеров и эвристик, вы можете отключить настройку `input_format_tsv_use_best_effort_in_schema_inference`,
и ClickHouse будет рассматривать все столбцы как строки (String).

Если настройка `input_format_tsv_detect_header` включена, ClickHouse попытается обнаружить заголовок с именами столбцов (и, возможно, типами) при определении схемы. Эта настройка включена по умолчанию.

**Примеры:**

Integers, Floats, Bools, Strings:

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

Даты и время:

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

Если массив содержит значение null, ClickHouse определит тип по другим элементам массива:

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

Вложенные массивы, кортежи и отображения:

```sql
DESC format(TSV, $$[{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}]$$)
```

```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```


Если ClickHouse не может определить тип данных, потому что данные состоят только из значений NULL, он будет интерпретировать их как String:

```sql
DESC format(TSV, '[NULL, NULL]')
```

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Пример с отключённой настройкой `input_format_tsv_use_best_effort_in_schema_inference`:

```sql
SET input_format_tsv_use_best_effort_in_schema_inference = 0
DESC format(TSV, '[1,2,3]    42.42    Привет, мир!')
```

```response
┌─name─┬─type─────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(String) │              │                    │         │                  │                │
│ c2   │ Nullable(String) │              │                    │         │                  │                │
│ c3   │ Nullable(String) │              │                    │         │                  │                │
└──────┴──────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Примеры автоматического определения заголовка (когда включён `input_format_tsv_detect_header`):

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

Названия и типы:

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

Обратите внимание, что заголовок может быть распознан только в том случае, если есть хотя бы один столбец с типом, отличным от String. Если все столбцы имеют тип String, заголовок не распознается:

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

В формате Values ClickHouse извлекает значение столбца из строки, а затем разбирает его рекурсивным парсером, аналогично разбору литералов.

**Примеры:**


Целые числа, вещественные числа, логические значения, строки:

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

Типы Date и DateTime:

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

Если массив содержит null, ClickHouse использует типы остальных элементов массива:

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


Вложенные массивы, кортежи и словари:

```sql
DESC format(Values, $$([{'key1' : [(42, 'Hello'), (24, NULL)], 'key2' : [(NULL, ','), (42, 'world!')]}])$$)
```

```response
┌─name─┬─type────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Array(Map(String, Array(Tuple(Nullable(Int64), Nullable(String))))) │              │                    │         │                  │                │
└──────┴─────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Если ClickHouse не удаётся определить тип, так как данные содержат только значения NULL, будет сгенерировано исключение:

```sql
DESC format(Values, '([NULL, NULL])')
```

```response
Код: 652. DB::Exception: Получено от localhost:9000. DB::Exception:
Невозможно определить тип столбца 'c1' по первой строке данных,
вероятно, этот столбец содержит только значения Null или пустые массивы/словари.
...
```

Пример с отключённой настройкой `input_format_tsv_use_best_effort_in_schema_inference`:

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

В формате CustomSeparated ClickHouse сначала извлекает все значения столбцов из строки в соответствии с заданными разделителями, а затем пытается определить тип данных для каждого значения в соответствии с правилами экранирования.

Если настройка `input_format_custom_detect_header` включена, ClickHouse попытается обнаружить заголовок с именами столбцов (и, возможно, типами) при определении схемы. Эта настройка включена по умолчанию.

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

Пример автоопределения заголовка (когда включён `input_format_custom_detect_header`):


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

### Template {#template}

В формате Template ClickHouse сначала извлекает все значения столбцов из строки в соответствии с указанным шаблоном, а затем пытается определить
тип данных для каждого значения в соответствии с соответствующим правилом экранирования.

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

Далее можно выполнить следующие запросы:

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

### Regexp {#regexp}

Аналогично формату Template, в формате Regexp ClickHouse сначала извлекает все значения столбцов из строки в соответствии с заданным регулярным выражением, а затем пытается определить
тип данных для каждого значения согласно указанному правилу экранирования.

**Пример**

```sql
SET format_regexp = '^Line: value_1=(.+?), value_2=(.+?), value_3=(.+?)',
       format_regexp_escaping_rule = 'CSV'
```


DESC format(Regexp, $$Line: value&#95;1=42, value&#95;2=&quot;Some string 1&quot;, value&#95;3=&quot;[1, NULL, 3]&quot;
Line: value&#95;1=2, value&#95;2=&quot;Some string 2&quot;, value&#95;3=&quot;[4, 5, NULL]&quot;$$)

````
```response
┌─name─┬─type───────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ c1   │ Nullable(Int64)        │              │                    │         │                  │                │
│ c2   │ Nullable(String)       │              │                    │         │                  │                │
│ c3   │ Array(Nullable(Int64)) │              │                    │         │                  │                │
└──────┴────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
````

### Настройки для текстовых форматов {#settings-for-text-formats}

#### input&#95;format&#95;max&#95;rows&#95;to&#95;read&#95;for&#95;schema&#95;inference/input&#95;format&#95;max&#95;bytes&#95;to&#95;read&#95;for&#95;schema&#95;inference {#input-format-max-rows-to-read-for-schema-inference}

Эти настройки управляют объёмом данных, считываемых при автоматическом определении схемы.
Чем больше строк/байт считывается, тем больше времени уходит на определение схемы, но тем выше шанс
корректно определить типы (особенно когда данные содержат много null-значений).

Значения по умолчанию:

* `25000` для `input_format_max_rows_to_read_for_schema_inference`.
* `33554432` (32 МБ) для `input_format_max_bytes_to_read_for_schema_inference`.

#### column&#95;names&#95;for&#95;schema&#95;inference {#column-names-for-schema-inference}

Список имён столбцов, используемых при определении схемы для форматов без явных имён столбцов. Указанные имена будут использованы вместо значений по умолчанию `c1,c2,c3,...`. Формат: `column1,column2,column3,...`.

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

#### schema&#95;inference&#95;hints {#schema-inference-hints}

Список имен столбцов и их типов, используемых при определении схемы вместо автоматически определенных типов. Формат: «column&#95;name1 column&#95;type1, column&#95;name2 column&#95;type2, ...».
Этот параметр можно использовать для указания типов столбцов, которые не удалось определить автоматически, или для оптимизации схемы.

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

#### schema&#95;inference&#95;make&#95;columns&#95;nullable $ {#schema-inference-make-columns-nullable}


Управляет приведением выводимых типов к `Nullable` при выводе схемы для форматов без информации о nullability. Возможные значения:

* 0 — выводимый тип никогда не будет `Nullable`,
* 1 — все выводимые типы будут `Nullable`,
* 2 или &#39;auto&#39; — для текстовых форматов выводимый тип будет `Nullable` только если столбец содержит `NULL` в образце данных, который разбирается при выводе схемы; для строго типизированных форматов (Parquet, ORC, Arrow) информация о nullability берётся из метаданных файла,
* 3 — для текстовых форматов использовать `Nullable`; для строго типизированных форматов использовать метаданные файла.

По умолчанию: 3.

**Примеры**

```sql
SET schema_inference_make_columns_nullable = 1;
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


#### input&#95;format&#95;try&#95;infer&#95;integers {#input-format-try-infer-integers}

:::note
Этот параметр не применяется к типу данных `JSON`.
:::

Если параметр включён, ClickHouse будет пытаться определять целые числа вместо чисел с плавающей запятой при выводе схемы для текстовых форматов.
Если все числа в столбце в образце данных являются целыми, результирующим типом будет `Int64`, а если хотя бы одно число является числом с плавающей запятой, результирующим типом будет `Float64`.
Если в образце данных содержатся только целые числа и хотя бы одно положительное целое число превышает диапазон `Int64`, ClickHouse определит тип как `UInt64`.

По умолчанию параметр включён.

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

#### input&#95;format&#95;try&#95;infer&#95;datetimes {#input-format-try-infer-datetimes}

Если параметр включён, ClickHouse будет пытаться определять тип `DateTime` или `DateTime64` по строковым полям при автоматическом выводе схемы для текстовых форматов.
Если все значения столбца в образце данных были успешно распознаны как значения даты и времени, результирующим типом будет `DateTime` или `DateTime64(9)` (если хотя бы одно значение даты и времени содержало дробную часть),
если хотя бы одно значение не удалось распознать как дату и время, результирующим типом будет `String`.

По умолчанию параметр включён.

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

#### input&#95;format&#95;try&#95;infer&#95;datetimes&#95;only&#95;datetime64 {#input-format-try-infer-datetimes-only-datetime64}

Если включено, ClickHouse будет всегда определять тип `DateTime64(9)`, когда параметр `input_format_try_infer_datetimes` включён, даже если значения даты и времени не содержат дробной части.

По умолчанию отключено.

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

Примечание: При разборе значений типов DateTime при выводе схемы учитывается настройка [date&#95;time&#95;input&#95;format](/operations/settings/settings-formats.md#date_time_input_format)


#### input&#95;format&#95;try&#95;infer&#95;dates {#input-format-try-infer-dates}

Если параметр включён, ClickHouse будет пытаться определить тип `Date` из строковых полей при автоматическом определении схемы для текстовых форматов.
Если все значения в столбце в образце данных были успешно интерпретированы как даты, результирующим типом будет `Date`,
если хотя бы одно значение не было интерпретировано как дата, результирующим типом будет `String`.

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

#### input&#95;format&#95;try&#95;infer&#95;exponent&#95;floats {#input-format-try-infer-exponent-floats}

Если включено, ClickHouse будет пытаться распознавать числа с плавающей запятой в экспоненциальной форме в текстовых форматах (кроме JSON, где числа в экспоненциальной форме всегда распознаются).

По умолчанию отключено.

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

Самоописывающиеся форматы содержат информацию о структуре данных в самих данных:
это может быть заголовок с описанием, бинарное дерево типов или таблица.
Чтобы автоматически вывести схему по файлам в таких форматах, ClickHouse читает часть данных, содержащую
информацию о типах, и преобразует её в схему таблицы ClickHouse.

### Форматы с суффиксом -WithNamesAndTypes {#formats-with-names-and-types}

ClickHouse поддерживает некоторые текстовые форматы с суффиксом -WithNamesAndTypes. Этот суффикс означает, что данные содержат две дополнительные строки с именами и типами столбцов перед основными данными.
При автоматическом выводе схемы для таких форматов ClickHouse читает первые две строки и извлекает имена и типы столбцов.

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

### Форматы JSON с метаданными {#json-with-metadata}

Некоторые входные форматы JSON ([JSON](/interfaces/formats/JSON), [JSONCompact](/interfaces/formats/JSONCompact), [JSONColumnsWithMetadata](/interfaces/formats/JSONColumnsWithMetadata)) содержат метаданные с именами и типами столбцов.
При определении схемы для таких форматов ClickHouse использует эти метаданные.

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

В формате Avro ClickHouse считывает схему из данных и преобразует её в схему ClickHouse, используя следующие соответствия типов:


| Тип данных Avro                     | Тип данных ClickHouse                                                           |
|-------------------------------------|---------------------------------------------------------------------------------|
| `boolean`                           | [Bool](../sql-reference/data-types/boolean.md)                                  |
| `int`                               | [Int32](../sql-reference/data-types/int-uint.md)                                |
| `int (date)` \*                     | [Date32](../sql-reference/data-types/date32.md)                                 |
| `long`                              | [Int64](../sql-reference/data-types/int-uint.md)                                |
| `float`                             | [Float32](../sql-reference/data-types/float.md)                                 |
| `double`                            | [Float64](../sql-reference/data-types/float.md)                                 |
| `bytes`, `string`                   | [String](../sql-reference/data-types/string.md)                                 |
| `fixed`                             | [FixedString(N)](../sql-reference/data-types/fixedstring.md)                    |
| `enum`                              | [Enum](../sql-reference/data-types/enum.md)                                     |
| `array(T)`                          | [Array(T)](../sql-reference/data-types/array.md)                                |
| `union(null, T)`, `union(T, null)` | [Nullable(T)](../sql-reference/data-types/date.md)                              |
| `null`                              | [Nullable(Nothing)](../sql-reference/data-types/special-data-types/nothing.md)  |
| `string (uuid)` \*                  | [UUID](../sql-reference/data-types/uuid.md)                                     |
| `binary (decimal)` \*               | [Decimal(P, S)](../sql-reference/data-types/decimal.md)                         |

\* [Логические типы Avro](https://avro.apache.org/docs/current/spec.html#Logical+Types)

Другие типы Avro не поддерживаются.

### Parquet {#parquet}

В формате Parquet ClickHouse считывает схему из данных и преобразует её в схему ClickHouse, используя следующие соответствия типов:

| Тип данных Parquet             | Тип данных ClickHouse                                  |
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
| `FLOAT`                        | [Float32](../sql-reference/data-types/float.md)        |
| `DOUBLE`                       | [Float64](../sql-reference/data-types/float.md)        |
| `DATE`                         | [Date32](../sql-reference/data-types/date32.md)        |
| `TIME (ms)`                    | [DateTime](../sql-reference/data-types/datetime.md)    |
| `TIMESTAMP`, `TIME (us, ns)`   | [DateTime64](../sql-reference/data-types/datetime64.md) |
| `STRING`, `BINARY`             | [String](../sql-reference/data-types/string.md)        |
| `DECIMAL`                      | [Decimal](../sql-reference/data-types/decimal.md)      |
| `LIST`                         | [Array](../sql-reference/data-types/array.md)          |
| `STRUCT`                       | [Tuple](../sql-reference/data-types/tuple.md)          |
| `MAP`                          | [Map](../sql-reference/data-types/map.md)              |

Другие типы Parquet не поддерживаются.

### Arrow {#arrow}

В формате Arrow ClickHouse считывает схему из данных и преобразует её в схему ClickHouse, используя следующие соответствия типов:



| Тип данных Arrow                 | Тип данных ClickHouse                                    |
|----------------------------------|----------------------------------------------------------|
| `BOOL`                           | [Bool](../sql-reference/data-types/boolean.md)          |
| `UINT8`                          | [UInt8](../sql-reference/data-types/int-uint.md)        |
| `INT8`                           | [Int8](../sql-reference/data-types/int-uint.md)         |
| `UINT16`                         | [UInt16](../sql-reference/data-types/int-uint.md)       |
| `INT16`                          | [Int16](../sql-reference/data-types/int-uint.md)        |
| `UINT32`                         | [UInt32](../sql-reference/data-types/int-uint.md)       |
| `INT32`                          | [Int32](../sql-reference/data-types/int-uint.md)        |
| `UINT64`                         | [UInt64](../sql-reference/data-types/int-uint.md)       |
| `INT64`                          | [Int64](../sql-reference/data-types/int-uint.md)        |
| `FLOAT`, `HALF_FLOAT`            | [Float32](../sql-reference/data-types/float.md)         |
| `DOUBLE`                         | [Float64](../sql-reference/data-types/float.md)         |
| `DATE32`                         | [Date32](../sql-reference/data-types/date32.md)         |
| `DATE64`                         | [DateTime](../sql-reference/data-types/datetime.md)     |
| `TIMESTAMP`, `TIME32`, `TIME64`  | [DateTime64](../sql-reference/data-types/datetime64.md) |
| `STRING`, `BINARY`               | [String](../sql-reference/data-types/string.md)         |
| `DECIMAL128`, `DECIMAL256`       | [Decimal](../sql-reference/data-types/decimal.md)       |
| `LIST`                           | [Array](../sql-reference/data-types/array.md)           |
| `STRUCT`                         | [Tuple](../sql-reference/data-types/tuple.md)           |
| `MAP`                            | [Map](../sql-reference/data-types/map.md)               |

Другие типы Arrow не поддерживаются.

### ORC {#orc}

В формате ORC ClickHouse считывает схему из данных и преобразует её в схему ClickHouse, используя следующие соответствия типов:

| Тип данных ORC                        | Тип данных ClickHouse                                    |
|---------------------------------------|----------------------------------------------------------|
| `Boolean`                             | [Bool](../sql-reference/data-types/boolean.md)          |
| `Tinyint`                             | [Int8](../sql-reference/data-types/int-uint.md)         |
| `Smallint`                            | [Int16](../sql-reference/data-types/int-uint.md)        |
| `Int`                                 | [Int32](../sql-reference/data-types/int-uint.md)        |
| `Bigint`                              | [Int64](../sql-reference/data-types/int-uint.md)        |
| `Float`                               | [Float32](../sql-reference/data-types/float.md)         |
| `Double`                              | [Float64](../sql-reference/data-types/float.md)         |
| `Date`                                | [Date32](../sql-reference/data-types/date32.md)         |
| `Timestamp`                           | [DateTime64](../sql-reference/data-types/datetime64.md) |
| `String`, `Char`, `Varchar`, `BINARY` | [String](../sql-reference/data-types/string.md)         |
| `Decimal`                             | [Decimal](../sql-reference/data-types/decimal.md)       |
| `List`                                | [Array](../sql-reference/data-types/array.md)           |
| `Struct`                              | [Tuple](../sql-reference/data-types/tuple.md)           |
| `Map`                                 | [Map](../sql-reference/data-types/map.md)               |

Другие типы ORC не поддерживаются.

### Native {#native}

Формат Native используется внутри ClickHouse и содержит схему непосредственно в данных.
При определении схемы ClickHouse считывает её из данных без каких-либо преобразований.



## Форматы с внешней схемой {#formats-with-external-schema}

Такие форматы требуют наличия схемы, описывающей данные, в отдельном файле на определённом языке описания схем.
Чтобы автоматически определить схему по файлам в таких форматах, ClickHouse считывает внешнюю схему из отдельного файла и преобразует её в схему таблицы ClickHouse.

### Protobuf {#protobuf}

При определении схемы для формата Protobuf ClickHouse использует следующие соответствия типов:

| Тип данных Protobuf              | Тип данных ClickHouse                                |
|----------------------------------|------------------------------------------------------|
| `bool`                           | [UInt8](../sql-reference/data-types/int-uint.md)     |
| `float`                          | [Float32](../sql-reference/data-types/float.md)      |
| `double`                         | [Float64](../sql-reference/data-types/float.md)      |
| `int32`, `sint32`, `sfixed32`    | [Int32](../sql-reference/data-types/int-uint.md)     |
| `int64`, `sint64`, `sfixed64`    | [Int64](../sql-reference/data-types/int-uint.md)     |
| `uint32`, `fixed32`              | [UInt32](../sql-reference/data-types/int-uint.md)    |
| `uint64`, `fixed64`              | [UInt64](../sql-reference/data-types/int-uint.md)    |
| `string`, `bytes`                | [String](../sql-reference/data-types/string.md)      |
| `enum`                           | [Enum](../sql-reference/data-types/enum.md)          |
| `repeated T`                     | [Array(T)](../sql-reference/data-types/array.md)     |
| `message`, `group`               | [Tuple](../sql-reference/data-types/tuple.md)        |

### CapnProto {#capnproto}

При определении схемы для формата CapnProto ClickHouse использует следующие соответствия типов:

| Тип данных CapnProto                 | Тип данных ClickHouse                                     |
|--------------------------------------|-----------------------------------------------------------|
| `Bool`                               | [UInt8](../sql-reference/data-types/int-uint.md)         |
| `Int8`                               | [Int8](../sql-reference/data-types/int-uint.md)          |
| `UInt8`                              | [UInt8](../sql-reference/data-types/int-uint.md)         |
| `Int16`                              | [Int16](../sql-reference/data-types/int-uint.md)         |
| `UInt16`                             | [UInt16](../sql-reference/data-types/int-uint.md)        |
| `Int32`                              | [Int32](../sql-reference/data-types/int-uint.md)         |
| `UInt32`                             | [UInt32](../sql-reference/data-types/int-uint.md)        |
| `Int64`                              | [Int64](../sql-reference/data-types/int-uint.md)         |
| `UInt64`                             | [UInt64](../sql-reference/data-types/int-uint.md)        |
| `Float32`                            | [Float32](../sql-reference/data-types/float.md)          |
| `Float64`                            | [Float64](../sql-reference/data-types/float.md)          |
| `Text`, `Data`                       | [String](../sql-reference/data-types/string.md)          |
| `enum`                               | [Enum](../sql-reference/data-types/enum.md)              |
| `List`                               | [Array](../sql-reference/data-types/array.md)            |
| `struct`                             | [Tuple](../sql-reference/data-types/tuple.md)            |
| `union(T, Void)`, `union(Void, T)`   | [Nullable(T)](../sql-reference/data-types/nullable.md)   |



## Строго типизированные бинарные форматы {#strong-typed-binary-formats}

В таких форматах каждое сериализованное значение содержит информацию о своём типе (и, возможно, о своём имени), но нет информации о всей таблице.
При выводе схемы для таких форматов ClickHouse считывает данные построчно (до `input_format_max_rows_to_read_for_schema_inference` строк или `input_format_max_bytes_to_read_for_schema_inference` байт) и извлекает
тип (и, возможно, имя) каждого значения из данных, после чего преобразует эти типы в типы ClickHouse.

### MsgPack {#msgpack}

В формате MsgPack нет разделителя между строками; чтобы использовать вывод схемы для этого формата, необходимо указать количество столбцов в таблице
с помощью настройки `input_format_msgpack_number_of_columns`. ClickHouse использует следующие соответствия типов:

| Тип данных MessagePack (`INSERT`)                                   | Тип данных ClickHouse                                     |
|---------------------------------------------------------------------|-----------------------------------------------------------|
| `int N`, `uint N`, `negative fixint`, `positive fixint`             | [Int64](../sql-reference/data-types/int-uint.md)          |
| `bool`                                                              | [UInt8](../sql-reference/data-types/int-uint.md)          |
| `fixstr`, `str 8`, `str 16`, `str 32`, `bin 8`, `bin 16`, `bin 32`  | [String](../sql-reference/data-types/string.md)           |
| `float 32`                                                          | [Float32](../sql-reference/data-types/float.md)           |
| `float 64`                                                          | [Float64](../sql-reference/data-types/float.md)           |
| `uint 16`                                                           | [Date](../sql-reference/data-types/date.md)               |
| `uint 32`                                                           | [DateTime](../sql-reference/data-types/datetime.md)       |
| `uint 64`                                                           | [DateTime64](../sql-reference/data-types/datetime.md)     |
| `fixarray`, `array 16`, `array 32`                                  | [Array](../sql-reference/data-types/array.md)             |
| `fixmap`, `map 16`, `map 32`                                        | [Map](../sql-reference/data-types/map.md)                 |

По умолчанию все выведенные типы заключаются в `Nullable`, но это можно изменить с помощью настройки `schema_inference_make_columns_nullable`.

### BSONEachRow {#bsoneachrow}

В BSONEachRow каждая строка данных представлена как BSON-документ. При выводе схемы ClickHouse считывает BSON-документы один за другим и извлекает
значения, имена и типы из данных, после чего преобразует эти типы в типы ClickHouse, используя следующие соответствия типов:

| Тип BSON                                                                                      | Тип ClickHouse                                                                                                              |
|-----------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `\x08` boolean                                                                                | [Bool](../sql-reference/data-types/boolean.md)                                                                              |
| `\x10` int32                                                                                  | [Int32](../sql-reference/data-types/int-uint.md)                                                                            |
| `\x12` int64                                                                                  | [Int64](../sql-reference/data-types/int-uint.md)                                                                            |
| `\x01` double                                                                                 | [Float64](../sql-reference/data-types/float.md)                                                                             |
| `\x09` datetime                                                                               | [DateTime64](../sql-reference/data-types/datetime64.md)                                                                     |
| `\x05` тип binary с подтипом `\x00` (binary), `\x02` string, `\x0E` symbol, `\x0D` JavaScript code | [String](../sql-reference/data-types/string.md)                                                                             |
| `\x07` ObjectId                                                                               | [FixedString(12)](../sql-reference/data-types/fixedstring.md)                                                               |
| `\x05` тип binary с подтипом `\x04` (uuid), размером 16                                       | [UUID](../sql-reference/data-types/uuid.md)                                                                                 |
| `\x04` array                                                                                  | [Array](../sql-reference/data-types/array.md)/[Tuple](../sql-reference/data-types/tuple.md) (если вложенные типы различаются) |
| `\x03` document                                                                               | [Named Tuple](../sql-reference/data-types/tuple.md)/[Map](../sql-reference/data-types/map.md) (с ключами типа String)        |

По умолчанию все выведенные типы заключаются в `Nullable`, но это можно изменить с помощью настройки `schema_inference_make_columns_nullable`.



## Форматы с фиксированной схемой {#formats-with-constant-schema}

Данные в таких форматах всегда имеют одну и ту же схему.

### LineAsString {#line-as-string}

В этом формате ClickHouse считывает всю строку данных в один столбец с типом данных `String`. Выводимый тип для этого формата всегда `String`, а имя столбца — `line`.

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

В этом формате ClickHouse считывает весь JSON-объект из входных данных в один столбец с типом данных `String`. Определяемый для этого формата тип всегда `String`, а имя столбца — `json`.

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

В этом формате ClickHouse считывает весь JSON-объект из входных данных в один столбец с типом данных `JSON`. Определяемый для этого формата тип данных всегда `JSON`, а имя столбца — `json`.

**Пример**

```sql
DESC format(JSONAsObject, '{"x" : 42, "y" : "Hello, World!"}');
```

```response
┌─name─┬─type─┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ json │ JSON │              │                    │         │                  │                │
└──────┴──────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```


## Режимы определения схемы {#schema-inference-modes}

Определение схемы по набору файлов данных может работать в двух разных режимах: `default` и `union`.
Режим задаётся настройкой `schema_inference_mode`.

### Режим по умолчанию {#default-schema-inference-mode}

В режиме по умолчанию ClickHouse предполагает, что все файлы имеют одинаковую схему, и пытается определить её, последовательно читая файлы до тех пор, пока это не удастся.

Пример:

Допустим, у нас есть 3 файла `data1.jsonl`, `data2.jsonl` и `data3.jsonl` со следующим содержимым:

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

Давайте попробуем применить автоматическое определение схемы к этим трём файлам:

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
Это происходит потому, что ClickHouse сначала попытался определить схему по файлу `data1.jsonl`, но не смог, так как для поля `field2` были только значения null,
затем попытался определить схему по `data2.jsonl` и успешно это сделал, поэтому данные из файла `data3.jsonl` не были прочитаны.

### Режим union {#default-schema-inference-mode-1}

В режиме union ClickHouse предполагает, что файлы могут иметь разные схемы, поэтому он определяет схемы всех файлов, а затем объединяет их в общую схему.

Допустим, у нас есть 3 файла `data1.jsonl`, `data2.jsonl` и `data3.jsonl` со следующим содержимым:

`data1.jsonl`:

```json
{"field1" :  1}
{"field1" :  2}
{"field1" :  3}
```

`data2.jsonl`:

```json
{"field2" :  "Данные4"}
{"field2" :  "Данные5"}
{"field2" :  "Данные5"}
```

`data3.jsonl`:

```json
{"field3" :  [1, 2, 3]}
{"field3" :  [4, 5, 6]}
{"field3" :  [7, 8, 9]}
```

Давайте попробуем использовать автоматическое определение схемы для этих трёх файлов:

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

* Поскольку некоторые файлы могут не содержать некоторые столбцы из результирующей схемы, режим объединения (union) поддерживается только для форматов, которые умеют читать подмножество столбцов (таких как JSONEachRow, Parquet, TSVWithNames и т. д.) и не будет работать для других форматов (таких как CSV, TSV, JSONCompactEachRow и т. д.).
* Если ClickHouse не может определить схему по одному из файлов, будет сгенерировано исключение.
* Если у вас много файлов, чтение схемы из всех них может занять много времени.


## Автоматическое определение формата {#automatic-format-detection}

Если формат данных не указан и его нельзя определить по расширению файла, ClickHouse попытается определить формат файла по его содержимому.

**Примеры:**

Предположим, у нас есть файл `data` со следующим содержимым:

```csv
"a","b"
1,"Data1"
2,"Data2"
3,"Data3"
```

Мы можем изучать и выполнять запросы к этому файлу, не указывая формат или структуру:

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
ClickHouse может распознавать лишь некоторые форматы, и это распознавание занимает время. Поэтому всегда лучше явно указывать формат.
:::
