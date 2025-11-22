---
description: 'Документация по типу данных JSON в ClickHouse, который предоставляет
  встроенную поддержку работы с данными в формате JSON'
keywords: ['json', 'тип данных']
sidebar_label: 'JSON'
sidebar_position: 63
slug: /sql-reference/data-types/newjson
title: 'Тип данных JSON'
doc_type: 'reference'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'

<Link to="/docs/best-practices/use-json-where-appropriate" style={{display: 'flex', textDecoration: 'none', width: 'fit-content'}}>
  <CardSecondary badgeState="success" badgeText="" description="Ознакомьтесь с нашим руководством по лучшим практикам использования JSON: в нём приведены примеры, рассмотрены расширенные возможности и даны рекомендации по использованию типа JSON." icon="book" infoText="Подробнее" infoUrl="/docs/best-practices/use-json-where-appropriate" title="Ищете руководство?" />
</Link>

<br />

Тип `JSON` хранит документы в формате JavaScript Object Notation (JSON) в одном столбце.

:::note
В ClickHouse Open-Source тип данных `JSON` помечен как готовый к промышленной эксплуатации, начиная с версии 25.3. Не рекомендуется использовать этот тип в продуктивной среде в более ранних версиях.
:::

Чтобы объявить столбец типа `JSON`, можно использовать следующий синтаксис:

```sql
<column_name> JSON
(
    max_dynamic_paths=N, 
    max_dynamic_types=M, 
    some.path TypeName, 
    SKIP path.to.skip, 
    SKIP REGEXP 'paths_regexp'
)
```

Где параметры в приведённом выше синтаксисе определяются следующим образом:

| Параметр                    | Описание                                                                                                                                                                                                                                                                                                                                     | Значение по умолчанию |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `max_dynamic_paths`         | Необязательный параметр, задающий, сколько путей может храниться отдельно в виде подстолбцов в одном отдельно хранимом блоке данных (например, в одной части данных таблицы MergeTree). <br /><br />Если этот предел превышен, все остальные пути будут сохранены совместно в одной структуре.                                               | `1024`                |
| `max_dynamic_types`         | Необязательный параметр в диапазоне от `1` до `255`, задающий, сколько различных типов данных может храниться в одном столбце пути типа `Dynamic` в пределах одного отдельно хранимого блока данных (например, одной части данных таблицы MergeTree). <br /><br />Если этот предел превышен, все новые типы будут приведены к типу `String`. | `32`                  |
| `some.path TypeName`        | Необязательная подсказка типа для конкретного пути в JSON. Такие пути всегда будут храниться как подстолбцы с указанным типом.                                                                                                                                                                                                               |                       |
| `SKIP path.to.skip`         | Необязательная подсказка для конкретного пути, который следует пропустить при разборе JSON. Такие пути никогда не будут сохранены в столбце JSON. Если указанный путь является вложенным объектом JSON, будет пропущен весь вложенный объект.                                                                                                |                       |
| `SKIP REGEXP 'path_regexp'` | Необязательная подсказка с регулярным выражением, которое используется для пропуска путей при разборе JSON. Все пути, которые соответствуют этому регулярному выражению, никогда не будут сохранены в столбце JSON.                                                                                                                          |                       |


## Создание JSON {#creating-json}

В этом разделе мы рассмотрим различные способы создания `JSON`.

### Использование `JSON` в определении столбца таблицы {#using-json-in-a-table-column-definition}

```sql title="Запрос (Пример 1)"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="Ответ (Пример 1)"
┌─json────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"]}          │
│ {"f":"Hello, World!"}                       │
│ {"a":{"b":"43","e":"10"},"c":["4","5","6"]} │
└─────────────────────────────────────────────┘
```

```sql title="Запрос (Пример 2)"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42}, "c" : [1, 2, 3]}'), ('{"f" : "Hello, World!"}'), ('{"a" : {"b" : 43, "e" : 10}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="Ответ (Пример 2)"
┌─json──────────────────────────────┐
│ {"a":{"b":42},"c":["1","2","3"]}  │
│ {"a":{"b":0},"f":"Hello, World!"} │
│ {"a":{"b":43},"c":["4","5","6"]}  │
└───────────────────────────────────┘
```

### Использование CAST с `::JSON` {#using-cast-with-json}

Можно приводить различные типы, используя специальный синтаксис `::JSON`.

#### Приведение из `String` в `JSON` {#cast-from-string-to-json}

```sql title="Запрос"
SELECT '{"a" : {"b" : 42},"c" : [1, 2, 3], "d" : "Hello, World!"}'::JSON AS json;
```

```text title="Ответ"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

#### Приведение из `Tuple` в `JSON` {#cast-from-tuple-to-json}

```sql title="Запрос"
SET enable_named_columns_in_function_tuple = 1;
SELECT (tuple(42 AS b) AS a, [1, 2, 3] AS c, 'Hello, World!' AS d)::JSON AS json;
```

```text title="Ответ"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

#### Приведение из `Map` в `JSON` {#cast-from-map-to-json}

```sql title="Запрос"
SET use_variant_as_common_type=1;
SELECT map('a', map('b', 42), 'c', [1,2,3], 'd', 'Hello, World!')::JSON AS json;
```

```text title="Ответ"
┌─json───────────────────────────────────────────────────┐
│ {"a":{"b":"42"},"c":["1","2","3"],"d":"Hello, World!"} │
└────────────────────────────────────────────────────────┘
```

:::note
Пути JSON хранятся в развёрнутом виде. Это означает, что при форматировании объекта JSON из пути вида `a.b.c`
невозможно определить, должен ли объект быть построен как `{ "a.b.c" : ... }` или `{ "a": { "b": { "c": ... } } }`.
Наша реализация всегда предполагает последний вариант.

Например:

```sql
SELECT CAST('{"a.b.c" : 42}', 'JSON') AS json
```

вернёт:

```response
   ┌─json───────────────────┐
1. │ {"a":{"b":{"c":"42"}}} │
   └────────────────────────┘
```

а **не**:


```sql
   ┌─json───────────┐
1. │ {"a.b.c":"42"} │
   └────────────────┘
```

:::


## Чтение путей JSON как подстолбцов {#reading-json-paths-as-sub-columns}

Тип `JSON` поддерживает чтение каждого пути как отдельного подстолбца.
Если тип запрашиваемого пути не указан в объявлении типа JSON,
то подстолбец этого пути всегда будет иметь тип [Dynamic](/sql-reference/data-types/dynamic.md).

Например:

```sql title="Запрос"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42, "g" : 42.42}, "c" : [1, 2, 3], "d" : "2020-01-01"}'), ('{"f" : "Hello, World!", "d" : "2020-01-02"}'), ('{"a" : {"b" : 43, "e" : 10, "g" : 43.43}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="Ответ"
┌─json────────────────────────────────────────────────────────┐
│ {"a":{"b":42,"g":42.42},"c":["1","2","3"],"d":"2020-01-01"} │
│ {"a":{"b":0},"d":"2020-01-02","f":"Hello, World!"}          │
│ {"a":{"b":43,"g":43.43},"c":["4","5","6"]}                  │
└─────────────────────────────────────────────────────────────┘
```

```sql title="Запрос (чтение путей JSON как подстолбцов)"
SELECT json.a.b, json.a.g, json.c, json.d FROM test;
```

```text title="Ответ (чтение путей JSON как подстолбцов)"
┌─json.a.b─┬─json.a.g─┬─json.c──┬─json.d─────┐
│       42 │ 42.42    │ [1,2,3] │ 2020-01-01 │
│        0 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ    │ 2020-01-02 │
│       43 │ 43.43    │ [4,5,6] │ ᴺᵁᴸᴸ       │
└──────────┴──────────┴─────────┴────────────┘
```

Также можно использовать функцию `getSubcolumn` для чтения подстолбцов из типа JSON:

```sql title="Запрос"
SELECT getSubcolumn(json, 'a.b'), getSubcolumn(json, 'a.g'), getSubcolumn(json, 'c'), getSubcolumn(json, 'd') FROM test;
```

```text title="Ответ"
┌─getSubcolumn(json, 'a.b')─┬─getSubcolumn(json, 'a.g')─┬─getSubcolumn(json, 'c')─┬─getSubcolumn(json, 'd')─┐
│                        42 │ 42.42                     │ [1,2,3]                 │ 2020-01-01              │
│                         0 │ ᴺᵁᴸᴸ                      │ ᴺᵁᴸᴸ                    │ 2020-01-02              │
│                        43 │ 43.43                     │ [4,5,6]                 │ ᴺᵁᴸᴸ                    │
└───────────────────────────┴───────────────────────────┴─────────────────────────┴─────────────────────────┘
```

Если запрашиваемый путь не найден в данных, он будет заполнен значениями `NULL`:

```sql title="Запрос"
SELECT json.non.existing.path FROM test;
```

```text title="Ответ"
┌─json.non.existing.path─┐
│ ᴺᵁᴸᴸ                   │
│ ᴺᵁᴸᴸ                   │
│ ᴺᵁᴸᴸ                   │
└────────────────────────┘
```

Проверим типы данных возвращаемых подстолбцов:

```sql title="Запрос"
SELECT toTypeName(json.a.b), toTypeName(json.a.g), toTypeName(json.c), toTypeName(json.d) FROM test;
```


```text title="Response"
┌─toTypeName(json.a.b)─┬─toTypeName(json.a.g)─┬─toTypeName(json.c)─┬─toTypeName(json.d)─┐
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
└──────────────────────┴──────────────────────┴────────────────────┴────────────────────┘
```

Как мы видим, для `a.b` тип — `UInt32`, как и было задано в объявлении типа JSON,
а для всех остальных подстолбцов тип — `Dynamic`.

Также можно читать подстолбцы типа `Dynamic`, используя специальный синтаксис `json.some.path.:TypeName`:

```sql title="Query"
SELECT
    json.a.g.:Float64,
    dynamicType(json.a.g),
    json.d.:Date,
    dynamicType(json.d)
FROM test
```

```text title="Response"
┌─json.a.g.:`Float64`─┬─dynamicType(json.a.g)─┬─json.d.:`Date`─┬─dynamicType(json.d)─┐
│               42.42 │ Float64               │     2020-01-01 │ Date                │
│                ᴺᵁᴸᴸ │ None                  │     2020-01-02 │ Date                │
│               43.43 │ Float64               │           ᴺᵁᴸᴸ │ None                │
└─────────────────────┴───────────────────────┴────────────────┴─────────────────────┘
```

Подстолбцы типа `Dynamic` могут быть приведены к любому типу данных. В этом случае будет сгенерировано исключение, если внутренний тип в `Dynamic` не может быть приведён к запрошенному типу:

```sql title="Query"
SELECT json.a.g::UInt64 AS uint 
FROM test;
```

```text title="Response"
┌─uint─┐
│   42 │
│    0 │
│   43 │
└──────┘
```

```sql title="Query"
SELECT json.a.g::UUID AS float 
FROM test;
```

```text title="Response"
Получено исключение от сервера:
Code: 48. DB::Exception: Received from localhost:9000. DB::Exception: 
Преобразование между числовыми типами и UUID не поддерживается. 
Вероятно, переданный UUID не заключен в кавычки: 
при выполнении 'FUNCTION CAST(__table1.json.a.g :: 2, 'UUID'_String :: 1) -> CAST(__table1.json.a.g, 'UUID'_String) UUID : 0'. 
(NOT_IMPLEMENTED)
```

:::note
Для эффективного чтения подстолбцов из частей Compact MergeTree убедитесь, что настройка MergeTree [write&#95;marks&#95;for&#95;substreams&#95;in&#95;compact&#95;parts](../../operations/settings/merge-tree-settings.md#write_marks_for_substreams_in_compact_parts) включена.
:::


## Чтение подобъектов JSON как подстолбцов {#reading-json-sub-objects-as-sub-columns}

Тип `JSON` поддерживает чтение вложенных объектов в виде подстолбцов типа `JSON` с помощью специального синтаксиса `json.^some.path`:

```sql title="Запрос"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : {"c" : 42, "g" : 42.42}}, "c" : [1, 2, 3], "d" : {"e" : {"f" : {"g" : "Hello, World", "h" : [1, 2, 3]}}}}'), ('{"f" : "Hello, World!", "d" : {"e" : {"f" : {"h" : [4, 5, 6]}}}}'), ('{"a" : {"b" : {"c" : 43, "e" : 10, "g" : 43.43}}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="Ответ"
┌─json──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":"42","g":42.42}},"c":["1","2","3"],"d":{"e":{"f":{"g":"Hello, World","h":["1","2","3"]}}}} │
│ {"d":{"e":{"f":{"h":["4","5","6"]}}},"f":"Hello, World!"}                                                 │
│ {"a":{"b":{"c":"43","e":"10","g":43.43}},"c":["4","5","6"]}                                               │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql title="Запрос"
SELECT json.^a.b, json.^d.e.f FROM test;
```

```text title="Ответ"
┌─json.^`a`.b───────────────────┬─json.^`d`.e.f──────────────────────────┐
│ {"c":"42","g":42.42}          │ {"g":"Hello, World","h":["1","2","3"]} │
│ {}                            │ {"h":["4","5","6"]}                    │
│ {"c":"43","e":"10","g":43.43} │ {}                                     │
└───────────────────────────────┴────────────────────────────────────────┘
```

:::note
Чтение подобъектов в виде подстолбцов может быть неэффективным, поскольку может потребоваться практически полное сканирование данных JSON.
:::


## Определение типов для путей {#type-inference-for-paths}

При парсинге `JSON` ClickHouse пытается определить наиболее подходящий тип данных для каждого пути JSON.
Это работает аналогично [автоматическому выводу схемы из входных данных](/interfaces/schema-inference.md)
и управляется теми же настройками:

- [input_format_try_infer_dates](/operations/settings/formats#input_format_try_infer_dates)
- [input_format_try_infer_datetimes](/operations/settings/formats#input_format_try_infer_datetimes)
- [schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable)
- [input_format_json_try_infer_numbers_from_strings](/operations/settings/formats#input_format_json_try_infer_numbers_from_strings)
- [input_format_json_infer_incomplete_types_as_strings](/operations/settings/formats#input_format_json_infer_incomplete_types_as_strings)
- [input_format_json_read_numbers_as_strings](/operations/settings/formats#input_format_json_read_numbers_as_strings)
- [input_format_json_read_bools_as_strings](/operations/settings/formats#input_format_json_read_bools_as_strings)
- [input_format_json_read_bools_as_numbers](/operations/settings/formats#input_format_json_read_bools_as_numbers)
- [input_format_json_read_arrays_as_strings](/operations/settings/formats#input_format_json_read_arrays_as_strings)
- [input_format_json_infer_array_of_dynamic_from_array_of_different_types](/operations/settings/formats#input_format_json_infer_array_of_dynamic_from_array_of_different_types)

Рассмотрим несколько примеров:

```sql title="Запрос"
SELECT JSONAllPathsWithTypes('{"a" : "2020-01-01", "b" : "2020-01-01 10:00:00"}'::JSON) AS paths_with_types settings input_format_try_infer_dates=1, input_format_try_infer_datetimes=1;
```

```text title="Ответ"
┌─paths_with_types─────────────────┐
│ {'a':'Date','b':'DateTime64(9)'} │
└──────────────────────────────────┘
```

```sql title="Запрос"
SELECT JSONAllPathsWithTypes('{"a" : "2020-01-01", "b" : "2020-01-01 10:00:00"}'::JSON) AS paths_with_types settings input_format_try_infer_dates=0, input_format_try_infer_datetimes=0;
```

```text title="Ответ"
┌─paths_with_types────────────┐
│ {'a':'String','b':'String'} │
└─────────────────────────────┘
```

```sql title="Запрос"
SELECT JSONAllPathsWithTypes('{"a" : [1, 2, 3]}'::JSON) AS paths_with_types settings schema_inference_make_columns_nullable=1;
```

```text title="Ответ"
┌─paths_with_types───────────────┐
│ {'a':'Array(Nullable(Int64))'} │
└────────────────────────────────┘
```

```sql title="Запрос"
SELECT JSONAllPathsWithTypes('{"a" : [1, 2, 3]}'::JSON) AS paths_with_types settings schema_inference_make_columns_nullable=0;
```

```text title="Ответ"
┌─paths_with_types─────┐
│ {'a':'Array(Int64)'} │
└──────────────────────┘
```


## Обработка массивов JSON-объектов {#handling-arrays-of-json-objects}

JSON-пути, содержащие массив объектов, разбираются как тип `Array(JSON)` и вставляются в столбец `Dynamic` для данного пути.
Чтобы прочитать массив объектов, его можно извлечь из столбца `Dynamic` как подстолбец:

```sql title="Запрос"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES
('{"a" : {"b" : [{"c" : 42, "d" : "Hello", "f" : [[{"g" : 42.42}]], "k" : {"j" : 1000}}, {"c" : 43}, {"e" : [1, 2, 3], "d" : "My", "f" : [[{"g" : 43.43, "h" : "2020-01-01"}]],  "k" : {"j" : 2000}}]}}'),
('{"a" : {"b" : [1, 2, 3]}}'),
('{"a" : {"b" : [{"c" : 44, "f" : [[{"h" : "2020-01-02"}]]}, {"e" : [4, 5, 6], "d" : "World", "f" : [[{"g" : 44.44}]],  "k" : {"j" : 3000}}]}}');
SELECT json FROM test;
```

```text title="Ответ"
┌─json────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {"a":{"b":[{"c":"42","d":"Hello","f":[[{"g":42.42}]],"k":{"j":"1000"}},{"c":"43"},{"d":"My","e":["1","2","3"],"f":[[{"g":43.43,"h":"2020-01-01"}]],"k":{"j":"2000"}}]}} │
│ {"a":{"b":["1","2","3"]}}                                                                                                                                               │
│ {"a":{"b":[{"c":"44","f":[[{"h":"2020-01-02"}]]},{"d":"World","e":["4","5","6"],"f":[[{"g":44.44}]],"k":{"j":"3000"}}]}}                                                │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql title="Запрос"
SELECT json.a.b, dynamicType(json.a.b) FROM test;
```

```text title="Ответ"
┌─json.a.b──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─dynamicType(json.a.b)────────────────────────────────────┐
│ ['{"c":"42","d":"Hello","f":[[{"g":42.42}]],"k":{"j":"1000"}}','{"c":"43"}','{"d":"My","e":["1","2","3"],"f":[[{"g":43.43,"h":"2020-01-01"}]],"k":{"j":"2000"}}'] │ Array(JSON(max_dynamic_types=16, max_dynamic_paths=256)) │
│ [1,2,3]                                                                                                                                                           │ Array(Nullable(Int64))                                   │
│ ['{"c":"44","f":[[{"h":"2020-01-02"}]]}','{"d":"World","e":["4","5","6"],"f":[[{"g":44.44}]],"k":{"j":"3000"}}']                                                  │ Array(JSON(max_dynamic_types=16, max_dynamic_paths=256)) │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

Как можно заметить, параметры `max_dynamic_types`/`max_dynamic_paths` вложенного типа `JSON` были уменьшены по сравнению со значениями по умолчанию.
Это необходимо для предотвращения неконтролируемого роста количества подстолбцов во вложенных массивах JSON-объектов.

Попробуем прочитать подстолбцы из вложенного столбца `JSON`:

```sql title="Запрос"
SELECT json.a.b.:`Array(JSON)`.c, json.a.b.:`Array(JSON)`.f, json.a.b.:`Array(JSON)`.d FROM test;
```


```text title="Response"
┌─json.a.b.:`Array(JSON)`.c─┬─json.a.b.:`Array(JSON)`.f───────────────────────────────────┬─json.a.b.:`Array(JSON)`.d─┐
│ [42,43,NULL]              │ [[['{"g":42.42}']],NULL,[['{"g":43.43,"h":"2020-01-01"}']]] │ ['Hello',NULL,'My']       │
│ []                        │ []                                                          │ []                        │
│ [44,NULL]                 │ [[['{"h":"2020-01-02"}']],[['{"g":44.44}']]]                │ [NULL,'World']            │
└───────────────────────────┴─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

Мы можем избавиться от необходимости явно указывать имена подстолбцов `Array(JSON)`, используя специальный синтаксис:

```sql title="Query"
SELECT json.a.b[].c, json.a.b[].f, json.a.b[].d FROM test;
```

```text title="Response"
┌─json.a.b.:`Array(JSON)`.c─┬─json.a.b.:`Array(JSON)`.f───────────────────────────────────┬─json.a.b.:`Array(JSON)`.d─┐
│ [42,43,NULL]              │ [[['{"g":42.42}']],NULL,[['{"g":43.43,"h":"2020-01-01"}']]] │ ['Hello',NULL,'My']       │
│ []                        │ []                                                          │ []                        │
│ [44,NULL]                 │ [[['{"h":"2020-01-02"}']],[['{"g":44.44}']]]                │ [NULL,'World']            │
└───────────────────────────┴─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

Количество `[]` после пути указывает уровень массива. Например, `json.path[][]` будет преобразовано в `json.path.:Array(Array(JSON))`.

Давайте проверим пути и типы внутри нашего `Array(JSON)`:

```sql title="Query"
SELECT DISTINCT arrayJoin(JSONAllPathsWithTypes(arrayJoin(json.a.b[]))) FROM test;
```

```text title="Response"
┌─arrayJoin(JSONAllPathsWithTypes(arrayJoin(json.a.b.:`Array(JSON)`)))──┐
│ ('c','Int64')                                                         │
│ ('d','String')                                                        │
│ ('f','Array(Array(JSON(max_dynamic_types=8, max_dynamic_paths=64)))') │
│ ('k.j','Int64')                                                       │
│ ('e','Array(Nullable(Int64))')                                        │
└───────────────────────────────────────────────────────────────────────┘
```

Прочитаем подстолбцы из столбца `Array(JSON)`:

```sql title="Query"
SELECT json.a.b[].c.:Int64, json.a.b[].f[][].g.:Float64, json.a.b[].f[][].h.:Date FROM test;
```

```text title="Response"
┌─json.a.b.:`Array(JSON)`.c.:`Int64`─┬─json.a.b.:`Array(JSON)`.f.:`Array(Array(JSON))`.g.:`Float64`─┬─json.a.b.:`Array(JSON)`.f.:`Array(Array(JSON))`.h.:`Date`─┐
│ [42,43,NULL]                       │ [[[42.42]],[],[[43.43]]]                                     │ [[[NULL]],[],[['2020-01-01']]]                            │
│ []                                 │ []                                                           │ []                                                        │
│ [44,NULL]                          │ [[[NULL]],[[44.44]]]                                         │ [[['2020-01-02']],[[NULL]]]                               │
└────────────────────────────────────┴──────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
```

Мы также можем читать подколонки подобъектов из вложенного столбца `JSON`:

```sql title="Query"
SELECT json.a.b[].^k FROM test
```

```text title="Response"
┌─json.a.b.:`Array(JSON)`.^`k`─────────┐
│ ['{"j":"1000"}','{}','{"j":"2000"}'] │
│ []                                   │
│ ['{}','{"j":"3000"}']                │
└──────────────────────────────────────┘
```


## Обработка JSON-ключей со значением NULL {#handling-json-keys-with-nulls}

В нашей реализации JSON значение `null` и отсутствие значения считаются эквивалентными:

```sql title="Запрос"
SELECT '{}'::JSON AS json1, '{"a" : null}'::JSON AS json2, json1 = json2
```

```text title="Ответ"
┌─json1─┬─json2─┬─equals(json1, json2)─┐
│ {}    │ {}    │                    1 │
└───────┴───────┴──────────────────────┘
```

Это означает, что невозможно определить, содержали ли исходные JSON-данные какой-либо путь со значением NULL или не содержали его вообще.


## Обработка JSON-ключей с точками {#handling-json-keys-with-dots}

Внутри колонка JSON хранит все пути и значения в плоском виде. Это означает, что по умолчанию эти 2 объекта считаются идентичными:

```json
{"a" : {"b" : 42}}
{"a.b" : 42}
```

Оба они будут храниться внутри как пара пути `a.b` и значения `42`. При форматировании JSON всегда формируются вложенные объекты на основе частей пути, разделенных точкой:

```sql title="Запрос"
SELECT '{"a" : {"b" : 42}}'::JSON AS json1, '{"a.b" : 42}'::JSON AS json2, JSONAllPaths(json1), JSONAllPaths(json2);
```

```text title="Ответ"
┌─json1────────────┬─json2────────────┬─JSONAllPaths(json1)─┬─JSONAllPaths(json2)─┐
│ {"a":{"b":"42"}} │ {"a":{"b":"42"}} │ ['a.b']             │ ['a.b']             │
└──────────────────┴──────────────────┴─────────────────────┴─────────────────────┘
```

Как видно, исходный JSON `{"a.b" : 42}` теперь отформатирован как `{"a" : {"b" : 42}}`.

Это ограничение также приводит к ошибке при разборе валидных JSON-объектов, таких как:

```sql title="Запрос"
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json;
```

```text title="Ответ"
Code: 117. DB::Exception: Cannot insert data into JSON column: Duplicate path found during parsing JSON object: a.b. You can enable setting type_json_skip_duplicated_paths to skip duplicated paths during insert: In scope SELECT CAST('{"a.b" : 42, "a" : {"b" : "Hello, World"}}', 'JSON') AS json. (INCORRECT_DATA)
```

Если вы хотите сохранить ключи с точками и избежать их форматирования как вложенных объектов, можно включить
настройку [json_type_escape_dots_in_keys](/operations/settings/formats#json_type_escape_dots_in_keys) (доступна начиная с версии `25.8`). В этом случае при разборе все точки в JSON-ключах будут
экранированы в `%2E` и деэкранированы обратно при форматировании.

```sql title="Запрос"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a" : {"b" : 42}}'::JSON AS json1, '{"a.b" : 42}'::JSON AS json2, JSONAllPaths(json1), JSONAllPaths(json2);
```

```text title="Ответ"
┌─json1────────────┬─json2────────┬─JSONAllPaths(json1)─┬─JSONAllPaths(json2)─┐
│ {"a":{"b":"42"}} │ {"a.b":"42"} │ ['a.b']             │ ['a%2Eb']           │
└──────────────────┴──────────────┴─────────────────────┴─────────────────────┘
```

```sql title="Запрос"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, JSONAllPaths(json);
```

```text title="Ответ"
┌─json──────────────────────────────────┬─JSONAllPaths(json)─┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ ['a%2Eb','a.b']    │
└───────────────────────────────────────┴────────────────────┘
```

Чтобы прочитать ключ с экранированной точкой как подколонку, необходимо использовать экранированную точку в имени подколонки:

```sql title="Запрос"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.a.b;
```

```text title="Ответ"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┘
```

Примечание: из-за ограничений парсера и анализатора идентификаторов подколонка `` json.`a.b` `` эквивалентна подколонке `json.a.b` и не будет читать путь с экранированной точкой:


```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON AS json, json.`a%2Eb`, json.`a.b`, json.a.b;
```

```text title="Response"
┌─json──────────────────────────────────┬─json.a%2Eb─┬─json.a.b─────┬─json.a.b─────┐
│ {"a.b":"42","a":{"b":"Hello World!"}} │ 42         │ Hello World! │ Hello World! │
└───────────────────────────────────────┴────────────┴──────────────┴──────────────┘
```

Кроме того, если вы хотите указать подсказку для JSON‑пути, который содержит ключи с точками (или использовать её в разделах `SKIP`/`SKIP REGEX`), необходимо использовать экранированные точки в подсказке:

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON(`a%2Eb` UInt8) as json, json.`a%2Eb`, toTypeName(json.`a%2Eb`);
```

```text title="Response"
┌─json────────────────────────────────┬─json.a%2Eb─┬─toTypeName(json.a%2Eb)─┐
│ {"a.b":42,"a":{"b":"Hello World!"}} │         42 │ UInt8                  │
└─────────────────────────────────────┴────────────┴────────────────────────┘
```

```sql title="Query"
SET json_type_escape_dots_in_keys=1;
SELECT '{"a.b" : 42, "a" : {"b" : "Hello World!"}}'::JSON(SKIP `a%2Eb`) as json, json.`a%2Eb`;
```

```text title="Response"
┌─json───────────────────────┬─json.a%2Eb─┐
│ {"a":{"b":"Привет, мир!"}} │ ᴺᵁᴸᴸ       │
└────────────────────────────┴────────────┘
```


## Чтение типа JSON из данных {#reading-json-type-from-data}

Все текстовые форматы
([`JSONEachRow`](/interfaces/formats/JSONEachRow),
[`TSV`](/interfaces/formats/TabSeparated),
[`CSV`](/interfaces/formats/CSV),
[`CustomSeparated`](/interfaces/formats/CustomSeparated),
[`Values`](/interfaces/formats/Values) и т. д.) поддерживают чтение типа `JSON`.

Примеры:

```sql title="Запрос"
SELECT json FROM format(JSONEachRow, 'json JSON(a.b.c UInt32, SKIP a.b.d, SKIP d.e, SKIP REGEXP \'b.*\')', '
{"json" : {"a" : {"b" : {"c" : 1, "d" : [0, 1]}}, "b" : "2020-01-01", "c" : 42, "d" : {"e" : {"f" : ["s1", "s2"]}, "i" : [1, 2, 3]}}}
{"json" : {"a" : {"b" : {"c" : 2, "d" : [2, 3]}}, "b" : [1, 2, 3], "c" : null, "d" : {"e" : {"g" : 43}, "i" : [4, 5, 6]}}}
{"json" : {"a" : {"b" : {"c" : 3, "d" : [4, 5]}}, "b" : {"c" : 10}, "e" : "Hello, World!"}}
{"json" : {"a" : {"b" : {"c" : 4, "d" : [6, 7]}}, "c" : 43}}
{"json" : {"a" : {"b" : {"c" : 5, "d" : [8, 9]}}, "b" : {"c" : 11, "j" : [1, 2, 3]}, "d" : {"e" : {"f" : ["s3", "s4"], "g" : 44}, "h" : "2020-02-02 10:00:00"}}}
')
```

```text title="Результат"
┌─json──────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":1}},"c":"42","d":{"i":["1","2","3"]}}          │
│ {"a":{"b":{"c":2}},"d":{"i":["4","5","6"]}}                   │
│ {"a":{"b":{"c":3}},"e":"Hello, World!"}                       │
│ {"a":{"b":{"c":4}},"c":"43"}                                  │
│ {"a":{"b":{"c":5}},"d":{"h":"2020-02-02 10:00:00.000000000"}} │
└───────────────────────────────────────────────────────────────┘
```

Для текстовых форматов, таких как `CSV`/`TSV` и т. д., `JSON` парсится из строки, содержащей JSON-объект:


```sql title="Query"
SELECT json FROM format(TSV, 'json JSON(a.b.c UInt32, SKIP a.b.d, SKIP REGEXP \'b.*\')',
'{"a" : {"b" : {"c" : 1, "d" : [0, 1]}}, "b" : "2020-01-01", "c" : 42, "d" : {"e" : {"f" : ["s1", "s2"]}, "i" : [1, 2, 3]}}
{"a" : {"b" : {"c" : 2, "d" : [2, 3]}}, "b" : [1, 2, 3], "c" : null, "d" : {"e" : {"g" : 43}, "i" : [4, 5, 6]}}
{"a" : {"b" : {"c" : 3, "d" : [4, 5]}}, "b" : {"c" : 10}, "e" : "Hello, World!"}
{"a" : {"b" : {"c" : 4, "d" : [6, 7]}}, "c" : 43}
{"a" : {"b" : {"c" : 5, "d" : [8, 9]}}, "b" : {"c" : 11, "j" : [1, 2, 3]}, "d" : {"e" : {"f" : ["s3", "s4"], "g" : 44}, "h" : "2020-02-02 10:00:00"}}')
```

```text title="Response"
┌─json──────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":1}},"c":"42","d":{"i":["1","2","3"]}}          │
│ {"a":{"b":{"c":2}},"d":{"i":["4","5","6"]}}                   │
│ {"a":{"b":{"c":3}},"e":"Hello, World!"}                       │
│ {"a":{"b":{"c":4}},"c":"43"}                                  │
│ {"a":{"b":{"c":5}},"d":{"h":"2020-02-02 10:00:00.000000000"}} │
└───────────────────────────────────────────────────────────────┘
```


## Достижение лимита динамических путей внутри JSON {#reaching-the-limit-of-dynamic-paths-inside-json}

Тип данных `JSON` может хранить только ограниченное количество путей в виде отдельных подстолбцов.
По умолчанию этот лимит составляет `1024`, но его можно изменить в объявлении типа с помощью параметра `max_dynamic_paths`.

При достижении лимита все новые пути, вставляемые в столбец `JSON`, будут храниться в единой общей структуре данных.
Такие пути по-прежнему можно читать как подстолбцы,
но это может быть менее эффективно ([см. раздел об общей структуре данных](#shared-data-structure)).
Этот лимит необходим для предотвращения создания огромного количества различных подстолбцов, которые могут сделать таблицу непригодной для использования.

Рассмотрим, что происходит при достижении лимита в различных сценариях.

### Достижение лимита при парсинге данных {#reaching-the-limit-during-data-parsing}

При парсинге объектов `JSON` из данных, когда лимит достигается для текущего блока данных,
все новые пути сохраняются в общей структуре данных. Для анализа можно использовать следующие две функции интроспекции: `JSONDynamicPaths`, `JSONSharedDataPaths`:

```sql title="Запрос"
SELECT json, JSONDynamicPaths(json), JSONSharedDataPaths(json) FROM format(JSONEachRow, 'json JSON(max_dynamic_paths=3)', '
{"json" : {"a" : {"b" : 42}, "c" : [1, 2, 3]}}
{"json" : {"a" : {"b" : 43}, "d" : "2020-01-01"}}
{"json" : {"a" : {"b" : 44}, "c" : [4, 5, 6]}}
{"json" : {"a" : {"b" : 43}, "d" : "2020-01-02", "e" : "Hello", "f" : {"g" : 42.42}}}
{"json" : {"a" : {"b" : 43}, "c" : [7, 8, 9], "f" : {"g" : 43.43}, "h" : "World"}}
')
```

```text title="Ответ"
┌─json───────────────────────────────────────────────────────────┬─JSONDynamicPaths(json)─┬─JSONSharedDataPaths(json)─┐
│ {"a":{"b":"42"},"c":["1","2","3"]}                             │ ['a.b','c','d']        │ []                        │
│ {"a":{"b":"43"},"d":"2020-01-01"}                              │ ['a.b','c','d']        │ []                        │
│ {"a":{"b":"44"},"c":["4","5","6"]}                             │ ['a.b','c','d']        │ []                        │
│ {"a":{"b":"43"},"d":"2020-01-02","e":"Hello","f":{"g":42.42}}  │ ['a.b','c','d']        │ ['e','f.g']               │
│ {"a":{"b":"43"},"c":["7","8","9"],"f":{"g":43.43},"h":"World"} │ ['a.b','c','d']        │ ['f.g','h']               │
└────────────────────────────────────────────────────────────────┴────────────────────────┴───────────────────────────┘
```

Как видно, после вставки путей `e` и `f.g` лимит был достигнут,
и они были помещены в общую структуру данных.

### При слиянии частей данных в движках таблиц MergeTree {#during-merges-of-data-parts-in-mergetree-table-engines}

При слиянии нескольких частей данных в таблице `MergeTree` столбец `JSON` в результирующей части данных может достичь лимита динамических путей
и не сможет хранить все пути из исходных частей в виде подстолбцов.
В этом случае ClickHouse определяет, какие пути останутся подстолбцами после слияния, а какие будут сохранены в общей структуре данных.
В большинстве случаев ClickHouse пытается сохранить пути с
наибольшим количеством ненулевых значений и переместить наиболее редкие пути в общую структуру данных. Однако это зависит от реализации.

Рассмотрим пример такого слияния.
Сначала создадим таблицу со столбцом `JSON`, установим лимит динамических путей равным `3`, а затем вставим значения с `5` различными путями:


```sql title="Query"
CREATE TABLE test (id UInt64, json JSON(max_dynamic_paths=3)) ENGINE=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as a) FROM numbers(5);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as b) FROM numbers(4);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as c) FROM numbers(3);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as d) FROM numbers(2);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as e) FROM numbers(1);
```

Каждая вставка создаст отдельную часть данных, где колонка `JSON` будет содержать только один путь:

```sql title="Query"
SELECT
    count(),
    groupArrayArrayDistinct(JSONDynamicPaths(json)) AS dynamic_paths,
    groupArrayArrayDistinct(JSONSharedDataPaths(json)) AS shared_data_paths,
    _part
FROM test
GROUP BY _part
ORDER BY _part ASC
```

```text title="Response"
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│       5 │ ['a']         │ []                │ all_1_1_0 │
│       4 │ ['b']         │ []                │ all_2_2_0 │
│       3 │ ['c']         │ []                │ all_3_3_0 │
│       2 │ ['d']         │ []                │ all_4_4_0 │
│       1 │ ['e']         │ []                │ all_5_5_0 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

Теперь давайте объединим все части и посмотрим, что получится:

```sql title="Query"
SELECT
    count(),
    groupArrayArrayDistinct(JSONDynamicPaths(json)) AS dynamic_paths,
    groupArrayArrayDistinct(JSONSharedDataPaths(json)) AS shared_data_paths,
    _part
FROM test
GROUP BY _part
ORDER BY _part ASC
```

```text title="Response"
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│      15 │ ['a','b','c'] │ ['d','e']         │ all_1_5_2 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

Как мы видим, ClickHouse сохранил наиболее часто встречающиеся пути `a`, `b` и `c`, а пути `d` и `e` переместил в общую структуру данных.


## Структура общих данных {#shared-data-structure}

Как было описано в предыдущем разделе, при достижении лимита `max_dynamic_paths` все новые пути сохраняются в единой структуре общих данных.
В этом разделе мы рассмотрим детали структуры общих данных и способы чтения из неё подстолбцов путей.

Подробную информацию о функциях, используемых для проверки содержимого столбца JSON, см. в разделе ["функции интроспекции"](/sql-reference/data-types/newjson#introspection-functions).

### Структура общих данных в памяти {#shared-data-structure-in-memory}

В памяти структура общих данных представляет собой подстолбец типа `Map(String, String)`, который хранит отображение плоского пути JSON на бинарно закодированное значение.
Для извлечения подстолбца пути выполняется перебор всех строк в этом столбце `Map` с поиском запрошенного пути и его значений.

### Структура общих данных в частях MergeTree {#shared-data-structure-in-merge-tree-parts}

В таблицах [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) данные хранятся в частях данных, которые размещаются на диске (локальном или удалённом). При этом данные на диске могут храниться иначе, чем в памяти.
В настоящее время существует 3 различных варианта сериализации структуры общих данных в частях данных MergeTree: `map`, `map_with_buckets`
и `advanced`.

Версия сериализации управляется настройками MergeTree
[object_shared_data_serialization_version](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version)
и [object_shared_data_serialization_version_for_zero_level_parts](../../operations/settings/merge-tree-settings.md#object_shared_data_serialization_version_for_zero_level_parts)
(часть нулевого уровня — это часть, создаваемая при вставке данных в таблицу; при слияниях части имеют более высокий уровень).

Примечание: изменение сериализации структуры общих данных поддерживается только
для [версии сериализации объектов](../../operations/settings/merge-tree-settings.md#object_serialization_version) `v3`

#### Map {#shared-data-map}

В версии сериализации `map` общие данные сериализуются как единый столбец типа `Map(String, String)`, так же как они хранятся в
памяти. Для чтения подстолбца пути из этого типа сериализации ClickHouse читает весь столбец `Map` и
извлекает запрошенный путь в памяти.

Эта сериализация эффективна для записи данных и чтения всего столбца `JSON`, но неэффективна для чтения подстолбцов путей.

#### Map с корзинами {#shared-data-map-with-buckets}

В версии сериализации `map_with_buckets` общие данные сериализуются как `N` столбцов («корзин») типа `Map(String, String)`.
Каждая такая корзина содержит только подмножество путей. Для чтения подстолбца пути из этого типа сериализации ClickHouse
читает весь столбец `Map` из одной корзины и извлекает запрошенный путь в памяти.

Эта сериализация менее эффективна для записи данных и чтения всего столбца `JSON`, но более эффективна для чтения подстолбцов путей,
поскольку читает данные только из необходимых корзин.

Количество корзин `N` управляется настройками MergeTree [object_shared_data_buckets_for_compact_part](../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_compact_part) (8 по умолчанию)
и [object_shared_data_buckets_for_wide_part](../../operations/settings/merge-tree-settings.md#object_shared_data_buckets_for_wide_part) (32 по умолчанию).

#### Advanced {#shared-data-advanced}

В версии сериализации `advanced` общие данные сериализуются в специальной структуре данных, которая максимизирует производительность
чтения подстолбцов путей за счёт хранения дополнительной информации, позволяющей читать только данные запрошенных путей.
Эта сериализация также поддерживает корзины, поэтому каждая корзина содержит только подмножество путей.

Эта сериализация довольно неэффективна для записи данных (поэтому не рекомендуется использовать её для частей нулевого уровня), чтение всего столбца `JSON` немного менее эффективно по сравнению с сериализацией `map`, но она очень эффективна для чтения подстолбцов путей.

Примечание: из-за хранения дополнительной информации внутри структуры данных размер дискового хранилища при этой сериализации больше по сравнению с
сериализациями `map` и `map_with_buckets`.

Более подробный обзор новых сериализаций общих данных и деталей реализации см. в [статье блога](https://clickhouse.com/blog/json-data-type-gets-even-better).


## Функции интроспекции {#introspection-functions}

Существует несколько функций, которые помогают исследовать содержимое столбца JSON:

- [`JSONAllPaths`](../functions/json-functions.md#JSONAllPaths)
- [`JSONAllPathsWithTypes`](../functions/json-functions.md#JSONAllPathsWithTypes)
- [`JSONDynamicPaths`](../functions/json-functions.md#JSONDynamicPaths)
- [`JSONDynamicPathsWithTypes`](../functions/json-functions.md#JSONDynamicPathsWithTypes)
- [`JSONSharedDataPaths`](../functions/json-functions.md#JSONSharedDataPaths)
- [`JSONSharedDataPathsWithTypes`](../functions/json-functions.md#JSONSharedDataPathsWithTypes)
- [`distinctDynamicTypes`](../aggregate-functions/reference/distinctdynamictypes.md)
- [`distinctJSONPaths and distinctJSONPathsAndTypes`](../aggregate-functions/reference/distinctjsonpaths.md)

**Примеры**

Рассмотрим содержимое набора данных [GH Archive](https://www.gharchive.org/) за дату `2020-01-01`:

```sql title="Запрос"
SELECT arrayJoin(distinctJSONPaths(json))
FROM s3('s3://clickhouse-public-datasets/gharchive/original/2020-01-01-*.json.gz', JSONAsObject)
```

```text title="Результат"
┌─arrayJoin(distinctJSONPaths(json))─────────────────────────┐
│ actor.avatar_url                                           │
│ actor.display_login                                        │
│ actor.gravatar_id                                          │
│ actor.id                                                   │
│ actor.login                                                │
│ actor.url                                                  │
│ created_at                                                 │
│ id                                                         │
│ org.avatar_url                                             │
│ org.gravatar_id                                            │
│ org.id                                                     │
│ org.login                                                  │
│ org.url                                                    │
│ payload.action                                             │
│ payload.before                                             │
│ payload.comment._links.html.href                           │
│ payload.comment._links.pull_request.href                   │
│ payload.comment._links.self.href                           │
│ payload.comment.author_association                         │
│ payload.comment.body                                       │
│ payload.comment.commit_id                                  │
│ payload.comment.created_at                                 │
│ payload.comment.diff_hunk                                  │
│ payload.comment.html_url                                   │
│ payload.comment.id                                         │
│ payload.comment.in_reply_to_id                             │
│ payload.comment.issue_url                                  │
│ payload.comment.line                                       │
│ payload.comment.node_id                                    │
│ payload.comment.original_commit_id                         │
│ payload.comment.original_position                          │
│ payload.comment.path                                       │
│ payload.comment.position                                   │
│ payload.comment.pull_request_review_id                     │
...
│ payload.release.node_id                                    │
│ payload.release.prerelease                                 │
│ payload.release.published_at                               │
│ payload.release.tag_name                                   │
│ payload.release.tarball_url                                │
│ payload.release.target_commitish                           │
│ payload.release.upload_url                                 │
│ payload.release.url                                        │
│ payload.release.zipball_url                                │
│ payload.size                                               │
│ public                                                     │
│ repo.id                                                    │
│ repo.name                                                  │
│ repo.url                                                   │
│ type                                                       │
└─arrayJoin(distinctJSONPaths(json))─────────────────────────┘
```

```sql
SELECT arrayJoin(distinctJSONPathsAndTypes(json))
FROM s3('s3://clickhouse-public-datasets/gharchive/original/2020-01-01-*.json.gz', JSONAsObject)
SETTINGS date_time_input_format = 'best_effort'
```


```text
┌─arrayJoin(distinctJSONPathsAndTypes(json))──────────────────┐
│ ('actor.avatar_url',['String'])                             │
│ ('actor.display_login',['String'])                          │
│ ('actor.gravatar_id',['String'])                            │
│ ('actor.id',['Int64'])                                      │
│ ('actor.login',['String'])                                  │
│ ('actor.url',['String'])                                    │
│ ('created_at',['DateTime'])                                 │
│ ('id',['String'])                                           │
│ ('org.avatar_url',['String'])                               │
│ ('org.gravatar_id',['String'])                              │
│ ('org.id',['Int64'])                                        │
│ ('org.login',['String'])                                    │
│ ('org.url',['String'])                                      │
│ ('payload.action',['String'])                               │
│ ('payload.before',['String'])                               │
│ ('payload.comment._links.html.href',['String'])             │
│ ('payload.comment._links.pull_request.href',['String'])     │
│ ('payload.comment._links.self.href',['String'])             │
│ ('payload.comment.author_association',['String'])           │
│ ('payload.comment.body',['String'])                         │
│ ('payload.comment.commit_id',['String'])                    │
│ ('payload.comment.created_at',['DateTime'])                 │
│ ('payload.comment.diff_hunk',['String'])                    │
│ ('payload.comment.html_url',['String'])                     │
│ ('payload.comment.id',['Int64'])                            │
│ ('payload.comment.in_reply_to_id',['Int64'])                │
│ ('payload.comment.issue_url',['String'])                    │
│ ('payload.comment.line',['Int64'])                          │
│ ('payload.comment.node_id',['String'])                      │
│ ('payload.comment.original_commit_id',['String'])           │
│ ('payload.comment.original_position',['Int64'])             │
│ ('payload.comment.path',['String'])                         │
│ ('payload.comment.position',['Int64'])                      │
│ ('payload.comment.pull_request_review_id',['Int64'])        │
...
│ ('payload.release.node_id',['String'])                      │
│ ('payload.release.prerelease',['Bool'])                     │
│ ('payload.release.published_at',['DateTime'])               │
│ ('payload.release.tag_name',['String'])                     │
│ ('payload.release.tarball_url',['String'])                  │
│ ('payload.release.target_commitish',['String'])             │
│ ('payload.release.upload_url',['String'])                   │
│ ('payload.release.url',['String'])                          │
│ ('payload.release.zipball_url',['String'])                  │
│ ('payload.size',['Int64'])                                  │
│ ('public',['Bool'])                                         │
│ ('repo.id',['Int64'])                                       │
│ ('repo.name',['String'])                                    │
│ ('repo.url',['String'])                                     │
│ ('type',['String'])                                         │
└─arrayJoin(distinctJSONPathsAndTypes(json))──────────────────┘
```


## ALTER MODIFY COLUMN для типа JSON {#alter-modify-column-to-json-type}

Можно изменить существующую таблицу и преобразовать тип столбца в новый тип `JSON`. В настоящее время поддерживается только изменение `ALTER` из типа `String`.

**Пример**

```sql title="Запрос"
CREATE TABLE test (json String) ENGINE=MergeTree ORDER BY tuple();
INSERT INTO test VALUES ('{"a" : 42}'), ('{"a" : 43, "b" : "Hello"}'), ('{"a" : 44, "b" : [1, 2, 3]}'), ('{"c" : "2020-01-01"}');
ALTER TABLE test MODIFY COLUMN json JSON;
SELECT json, json.a, json.b, json.c FROM test;
```

```text title="Результат"
┌─json─────────────────────────┬─json.a─┬─json.b──┬─json.c─────┐
│ {"a":"42"}                   │ 42     │ ᴺᵁᴸᴸ    │ ᴺᵁᴸᴸ       │
│ {"a":"43","b":"Hello"}       │ 43     │ Hello   │ ᴺᵁᴸᴸ       │
│ {"a":"44","b":["1","2","3"]} │ 44     │ [1,2,3] │ ᴺᵁᴸᴸ       │
│ {"c":"2020-01-01"}           │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ    │ 2020-01-01 │
└──────────────────────────────┴────────┴─────────┴────────────┘
```


## Сравнение значений типа JSON {#comparison-between-values-of-the-json-type}

Объекты JSON сравниваются аналогично Map.

Например:

```sql title="Запрос"
CREATE TABLE test (json1 JSON, json2 JSON) ENGINE=Memory;
INSERT INTO test FORMAT JSONEachRow
{"json1" : {}, "json2" : {}}
{"json1" : {"a" : 42}, "json2" : {}}
{"json1" : {"a" : 42}, "json2" : {"a" : 41}}
{"json1" : {"a" : 42}, "json2" : {"a" : 42}}
{"json1" : {"a" : 42}, "json2" : {"a" : [1, 2, 3]}}
{"json1" : {"a" : 42}, "json2" : {"a" : "Hello"}}
{"json1" : {"a" : 42}, "json2" : {"b" : 42}}
{"json1" : {"a" : 42}, "json2" : {"a" : 42, "b" : 42}}
{"json1" : {"a" : 42}, "json2" : {"a" : 41, "b" : 42}}

SELECT json1, json2, json1 < json2, json1 = json2, json1 > json2 FROM test;
```

```text title="Результат"
┌─json1──────┬─json2───────────────┬─less(json1, json2)─┬─equals(json1, json2)─┬─greater(json1, json2)─┐
│ {}         │ {}                  │                  0 │                    1 │                     0 │
│ {"a":"42"} │ {}                  │                  0 │                    0 │                     1 │
│ {"a":"42"} │ {"a":"41"}          │                  0 │                    0 │                     1 │
│ {"a":"42"} │ {"a":"42"}          │                  0 │                    1 │                     0 │
│ {"a":"42"} │ {"a":["1","2","3"]} │                  0 │                    0 │                     1 │
│ {"a":"42"} │ {"a":"Hello"}       │                  1 │                    0 │                     0 │
│ {"a":"42"} │ {"b":"42"}          │                  1 │                    0 │                     0 │
│ {"a":"42"} │ {"a":"42","b":"42"} │                  1 │                    0 │                     0 │
│ {"a":"42"} │ {"a":"41","b":"42"} │                  0 │                    0 │                     1 │
└────────────┴─────────────────────┴────────────────────┴──────────────────────┴───────────────────────┘
```

**Примечание:** если два пути содержат значения разных типов данных, они сравниваются согласно [правилу сравнения](/sql-reference/data-types/variant#comparing-values-of-variant-data) типа данных `Variant`.


## Советы по эффективному использованию типа JSON {#tips-for-better-usage-of-the-json-type}

Перед созданием столбца типа `JSON` и загрузкой в него данных учтите следующие рекомендации:

- Проанализируйте ваши данные и укажите как можно больше подсказок путей с типами. Это значительно повысит эффективность хранения и чтения.
- Определите, какие пути вам понадобятся, а какие не потребуются. Укажите ненужные пути в секции `SKIP`, а при необходимости — в секции `SKIP REGEXP`. Это улучшит эффективность хранения.
- Не устанавливайте слишком высокие значения параметра `max_dynamic_paths`, так как это может снизить эффективность хранения и чтения.
  Хотя это во многом зависит от системных параметров, таких как объём памяти, процессор и т. д., общая рекомендация — не устанавливать значение `max_dynamic_paths` больше 10 000 для локального файлового хранилища и 1024 для удалённого файлового хранилища.


## Дополнительные материалы {#further-reading}

- [Как мы создали новый мощный тип данных JSON для ClickHouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)
- [Испытание с миллиардом JSON-документов: ClickHouse против MongoDB, Elasticsearch и других](https://clickhouse.com/blog/json-bench-clickhouse-vs-mongodb-elasticsearch-duckdb-postgresql)
