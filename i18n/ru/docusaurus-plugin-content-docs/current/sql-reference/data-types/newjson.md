---
slug: /sql-reference/data-types/newjson
sidebar_position: 63
sidebar_label: JSON
keywords: ['json', 'data type']
title: 'Тип данных JSON'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge/>

Тип `JSON` хранит документы формата JavaScript Object Notation (JSON) в одной колонке.

:::note
Эта функция находится на стадии бета-тестирования и еще не готова к использованию в продакшене. Если вам нужно работать с документами JSON, рассмотрите возможность использования [этой руководства](/integrations/data-formats/json/overview).

Если вы хотите использовать тип `JSON` и для примеров на этой странице, используйте:

```sql
SET enable_json_type = 1
```

:::

Чтобы объявить колонку типа `JSON`, вы можете использовать следующий синтаксис:

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
Где параметры синтаксиса определяются следующим образом:

| Параметр                   | Описание                                                                                                                                                                                                                                                                                                                                                | Значение по умолчанию |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| `max_dynamic_paths`         | Необязательный параметр, указывающий, сколько путей может храниться отдельно в виде под-колонок в одном блоке данных, который хранится отдельно (например, в одном разделе данных для таблицы MergeTree). <br/><br/>Если этот лимит превышен, все другие пути будут храниться вместе в одной структуре.                                               | `1024`                |
| `max_dynamic_types`         | Необязательный параметр от `1` до `255`, указывающий, сколько различных типов данных может храниться внутри одной колонны пути с типом `Dynamic` в одном блоке данных, который хранится отдельно (например, в одном разделе данных для таблицы MergeTree). <br/><br/>Если предел будет превышен, все новые типы будут преобразованы в тип `String`. | `32`                  |
| `some.path TypeName`        | Необязательный тип подсказки для конкретного пути в JSON. Такие пути всегда будут храниться в качестве под-колонок с указанным типом.                                                                                                                                                                                                                  |                       |
| `SKIP path.to.skip`         | Необязательный подсказка для конкретного пути, который должен быть пропущен во время парсинга JSON. Такие пути никогда не будут хранились в колонке JSON. Если указанный путь является вложенным объектом JSON, весь вложенный объект будет пропущен.                                                                                                            |                       |
| `SKIP REGEXP 'path_regexp'` | Необязательный подсказка с регулярным выражением, которое используется для пропуска путей во время парсинга JSON. Все пути, соответствующие этому регулярному выражению, никогда не будут храниться в колонке JSON.                                                                                                                                                                           |                       |
## Создание JSON {#creating-json}

В этом разделе мы рассмотрим различные способы создания `JSON`.
### Использование `JSON` в определении колонки таблицы {#using-json-in-a-table-column-definition}

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
│ {"a":{"b":42},"c":[1,2,3]}        │
│ {"a":{"b":0},"f":"Hello, World!"} │
│ {"a":{"b":43},"c":[4,5,6]}        │
└───────────────────────────────────┘
```
### Использование CAST с `::JSON` {#using-cast-with-json}

Можно преобразовать различные типы с помощью специального синтаксиса `::JSON`.
#### CAST из `String` в `JSON` {#cast-from-string-to-json}

```sql title="Запрос"
SELECT '{"a" : {"b" : 42},"c" : [1, 2, 3], "d" : "Hello, World!"}'::JSON AS json;
```

```text title="Ответ"
┌─json───────────────────────────────────────────┐
│ {"a":{"b":42},"c":[1,2,3],"d":"Hello, World!"} │
└────────────────────────────────────────────────┘
```
#### CAST из `Tuple` в `JSON` {#cast-from-tuple-to-json}

```sql title="Запрос"
SET enable_named_columns_in_function_tuple = 1;
SELECT (tuple(42 AS b) AS a, [1, 2, 3] AS c, 'Hello, World!' AS d)::JSON AS json;
```

```text title="Ответ"
┌─json───────────────────────────────────────────┐
│ {"a":{"b":42},"c":[1,2,3],"d":"Hello, World!"} │
└────────────────────────────────────────────────┘
```
#### CAST из `Map` в `JSON` {#cast-from-map-to-json}

```sql title="Запрос"
SET enable_variant_type=1, use_variant_as_common_type=1;
SELECT map('a', map('b', 42), 'c', [1,2,3], 'd', 'Hello, World!')::JSON AS json;
```

```text title="Ответ"
┌─json───────────────────────────────────────────┐
│ {"a":{"b":42},"c":[1,2,3],"d":"Hello, World!"} │
└────────────────────────────────────────────────┘
```
#### CAST из устаревшего `Object('json')` в `JSON` {#cast-from-deprecated-objectjson-to-json}

```sql title="Запрос"
SET allow_experimental_object_type = 1;
SELECT '{"a" : {"b" : 42},"c" : [1, 2, 3], "d" : "Hello, World!"}'::Object('json')::JSON AS json;
```

```text title="Ответ"
┌─json───────────────────────────────────────────┐
│ {"a":{"b":42},"c":[1,2,3],"d":"Hello, World!"} │
└────────────────────────────────────────────────┘
```

:::note
Пути JSON хранятся в развернутом виде. Это означает, что когда объект JSON форматируется из пути, например, `a.b.c`, невозможно определить, должен ли объект быть построен как `{ "a.b.c" : ... }` или `{ "a" : {"b" : {"c" : ... }}}`. Наша реализация всегда будет предполагать последнее.

Например:

```sql
SELECT CAST('{"a.b.c" : 42}', 'JSON') as json
```

вернет:

```response
   ┌─json───────────────────┐
1. │ {"a":{"b":{"c":"42"}}} │
   └────────────────────────┘
```

и **не**:

```sql
   ┌─json───────────┐
1. │ {"a.b.c":"42"} │
   └────────────────┘
```
:::
## Чтение путей JSON как под-колонок {#reading-json-paths-as-sub-columns}

Тип `JSON` поддерживает чтение каждого пути как отдельной под-колонки. Если тип запрашиваемого пути не указан в декларации типа JSON, под-колонка пути всегда будет иметь тип [Dynamic](/sql-reference/data-types/dynamic.md).

Например:

```sql title="Запрос"
CREATE TABLE test (json JSON(a.b UInt32, SKIP a.e)) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : 42, "g" : 42.42}, "c" : [1, 2, 3], "d" : "2020-01-01"}'), ('{"f" : "Hello, World!", "d" : "2020-01-02"}'), ('{"a" : {"b" : 43, "e" : 10, "g" : 43.43}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="Ответ"
┌─json──────────────────────────────────────────────────┐
│ {"a":{"b":42,"g":42.42},"c":[1,2,3],"d":"2020-01-01"} │
│ {"a":{"b":0},"d":"2020-01-02","f":"Hello, World!"}    │
│ {"a":{"b":43,"g":43.43},"c":[4,5,6]}                  │
└───────────────────────────────────────────────────────┘
```

```sql title="Запрос (Чтение путей JSON как под-колонок)"
SELECT json.a.b, json.a.g, json.c, json.d FROM test;
```

```text title="Ответ (Чтение путей JSON как под-колонок)"
┌─json.a.b─┬─json.a.g─┬─json.c──┬─json.d─────┐
│       42 │ 42.42    │ [1,2,3] │ 2020-01-01 │
│        0 │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ    │ 2020-01-02 │
│       43 │ 43.43    │ [4,5,6] │ ᴺᵁᴸᴸ       │
└──────────┴──────────┴─────────┴────────────┘
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

Давайте проверим типы данных возвращаемых под-колонок:

```sql title="Запрос"
SELECT toTypeName(json.a.b), toTypeName(json.a.g), toTypeName(json.c), toTypeName(json.d) FROM test;
```

```text title="Ответ"
┌─toTypeName(json.a.b)─┬─toTypeName(json.a.g)─┬─toTypeName(json.c)─┬─toTypeName(json.d)─┐
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
│ UInt32               │ Dynamic              │ Dynamic            │ Dynamic            │
└──────────────────────┴──────────────────────┴────────────────────┴────────────────────┘
```

Как мы видим, для `a.b` тип `UInt32`, как мы указали его в декларации типа JSON, и для всех других под-колонок тип `Dynamic`.

Также возможно читать под-колонки типа `Dynamic`, используя специальный синтаксис `json.some.path.:TypeName`:

```sql title="Запрос"
SELECT
    json.a.g.:Float64,
    dynamicType(json.a.g),
    json.d.:Date,
    dynamicType(json.d)
FROM test
```

```text title="Ответ"
┌─json.a.g.:`Float64`─┬─dynamicType(json.a.g)─┬─json.d.:`Date`─┬─dynamicType(json.d)─┐
│               42.42 │ Float64               │     2020-01-01 │ Date                │
│                ᴺᵁᴸᴸ │ None                  │     2020-01-02 │ Date                │
│               43.43 │ Float64               │           ᴺᵁᴸᴸ │ None                │
└─────────────────────┴───────────────────────┴────────────────┴─────────────────────┘
```

Под-колонки типа `Dynamic` могут быть преобразованы в любой тип данных. В этом случае будет выдано исключение, если внутренний тип внутри `Dynamic` не может быть преобразован в запрашиваемый тип:

```sql title="Запрос"
SELECT json.a.g::UInt64 AS uint 
FROM test;
```

```text title="Ответ"
┌─uint─┐
│   42 │
│    0 │
│   43 │
└──────┘
```

```sql title="Запрос"
SELECT json.a.g::UUID AS float 
FROM test;
```

```text title="Ответ"
Получено исключение от сервера: 
Код: 48. DB::Exception: Получено от localhost:9000. DB::Exception: 
Преобразование между числовыми типами и UUID не поддерживается. 
Вероятно, переданный UUID не заключен в кавычки: 
выполняя 'FUNCTION CAST(__table1.json.a.g :: 2, 'UUID'_String :: 1) -> CAST(__table1.json.a.g, 'UUID'_String) UUID : 0'. 
(NOT_IMPLEMENTED)
```
## Чтение под-объектов JSON как под-колонок {#reading-json-sub-objects-as-sub-columns}

Тип `JSON` поддерживает чтение вложенных объектов как под-колонок с типом `JSON`, используя специальный синтаксис `json.^some.path`:

```sql title="Запрос"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES ('{"a" : {"b" : {"c" : 42, "g" : 42.42}}, "c" : [1, 2, 3], "d" : {"e" : {"f" : {"g" : "Hello, World", "h" : [1, 2, 3]}}}}'), ('{"f" : "Hello, World!", "d" : {"e" : {"f" : {"h" : [4, 5, 6]}}}}'), ('{"a" : {"b" : {"c" : 43, "e" : 10, "g" : 43.43}}, "c" : [4, 5, 6]}');
SELECT json FROM test;
```

```text title="Ответ"
┌─json────────────────────────────────────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":42,"g":42.42}},"c":[1,2,3],"d":{"e":{"f":{"g":"Hello, World","h":[1,2,3]}}}} │
│ {"d":{"e":{"f":{"h":[4,5,6]}}},"f":"Hello, World!"}                                         │
│ {"a":{"b":{"c":43,"e":10,"g":43.43}},"c":[4,5,6]}                                           │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

```sql title="Запрос"
SELECT json.^a.b, json.^d.e.f FROM test;
```

```text title="Ответ"
┌─json.^`a`.b───────────────┬─json.^`d`.e.f────────────────────┐
│ {"c":42,"g":42.42}        │ {"g":"Hello, World","h":[1,2,3]} │
│ {}                        │ {"h":[4,5,6]}                    │
│ {"c":43,"e":10,"g":43.43} │ {}                               │
└───────────────────────────┴──────────────────────────────────┘
```

:::note
Чтение под-объектов как под-колонок может быть неэффективным, так как это может потребовать почти полного сканирования данных JSON.
:::
## Выведение типов для путей {#type-inference-for-paths}

Во время парсинга `JSON` ClickHouse пытается определить наиболее подходящий тип данных для каждого пути JSON. Это происходит аналогично [автоматическому выведению схемы из входных данных](/interfaces/schema-inference.md) и контролируется теми же настройками:

- [input_format_try_infer_integers](/operations/settings/formats#input_format_try_infer_integers)
- [input_format_try_infer_dates](/operations/settings/formats#input_format_try_infer_dates)
- [input_format_try_infer_datetimes](/operations/settings/formats#input_format_try_infer_datetimes)
- [schema_inference_make_columns_nullable](/operations/settings/formats#schema_inference_make_columns_nullable)
- [input_format_json_try_infer_numbers_from_strings](/operations/settings/formats#input_format_json_try_infer_numbers_from_strings)
- [input_format_json_infer_incomplete_types_as_strings](/operations/settings/formats#input_format_json_infer_incomplete_types_as_strings)
- [input_format_json_read_numbers_as_strings](/operations/settings/formats#input_format_json_read_numbers_as_strings)
- [input_format_json_read_bools_as_strings](/operations/settings/formats#input_format_json_read_bools_as_strings)
- [input_format_json_read_bools_as_numbers](/operations/settings/formats#input_format_json_read_bools_as_numbers)
- [input_format_json_read_arrays_as_strings](/operations/settings/formats#input_format_json_read_arrays_as_strings)

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
## Обработка массивов объектов JSON {#handling-arrays-of-json-objects}

Пути JSON, содержащие массив объектов, разбираются как тип `Array(JSON)` и вставляются в колонку `Dynamic` для пути. Чтобы прочитать массив объектов, вы можете извлечь его из колонки `Dynamic` как под-колонку:

```sql title="Запрос"
CREATE TABLE test (json JSON) ENGINE = Memory;
INSERT INTO test VALUES
('{"a" : {"b" : [{"c" : 42, "d" : "Hello", "f" : [[{"g" : 42.42}]], "k" : {"j" : 1000}}, {"c" : 43}, {"e" : [1, 2, 3], "d" : "My", "f" : [[{"g" : 43.43, "h" : "2020-01-01"}]], "k" : {"j" : 2000}}]}}'),
('{"a" : {"b" : [1, 2, 3]}}'),
('{"a" : {"b" : [{"c" : 44, "f" : [[{"h" : "2020-01-02"}]]}, {"e" : [4, 5, 6], "d" : "World", "f" : [[{"g" : 44.44}]], "k" : {"j" : 3000}}]}}');
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
│ ['{"c":"42","d":"Hello","f":[[{"g":42.42}]],"k":{"j":"1000"}}','{"c":"43"}','{"d":"My","e":["1","2","3"],"f":[[{"g":43.43}]],"k":{"j":"2000"}}'] │ Array(JSON(max_dynamic_types=16, max_dynamic_paths=256)) │
│ [1,2,3]                                                                                                                                                           │ Array(Nullable(Int64))                                   │
│ ['{"c":"44","f":[[{"h":"2020-01-02"}]]}','{"d":"World","e":["4","5","6"],"f":[[{"g":44.44}]],"k":{"j":"3000"}}']                                                  │ Array(JSON(max_dynamic_types=16, max_dynamic_paths=256)) │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

Как вы могли заметить, параметры `max_dynamic_types` / `max_dynamic_paths` для вложенного типа `JSON` уменьшены по сравнению с значениями по умолчанию. Это необходимо, чтобы избежать неконтролируемого увеличения числа под-колонок на вложенных массивах объектов JSON.

Давайте попробуем считать под-колонки из колонки `JSON` вложенного типа:

```sql title="Запрос"
SELECT json.a.b.:`Array(JSON)`.c, json.a.b.:`Array(JSON)`.f, json.a.b.:`Array(JSON)`.d FROM test; 
```

```text title="Ответ"
┌─json.a.b.:`Array(JSON)`.c─┬─json.a.b.:`Array(JSON)`.f───────────────────────────────────┬─json.a.b.:`Array(JSON)`.d─┐
│ [42,43,NULL]              │ [[['{"g":42.42}']],NULL,[['{"g":43.43,"h":"2020-01-01"}']]] │ ['Hello',NULL,'My']       │
│ []                        │ []                                                          │ []                        │
│ [44,NULL]                 │ [[['{"h":"2020-01-02"}']],[['{"g":44.44}']]]                │ [NULL,'World']            │
└───────────────────────────┴─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

Мы также можем избегать написания названий под-колонок `Array(JSON)`, используя специальный синтаксис:

```sql title="Запрос"
SELECT json.a.b[].c, json.a.b[].f, json.a.b[].d FROM test;
```

```text title="Ответ"
┌─json.a.b.:`Array(JSON)`.c─┬─json.a.b.:`Array(JSON)`.f───────────────────────────────────┬─json.a.b.:`Array(JSON)`.d─┐
│ [42,43,NULL]              │ [[['{"g":42.42}']],NULL,[['{"g":43.43,"h":"2020-01-01"}']]] │ ['Hello',NULL,'My']       │
│ []                        │ []                                                          │ []                        │
│ [44,NULL]                 │ [[['{"h":"2020-01-02"}']],[['{"g":44.44}']]]                │ [NULL,'World']            │
└───────────────────────────┴─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

Количество `[]` после пути указывает на уровень массива. Например, `json.path[][]` будет преобразовано в `json.path.:Array(Array(JSON))`

Давайте проверим пути и типы внутри нашего `Array(JSON)`:

```sql title="Запрос"
SELECT DISTINCT arrayJoin(JSONAllPathsWithTypes(arrayJoin(json.a.b[]))) FROM test;
```

```text title="Ответ"
┌─arrayJoin(JSONAllPathsWithTypes(arrayJoin(json.a.b.:`Array(JSON)`)))──┐
│ ('c','Int64')                                                         │
│ ('d','String')                                                        │
│ ('f','Array(Array(JSON(max_dynamic_types=8, max_dynamic_paths=64)))') │
│ ('k.j','Int64')                                                       │
│ ('e','Array(Nullable(Int64))')                                        │
└──────────────────────────────────────────────────────────────────────┘
```

Теперь давайте прочитаем под-колонки из колонки типа `Array(JSON)`:

```sql title="Запрос"
SELECT json.a.b[].c.:Int64, json.a.b[].f[][].g.:Float64, json.a.b[].f[][].h.:Date FROM test;
```

```text title="Ответ"
┌─json.a.b.:`Array(JSON)`.c.:`Int64`─┬─json.a.b.:`Array(JSON)`.f.:`Array(Array(JSON))`.g.:`Float64`─┬─json.a.b.:`Array(JSON)`.f.:`Array(Array(JSON))`.h.:`Date`─┐
│ [42,43,NULL]                       │ [[[42.42]],[],[[43.43]]]                                     │ [[[NULL]],[],[['2020-01-01']]]                            │
│ []                                 │ []                                                           │ []                                                        │
│ [44,NULL]                          │ [[[NULL]],[[44.44]]]                                         │ [[['2020-01-02']],[[NULL]]]                               │
└────────────────────────────────────┴──────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
```

Мы также можем читать под-объектные под-колонки из колонки типа `JSON`:

```sql title="Запрос"
SELECT json.a.b[].^k FROM test
```

```text title="Ответ"
┌─json.a.b.:`Array(JSON)`.^`k`─────────┐
│ ['{"j":"1000"}','{}','{"j":"2000"}'] │
│ []                                   │
│ ['{}','{"j":"3000"}']                │
└──────────────────────────────────────┘
```
## Чтение типа JSON из данных {#reading-json-type-from-data}

Все текстовые форматы 
([`JSONEachRow`](../../interfaces/formats/JSON/JSONEachRow.md), 
[`TSV`](../../interfaces/formats/TabSeparated/TabSeparated.md), 
[`CSV`](../../interfaces/formats/CSV/CSV.md), 
[`CustomSeparated`](../../interfaces/formats/CustomSeparated/CustomSeparated.md), 
[`Values`](../../interfaces/formats/Values.md) и т. д.) поддерживают чтение типа `JSON`.

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

```text title="Ответ"
┌─json──────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":1}},"c":"42","d":{"i":["1","2","3"]}}          │
│ {"a":{"b":{"c":2}},"d":{"i":["4","5","6"]}}                   │
│ {"a":{"b":{"c":3}},"e":"Hello, World!"}                       │
│ {"a":{"b":{"c":4}},"c":"43"}                                  │
│ {"a":{"b":{"c":5}},"d":{"h":"2020-02-02 10:00:00.000000000"}} │
└───────────────────────────────────────────────────────────────┘
```

Для текстовых форматов, таких как `CSV`/`TSV` и т. д., JSON анализируется из строки, содержащей объект JSON:

```sql title="Запрос"
SELECT json FROM format(TSV, 'json JSON(a.b.c UInt32, SKIP a.b.d, SKIP REGEXP \'b.*\')',
'{"a" : {"b" : {"c" : 1, "d" : [0, 1]}}, "b" : "2020-01-01", "c" : 42, "d" : {"e" : {"f" : ["s1", "s2"]}, "i" : [1, 2, 3]}}
{"a" : {"b" : {"c" : 2, "d" : [2, 3]}}, "b" : [1, 2, 3], "c" : null, "d" : {"e" : {"g" : 43}, "i" : [4, 5, 6]}}
{"a" : {"b" : {"c" : 3, "d" : [4, 5]}}, "b" : {"c" : 10}, "e" : "Hello, World!"}
{"a" : {"b" : {"c" : 4, "d" : [6, 7]}}, "c" : 43}
{"a" : {"b" : {"c" : 5, "d" : [8, 9]}}, "b" : {"c" : 11, "j" : [1, 2, 3]}, "d" : {"e" : {"f" : ["s3", "s4"], "g" : 44}, "h" : "2020-02-02 10:00:00"}}')
```

```text title="Ответ"
┌─json──────────────────────────────────────────────────────────┐
│ {"a":{"b":{"c":1}},"c":"42","d":{"i":["1","2","3"]}}          │
│ {"a":{"b":{"c":2}},"d":{"i":["4","5","6"]}}                   │
│ {"a":{"b":{"c":3}},"e":"Hello, World!"}                       │
│ {"a":{"b":{"c":4}},"c":"43"}                                  │
│ {"a":{"b":{"c":5}},"d":{"h":"2020-02-02 10:00:00.000000000"}} │
└───────────────────────────────────────────────────────────────┘
```
## Достижение предела динамических путей внутри JSON {#reaching-the-limit-of-dynamic-paths-inside-json}

Тип данных `JSON` может хранить только ограниченное количество путей в виде отдельных под-колонок внутри. Значение по умолчанию этого лимита равно `1024`, но вы можете изменить его в декларации типа с помощью параметра `max_dynamic_paths`.

Когда лимит будет достигнут, все новые пути, вставленные в колонку `JSON`, будут храниться в одной общей структуре данных. 
Чтение таких путей как под-колонок по-прежнему будет возможным, но это потребует чтения всей общей структуры данных для извлечения значений этого пути. 
Этот лимит нужен для предотвращения появления огромного числа различных под-колонок, что может сделать таблицу непригодной для использования.

Давайте посмотрим, что произойдет, когда лимит будет достигнут в нескольких различных сценариях.
### Достижение предела во время парсинга данных {#reaching-the-limit-during-data-parsing}

Во время парсинга объектов `JSON` из данных, когда лимит достигнут для текущего блока данных, все новые пути будут храниться в общей структуре данных. Мы можем использовать следующие две функции интуиции: `JSONDynamicPaths`, `JSONSharedDataPaths`:

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

Как мы видим, после вставки путей `e` и `f.g` лимит был достигнут, и они были вставлены в общую структуру данных.
```yaml
title: 'Во время слияний частей данных в движках таблиц MergeTree'
sidebar_label: 'Во время слияний частей данных в движках таблиц MergeTree'
keywords: ['ClickHouse', 'JSON', 'MergeTree', 'слияния']
description: 'Раздел о слиянии частей данных в таблицах MergeTree и их особенностях при работе с колонками JSON.'
```

### Во время слияний частей данных в движках таблиц MergeTree {#during-merges-of-data-parts-in-mergetree-table-engines}

Во время слияния нескольких частей данных в таблице `MergeTree` колонка `JSON` в результирующей части данных может достичь предела динамических путей и не сможет хранить все пути из исходных частей в виде подколонок. В этом случае ClickHouse выбирает, какие пути останутся в качестве подколонок после слияния, а какие пути будут сохранены в общей структуре данных. В большинстве случаев ClickHouse пытается сохранить пути, содержащие наибольшее количество ненулевых значений, и перемещает наименее встречающиеся пути в общую структуру данных. Однако это зависит от реализации.

Давайте рассмотрим пример такого слияния. Сначала создадим таблицу с колонкой `JSON`, установим предел динамических путей равным `3`, а затем вставим значения с `5` различными путями:

```sql title="Запрос"
CREATE TABLE test (id UInt64, json JSON(max_dynamic_paths=3)) engine=MergeTree ORDER BY id;
SYSTEM STOP MERGES test;
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as a) FROM numbers(5);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as b) FROM numbers(4);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as c) FROM numbers(3);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as d) FROM numbers(2);
INSERT INTO test SELECT number, formatRow('JSONEachRow', number as e) FROM numbers(1);
```

Каждая вставка создаст отдельную часть данных, в которой колонка `JSON` будет содержать один путь:

```sql title="Запрос"
SELECT
    count(),
    groupArrayArrayDistinct(JSONDynamicPaths(json)) AS dynamic_paths,
    groupArrayArrayDistinct(JSONSharedDataPaths(json)) AS shared_data_paths,
    _part
FROM test
GROUP BY _part
ORDER BY _part ASC
```

```text title="Ответ"
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│       5 │ ['a']         │ []                │ all_1_1_0 │
│       4 │ ['b']         │ []                │ all_2_2_0 │
│       3 │ ['c']         │ []                │ all_3_3_0 │
│       2 │ ['d']         │ []                │ all_4_4_0 │
│       1 │ ['e']         │ []                │ all_5_5_0 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

Теперь давайте объединим все части в одну и посмотрим, что произойдет:

```sql title="Запрос"
SELECT
    count(),
    groupArrayArrayDistinct(JSONDynamicPaths(json)) AS dynamic_paths,
    groupArrayArrayDistinct(JSONSharedDataPaths(json)) AS shared_data_paths,
    _part
FROM test
GROUP BY _part
ORDER BY _part ASC
```

```text title="Ответ"
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│      15 │ ['a','b','c'] │ ['d','e']         │ all_1_5_2 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

Как мы видим, ClickHouse сохранил самые частые пути `a`, `b` и `c`, а пути `d` и `e` переместил в общую структуру данных.

## Функции интроспекции {#introspection-functions}

Существует несколько функций, которые могут помочь исследовать содержимое колонки JSON: 
- [`JSONAllPaths`](../functions/json-functions.md#jsonallpaths)
- [`JSONAllPathsWithTypes`](../functions/json-functions.md#jsonallpathswithtypes)
- [`JSONDynamicPaths`](../functions/json-functions.md#jsondynamicpaths)
- [`JSONDynamicPathsWithTypes`](../functions/json-functions.md#jsondynamicpathswithtypes)
- [`JSONSharedDataPaths`](../functions/json-functions.md#jsonshareddatapaths)
- [`JSONSharedDataPathsWithTypes`](../functions/json-functions.md#jsonshareddatapathswithtypes)
- [`distinctDynamicTypes`](../aggregate-functions/reference/distinctdynamictypes.md)
- [`distinctJSONPaths и distinctJSONPathsAndTypes`](../aggregate-functions/reference/distinctjsonpaths.md)

**Примеры**

Давайте исследуем содержимое набора данных [GH Archive](https://www.gharchive.org/) за дату `2020-01-01`:

```sql title="Запрос"
SELECT arrayJoin(distinctJSONPaths(json))
FROM s3('s3://clickhouse-public-datasets/gharchive/original/2020-01-01-*.json.gz', JSONAsObject) 
```

```text title="Ответ"
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

Возможно изменить существующую таблицу и изменить тип колонки на новый тип `JSON`. В данный момент поддерживается только `ALTER` с типа `String`.

**Пример**

```sql title="Запрос"
CREATE TABLE test (json String) ENGINE=MergeTree ORDeR BY tuple();
INSERT INTO test VALUES ('{"a" : 42}'), ('{"a" : 43, "b" : "Hello"}'), ('{"a" : 44, "b" : [1, 2, 3]}'), ('{"c" : "2020-01-01"}');
ALTER TABLE test MODIFY COLUMN json JSON;
SELECT json, json.a, json.b, json.c FROM test;
```

```text title="Ответ"
┌─json─────────────────────────┬─json.a─┬─json.b──┬─json.c─────┐
│ {"a":"42"}                   │ 42     │ ᴺᵁᴸᴸ    │ ᴺᵁᴸᴸ       │
│ {"a":"43","b":"Hello"}       │ 43     │ Hello   │ ᴺᵁᴸᴸ       │
│ {"a":"44","b":[1,2,3]}       │ 44     │ [1,2,3] │ ᴺᵁᴺᴸ       │
│ {"c":"2020-01-01"}           │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ    │ 2020-01-01 │
└──────────────────────────────┴────────┴─────────┴────────────┘
```

## Сравнение значений типа JSON {#comparison-between-values-of-the-json-type}

Значения колонки `JSON` не могут быть сравнены с помощью функций `less/greater`, но могут быть сравнены с помощью функции `equal`.

Два объекта JSON считаются равными, когда у них одинаковый набор путей и каждый из этих путей имеет одинаковый тип и значение в обоих объектах.

Например:

```sql title="Запрос"
CREATE TABLE test (json1 JSON(a UInt32), json2 JSON(a UInt32)) ENGINE=Memory;
INSERT INTO test FORMAT JSONEachRow
{"json1" : {"a" : 42, "b" : 42, "c" : "Hello"}, "json2" : {"a" : 42, "b" : 42, "c" : "Hello"}}
{"json1" : {"a" : 42, "b" : 42, "c" : "Hello"}, "json2" : {"a" : 43, "b" : 42, "c" : "Hello"}}
{"json1" : {"a" : 42, "b" : 42, "c" : "Hello"}, "json2" : {"a" : 43, "b" : 42, "c" : "Hello"}}
{"json1" : {"a" : 42, "b" : 42, "c" : "Hello"}, "json2" : {"a" : 42, "b" : 42, "c" : "World"}}
{"json1" : {"a" : 42, "b" : [1, 2, 3], "c" : "Hello"}, "json2" : {"a" : 42, "b" : 42, "c" : "Hello"}}
{"json1" : {"a" : 42, "b" : 42.0, "c" : "Hello"}, "json2" : {"a" : 42, "b" : 42, "c" : "Hello"}}
{"json1" : {"a" : 42, "b" : "42", "c" : "Hello"}, "json2" : {"a" : 42, "b" : 42, "c" : "Hello"}};

SELECT json1, json2, json1 == json2 FROM test;
```

```text title="Ответ"
┌─json1──────────────────────────────────┬─json2─────────────────────────┬─equals(json1, json2)─┐
│ {"a":42,"b":"42","c":"Hello"}          │ {"a":42,"b":"42","c":"Hello"} │                    1 │
│ {"a":42,"b":"42","c":"Hello"}          │ {"a":43,"b":"42","c":"Hello"} │                    0 │
│ {"a":42,"b":"42","c":"Hello"}          │ {"a":43,"b":"42","c":"Hello"} │                    0 │
│ {"a":42,"b":"42","c":"Hello"}          │ {"a":42,"b":"42","c":"World"} │                    0 │
│ {"a":42,"b":["1","2","3"],"c":"Hello"} │ {"a":42,"b":"42","c":"Hello"} │                    0 │
│ {"a":42,"b":42,"c":"Hello"}            │ {"a":42,"b":"42","c":"Hello"} │                    0 │
│ {"a":42,"b":"42","c":"Hello"}          │ {"a":42,"b":"42","c":"Hello"} │                    0 │
└────────────────────────────────────────┴───────────────────────────────┴──────────────────────┘
```

## Советы для более эффективного использования типа JSON {#tips-for-better-usage-of-the-json-type}

Перед созданием колонки `JSON` и загрузкой данных в нее, рассмотрите следующие рекомендации:

- Изучите свои данные и укажите как можно больше подсказок по путям с их типами. Это сделает хранение и чтение намного более эффективным.
- Подумайте о том, какие пути вам понадобятся, а какие никогда не понадобятся. Укажите пути, которые вам не понадобятся, в разделе `SKIP`, а в `SKIP REGEXP`, если необходимо. Это улучшит хранение.
- Не устанавливайте параметр `max_dynamic_paths` на слишком большие значения, так как это может сделать хранение и чтение менее эффективным. Хотя это во многом зависит от системных параметров, таких как память, ЦП и т. д., общее правило состоит в том, чтобы не устанавливать `max_dynamic_paths` > 10 000.

## Дальнейшее чтение {#further-reading}

- [Как мы создали новый мощный тип данных JSON для ClickHouse](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)
- [Челендж на миллиард документов JSON: ClickHouse против MongoDB, Elasticsearch и других](https://clickhouse.com/blog/json-bench-clickhouse-vs-mongodb-elasticsearch-duckdb-postgresql)
