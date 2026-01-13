---
description: 'Документация о типе данных Variant в ClickHouse'
sidebar_label: 'Variant(T1, T2, ...)'
sidebar_position: 40
slug: /sql-reference/data-types/variant
title: 'Variant(T1, T2, ...)'
doc_type: 'reference'
---

# Variant(T1, T2, ...) {#variantt1-t2}

Этот тип представляет собой объединение других типов данных. Тип `Variant(T1, T2, ..., TN)` означает, что каждая строка этого типа
имеет значение либо типа `T1`, либо `T2`, ... либо `TN`, либо не имеет значения (`NULL`).

Порядок вложенных типов не имеет значения: Variant(T1, T2) = Variant(T2, T1).
Вложенными типами могут быть произвольные типы, за исключением типов Nullable(...), LowCardinality(Nullable(...)) и Variant(...).

:::note
Не рекомендуется использовать похожие типы в качестве вариантов (например, разные числовые типы, такие как `Variant(UInt32, Int64)`, или разные типы дат, такие как `Variant(Date, DateTime)`),
поскольку работа со значениями таких типов может приводить к неоднозначности. По умолчанию создание такого типа `Variant` приведёт к исключению, но это поведение можно изменить с помощью настройки `allow_suspicious_variant_types`.
:::

## Создание типа Variant {#creating-variant}

Использование типа `Variant` в определении столбца таблицы:

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT v FROM test;
```

```text
┌─v─────────────┐
│ ᴺᵁᴸᴸ          │
│ 42            │
│ Hello, World! │
│ [1,2,3]       │
└───────────────┘
```

Использование CAST для обычных столбцов:

```sql
SELECT toTypeName(variant) AS type_name, 'Hello, World!'::Variant(UInt64, String, Array(UInt64)) as variant;
```

```text
┌─type_name──────────────────────────────┬─variant───────┐
│ Variant(Array(UInt64), String, UInt64) │ Hello, World! │
└────────────────────────────────────────┴───────────────┘
```

Использование функций `if/multiIf`, когда аргументы не имеют общего типа (для этого должна быть включена настройка `use_variant_as_common_type`):

```sql
SET use_variant_as_common_type = 1;
SELECT if(number % 2, number, range(number)) as variant FROM numbers(5);
```

```text
┌─variant───┐
│ []        │
│ 1         │
│ [0,1]     │
│ 3         │
│ [0,1,2,3] │
└───────────┘
```

```sql
SET use_variant_as_common_type = 1;
SELECT multiIf((number % 4) = 0, 42, (number % 4) = 1, [1, 2, 3], (number % 4) = 2, 'Hello, World!', NULL) AS variant FROM numbers(4);
```

```text
┌─variant───────┐
│ 42            │
│ [1,2,3]       │
│ Hello, World! │
│ ᴺᵁᴸᴸ          │
└───────────────┘
```

Использование функций `array`/`map`, если элементы массива или значения Map не имеют общего типа (для этого должен быть включён настройка `use_variant_as_common_type`):

```sql
SET use_variant_as_common_type = 1;
SELECT array(range(number), number, 'str_' || toString(number)) as array_of_variants FROM numbers(3);
```

```text
┌─array_of_variants─┐
│ [[],0,'str_0']    │
│ [[0],1,'str_1']   │
│ [[0,1],2,'str_2'] │
└───────────────────┘
```

```sql
SET use_variant_as_common_type = 1;
SELECT map('a', range(number), 'b', number, 'c', 'str_' || toString(number)) as map_of_variants FROM numbers(3);
```

```text
┌─map_of_variants───────────────┐
│ {'a':[],'b':0,'c':'str_0'}    │
│ {'a':[0],'b':1,'c':'str_1'}   │
│ {'a':[0,1],'b':2,'c':'str_2'} │
└───────────────────────────────┘
```


## Чтение вложенных типов Variant как подколонок {#reading-variant-nested-types-as-subcolumns}

Тип Variant поддерживает чтение отдельного вложенного типа из столбца Variant, используя имя типа как подколонку.
Таким образом, если у вас есть столбец `variant Variant(T1, T2, T3)`, вы можете прочитать подколонку типа `T2`, используя синтаксис `variant.T2`,
эта подколонка будет иметь тип `Nullable(T2)`, если `T2` может быть обёрнут в `Nullable`, и `T2` в противном случае. Эта подколонка будет
того же размера, что и исходный столбец `Variant`, и будет содержать значения `NULL` (или пустые значения, если `T2` не может быть обёрнут в `Nullable`)
во всех строках, в которых значение в исходном столбце `Variant` не имеет типа `T2`.

Подколонки Variant также могут читаться с помощью функции `variantElement(variant_column, type_name)`.

Примеры:

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT v, v.String, v.UInt64, v.`Array(UInt64)` FROM test;
```

```text
┌─v─────────────┬─v.String──────┬─v.UInt64─┬─v.Array(UInt64)─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ          │     ᴺᵁᴸᴸ │ []              │
│ 42            │ ᴺᵁᴸᴸ          │       42 │ []              │
│ Hello, World! │ Hello, World! │     ᴺᵁᴸᴸ │ []              │
│ [1,2,3]       │ ᴺᵁᴸᴸ          │     ᴺᵁᴸᴸ │ [1,2,3]         │
└───────────────┴───────────────┴──────────┴─────────────────┘
```

```sql
SELECT toTypeName(v.String), toTypeName(v.UInt64), toTypeName(v.`Array(UInt64)`) FROM test LIMIT 1;
```

```text
┌─toTypeName(v.String)─┬─toTypeName(v.UInt64)─┬─toTypeName(v.Array(UInt64))─┐
│ Nullable(String)     │ Nullable(UInt64)     │ Array(UInt64)               │
└──────────────────────┴──────────────────────┴─────────────────────────────┘
```

```sql
SELECT v, variantElement(v, 'String'), variantElement(v, 'UInt64'), variantElement(v, 'Array(UInt64)') FROM test;
```

```text
┌─v─────────────┬─variantElement(v, 'String')─┬─variantElement(v, 'UInt64')─┬─variantElement(v, 'Array(UInt64)')─┐
│ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ                        │                        ᴺᵁᴸᴸ │ []                                 │
│ 42            │ ᴺᵁᴸᴸ                        │                          42 │ []                                 │
│ Hello, World! │ Hello, World!               │                        ᴺᵁᴸᴸ │ []                                 │
│ [1,2,3]       │ ᴺᵁᴸᴸ                        │                        ᴺᵁᴸᴸ │ [1,2,3]                            │
└───────────────┴─────────────────────────────┴─────────────────────────────┴────────────────────────────────────┘
```

Чтобы узнать, какой вариант хранится в каждой строке, можно использовать функцию `variantType(variant_column)`. Она возвращает значение типа `Enum` с именем типа варианта для каждой строки (или `'None'`, если строка имеет значение `NULL`).

Пример:

```sql
CREATE TABLE test (v Variant(UInt64, String, Array(UInt64))) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('Hello, World!'), ([1, 2, 3]);
SELECT variantType(v) FROM test;
```

```text
┌─variantType(v)─┐
│ None           │
│ UInt64         │
│ String         │
│ Array(UInt64)  │
└────────────────┘
```

```sql
SELECT toTypeName(variantType(v)) FROM test LIMIT 1;
```


```text
┌─toTypeName(variantType(v))──────────────────────────────────────────┐
│ Enum8('None' = -1, 'Array(UInt64)' = 0, 'String' = 1, 'UInt64' = 2) │
└─────────────────────────────────────────────────────────────────────┘
```


## Преобразование между столбцом Variant и другими столбцами {#conversion-between-a-variant-column-and-other-columns}

Существует четыре возможных преобразования, которые можно выполнить для столбца типа `Variant`.

### Преобразование столбца String в столбец Variant {#converting-a-string-column-to-a-variant-column}

Преобразование из `String` в `Variant` выполняется путём парсинга значения типа `Variant` из строкового значения:

```sql
SELECT '42'::Variant(String, UInt64) AS variant, variantType(variant) AS variant_type
```

```text
┌─variant─┬─variant_type─┐
│ 42      │ UInt64       │
└─────────┴──────────────┘
```

```sql
SELECT '[1, 2, 3]'::Variant(String, Array(UInt64)) as variant, variantType(variant) as variant_type
```

```text
┌─variant─┬─variant_type──┐
│ [1,2,3] │ Array(UInt64) │
└─────────┴───────────────┘
```

````sql
SELECT CAST(map('key1', '42', 'key2', 'true', 'key3', '2020-01-01'), 'Map(String, Variant(UInt64, Bool, Date))') AS map_of_variants, mapApply((k, v) -> (k, variantType(v)), map_of_variants) AS map_of_variant_types```
````

```text
┌─map_of_variants─────────────────────────────┬─map_of_variant_types──────────────────────────┐
│ {'key1':42,'key2':true,'key3':'2020-01-01'} │ {'key1':'UInt64','key2':'Bool','key3':'Date'} │
└─────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

Чтобы отключить парсинг при преобразовании из `String` в `Variant`, можно выключить настройку `cast_string_to_dynamic_use_inference`:

```sql
SET cast_string_to_variant_use_inference = 0;
SELECT '[1, 2, 3]'::Variant(String, Array(UInt64)) as variant, variantType(variant) as variant_type
```

```text
┌─variant───┬─variant_type─┐
│ [1, 2, 3] │ String       │
└───────────┴──────────────┘
```


### Converting an ordinary column to a Variant column {#converting-an-ordinary-column-to-a-variant-column}

It is possible to convert an ordinary column with type `T` to a `Variant` column containing this type:

```sql
SELECT toTypeName(variant) AS type_name, [1,2,3]::Array(UInt64)::Variant(UInt64, String, Array(UInt64)) as variant, variantType(variant) as variant_name
```

```text
┌─type_name──────────────────────────────┬─variant─┬─variant_name──┐
│ Variant(Array(UInt64), String, UInt64) │ [1,2,3] │ Array(UInt64) │
└────────────────────────────────────────┴─────────┴───────────────┘
```

Примечание: преобразование из типа `String` всегда выполняется посредством парсинга; если вам нужно преобразовать столбец `String` в вариант `String` типа `Variant` без парсинга, можно сделать следующее:

```sql
SELECT '[1, 2, 3]'::Variant(String)::Variant(String, Array(UInt64), UInt64) as variant, variantType(variant) as variant_type
```

```sql
┌─variant───┬─variant_type─┐
│ [1, 2, 3] │ String       │
└───────────┴──────────────┘
```


### Converting a Variant column to an ordinary column {#converting-a-variant-column-to-an-ordinary-column}

It is possible to convert a `Variant` column to an ordinary column. In this case all nested variants will be converted to a destination type:

```sql
CREATE TABLE test (v Variant(UInt64, String)) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('42.42');
SELECT v::Nullable(Float64) FROM test;
```

```text
┌─CAST(v, 'Nullable(Float64)')─┐
│                         ᴺᵁᴸᴸ │
│                           42 │
│                        42.42 │
└──────────────────────────────┘
```


### Преобразование одного Variant в другой Variant {#converting-a-variant-to-another-variant}

It is possible to convert a `Variant` column to another `Variant` column, but only if the destination `Variant` column contains all nested types from the original `Variant`:

```sql
CREATE TABLE test (v Variant(UInt64, String)) ENGINE = Memory;
INSERT INTO test VALUES (NULL), (42), ('String');
SELECT v::Variant(UInt64, String, Array(UInt64)) FROM test;
```

```text
┌─CAST(v, 'Variant(UInt64, String, Array(UInt64))')─┐
│ ᴺᵁᴸᴸ                                              │
│ 42                                                │
│ String                                            │
└───────────────────────────────────────────────────┘
```


## Reading Variant type from the data {#reading-variant-type-from-the-data}

All text formats (TSV, CSV, CustomSeparated, Values, JSONEachRow, etc) supports reading `Variant` type. During data parsing ClickHouse tries to insert value into most appropriate variant type.

Example:

```sql
SELECT
    v,
    variantElement(v, 'String') AS str,
    variantElement(v, 'UInt64') AS num,
    variantElement(v, 'Float64') AS float,
    variantElement(v, 'DateTime') AS date,
    variantElement(v, 'Array(UInt64)') AS arr
FROM format(JSONEachRow, 'v Variant(String, UInt64, Float64, DateTime, Array(UInt64))', $$
{"v" : "Hello, World!"},
{"v" : 42},
{"v" : 42.42},
{"v" : "2020-01-01 00:00:00"},
{"v" : [1, 2, 3]}
$$)
```

```text
┌─v───────────────────┬─str───────────┬──num─┬─float─┬────────────────date─┬─arr─────┐
│ Hello, World!       │ Hello, World! │ ᴺᵁᴸᴸ │  ᴺᵁᴸᴸ │                ᴺᵁᴸᴸ │ []      │
│ 42                  │ ᴺᵁᴸᴸ          │   42 │  ᴺᵁᴸᴸ │                ᴺᵁᴸᴸ │ []      │
│ 42.42               │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ │ 42.42 │                ᴺᵁᴸᴸ │ []      │
│ 2020-01-01 00:00:00 │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ │  ᴺᵁᴸᴸ │ 2020-01-01 00:00:00 │ []      │
│ [1,2,3]             │ ᴺᵁᴸᴸ          │ ᴺᵁᴸᴸ │  ᴺᵁᴸᴸ │                ᴺᵁᴸᴸ │ [1,2,3] │
└─────────────────────┴───────────────┴──────┴───────┴─────────────────────┴─────────┘
```


## Comparing values of Variant type {#comparing-values-of-variant-data}

Values of a `Variant` type can be compared only with values with the same `Variant` type.

По умолчанию операторы сравнения используют [реализацию сравнения Variant по умолчанию](#functions-with-variant-arguments),
применяя сравнение к каждому варианту типа по отдельности. Это можно отключить, установив настройку `use_variant_default_implementation_for_comparisons = 0`,
чтобы использовать нативные правила сравнения Variant, описанные ниже. **Обратите внимание**, что `ORDER BY` всегда использует нативное сравнение.

**Нативные правила сравнения Variant:**

The result of operator `<` for values `v1` with underlying type `T1` and `v2` with underlying type `T2`  of a type `Variant(..., T1, ... T2, ...)` is defined as follows:

* If `T1 = T2 = T`, the result will be `v1.T < v2.T` (underlying values will be compared).
* If `T1 != T2`, the result will be `T1 < T2` (type names will be compared).

Examples:

```sql
SET allow_suspicious_types_in_order_by = 1;
CREATE TABLE test (v1 Variant(String, UInt64, Array(UInt32)), v2 Variant(String, UInt64, Array(UInt32))) ENGINE=Memory;
INSERT INTO test VALUES (42, 42), (42, 43), (42, 'abc'), (42, [1, 2, 3]), (42, []), (42, NULL);
```

```sql
SELECT v2, variantType(v2) AS v2_type FROM test ORDER BY v2;
```

```text
┌─v2──────┬─v2_type───────┐
│ []      │ Array(UInt32) │
│ [1,2,3] │ Array(UInt32) │
│ abc     │ String        │
│ 42      │ UInt64        │
│ 43      │ UInt64        │
│ ᴺᵁᴸᴸ    │ None          │
└─────────┴───────────────┘
```

```sql
SELECT v1, variantType(v1) AS v1_type, v2, variantType(v2) AS v2_type, v1 = v2, v1 < v2, v1 > v2 FROM test;
```

```text
┌─v1─┬─v1_type─┬─v2──────┬─v2_type───────┬─equals(v1, v2)─┬─less(v1, v2)─┬─greater(v1, v2)─┐
│ 42 │ UInt64  │ 42      │ UInt64        │              1 │            0 │               0 │
│ 42 │ UInt64  │ 43      │ UInt64        │              0 │            1 │               0 │
│ 42 │ UInt64  │ abc     │ String        │              0 │            0 │               1 │
│ 42 │ UInt64  │ [1,2,3] │ Array(UInt32) │              0 │            0 │               1 │
│ 42 │ UInt64  │ []      │ Array(UInt32) │              0 │            0 │               1 │
│ 42 │ UInt64  │ ᴺᵁᴸᴸ    │ None          │              0 │            1 │               0 │
└────┴─────────┴─────────┴───────────────┴────────────────┴──────────────┴─────────────────┘

```

Если вам нужно найти строку с определённым значением `Variant`, вы можете сделать одно из следующего:

* Привести значение к соответствующему типу `Variant`:

```sql
SELECT * FROM test WHERE v2 == [1,2,3]::Array(UInt32)::Variant(String, UInt64, Array(UInt32));
```

```text
┌─v1─┬─v2──────┐
│ 42 │ [1,2,3] │
└────┴─────────┘
```

* Сравнить подстолбец `Variant` с требуемым типом:

```sql
SELECT * FROM test WHERE v2.`Array(UInt32)` == [1,2,3] -- or using variantElement(v2, 'Array(UInt32)')
```

```text
┌─v1─┬─v2──────┐
│ 42 │ [1,2,3] │
└────┴─────────┘
```


Иногда может быть полезно дополнительно проверить тип варианта, так как подстолбцы со сложными типами, такими как `Array/Map/Tuple`, не могут находиться внутри `Nullable` и будут иметь значения по умолчанию вместо `NULL` в строках с другими типами:

```sql
SELECT v2, v2.`Array(UInt32)`, variantType(v2) FROM test WHERE v2.`Array(UInt32)` == [];
```

```text
┌─v2───┬─v2.Array(UInt32)─┬─variantType(v2)─┐
│ 42   │ []               │ UInt64          │
│ 43   │ []               │ UInt64          │
│ abc  │ []               │ String          │
│ []   │ []               │ Array(UInt32)   │
│ ᴺᵁᴸᴸ │ []               │ None            │
└──────┴──────────────────┴─────────────────┘
```

```sql
SELECT v2, v2.`Array(UInt32)`, variantType(v2) FROM test WHERE variantType(v2) == 'Array(UInt32)' AND v2.`Array(UInt32)` == [];
```

```text
┌─v2─┬─v2.Array(UInt32)─┬─variantType(v2)─┐
│ [] │ []               │ Array(UInt32)   │
└────┴──────────────────┴─────────────────┘
```

**Note:** values of variants with different numeric types are considered as different variants and not compared between each other, their type names are compared instead.

Example:

```sql
SET allow_suspicious_variant_types = 1;
CREATE TABLE test (v Variant(UInt32, Int64)) ENGINE=Memory;
INSERT INTO test VALUES (1::UInt32), (1::Int64), (100::UInt32), (100::Int64);
SELECT v, variantType(v) FROM test ORDER by v;
```

```text
┌─v───┬─variantType(v)─┐
│ 1   │ Int64          │
│ 100 │ Int64          │
│ 1   │ UInt32         │
│ 100 │ UInt32         │
└─────┴────────────────┘
```

**Note** by default `Variant` type is not allowed in `GROUP BY`/`ORDER BY` keys, if you want to use it consider its special comparison rule and enable `allow_suspicious_types_in_group_by`/`allow_suspicious_types_in_order_by` settings.


## JSONExtract functions with Variant {#jsonextract-functions-with-variant}

All `JSONExtract*` functions support `Variant` type:

```sql
SELECT JSONExtract('{"a" : [1, 2, 3]}', 'a', 'Variant(UInt32, String, Array(UInt32))') AS variant, variantType(variant) AS variant_type;
```

```text
┌─variant─┬─variant_type──┐
│ [1,2,3] │ Array(UInt32) │
└─────────┴───────────────┘
```

```sql
SELECT JSONExtract('{"obj" : {"a" : 42, "b" : "Hello", "c" : [1,2,3]}}', 'obj', 'Map(String, Variant(UInt32, String, Array(UInt32)))') AS map_of_variants, mapApply((k, v) -> (k, variantType(v)), map_of_variants) AS map_of_variant_types
```

```text
┌─map_of_variants──────────────────┬─map_of_variant_types────────────────────────────┐
│ {'a':42,'b':'Hello','c':[1,2,3]} │ {'a':'UInt32','b':'String','c':'Array(UInt32)'} │
└──────────────────────────────────┴─────────────────────────────────────────────────┘
```

```sql
SELECT JSONExtractKeysAndValues('{"a" : 42, "b" : "Hello", "c" : [1,2,3]}', 'Variant(UInt32, String, Array(UInt32))') AS variants, arrayMap(x -> (x.1, variantType(x.2)), variants) AS variant_types
```

```text
┌─variants───────────────────────────────┬─variant_types─────────────────────────────────────────┐
│ [('a',42),('b','Hello'),('c',[1,2,3])] │ [('a','UInt32'),('b','String'),('c','Array(UInt32)')] │
└────────────────────────────────────────┴───────────────────────────────────────────────────────┘
```


## Функции с аргументами типа Variant {#functions-with-variant-arguments}

Большинство функций в ClickHouse автоматически поддерживают аргументы типа `Variant` благодаря **реализации по умолчанию для Variant**.
Начиная с версии `26.1`, когда функция, которая явно не обрабатывает типы Variant, получает столбец типа Variant, ClickHouse:

1. Извлекает из столбца Variant каждый вариант типа
2. Выполняет функцию отдельно для каждого варианта типа
3. Объединяет результаты соответствующим образом в зависимости от типов результата

Это позволяет использовать обычные функции со столбцами типа Variant без специальной обработки.

**Пример:**

```sql
CREATE TABLE test (v Variant(UInt32, String)) ENGINE = Memory;
INSERT INTO test VALUES (42), ('hello'), (NULL);
SELECT *, toTypeName(v) FROM test WHERE v = 42;
```

```text
   ┌─v──┬─toTypeName(v)───────────┐
1. │ 42 │ Variant(String, UInt32) │
   └────┴─────────────────────────┘
```

Оператор сравнения автоматически применяется к каждому типу внутри Variant отдельно, что позволяет выполнять фильтрацию по столбцам типа Variant.

**Поведение результирующего типа:**

Результирующий тип зависит от того, что функция возвращает для каждого варианта:

* **Разные результирующие типы**: `Variant(T1, T2, ...)`

  ```sql
  CREATE TABLE test2 (v Variant(UInt64, Float64)) ENGINE = Memory;
  INSERT INTO test2 VALUES (42::UInt64), (42.42);
  SELECT v + 1 AS result, toTypeName(result) FROM test2;
  ```

  ```text
  ┌─result─┬─toTypeName(plus(v, 1))──┐
  │     43 │ Variant(Float64, UInt64) │
  │  43.42 │ Variant(Float64, UInt64) │
  └────────┴─────────────────────────┘
  ```

* **Несовместимость типов**: `NULL` для несовместимых вариантов

  ```sql
  CREATE TABLE test3 (v Variant(Array(UInt32), UInt32)) ENGINE = Memory;
  INSERT INTO test3 VALUES ([1,2,3]), (42);
  SELECT v + 10 AS result, toTypeName(result) FROM test3;
  ```

  ```text
  ┌─result─┬─toTypeName(plus(v, 10))─┐
  │   ᴺᵁᴸᴸ │ Nullable(UInt64)        │
  │     52 │ Nullable(UInt64)        │
  └────────┴─────────────────────────┘
  ```

:::note
**Обработка ошибок:** Когда функция не может обработать тип варианта, перехватываются только ошибки, связанные с типами (ILLEGAL&#95;TYPE&#95;OF&#95;ARGUMENT,
TYPE&#95;MISMATCH, CANNOT&#95;CONVERT&#95;TYPE, NO&#95;COMMON&#95;TYPE), и для таких строк результатом становится NULL. Другие ошибки, такие как
деление на ноль или нехватка памяти, пробрасываются обычным образом, чтобы не скрывать реальные проблемы.
:::
