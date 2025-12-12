---
description: 'Документация по функциям Map и Tuple'
sidebar_label: 'Map'
slug: /sql-reference/functions/tuple-map-functions
title: 'Функции Map'
doc_type: 'reference'
---

## map {#map}

Создаёт значение типа [Map(key, value)](../data-types/map.md) из пар ключ–значение.

**Синтаксис**

```sql
map(key1, value1[, key2, value2, ...])
```

**Аргументы**

* `key_n` — ключи элементов `Map`. Любой тип, поддерживаемый как тип ключа для [Map](../data-types/map.md).
* `value_n` — значения элементов `Map`. Любой тип, поддерживаемый как тип значения для [Map](../data-types/map.md).

**Возвращаемое значение**

* Тип `Map`, содержащий пары `key:value`. [Map(key, value)](../data-types/map.md).

**Примеры**

Запрос:

```sql
SELECT map('key1', number, 'key2', number * 2) FROM numbers(3);
```

Результат:

```text
┌─map('key1', number, 'key2', multiply(number, 2))─┐
│ {'key1':0,'key2':0}                              │
│ {'key1':1,'key2':2}                              │
│ {'key1':2,'key2':4}                              │
└──────────────────────────────────────────────────┘
```

## mapFromArrays {#mapfromarrays}

Создает map из массива (или map) ключей и массива (или map) значений.

Функция является удобной альтернативой синтаксису `CAST([...], 'Map(key_type, value_type)')`.
Например, вместо того чтобы писать

* `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')`, или
* `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

можно написать `mapFromArrays(['aa', 'bb'], [4, 5])`.

**Синтаксис**

```sql
mapFromArrays(keys, values)
```

Alias: `MAP_FROM_ARRAYS(keys, values)`

**Аргументы**

* `keys` — массив или map ключей ([Array](../data-types/array.md) или [Map](../data-types/map.md)), из которых формируется результирующий map. Если `keys` — массив, допускаются типы `Array(Nullable(T))` или `Array(LowCardinality(Nullable(T)))` при условии, что он не содержит значения NULL.
* `values` — массив или map значений ([Array](../data-types/array.md) или [Map](../data-types/map.md)), из которых формируется результирующий map.

**Возвращаемое значение**

* Map, в котором ключи и значения сформированы из массива ключей и массива/map значений.

**Пример**

Запрос:

```sql
SELECT mapFromArrays(['a', 'b', 'c'], [1, 2, 3])
```

Результат:

```response
┌─mapFromArrays(['a', 'b', 'c'], [1, 2, 3])─┐
│ {'a':1,'b':2,'c':3}                       │
└───────────────────────────────────────────┘
```

`mapFromArrays` также принимает аргументы типа [Map](../data-types/map.md). Во время выполнения они приводятся к массиву из кортежей.

```sql
SELECT mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))
```

Результат:

```response
┌─mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))─┐
│ {1:('a',1),2:('b',2),3:('c',3)}                       │
└───────────────────────────────────────────────────────┘
```

```sql
SELECT mapFromArrays(map('a', 1, 'b', 2, 'c', 3), [1, 2, 3])
```

Результат:

```response
┌─mapFromArrays(map('a', 1, 'b', 2, 'c', 3), [1, 2, 3])─┐
│ {('a',1):1,('b',2):2,('c',3):3}                       │
└───────────────────────────────────────────────────────┘
```

## extractKeyValuePairs {#extractkeyvaluepairs}

Преобразует строку с парами ключ-значение в [Map(String, String)](../data-types/map.md).
Парсинг устойчив к «шуму» (например, в файлах логов).
Пары ключ-значение во входной строке состоят из ключа, за которым следует разделитель ключ-значение и значение.
Пары ключ-значение разделяются разделителем пар.
Ключи и значения могут быть заключены в кавычки.

**Синтаксис**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character[, unexpected_quoting_character_strategy]]])
```

Псевдонимы:

* `str_to_map`
* `mapFromString`

**Аргументы**

* `data` — строка, из которой извлекаются пары ключ-значение. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
* `key_value_delimiter` — одиночный символ, разделяющий ключи и значения. По умолчанию `:`. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
* `pair_delimiters` — набор символов, разделяющих пары. По умолчанию ` `, `,` и `;`. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
* `quoting_character` — одиночный символ, используемый в качестве кавычки. По умолчанию `"`. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
* `unexpected_quoting_character_strategy` — стратегия обработки кавычек в неожиданных местах на этапах `read_key` и `read_value`. Возможные значения: `invalid`, `accept` и `promote`. `invalid` отбросит ключ/значение и вернётся в состояние `WAITING_KEY`. `accept` будет обрабатывать символ как обычный. `promote` перейдёт в состояние `READ_QUOTED_{KEY/VALUE}` и начнёт обработку со следующего символа.

**Возвращаемые значения**

* Массив пар ключ-значение. Тип: [Map(String, String)](../data-types/map.md)

**Примеры**

Запрос

```sql
SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') AS kv
```

Результат:

```Result:
┌─kv──────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
└─────────────────────────────────────────────────────────────────────────┘
```

With a single quote `'` as quoting character:

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') AS kv
```

Result:

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

unexpected_quoting_character_strategy examples:

unexpected_quoting_character_strategy=invalid

```sql
SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'INVALID') AS kv;
```

```text
┌─kv────────────────┐
│ {'abc':'5'}  │
└───────────────────┘
```

```sql
SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'INVALID') AS kv;
```

```text
┌─kv──┐
│ {}  │
└─────┘
```

unexpected_quoting_character_strategy=accept

```sql
SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'ACCEPT') AS kv;
```

```text
┌─kv────────────────┐
│ {'name"abc':'5'}  │
└───────────────────┘
```

```sql
SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'ACCEPT') AS kv;
```

```text
┌─kv─────────────────┐
│ {'name"abc"':'5'}  │
└────────────────────┘
```

unexpected_quoting_character_strategy=promote

```sql
SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'PROMOTE') AS kv;
```

```text
┌─kv──┐
│ {}  │
└─────┘
```

```sql
SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'PROMOTE') AS kv;
```

```text
┌─kv───────────┐
│ {'abc':'5'}  │
└──────────────┘
```

Escape sequences without escape sequences support:

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

Result:

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

To restore a map string key-value pairs serialized with `toString`:

```sql
SELECT
    map('John', '33', 'Paula', '31') AS m,
    toString(m) AS map_serialized,
    extractKeyValuePairs(map_serialized, ':', ',', '\'') AS map_restored
FORMAT Vertical;
```

Result:

```response
Строка 1:
──────
m:              {'John':'33','Paula':'31'}
map_serialized: {'John':'33','Paula':'31'}
map_restored:   {'John':'33','Paula':'31'}
```

## extractKeyValuePairsWithEscaping {#extractkeyvaluepairswithescaping}

Same as `extractKeyValuePairs` but supports escaping.

Supported escape sequences: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v` and `\0`.
Non standard escape sequences are returned as it is (including the backslash) unless they are one of the following:
`\\`, `'`, `"`, `backtick`, `/`, `=` or ASCII control characters (c &lt;= 31).

This function will satisfy the use case where pre-escaping and post-escaping are not suitable. For instance, consider the following
input string: `a: "aaaa\"bbb"`. The expected output is: `a: aaaa\"bbbb`.
- Pre-escaping: Pre-escaping it will output: `a: "aaaa"bbb"` and `extractKeyValuePairs` will then output: `a: aaaa`
- Post-escaping: `extractKeyValuePairs` will output `a: aaaa\` and post-escaping will keep it as it is.

Leading escape sequences will be skipped in keys and will be considered invalid for values.

**Examples**

Escape sequences with escape sequence support turned on:

```sql
SELECT extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') AS kv
```

Result:

```response
┌─kv────────────────┐
│ {'age':'a\n\n\0'} │
└───────────────────┘
```

## mapAdd {#mapadd}

Collect all the keys and sum corresponding values.

**Syntax**

```sql
mapAdd(arg1, arg2 [, ...])
```

**Arguments**

Arguments are [maps](../data-types/map.md) or [tuples](/sql-reference/data-types/tuple) of two [arrays](/sql-reference/data-types/array), where items in the first array represent keys, and the second array contains values for the each key. All key arrays should have same type, and all value arrays should contain items which are promoted to the one type ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) or [Float64](/sql-reference/data-types/float)). The common promoted type is used as a type for the result array.

**Returned value**

- Depending on the arguments returns one [map](../data-types/map.md) or [tuple](/sql-reference/data-types/tuple), where the first array contains the sorted keys and the second array contains values.

**Example**

Query with `Map` type:

```sql
SELECT mapAdd(map(1,1), map(1,1));
```

Result:

```text
┌─mapAdd(map(1, 1), map(1, 1))─┐
│ {1:2}                        │
└──────────────────────────────┘
```

Query with a tuple:

```sql
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1])) AS res, toTypeName(res) AS type;
```

Result:

```text
┌─res───────────┬─type───────────────────────────────┐
│ ([1,2],[2,2]) │ Tuple(Array(UInt8), Array(UInt64)) │
└───────────────┴────────────────────────────────────┘
```

## mapSubtract {#mapsubtract}

Collect all the keys and subtract corresponding values.

**Syntax**

```sql
mapSubtract(Tuple(Array, Array), Tuple(Array, Array) [, ...])
```

**Arguments**

Arguments are [maps](../data-types/map.md) or [tuples](/sql-reference/data-types/tuple) of two [arrays](/sql-reference/data-types/array), where items in the first array represent keys, and the second array contains values for the each key. All key arrays should have same type, and all value arrays should contain items which are promote to the one type ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) or [Float64](/sql-reference/data-types/float)). The common promoted type is used as a type for the result array.

**Returned value**

- Depending on the arguments returns one [map](../data-types/map.md) or [tuple](/sql-reference/data-types/tuple), where the first array contains the sorted keys and the second array contains values.

**Example**

Query with `Map` type:

```sql
SELECT mapSubtract(map(1,1), map(1,1));
```

Result:

```text
┌─mapSubtract(map(1, 1), map(1, 1))─┐
│ {1:0}                             │
└───────────────────────────────────┘
```

Query with a tuple map:

```sql
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1])) AS res, toTypeName(res) AS type;
```

Result:

```text
┌─res────────────┬─type──────────────────────────────┐
│ ([1,2],[-1,0]) │ Tuple(Array(UInt8), Array(Int64)) │
└────────────────┴───────────────────────────────────┘
```

## mapPopulateSeries {#mappopulateseries}

Fills missing key-value pairs in a map with integer keys.
To support extending the keys beyond the largest value, a maximum key can be specified.
More specifically, the function returns a map in which the the keys form a series from the smallest to the largest key (or `max` argument if it specified) with step size of 1, and corresponding values.
If no value is specified for a key, a default value is used as value.
In case keys repeat, only the first value (in order of appearance) is associated with the key.

**Syntax**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

For array arguments the number of elements in `keys` and `values` must be the same for each row.

**Arguments**

Arguments are [Maps](../data-types/map.md) or two [Arrays](/sql-reference/data-types/array), where the first and second array contains keys and values for the each key.

Mapped arrays:

- `map` — Map with integer keys. [Map](../data-types/map.md).

or

- `keys` — Array of keys. [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges)).
- `values` — Array of values. [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges)).
- `max` — Maximum key value. Optional. [Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges).

**Returned value**

- Depending on the arguments a [Map](../data-types/map.md) or a [Tuple](/sql-reference/data-types/tuple) of two [Arrays](/sql-reference/data-types/array): keys in sorted order, and values the corresponding keys.

**Example**

Query with `Map` type:

```sql
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6);
```

Result:

```text
┌─mapPopulateSeries(map(1, 10, 5, 20), 6)─┐
│ {1:10,2:0,3:0,4:0,5:20,6:0}             │
└─────────────────────────────────────────┘
```

Query with mapped arrays:

```sql
SELECT mapPopulateSeries([1,2,4], [11,22,44], 5) AS res, toTypeName(res) AS type;
```

Result:

```text
┌─res──────────────────────────┬─type──────────────────────────────┐
│ ([1,2,3,4,5],[11,22,0,44,0]) │ Tuple(Array(UInt8), Array(UInt8)) │
└──────────────────────────────┴───────────────────────────────────┘
```

## mapKeys {#mapkeys}

Returns the keys of a given map.

This function can be optimized by enabling setting [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns).
With enabled setting, the function only reads the [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) subcolumn instead the whole map.
The query `SELECT mapKeys(m) FROM table` is transformed to `SELECT m.keys FROM table`.

**Syntax**

```sql
mapKeys(map)
```

**Arguments**

- `map` — Map. [Map](../data-types/map.md).

**Returned value**

- Array containing all keys from the `map`. [Array](../data-types/array.md).

**Example**

Query:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapKeys(a) FROM tab;
```

Result:

```text
┌─mapKeys(a)────────────┐
│ ['name','age']        │
│ ['number','position'] │
└───────────────────────┘
```

## mapContains {#mapcontains}

Returns if a given key is contained in a given map.

**Syntax**

```sql
mapContains(map, key)
```

Alias: `mapContainsKey(map, key)`

**Arguments**

- `map` — Map. [Map](../data-types/map.md).
- `key` — Key. Type must match the key type of `map`.

**Returned value**

- `1` if `map` contains `key`, `0` if not. [UInt8](../data-types/int-uint.md).

**Example**

Query:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapContains(a, 'name') FROM tab;

```

Result:

```text
┌─mapContains(a, 'name')─┐
│                      1 │
│                      0 │
└────────────────────────┘
```

## mapContainsKeyLike {#mapcontainskeylike}

**Syntax**

```sql
mapContainsKeyLike(map, pattern)
```

**Arguments**
- `map` — Map. [Map](../data-types/map.md).
- `pattern`  - String pattern to match.

**Returned value**

- `1` if `map` contains `key` like specified pattern, `0` if not.

**Example**

Query:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsKeyLike(a, 'a%') FROM tab;
```

Result:

```text
┌─mapContainsKeyLike(a, 'a%')─┐
│                           1 │
│                           0 │
└─────────────────────────────┘
```

## mapExtractKeyLike {#mapextractkeylike}

Give a map with string keys and a LIKE pattern, this function returns a map with elements where the key matches the pattern.

**Syntax**

```sql
mapExtractKeyLike(map, pattern)
```

**Arguments**

- `map` — Map. [Map](../data-types/map.md).
- `pattern`  - String pattern to match.

**Returned value**

- A map containing elements the key matching the specified pattern. If no elements match the pattern, an empty map is returned.

**Example**

Query:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractKeyLike(a, 'a%') FROM tab;
```

Result:

```text
┌─mapExtractKeyLike(a, 'a%')─┐
│ {'abc':'abc'}              │
│ {}                         │
└────────────────────────────┘
```

## mapValues {#mapvalues}

Returns the values of a given map.

This function can be optimized by enabling setting [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns).
With enabled setting, the function only reads the [values](/sql-reference/data-types/map#reading-subcolumns-of-map) subcolumn instead the whole map.
The query `SELECT mapValues(m) FROM table` is transformed to `SELECT m.values FROM table`.

**Syntax**

```sql
mapValues(map)
```

**Arguments**

- `map` — Map. [Map](../data-types/map.md).

**Returned value**

- Array containing all the values from `map`. [Array](../data-types/array.md).

**Example**

Query:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapValues(a) FROM tab;
```

Result:

```text
┌─mapValues(a)─────┐
│ ['eleven','11']  │
│ ['twelve','6.0'] │
└──────────────────┘
```

## mapContainsValue {#mapcontainsvalue}

Returns if a given key is contained in a given map.

**Syntax**

```sql
mapContainsValue(map, value)
```

Alias: `mapContainsValue(map, value)`

**Arguments**

- `map` — Map. [Map](../data-types/map.md).
- `value` — Value. Type must match the value type of `map`.

**Returned value**

- `1` if `map` contains `value`, `0` if not. [UInt8](../data-types/int-uint.md).

**Example**

Query:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapContainsValue(a, '11') FROM tab;

```

Result:

```text
┌─mapContainsValue(a, '11')─┐
│                         1 │
│                         0 │
└───────────────────────────┘
```

## mapContainsValueLike {#mapcontainsvaluelike}

**Syntax**

```sql
mapContainsValueLike(map, pattern)
```

**Arguments**
- `map` — Map. [Map](../data-types/map.md).
- `pattern`  - String pattern to match.

**Returned value**

- `1` if `map` contains `value` like specified pattern, `0` if not.

**Example**

Query:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsValueLike(a, 'a%') FROM tab;
```

Result:

```text
┌─mapContainsV⋯ke(a, 'a%')─┐
│                        1 │
│                        0 │
└──────────────────────────┘
```

## mapExtractValueLike {#mapextractvaluelike}

Give a map with string values and a LIKE pattern, this function returns a map with elements where the value matches the pattern.

**Syntax**

```sql
mapExtractValueLike(map, pattern)
```

**Arguments**

- `map` — Map. [Map](../data-types/map.md).
- `pattern`  - String pattern to match.

**Returned value**

- A map containing elements the value matching the specified pattern. If no elements match the pattern, an empty map is returned.

**Example**

Query:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractValueLike(a, 'a%') FROM tab;
```

Result:

```text
┌─mapExtractValueLike(a, 'a%')─┐
│ {'abc':'abc'}                │
│ {}                           │
└──────────────────────────────┘
```

## mapApply {#mapapply}

Applies a function to each element of a map.

**Syntax**

```sql
mapApply(func, map)
```

**Arguments**

- `func` — [Lambda function](/sql-reference/functions/overview#higher-order-functions).
- `map` — [Map](../data-types/map.md).

**Returned value**

- Returns a map obtained from the original map by application of `func(map1[i], ..., mapN[i])` for each element.

**Example**

Query:

```sql
SELECT mapApply((k, v) -> (k, v * 10), _map) AS r
FROM
(
    SELECT map('key1', number, 'key2', number * 2) AS _map
    FROM numbers(3)
)
```

Result:

```text
┌─r─────────────────────┐
│ {'key1':0,'key2':0}   │
│ {'key1':10,'key2':20} │
│ {'key1':20,'key2':40} │
└───────────────────────┘
```

## mapFilter {#mapfilter}

Filters a map by applying a function to each map element.

**Syntax**

```sql
mapFilter(func, map)
```

**Arguments**

- `func`  - [Lambda function](/sql-reference/functions/overview#higher-order-functions).
- `map` — [Map](../data-types/map.md).

**Returned value**

- Returns a map containing only the elements in `map` for which `func(map1[i], ..., mapN[i])` returns something other than 0.

**Example**

Query:

```sql
SELECT mapFilter((k, v) -> ((v % 2) = 0), _map) AS r
FROM
(
    SELECT map('key1', number, 'key2', number * 2) AS _map
    FROM numbers(3)
)
```

Result:

```text
┌─r───────────────────┐
│ {'key1':0,'key2':0} │
│ {'key2':2}          │
│ {'key1':2,'key2':4} │
└─────────────────────┘
```

## mapUpdate {#mapupdate}

**Syntax**

```sql
mapUpdate(map1, map2)
```

**Arguments**

- `map1` [Map](../data-types/map.md).
- `map2` [Map](../data-types/map.md).

**Returned value**

- Returns a map1 with values updated of values for the corresponding keys in map2.

**Example**

Query:

```sql
SELECT mapUpdate(map('key1', 0, 'key3', 0), map('key1', 10, 'key2', 10)) AS map;
```

Result:

```text
┌─map────────────────────────────┐
│ {'key3':0,'key1':10,'key2':10} │
└────────────────────────────────┘
```

## mapConcat {#mapconcat}

Concatenates multiple maps based on the equality of their keys.
If elements with the same key exist in more than one input map, all elements are added to the result map, but only the first one is accessible via operator `[]`

**Syntax**

```sql
mapConcat(maps)
```

**Arguments**

-   `maps` – Arbitrarily many [Maps](../data-types/map.md).

**Returned value**

- Returns a map with concatenated maps passed as arguments.

**Examples**

Query:

```sql
SELECT mapConcat(map('key1', 1, 'key3', 3), map('key2', 2)) AS map;
```

Result:

```text
┌─map──────────────────────────┐
│ {'key1':1,'key3':3,'key2':2} │
└──────────────────────────────┘
```

Query:

```sql
SELECT mapConcat(map('key1', 1, 'key2', 2), map('key1', 3)) AS map, map['key1'];
```

Result:

```text
┌─map──────────────────────────┬─elem─┐
│ {'key1':1,'key2':2,'key1':3} │    1 │
└──────────────────────────────┴──────┘
```

## mapExists(\[func,\], map) {#mapexistsfunc-map}

Returns 1 if at least one key-value pair in `map` exists for which `func(key, value)` returns something other than 0. Otherwise, it returns 0.

:::note
`mapExists` is a [higher-order function](/sql-reference/functions/overview#higher-order-functions).
You can pass a lambda function to it as the first argument.
:::

**Example**

Query:

```sql
SELECT mapExists((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

Result:

```response
┌─res─┐
│   1 │
└─────┘
```

## mapAll(\[func,\] map) {#mapallfunc-map}

Returns 1 if `func(key, value)` returns something other than 0 for all key-value pairs in `map`. Otherwise, it returns 0.

:::note
Note that the `mapAll` is a [higher-order function](/sql-reference/functions/overview#higher-order-functions).
You can pass a lambda function to it as the first argument.
:::

**Example**

Query:

```sql
SELECT mapAll((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

Result:

```response
┌─res─┐
│   0 │
└─────┘
```

## mapSort(\[func,\], map) {#mapsortfunc-map}

Sorts the elements of a map in ascending order.
If the `func` function is specified, the sorting order is determined by the result of the `func` function applied to the keys and values of the map.

**Examples**

```sql
SELECT mapSort(map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

```text
┌─map──────────────────────────┐
│ {'key1':3,'key2':2,'key3':1} │
└──────────────────────────────┘
```

```sql
SELECT mapSort((k, v) -> v, map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

```text
┌─map──────────────────────────┐
│ {'key3':1,'key2':2,'key1':3} │
└──────────────────────────────┘
```

For more details see the [reference](/sql-reference/functions/array-functions#arraySort) for `arraySort` function. 

## mapPartialSort {#mappartialsort}

Sorts the elements of a map in ascending order with additional `limit` argument allowing partial sorting. 
If the `func` function is specified, the sorting order is determined by the result of the `func` function applied to the keys and values of the map.

**Syntax**

```sql
mapPartialSort([func,] limit, map)
```
**Arguments**

- `func` – Optional function to apply to the keys and values of the map. [Lambda function](/sql-reference/functions/overview#higher-order-functions).
- `limit` – Elements in range [1..limit] are sorted. [(U)Int](../data-types/int-uint.md).
- `map` – Map to sort. [Map](../data-types/map.md).

**Returned value**

- Partially sorted map. [Map](../data-types/map.md).

**Example**

```sql
SELECT mapPartialSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k2':1,'k3':2,'k1':3}                                                    │
└───────────────────────────────────────────────────────────────────────────┘
```

## mapReverseSort(\[func,\], map) {#mapreversesortfunc-map}

Sorts the elements of a map in descending order.
If the `func` function is specified, the sorting order is determined by the result of the `func` function applied to the keys and values of the map.

**Examples**

```sql
SELECT mapReverseSort(map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

```text
┌─map──────────────────────────┐
│ {'key3':1,'key2':2,'key1':3} │
└──────────────────────────────┘
```

```sql
SELECT mapReverseSort((k, v) -> v, map('key2', 2, 'key3', 1, 'key1', 3)) AS map;
```

```text
┌─map──────────────────────────┐
│ {'key1':3,'key2':2,'key3':1} │
└──────────────────────────────┘
```

For more details see function [arrayReverseSort](/sql-reference/functions/array-functions#arrayReverseSort).

## mapPartialReverseSort {#mappartialreversesort}

Sorts the elements of a map in descending order with additional `limit` argument allowing partial sorting.
If the `func` function is specified, the sorting order is determined by the result of the `func` function applied to the keys and values of the map.

**Syntax**

```sql
mapPartialReverseSort([func,] limit, map)
```
**Arguments**

- `func` – Optional function to apply to the keys and values of the map. [Lambda function](/sql-reference/functions/overview#higher-order-functions).
- `limit` – Elements in range [1..limit] are sorted. [(U)Int](../data-types/int-uint.md).
- `map` – Map to sort. [Map](../data-types/map.md).

**Returned value**

- Partially sorted map. [Map](../data-types/map.md).

**Example**

```sql
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialReverseSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k1':3,'k3':2,'k2':1}                                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
## extractKeyValuePairs {#extractKeyValuePairs}

Introduced in: v

Extracts key-value pairs from any string. The string does not need to be 100% structured in a key value pair format;

            It can contain noise (e.g. log files). The key-value pair format to be interpreted should be specified via function arguments.

            A key-value pair consists of a key followed by a `key_value_delimiter` and a value. Quoted keys and values are also supported. Key value pairs must be separated by pair delimiters.

            **Syntax**
            ```sql
            extractKeyValuePairs(data, [key_value_delimiter], [pair_delimiter], [quoting_character])
```

            **Arguments**
            - `data` - String to extract key-value pairs from. [String](../../sql-reference/data-types/string.md) or [FixedString](../../sql-reference/data-types/fixedstring.md).
            - `key_value_delimiter` - Character to be used as delimiter between the key and the value. Defaults to `:`. [String](../../sql-reference/data-types/string.md) or [FixedString](../../sql-reference/data-types/fixedstring.md).
            - `pair_delimiters` - Set of character to be used as delimiters between pairs. Defaults to `\space`, `,` and `;`. [String](../../sql-reference/data-types/string.md) or [FixedString](../../sql-reference/data-types/fixedstring.md).
            - `quoting_character` - Character to be used as quoting character. Defaults to `"`. [String](../../sql-reference/data-types/string.md) or [FixedString](../../sql-reference/data-types/fixedstring.md).
            - `unexpected_quoting_character_strategy` - Strategy to handle quoting characters in unexpected places during `read_key` and `read_value` phase. Possible values: `invalid`, `accept` and `promote`. Invalid will discard key/value and transition back to `WAITING_KEY` state. Accept will treat it as a normal character. Promote will transition to `READ_QUOTED_{KEY/VALUE}` state and start from next character. The default value is `INVALID`

            **Returned values**
            - The extracted key-value pairs in a Map(String, String).

            **Examples**

            Query:

            **Simple case**
            ```sql
            arthur :) select extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') as kv

            SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') as kv

            Query id: f9e0ca6f-3178-4ee2-aa2c-a5517abb9cee

            ┌─kv──────────────────────────────────────────────────────────────────────┐
            │ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
            └─────────────────────────────────────────────────────────────────────────┘
```

            **Single quote as quoting character**
            ```sql
            arthur :) select extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') as kv

            SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') as kv

            Идентификатор запроса: 0e22bf6b-9844-414a-99dc-32bf647abd5e

            ┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
            │ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
            └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

            unexpected_quoting_character_strategy examples:

            unexpected_quoting_character_strategy=invalid

            ```sql
            SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'INVALID') as kv;
```

            ```text
            ┌─kv────────────────┐
            │ {'abc':'5'}  │
            └───────────────────┘
```

            ```sql
            SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'INVALID') as kv;
```

            ```text
            ┌─kv──┐
            │ {}  │
            └─────┘
```

            unexpected_quoting_character_strategy=accept

            ```sql
            SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'ACCEPT') as kv;
```

            ```text
            ┌─kv────────────────┐
            │ {'name"abc':'5'}  │
            └───────────────────┘
```

            ```sql
            SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'ACCEPT') as kv;
```

            ```text
            ┌─kv─────────────────┐
            │ {'name"abc"':'5'}  │
            └────────────────────┘
```

            unexpected_quoting_character_strategy=promote

            ```sql
            SELECT extractKeyValuePairs('name"abc:5', ':', ' ,;', '\"', 'PROMOTE') as kv;
```

            ```text
            ┌─kv──┐
            │ {}  │
            └─────┘
```

            ```sql
            SELECT extractKeyValuePairs('name"abc":5', ':', ' ,;', '\"', 'PROMOTE') as kv;
```

            ```text
            ┌─kv───────────┐
            │ {'abc':'5'}  │
            └──────────────┘
```

            **Escape sequences without escape sequences support**
            ```sql
            arthur :) select extractKeyValuePairs('age:a\\x0A\\n\\0') as kv

            SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv

            Query id: e9fd26ee-b41f-4a11-b17f-25af6fd5d356

            ┌─kv────────────────────┐
            │ {'age':'a\\x0A\\n\\0'} │
            └───────────────────────┘
```

**Syntax**

```sql
```

**Aliases**: `str_to_map`, `mapFromString`

**Arguments**

- None.

**Returned value**



**Examples**



## extractKeyValuePairsWithEscaping {#extractKeyValuePairsWithEscaping}

Introduced in: v

Same as `extractKeyValuePairs` but with escaping support.

            Escape sequences supported: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v` and `\0`.
            Non standard escape sequences are returned as it is (including the backslash) unless they are one of the following:
            `\\`, `'`, `"`, `backtick`, `/`, `=` or ASCII control characters (`c <= 31`).

            This function will satisfy the use case where pre-escaping and post-escaping are not suitable. For instance, consider the following
            input string: `a: "aaaa\"bbb"`. The expected output is: `a: aaaa\"bbbb`.
            - Pre-escaping: Pre-escaping it will output: `a: "aaaa"bbb"` and `extractKeyValuePairs` will then output: `a: aaaa`
            - Post-escaping: `extractKeyValuePairs` will output `a: aaaa\` and post-escaping will keep it as it is.

            Leading escape sequences will be skipped in keys and will be considered invalid for values.

            **Escape sequences with escape sequence support turned on**
            ```sql
            arthur :) select extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') as kv

            SELECT extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') AS kv

            Query id: 44c114f0-5658-4c75-ab87-4574de3a1645

            ┌─kv───────────────┐
            │ {'age':'a\n\n\0'} │
            └──────────────────┘
```

**Syntax**

```sql
```

**Arguments**

- None.

**Returned value**



**Examples**



## map {#map}

Introduced in: v21.1


Creates a value of type `Map(key, value)` from key-value pairs.


**Syntax**

```sql
map(key1, value1[, key2, value2, ...])
```

**Arguments**

- `key_n` — The keys of the map entries. [`Any`](/sql-reference/data-types)
- `value_n` — The values of the map entries. [`Any`](/sql-reference/data-types)


**Returned value**

Returns a map containing key:value pairs. [`Map(Any, Any)`](/sql-reference/data-types/map)

**Examples**

**Usage example**

```sql title=Query
SELECT map('key1', number, 'key2', number * 2) FROM numbers(3)
```

```response title=Response
{'key1':0,'key2':0}
{'key1':1,'key2':2}
{'key1':2,'key2':4}
```



## mapAdd {#mapAdd}

Introduced in: v20.7


Collect all the keys and sum corresponding values.


**Syntax**

```sql
mapAdd(arg1[, arg2, ...])
```

**Arguments**

- `arg1[, arg2, ...]` — Maps or tuples of two arrays in which items in the first array represent keys, and the second array contains values for each key. [`Map(K, V)`](/sql-reference/data-types/map) or [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)


**Returned value**

Returns a map or returns a tuple, where the first array contains the sorted keys and the second array contains values. [`Map(K, V)`](/sql-reference/data-types/map) or [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)

**Examples**

**With Map type**

```sql title=Query
SELECT mapAdd(map(1, 1), map(1, 1))
```

```response title=Response
{1:2}
```

**With tuple**

```sql title=Query
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1]))
```

```response title=Response
([1, 2], [2, 2])
```



## mapAll {#mapAll}

Introduced in: v23.4


Tests whether a condition holds for all key-value pairs in a map.
`mapAll` is a higher-order function.
You can pass a lambda function to it as the first argument.


**Syntax**

```sql
mapAll([func,] map)
```

**Arguments**

- `func` — Lambda function. [`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
- `map` — Map to check. [`Map(K, V)`](/sql-reference/data-types/map)


**Returned value**

Returns `1` if all key-value pairs satisfy the condition, `0` otherwise. [`UInt8`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
SELECT mapAll((k, v) -> v = 1, map('k1', 1, 'k2', 2))
```

```response title=Response
0
```



## mapApply {#mapApply}

Introduced in: v22.3


Applies a function to each element of a map.


**Syntax**

```sql
mapApply(func, map)
```

**Arguments**

- `func` — Lambda function. [`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
- `map` — Map to apply function to. [`Map(K, V)`](/sql-reference/data-types/map)


**Returned value**

Returns a new map obtained from the original map by application of `func` for each element. [`Map(K, V)`](/sql-reference/data-types/map)

**Examples**

**Usage example**

```sql title=Query
SELECT mapApply((k, v) -> (k, v * 2), map('k1', 1, 'k2', 2))
```

```response title=Response
{'k1':2,'k2':4}
```



## mapConcat {#mapConcat}

Introduced in: v23.4


Concatenates multiple maps based on the equality of their keys.
If elements with the same key exist in more than one input map, all elements are added to the result map, but only the first one is accessible via operator [].


**Syntax**

```sql
mapConcat(maps)
```

**Arguments**

- `maps` — Arbitrarily many maps. [`Map`](/sql-reference/data-types/map)


**Returned value**

Returns a map with concatenated maps passed as arguments. [`Map`](/sql-reference/data-types/map)

**Examples**

**Usage example**

```sql title=Query
SELECT mapConcat(map('k1', 'v1'), map('k2', 'v2'))
```

```response title=Response
{'k1':'v1','k2':'v2'}
```



## mapContainsKey {#mapContainsKey}

Introduced in: v21.2


Determines if a key is contained in a map.


**Syntax**

```sql
mapContains(map, key)
```

**Aliases**: `mapContains`

**Arguments**

- `map` — Map to search in. [`Map(K, V)`](/sql-reference/data-types/map)
- `key` — Key to search for. Type must match the key type of the map. [`Any`](/sql-reference/data-types)


**Returned value**

Returns 1 if map contains key, 0 if not. [`UInt8`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
SELECT mapContainsKey(map('k1', 'v1', 'k2', 'v2'), 'k1')
```

```response title=Response
1
```



## mapContainsKeyLike {#mapContainsKeyLike}

Introduced in: v23.4


Checks whether map contains key `LIKE` specified pattern.


**Syntax**

```sql
mapContainsKeyLike(map, pattern)
```

**Arguments**

- `map` — Map to search in. [`Map(K, V)`](/sql-reference/data-types/map)
- `pattern` — Pattern to match keys against. [`const String`](/sql-reference/data-types/string)


**Returned value**

Returns `1` if `map` contains a key matching `pattern`, `0` otherwise. [`UInt8`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
CREATE TABLE tab (a Map(String, String))
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsKeyLike(a, 'a%') FROM tab;
```

```response title=Response
┌─mapContainsKeyLike(a, 'a%')─┐
│                           1 │
│                           0 │
└─────────────────────────────┘
```



## mapContainsValue {#mapContainsValue}

Introduced in: v25.6


Determines if a value is contained in a map.


**Syntax**

```sql
mapContainsValue(map, value)
```

**Arguments**

- `map` — Map to search in. [`Map(K, V)`](/sql-reference/data-types/map)
- `value` — Value to search for. Type must match the value type of map. [`Any`](/sql-reference/data-types)


**Returned value**

Returns `1` if the map contains the value, `0` if not. [`UInt8`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
SELECT mapContainsValue(map('k1', 'v1', 'k2', 'v2'), 'v1')
```

```response title=Response
1
```



## mapContainsValueLike {#mapContainsValueLike}

Introduced in: v25.5


Checks whether a map contains a value `LIKE` the specified pattern.


**Syntax**

```sql
mapContainsValueLike(map, pattern)
```

**Arguments**

- `map` — Map to search in. [`Map(K, V)`](/sql-reference/data-types/map)
- `pattern` — Pattern to match values against. [`const String`](/sql-reference/data-types/string)


**Returned value**

Returns `1` if `map` contains a value matching `pattern`, `0` otherwise. [`UInt8`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
CREATE TABLE tab (a Map(String, String))
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsValueLike(a, 'a%') FROM tab;
```

```response title=Response
┌─mapContainsV⋯ke(a, 'a%')─┐
│                        1 │
│                        0 │
└──────────────────────────┘
```



## mapExists {#mapExists}

Introduced in: v23.4


Tests whether a condition holds for at least one key-value pair in a map.
`mapExists` is a higher-order function.
You can pass a lambda function to it as the first argument.


**Syntax**

```sql
mapExists([func,] map)
```

**Arguments**

- `func` — Optional. Lambda function. [`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
- `map` — Map to check. [`Map(K, V)`](/sql-reference/data-types/map)


**Returned value**

Returns `1` if at least one key-value pair satisfies the condition, `0` otherwise. [`UInt8`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
SELECT mapExists((k, v) -> v = 1, map('k1', 1, 'k2', 2))
```

```response title=Response
1
```



## mapExtractKeyLike {#mapExtractKeyLike}

Introduced in: v23.4


Give a map with string keys and a `LIKE` pattern, this function returns a map with elements where the key matches the pattern.


**Syntax**

```sql
mapExtractKeyLike(map, pattern)
```

**Arguments**

- `map` — Map to extract from. [`Map(K, V)`](/sql-reference/data-types/map)
- `pattern` — Pattern to match keys against. [`const String`](/sql-reference/data-types/string)


**Returned value**

Returns a map containing elements the key matching the specified pattern. If no elements match the pattern, an empty map is returned. [`Map(K, V)`](/sql-reference/data-types/map)

**Examples**

**Usage example**

```sql title=Query
CREATE TABLE tab (a Map(String, String))
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractKeyLike(a, 'a%') FROM tab;
```

```response title=Response
┌─mapExtractKeyLike(a, 'a%')─┐
│ {'abc':'abc'}              │
│ {}                         │
└────────────────────────────┘
```



## mapExtractValueLike {#mapExtractValueLike}

Introduced in: v25.5


Given a map with string values and a `LIKE` pattern, this function returns a map with elements where the value matches the pattern.


**Syntax**

```sql
mapExtractValueLike(map, pattern)
```

**Arguments**

- `map` — Map to extract from. [`Map(K, V)`](/sql-reference/data-types/map)
- `pattern` — Pattern to match values against. [`const String`](/sql-reference/data-types/string)


**Returned value**

Returns a map containing elements the value matching the specified pattern. If no elements match the pattern, an empty map is returned. [`Map(K, V)`](/sql-reference/data-types/map)

**Examples**

**Usage example**

```sql title=Query
CREATE TABLE tab (a Map(String, String))
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractValueLike(a, 'a%') FROM tab;
```

```response title=Response
┌─mapExtractValueLike(a, 'a%')─┐
│ {'abc':'abc'}                │
│ {}                           │
└──────────────────────────────┘
```



## mapFilter {#mapFilter}

Introduced in: v22.3


Filters a map by applying a function to each map element.


**Syntax**

```sql
mapFilter(func, map)
```

**Arguments**

- `func` — Lambda function. [`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
- `map` — Map to filter. [`Map(K, V)`](/sql-reference/data-types/map)


**Returned value**

Returns a map containing only the elements in the map for which `func` returns something other than `0`. [`Map(K, V)`](/sql-reference/data-types/map)

**Examples**

**Usage example**

```sql title=Query
SELECT mapFilter((k, v) -> v > 1, map('k1', 1, 'k2', 2))
```

```response title=Response
{'k2':2}
```



## mapFromArrays {#mapFromArrays}

Introduced in: v23.3


Creates a map from an array or map of keys and an array or map of values.
The function is a convenient alternative to syntax `CAST([...], 'Map(key_type, value_type)')`.


**Syntax**

```sql
mapFromArrays(keys, values)
```

**Aliases**: `MAP_FROM_ARRAYS`

**Arguments**

- `keys` — Array or map of keys to create the map from. [`Array`](/sql-reference/data-types/array) or [`Map`](/sql-reference/data-types/map)
- `values` — Array or map of values to create the map from. [`Array`](/sql-reference/data-types/array) or [`Map`](/sql-reference/data-types/map)


**Returned value**

Returns a map with keys and values constructed from the key array and value array/map. [`Map`](/sql-reference/data-types/map)

**Examples**

**Basic usage**

```sql title=Query
SELECT mapFromArrays(['a', 'b', 'c'], [1, 2, 3])
```

```response title=Response
{'a':1,'b':2,'c':3}
```

**With map inputs**

```sql title=Query
SELECT mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))
```

```response title=Response
{1:('a', 1), 2:('b', 2), 3:('c', 3)}
```



## mapKeys {#mapKeys}

Introduced in: v21.2


Returns the keys of a given map.
This function can be optimized by enabling setting [`optimize_functions_to_subcolumns`](/operations/settings/settings#optimize_functions_to_subcolumns).
With the setting enabled, the function only reads the `keys` subcolumn instead of the entire map.
The query `SELECT mapKeys(m) FROM table` is transformed to `SELECT m.keys FROM table`.


**Syntax**

```sql
mapKeys(map)
```

**Arguments**

- `map` — Map to extract keys from. [`Map(K, V)`](/sql-reference/data-types/map)


**Returned value**

Returns array containing all keys from the map. [`Array(T)`](/sql-reference/data-types/array)

**Examples**

**Usage example**

```sql title=Query
SELECT mapKeys(map('k1', 'v1', 'k2', 'v2'))
```

```response title=Response
['k1','k2']
```



## mapPartialReverseSort {#mapPartialReverseSort}

Introduced in: v23.4


Sorts the elements of a map in descending order with additional limit argument allowing partial sorting.
If the func function is specified, the sorting order is determined by the result of the func function applied to the keys and values of the map.


**Syntax**

```sql
mapPartialReverseSort([func,] limit, map)
```

**Arguments**

- `func` — Optional. Lambda function. [`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
- `limit` — Elements in the range `[1..limit]` are sorted. [`(U)Int*`](/sql-reference/data-types/int-uint)
- `map` — Map to sort. [`Map(K, V)`](/sql-reference/data-types/map)


**Returned value**

Returns a partially sorted map in descending order. [`Map(K, V)`](/sql-reference/data-types/map)

**Examples**

**Usage example**

```sql title=Query
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k1':3,'k3':2,'k2':1}
```



## mapPartialSort {#mapPartialSort}

Introduced in: v23.4


Sorts the elements of a map in ascending order with additional limit argument allowing partial sorting.
If the func function is specified, the sorting order is determined by the result of the func function applied to the keys and values of the map.


**Syntax**

```sql
mapPartialSort([func,] limit, map)
```

**Arguments**

- `func` — Optional. Lambda function. [`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
- `limit` — Elements in the range `[1..limit]` are sorted. [`(U)Int*`](/sql-reference/data-types/int-uint)
- `map` — Map to sort. [`Map(K, V)`](/sql-reference/data-types/map)


**Returned value**

Returns a partially sorted map. [`Map(K, V)`](/sql-reference/data-types/map)

**Examples**

**Usage example**

```sql title=Query
SELECT mapPartialSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k2':1,'k3':2,'k1':3}
```



## mapPopulateSeries {#mapPopulateSeries}

Introduced in: v20.10


Fills missing key-value pairs in a map with integer keys.
To support extending the keys beyond the largest value, a maximum key can be specified.
More specifically, the function returns a map in which the keys form a series from the smallest to the largest key (or max argument if specified) with step size of 1, and corresponding values.
If no value is specified for a key, a default value is used as value.
In case keys repeat, only the first value (in order of appearance) is associated with the key.


**Syntax**

```sql
mapPopulateSeries(map[, max]) | mapPopulateSeries(keys, values[, max])
```

**Arguments**

- `map` — Map with integer keys. [`Map((U)Int*, V)`](/sql-reference/data-types/map)
- `keys` — Array of keys. [`Array(T)`](/sql-reference/data-types/array)
- `values` — Array of values. [`Array(T)`](/sql-reference/data-types/array)
- `max` — Optional. Maximum key value. [`Int8`](/sql-reference/data-types/int-uint) or [`Int16`](/sql-reference/data-types/int-uint) or [`Int32`](/sql-reference/data-types/int-uint) or [`Int64`](/sql-reference/data-types/int-uint) or [`Int128`](/sql-reference/data-types/int-uint) or [`Int256`](/sql-reference/data-types/int-uint)


**Returned value**

Returns a map or a tuple of two arrays where the first has keys in sorted order, and the second values for the corresponding keys. [`Map(K, V)`](/sql-reference/data-types/map) or [`Tuple(Array(UInt*), Array(Any))`](/sql-reference/data-types/tuple)

**Examples**

**With Map type**

```sql title=Query
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6)
```

```response title=Response
{1:10, 2:0, 3:0, 4:0, 5:20, 6:0}
```

**With mapped arrays**

```sql title=Query
SELECT mapPopulateSeries([1, 2, 4], [11, 22, 44], 5)
```

```response title=Response
([1, 2, 3, 4, 5], [11, 22, 0, 44, 0])
```



## mapReverseSort {#mapReverseSort}

Introduced in: v23.4


Sorts the elements of a map in descending order.
If the func function is specified, the sorting order is determined by the result of the func function applied to the keys and values of the map.


**Syntax**

```sql
mapReverseSort([func,] map)
```

**Arguments**

- `func` — Optional. Lambda function. [`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
- `map` — Map to sort. [`Map(K, V)`](/sql-reference/data-types/map)


**Returned value**

Returns a map sorted in descending order. [`Map(K, V)`](/sql-reference/data-types/map)

**Examples**

**Usage example**

```sql title=Query
SELECT mapReverseSort((k, v) -> v, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k1':3,'k3':2,'k2':1}
```



## mapSort {#mapSort}

Introduced in: v23.4


Sorts the elements of a map in ascending order.
If the func function is specified, the sorting order is determined by the result of the func function applied to the keys and values of the map.


**Syntax**

```sql
mapSort([func,] map)
```

**Arguments**

- `func` — Optional. Lambda function. [`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
- `map` — Map to sort. [`Map(K, V)`](/sql-reference/data-types/map)


**Returned value**

Returns a map sorted in ascending order. [`Map(K, V)`](/sql-reference/data-types/map)

**Examples**

**Usage example**

```sql title=Query
SELECT mapSort((k, v) -> v, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k2':1,'k3':2,'k1':3}
```



## mapSubtract {#mapSubtract}

Introduced in: v20.7


Collect all the keys and subtract corresponding values.


**Syntax**

```sql
mapSubtract(arg1[, arg2, ...])
```

**Arguments**

- `arg1[, arg2, ...]` — Maps or tuples of two arrays in which items in the first array represent keys, and the second array contains values for each key. [`Map(K, V)`](/sql-reference/data-types/map) or [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)


**Returned value**

Returns one map or tuple, where the first array contains the sorted keys and the second array contains values. [`Map(K, V)`](/sql-reference/data-types/map) or [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)

**Examples**

**With Map type**

```sql title=Query
SELECT mapSubtract(map(1, 1), map(1, 1))
```

```response title=Response
{1:0}
```

**With tuple map**

```sql title=Query
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1]))
```

```response title=Response
([1, 2], [-1, 0])
```



## mapUpdate {#mapUpdate}

Introduced in: v22.3


For two maps, returns the first map with values updated on the values for the corresponding keys in the second map.


**Syntax**

```sql
mapUpdate(map1, map2)
```

**Arguments**

- `map1` — The map to update. [`Map(K, V)`](/sql-reference/data-types/map)
- `map2` — The map to use for updating. [`Map(K, V)`](/sql-reference/data-types/map)


**Returned value**

Returns `map1` with values updated from values for the corresponding keys in `map2`. [`Map(K, V)`](/sql-reference/data-types/map)

**Examples**

**Basic usage**

```sql title=Query
SELECT mapUpdate(map('key1', 0, 'key3', 0), map('key1', 10, 'key2', 10))
```

```response title=Response
{'key3':0,'key1':10,'key2':10}
```



## mapValues {#mapValues}

Introduced in: v21.2


Returns the values of a given map.
This function can be optimized by enabling setting [`optimize_functions_to_subcolumns`](/operations/settings/settings#optimize_functions_to_subcolumns).
With the setting enabled, the function only reads the `values` subcolumn instead of the entire map.
The query `SELECT mapValues(m) FROM table` is transformed to `SELECT m.values FROM table`.


**Syntax**

```sql
mapValues(map)
```

**Arguments**

- `map` — Map to extract values from. [`Map(K, V)`](/sql-reference/data-types/map)


**Returned value**

Returns an array containing all the values from the map. [`Array(T)`](/sql-reference/data-types/array)

**Examples**

**Usage example**

```sql title=Query
SELECT mapValues(map('k1', 'v1', 'k2', 'v2'))
```

```response title=Response
['v1','v2']
```

{/*AUTOGENERATED_END*/ }
