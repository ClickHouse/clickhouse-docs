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

С одинарной кавычкой `'` в качестве символа цитирования:

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') AS kv
```

Результат:

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Примеры unexpected&#95;quoting&#95;character&#95;strategy:

unexpected&#95;quoting&#95;character&#95;strategy=invalid

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

unexpected&#95;quoting&#95;character&#95;strategy=accept

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

unexpected&#95;quoting&#95;character&#95;strategy=promote

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

Escape-последовательности при отсутствии поддержки:

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

Результат:

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

Чтобы восстановить пары ключ–значение строковой карты, сериализованные с помощью `toString`:

```sql
SELECT
    map('John', '33', 'Paula', '31') AS m,
    toString(m) AS map_serialized,
    extractKeyValuePairs(map_serialized, ':', ',', '\'') AS map_restored
FORMAT Vertical;
```

Результат:

```response
Строка 1:
──────
m:              {'John':'33','Paula':'31'}
map_serialized: {'John':'33','Paula':'31'}
map_restored:   {'John':'33','Paula':'31'}
```

## extractKeyValuePairsWithEscaping {#extractkeyvaluepairswithescaping}

То же, что и `extractKeyValuePairs`, но с поддержкой экранирования.

Поддерживаемые escape-последовательности: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v` и `\0`.
Нестандартные escape-последовательности возвращаются как есть (включая обратный слэш), за исключением следующих:
`\\`, `'`, `"`, `backtick` (обратная кавычка), `/`, `=` или управляющие символы ASCII (c &lt;= 31).

Эта функция подходит для случаев, когда предварительное и последующее экранирование неприменимы. Например, рассмотрим следующую
входную строку: `a: "aaaa\"bbb"`. Ожидаемый вывод: `a: aaaa\"bbbb`.

* Предварительное экранирование: при предварительном экранировании будет получен вывод: `a: "aaaa"bbb"`, а `extractKeyValuePairs` затем вернёт: `a: aaaa`
* Последующее экранирование: `extractKeyValuePairs` вернёт `a: aaaa\`, и последующее экранирование оставит строку без изменений.

Начальные escape-последовательности будут пропущены в ключах и будут считаться недопустимыми для значений.

**Примеры**

Escape-последовательности при включённой поддержке экранирования:

```sql
SELECT extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') AS kv
```

Результат:

```response
┌─kv────────────────┐
│ {'age':'a\n\n\0'} │
└───────────────────┘
```

## mapAdd {#mapadd}

Собирает все ключи и суммирует соответствующие значения.

**Синтаксис**

```sql
mapAdd(arg1, arg2 [, ...])
```

**Аргументы**

Аргументы представляют собой [map](../data-types/map.md) или [tuple](/sql-reference/data-types/tuple) из двух [arrays](/sql-reference/data-types/array), где элементы в первом массиве являются ключами, а второй массив содержит значения для каждого ключа. Все массивы ключей должны иметь одинаковый тип, а все массивы значений должны содержать элементы, которые могут быть приведены к одному типу ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) или [Float64](/sql-reference/data-types/float)). Общий приведённый тип используется как тип для результирующего массива.

**Возвращаемое значение**

* В зависимости от аргументов возвращается один [map](../data-types/map.md) или [tuple](/sql-reference/data-types/tuple), где первый массив содержит отсортированные ключи, а второй массив — значения.

**Пример**

Запрос с типом `Map`:

```sql
SELECT mapAdd(map(1,1), map(1,1));
```

Результат:

```text
┌─mapAdd(map(1, 1), map(1, 1))─┐
│ {1:2}                        │
└──────────────────────────────┘
```

Запрос с кортежем:

```sql
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1])) AS res, toTypeName(res) AS type;
```

Результат:

```text
┌─res───────────┬─type───────────────────────────────┐
│ ([1,2],[2,2]) │ Tuple(Array(UInt8), Array(UInt64)) │
└───────────────┴────────────────────────────────────┘
```

## mapSubtract {#mapsubtract}

Собирает все ключи и вычитает соответствующие им значения.

**Синтаксис**

```sql
mapSubtract(Tuple(Array, Array), Tuple(Array, Array) [, ...])
```

**Аргументы**

Аргументы — это [map](../data-types/map.md) или [tuple](/sql-reference/data-types/tuple) из двух [array](/sql-reference/data-types/array), где элементы первого массива представляют ключи, а второй массив содержит значения для каждого ключа. Все массивы ключей должны иметь один и тот же тип, а все массивы значений должны содержать элементы, которые могут быть приведены к одному типу ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) или [Float64](/sql-reference/data-types/float)). Общий приведённый тип используется как тип для результирующего массива.

**Возвращаемое значение**

* В зависимости от аргументов функция возвращает [map](../data-types/map.md) или [tuple](/sql-reference/data-types/tuple), где первый массив содержит отсортированные ключи, а второй массив содержит значения.

**Пример**

Запрос с типом `Map`:

```sql
SELECT mapSubtract(map(1,1), map(1,1));
```

Результат:

```text
┌─mapSubtract(map(1, 1), map(1, 1))─┐
│ {1:0}                             │
└───────────────────────────────────┘
```

Запрос с отображением кортежей:

```sql
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1])) AS res, toTypeName(res) AS type;
```

Результат:

```text
┌─res────────────┬─type──────────────────────────────┐
│ ([1,2],[-1,0]) │ Tuple(Array(UInt8), Array(Int64)) │
└────────────────┴───────────────────────────────────┘
```

## mapPopulateSeries {#mappopulateseries}

Заполняет отсутствующие пары ключ–значение в отображении (map) с целочисленными ключами.
Чтобы можно было расширять множество ключей за пределы наибольшего значения, можно задать максимальный ключ.
Более конкретно, функция возвращает отображение, в котором ключи образуют последовательность от наименьшего до наибольшего ключа (или аргумента `max`, если он указан) с шагом 1 и соответствующими значениями.
Если для ключа не задано значение, используется значение по умолчанию.
В случае повторяющихся ключей с каждым ключом связывается только первое значение (в порядке появления).

**Синтаксис**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

Для аргументов-массивов количество элементов в `keys` и `values` должно совпадать для каждой строки.

**Аргументы**

Аргументы — это [Map](../data-types/map.md) или два массива [Array](/sql-reference/data-types/array), где первый массив содержит ключи, а второй — значения для каждого ключа.

Отображаемые массивы:

* `map` — Map с целочисленными ключами. [Map](../data-types/map.md).

или

* `keys` — Массив ключей. [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges)).
* `values` — Массив значений. [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges)).
* `max` — Максимальное значение ключа. Необязательный параметр. [Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges).

**Возвращаемое значение**

* В зависимости от аргументов — [Map](../data-types/map.md) или [Tuple](/sql-reference/data-types/tuple) из двух [Array](/sql-reference/data-types/array): ключи в отсортированном порядке и значения, соответствующие этим ключам.

**Пример**

Запрос с типом `Map`:

```sql
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6);
```

Результат:

```text
┌─mapPopulateSeries(map(1, 10, 5, 20), 6)─┐
│ {1:10,2:0,3:0,4:0,5:20,6:0}             │
└─────────────────────────────────────────┘
```

Запрос с сопоставленными массивами:

```sql
SELECT mapPopulateSeries([1,2,4], [11,22,44], 5) AS res, toTypeName(res) AS type;
```

Результат:

```text
┌─res──────────────────────────┬─type──────────────────────────────┐
│ ([1,2,3,4,5],[11,22,0,44,0]) │ Tuple(Array(UInt8), Array(UInt8)) │
└──────────────────────────────┴───────────────────────────────────┘
```

## mapKeys {#mapkeys}

Возвращает ключи заданной `Map`.

Эту функцию можно оптимизировать с помощью настройки [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns).
При включённой настройке функция читает только подстолбец [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) вместо всей `Map`.
Запрос `SELECT mapKeys(m) FROM table` преобразуется в `SELECT m.keys FROM table`.

**Синтаксис**

```sql
mapKeys(map)
```

**Аргументы**

* `map` — отображение. [Map](../data-types/map.md).

**Возвращаемое значение**

* Массив, содержащий все ключи из отображения `map`. [Array](../data-types/array.md).

**Пример**

Запрос:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapKeys(a) FROM tab;
```

Результат:

```text
┌─mapKeys(a)────────────┐
│ ['name','age']        │
│ ['number','position'] │
└───────────────────────┘
```

## mapContains {#mapcontains}

Возвращает, содержится ли заданный ключ в указанном отображении.

**Синтаксис**

```sql
mapContains(map, key)
```

Псевдоним: `mapContainsKey(map, key)`

**Аргументы**

* `map` — Map. [Map](../data-types/map.md).
* `key` — ключ. Тип должен совпадать с типом ключа в `map`.

**Возвращаемое значение**

* `1`, если `map` содержит `key`, `0` в противном случае. [UInt8](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapContains(a, 'name') FROM tab;

```

Результат:

```text
┌─mapContains(a, 'name')─┐
│                      1 │
│                      0 │
└────────────────────────┘
```

## mapContainsKeyLike {#mapcontainskeylike}

**Синтаксис**

```sql
mapContainsKeyLike(map, pattern)
```

**Аргументы**

* `map` — Map. [Map](../data-types/map.md).
* `pattern`  - Строковый шаблон для сопоставления.

**Возвращаемое значение**

* `1`, если `map` содержит `key`, соответствующий заданному шаблону, `0` — если не содержит.

**Пример**

Запрос:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsKeyLike(a, 'a%') FROM tab;
```

Результат:

```text
┌─mapContainsKeyLike(a, 'a%')─┐
│                           1 │
│                           0 │
└─────────────────────────────┘
```

## mapExtractKeyLike {#mapextractkeylike}

Для map со строковыми ключами и шаблоном `LIKE` эта функция возвращает map с элементами, ключи которых соответствуют заданному шаблону.

**Синтаксис**

```sql
mapExtractKeyLike(map, pattern)
```

**Аргументы**

* `map` — Map. [Map](../data-types/map.md).
* `pattern`  - Строковый шаблон для сопоставления.

**Возвращаемое значение**

* Map, содержащая элементы, ключи которых соответствуют указанному шаблону. Если ни один элемент не соответствует шаблону, возвращается пустая Map.

**Пример**

Запрос:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractKeyLike(a, 'a%') FROM tab;
```

Результат:

```text
┌─mapExtractKeyLike(a, 'a%')─┐
│ {'abc':'abc'}              │
│ {}                         │
└────────────────────────────┘
```

## mapValues {#mapvalues}

Возвращает значения указанной карты (Map).

Эта функция может быть оптимизирована с помощью настройки [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns).
При включённой настройке функция считывает только подстолбец [values](/sql-reference/data-types/map#reading-subcolumns-of-map) вместо всей карты.
Запрос `SELECT mapValues(m) FROM table` преобразуется в `SELECT m.values FROM table`.

**Синтаксис**

```sql
mapValues(map)
```

**Аргументы**

* `map` — `Map`. [Map](../data-types/map.md).

**Возвращаемое значение**

* Массив, содержащий все значения из `map`. [Array](../data-types/array.md).

**Пример**

Запрос:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapValues(a) FROM tab;
```

Результат:

```text
┌─mapValues(a)─────┐
│ ['eleven','11']  │
│ ['twelve','6.0'] │
└──────────────────┘
```

## mapContainsValue {#mapcontainsvalue}

Возвращает, содержится ли заданный ключ в указанной карте.

**Синтаксис**

```sql
mapContainsValue(map, value)
```

Псевдоним: `mapContainsValue(map, value)`

**Аргументы**

* `map` — Map. [Map](../data-types/map.md).
* `value` — Значение. Тип должен совпадать с типом значения `map`.

**Возвращаемое значение**

* `1`, если `map` содержит `value`, `0` в противном случае. [UInt8](../data-types/int-uint.md).

**Пример**

Запрос:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'name':'eleven','age':'11'}), ({'number':'twelve','position':'6.0'});

SELECT mapContainsValue(a, '11') FROM tab;

```

Результат:

```text
┌─mapContainsValue(a, '11')─┐
│                         1 │
│                         0 │
└───────────────────────────┘
```

## mapContainsValueLike {#mapcontainsvaluelike}

**Синтаксис**

```sql
mapContainsValueLike(map, pattern)
```

**Аргументы**

* `map` — Map. [Map](../data-types/map.md).
* `pattern`  - Строковый шаблон для сопоставления.

**Возвращаемое значение**

* `1`, если `map` содержит `value`, соответствующее указанному шаблону, `0` в противном случае.

**Пример**

Запрос:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapContainsValueLike(a, 'a%') FROM tab;
```

Результат:

```text
┌─mapContainsV⋯ke(a, 'a%')─┐
│                        1 │
│                        0 │
└──────────────────────────┘
```

## mapExtractValueLike {#mapextractvaluelike}

Получив map со строковыми значениями и шаблоном LIKE, функция возвращает map с элементами, чьи значения соответствуют этому шаблону.

**Синтаксис**

```sql
mapExtractValueLike(map, pattern)
```

**Аргументы**

* `map` — Map. [Map](../data-types/map.md).
* `pattern`  - Строковый шаблон для сопоставления.

**Возвращаемое значение**

* Map, содержащая элементы, значения которых соответствуют указанному шаблону. Если ни один элемент не соответствует шаблону, возвращается пустая Map.

**Пример**

Запрос:

```sql
CREATE TABLE tab (a Map(String, String)) ENGINE = Memory;

INSERT INTO tab VALUES ({'abc':'abc','def':'def'}), ({'hij':'hij','klm':'klm'});

SELECT mapExtractValueLike(a, 'a%') FROM tab;
```

Результат:

```text
┌─mapExtractValueLike(a, 'a%')─┐
│ {'abc':'abc'}                │
│ {}                           │
└──────────────────────────────┘
```

## mapApply {#mapapply}

Применяет функцию к каждому элементу карты.

**Синтаксис**

```sql
mapApply(func, map)
```

**Аргументы**

* `func` — [lambda-функция](/sql-reference/functions/overview#higher-order-functions).
* `map` — [Map](../data-types/map.md).

**Возвращаемое значение**

* Возвращает объект Map, полученный из исходного объекта Map путём применения `func(map1[i], ..., mapN[i])` к каждому элементу.

**Пример**

Запрос:

```sql
SELECT mapApply((k, v) -> (k, v * 10), _map) AS r
FROM
(
    SELECT map('key1', number, 'key2', number * 2) AS _map
    FROM numbers(3)
)
```

Результат:

```text
┌─r─────────────────────┐
│ {'key1':0,'key2':0}   │
│ {'key1':10,'key2':20} │
│ {'key1':20,'key2':40} │
└───────────────────────┘
```

## mapFilter {#mapfilter}

Фильтрует map, применяя функцию к каждому элементу карты.

**Синтаксис**

```sql
mapFilter(func, map)
```

**Аргументы**

* `func`  - [лямбда-функция](/sql-reference/functions/overview#higher-order-functions).
* `map` — [Map](../data-types/map.md).

**Возвращаемое значение**

* Возвращает map, содержащий только те элементы из `map`, для которых `func(map1[i], ..., mapN[i])` возвращает значение, не равное 0.

**Пример**

Запрос:

```sql
SELECT mapFilter((k, v) -> ((v % 2) = 0), _map) AS r
FROM
(
    SELECT map('key1', number, 'key2', number * 2) AS _map
    FROM numbers(3)
)
```

Результат:

```text
┌─r───────────────────┐
│ {'key1':0,'key2':0} │
│ {'key2':2}          │
│ {'key1':2,'key2':4} │
└─────────────────────┘
```

## mapUpdate {#mapupdate}

**Синтаксис**

```sql
mapUpdate(map1, map2)
```

**Аргументы**

* `map1` [Map](../data-types/map.md).
* `map2` [Map](../data-types/map.md).

**Возвращаемое значение**

* Возвращает `map1` с обновлёнными значениями для соответствующих ключей из `map2`.

**Пример**

Запрос:

```sql
SELECT mapUpdate(map('key1', 0, 'key3', 0), map('key1', 10, 'key2', 10)) AS map;
```

Результат:

```text
┌─map────────────────────────────┐
│ {'key3':0,'key1':10,'key2':10} │
└────────────────────────────────┘
```

## mapConcat {#mapconcat}

Объединяет несколько map на основе совпадения их ключей.
Если элементы с одинаковым ключом присутствуют более чем в одной входной map, все элементы добавляются в результирующую map, но только первый элемент доступен через оператор `[]`.

**Синтаксис**

```sql
mapConcat(maps)
```

**Аргументы**

* `maps` – Произвольное количество значений типа [Map](../data-types/map.md).

**Возвращаемое значение**

* Возвращает значение типа Map, полученное объединением карт, переданных в качестве аргументов.

**Примеры**

Запрос:

```sql
SELECT mapConcat(map('key1', 1, 'key3', 3), map('key2', 2)) AS map;
```

Результат:

```text
┌─map──────────────────────────┐
│ {'key1':1,'key3':3,'key2':2} │
└──────────────────────────────┘
```

Запрос:

```sql
SELECT mapConcat(map('key1', 1, 'key2', 2), map('key1', 3)) AS map, map['key1'];
```

Результат:

```text
┌─map──────────────────────────┬─elem─┐
│ {'key1':1,'key2':2,'key1':3} │    1 │
└──────────────────────────────┴──────┘
```

## mapExists([func,], map) {#mapexistsfunc-map}

Возвращает 1, если в `map` есть хотя бы одна пара ключ-значение, для которой `func(key, value)` возвращает что-либо, отличное от 0. В противном случае возвращает 0.

:::note
`mapExists` — [функция высшего порядка](/sql-reference/functions/overview#higher-order-functions).
Вы можете передать ей лямбда-функцию в качестве первого аргумента.
:::

**Пример**

Запрос:

```sql
SELECT mapExists((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

Результат:

```response
┌─res─┐
│   1 │
└─────┘
```

## mapAll([func,] map) {#mapallfunc-map}

Возвращает 1, если `func(key, value)` возвращает значение, отличное от 0, для всех пар «ключ–значение» в `map`. В противном случае возвращает 0.

:::note
Обратите внимание, что `mapAll` — это [функция высшего порядка](/sql-reference/functions/overview#higher-order-functions).
В качестве первого аргумента ей можно передать лямбда-функцию.
:::

**Пример**

Запрос:

```sql
SELECT mapAll((k, v) -> (v = 1), map('k1', 1, 'k2', 2)) AS res
```

Результат:

```response
┌─res─┐
│   0 │
└─────┘
```

## mapSort([func,], map) {#mapsortfunc-map}

Сортирует элементы карты по возрастанию.
Если указана функция `func`, порядок сортировки определяется результатом применения `func` к ключам и значениям карты.

**Примеры**

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

Подробнее см. [справочник](/sql-reference/functions/array-functions#arraySort) по функции `arraySort`.

## mapPartialSort {#mappartialsort}

Сортирует элементы карты в порядке возрастания с дополнительным аргументом `limit`, который позволяет выполнять частичную сортировку.
Если указана функция `func`, порядок сортировки определяется результатом применения функции `func` к ключам и значениям карты.

**Синтаксис**

```sql
mapPartialSort([func,] limit, map)
```

**Аргументы**

* `func` – необязательная функция, применяемая к ключам и значениям отображения. [Lambda function](/sql-reference/functions/overview#higher-order-functions).
* `limit` – количество элементов, которые будут отсортированы (элементы с позициями в диапазоне [1..limit]). [(U)Int](../data-types/int-uint.md).
* `map` – отображение для сортировки. [Map](../data-types/map.md).

**Возвращаемое значение**

* Частично отсортированное отображение. [Map](../data-types/map.md).

**Пример**

```sql
SELECT mapPartialSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k2':1,'k3':2,'k1':3}                                                    │
└───────────────────────────────────────────────────────────────────────────┘
```

## mapReverseSort([func,], map) {#mapreversesortfunc-map}

Сортирует элементы map в порядке убывания.
Если указана функция `func`, порядок сортировки определяется результатом её применения к ключам и значениям map.

**Примеры**

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

Подробнее см. функцию [arrayReverseSort](/sql-reference/functions/array-functions#arrayReverseSort).

## mapPartialReverseSort {#mappartialreversesort}

Сортирует элементы map в порядке убывания с дополнительным аргументом `limit`, позволяющим выполнять частичную сортировку.
Если указана функция `func`, порядок сортировки определяется результатом функции `func`, применённой к ключам и значениям map.

**Синтаксис**

```sql
mapPartialReverseSort([func,] limit, map)
```

**Аргументы**

* `func` – необязательная функция, применяемая к ключам и значениям map. [Lambda function](/sql-reference/functions/overview#higher-order-functions).
* `limit` – сортируются элементы с индексами в диапазоне [1..limit]. [(U)Int](../data-types/int-uint.md).
* `map` – объект типа Map для сортировки. [Map](../data-types/map.md).

**Возвращаемое значение**

* Частично отсортированный объект типа Map. [Map](../data-types/map.md).

**Пример**

```sql
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialReverseSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k1':3,'k3':2,'k2':1}                                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```

{/* 
  Содержимое тегов ниже заменяется во время сборки фреймворка документации
  документацией, сгенерированной на основе system.functions. Пожалуйста, не изменяйте и не удаляйте эти теги.
  См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

## extractKeyValuePairs {#extractKeyValuePairs}

Введено в: v

Извлекает пары ключ-значение из произвольной строки. Строка не обязана строго соответствовать формату пар ключ-значение;

она может содержать «шум» (например, файлы журналов / логи). Формат пар ключ-значение, который нужно интерпретировать, задаётся через аргументы функции.

Пара ключ-значение состоит из ключа, за которым следует `key_value_delimiter`, и значения. Также поддерживаются ключи и значения, заключённые в кавычки. Пары ключ-значение должны быть разделены разделителями пар ключ-значение.

**Синтаксис**

```sql
            extractKeyValuePairs(data, [key_value_delimiter], [pair_delimiter], [quoting_character])
```

**Аргументы**

* `data` - Строка, из которой извлекаются пары ключ-значение. [String](../../sql-reference/data-types/string.md) или [FixedString](../../sql-reference/data-types/fixedstring.md).
  * `key_value_delimiter` - Символ, используемый в качестве разделителя между ключом и значением. По умолчанию `:`. [String](../../sql-reference/data-types/string.md) или [FixedString](../../sql-reference/data-types/fixedstring.md).
  * `pair_delimiters` - Набор символов, используемых в качестве разделителей между парами. По умолчанию `\space`, `,` и `;`. [String](../../sql-reference/data-types/string.md) или [FixedString](../../sql-reference/data-types/fixedstring.md).
  * `quoting_character` - Символ, используемый в качестве символа кавычек. По умолчанию `"`. [String](../../sql-reference/data-types/string.md) или [FixedString](../../sql-reference/data-types/fixedstring.md).
  * `unexpected_quoting_character_strategy` - Стратегия обработки символов кавычек в неожиданных местах во время фаз `read_key` и `read_value`. Возможные значения: `invalid`, `accept` и `promote`. `invalid` отбросит ключ/значение и вернёт состояние `WAITING_KEY`. `accept` будет трактовать его как обычный символ. `promote` переведёт в состояние `READ_QUOTED_{KEY/VALUE}` и начнёт со следующего символа. Значение по умолчанию — `INVALID`.

**Возвращаемые значения**

* Извлечённые пары ключ-значение в Map(String, String).

**Примеры**

Запрос:

**Простой пример**

```sql
            arthur :) select extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') as kv

            SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') as kv

            Query id: f9e0ca6f-3178-4ee2-aa2c-a5517abb9cee

            ┌─kv──────────────────────────────────────────────────────────────────────┐
            │ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
            └─────────────────────────────────────────────────────────────────────────┘
```

**Одинарная кавычка как символ обрамления**

```sql
            arthur :) select extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') as kv

            SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') as kv

            Идентификатор запроса: 0e22bf6b-9844-414a-99dc-32bf647abd5e

            ┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
            │ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
            └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Примеры unexpected&#95;quoting&#95;character&#95;strategy:

unexpected&#95;quoting&#95;character&#95;strategy=invalid

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

unexpected&#95;quoting&#95;character&#95;strategy=accept

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

unexpected&#95;quoting&#95;character&#95;strategy=promote

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

**Escape-последовательности при отключённой поддержке экранирования**

```sql
            arthur :) select extractKeyValuePairs('age:a\\x0A\\n\\0') as kv

            SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv

            Query id: e9fd26ee-b41f-4a11-b17f-25af6fd5d356

            ┌─kv────────────────────┐
            │ {'age':'a\\x0A\\n\\0'} │
            └───────────────────────┘
```

**Синтаксис**

```sql
```

**Псевдонимы**: `str_to_map`, `mapFromString`

**Аргументы**

* Отсутствуют.

**Возвращаемое значение**

**Примеры**

## extractKeyValuePairsWithEscaping {#extractKeyValuePairsWithEscaping}

Введена в: v

Та же функция, что и `extractKeyValuePairs`, но с поддержкой экранирования.

Поддерживаемые последовательности экранирования: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v` и `\0`.
Нестандартные последовательности экранирования возвращаются без изменений (включая обратный слеш), за исключением следующих:
`\\`, `'`, `"`, `backtick`, `/`, `=` или управляющие символы ASCII (`c <= 31`).

Эта функция подходит для случаев, когда предварительное и последующее экранирование неприменимы. Например, рассмотрим следующую
входную строку: `a: "aaaa\"bbb"`. Ожидаемый результат: `a: aaaa\"bbbb`.

* Предварительное экранирование: при предварительном экранировании результат будет: `a: "aaaa"bbb"`, а затем `extractKeyValuePairs` вернёт: `a: aaaa`
  * Последующее экранирование: `extractKeyValuePairs` вернёт `a: aaaa\`, и последующее экранирование сохранит это без изменений.

Начальные последовательности экранирования в ключах будут пропущены и будут считаться недопустимыми для значений.

**Последовательности экранирования при включённой поддержке экранирования**

```sql
            arthur :) select extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') as kv

            SELECT extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') AS kv

            Query id: 44c114f0-5658-4c75-ab87-4574de3a1645

            ┌─kv───────────────┐
            │ {'age':'a\n\n\0'} │
            └──────────────────┘
```

**Синтаксис**

```sql
```

**Аргументы**

* Нет.

**Возвращаемое значение**

**Примеры**

## map {#map}

Добавлена в: v21.1

Создаёт значение типа `Map(key, value)` из пар ключ–значение.

**Синтаксис**

```sql
map(key1, value1[, key2, value2, ...])
```

**Аргументы**

* `key_n` — ключи элементов map. [`Any`](/sql-reference/data-types)
* `value_n` — значения элементов map. [`Any`](/sql-reference/data-types)

**Возвращаемое значение**

Возвращает map с парами ключ:значение. [`Map(Any, Any)`](/sql-reference/data-types/map)

**Примеры**

**Пример использования**

```sql title=Query
SELECT map('key1', number, 'key2', number * 2) FROM numbers(3)
```

```response title=Response
{'key1':0,'key2':0}
{'key1':1,'key2':2}
{'key1':2,'key2':4}
```

## mapAdd {#mapAdd}

Добавлена в версии: v20.7

Собирает все ключи и суммирует соответствующие значения.

**Синтаксис**

```sql
mapAdd(arg1[, arg2, ...])
```

**Аргументы**

* `arg1[, arg2, ...]` — значения типов `Map` или `Tuple` из двух массивов, в которых элементы первого массива представляют ключи, а второй массив содержит значения для каждого ключа. [`Map(K, V)`](/sql-reference/data-types/map) или [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает значение типа `Map` или `Tuple`, где первый массив содержит отсортированные ключи, а второй массив — соответствующие им значения. [`Map(K, V)`](/sql-reference/data-types/map) или [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)

**Примеры**

**Для типа Map**

```sql title=Query
SELECT mapAdd(map(1, 1), map(1, 1))
```

```response title=Response
{1:2}
```

**С использованием кортежа**

```sql title=Query
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1]))
```

```response title=Response
([1, 2], [2, 2])
```

## mapAll {#mapAll}

Введена в: v23.4

Проверяет, выполняется ли условие для всех пар ключ–значение в map.
`mapAll` — это функция высшего порядка.
В качестве первого аргумента ей можно передать лямбда-функцию.

**Синтаксис**

```sql
mapAll([func,] map)
```

**Аргументы**

* `func` — лямбда-функция. [`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — проверяемая структура Map. [`Map(K, V)`](/sql-reference/data-types/map)

**Возвращаемое значение**

Возвращает `1`, если все пары ключ-значение удовлетворяют условию, иначе `0`. [`UInt8`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT mapAll((k, v) -> v = 1, map('k1', 1, 'k2', 2))
```

```response title=Response
0
```

## mapApply {#mapApply}

Впервые представлена в: v22.3

Применяет функцию к каждому элементу map.

**Синтаксис**

```sql
mapApply(func, map)
```

**Аргументы**

* `func` — лямбда-функция. [`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — map, к которому применяется функция. [`Map(K, V)`](/sql-reference/data-types/map)

**Возвращаемое значение**

Возвращает новый map, полученный из исходного map посредством применения `func` к каждому элементу. [`Map(K, V)`](/sql-reference/data-types/map)

**Примеры**

**Пример использования**

```sql title=Query
SELECT mapApply((k, v) -> (k, v * 2), map('k1', 1, 'k2', 2))
```

```response title=Response
{'k1':2,'k2':4}
```

## mapConcat {#mapConcat}

Появилась в версии: v23.4

Объединяет несколько значений типа `Map` по совпадающим ключам.
Если элементы с одинаковым ключом присутствуют более чем в одном входном значении `Map`, все элементы добавляются в результирующее значение `Map`, но через оператор [] доступен только первый.

**Синтаксис**

```sql
mapConcat(maps)
```

**Аргументы**

* `maps` — произвольное количество отображений типа [`Map`](/sql-reference/data-types/map).

**Возвращаемое значение**

Возвращает `Map`, полученный объединением карт, переданных в качестве аргументов. [`Map`](/sql-reference/data-types/map)

**Примеры**

**Пример использования**

```sql title=Query
SELECT mapConcat(map('k1', 'v1'), map('k2', 'v2'))
```

```response title=Response
{'k1':'v1','k2':'v2'}
```

## mapContainsKey {#mapContainsKey}

Введена в версии: v21.2

Определяет, содержится ли ключ в `map`.

**Синтаксис**

```sql
mapContains(map, key)
```

**Псевдонимы**: `mapContains`

**Аргументы**

* `map` — отображение, в котором выполняется поиск. [`Map(K, V)`](/sql-reference/data-types/map)
* `key` — ключ для поиска. Тип должен совпадать с типом ключа отображения. [`Any`](/sql-reference/data-types)

**Возвращаемое значение**

Возвращает 1, если отображение содержит ключ, и 0, если не содержит. [`UInt8`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT mapContainsKey(map('k1', 'v1', 'k2', 'v2'), 'k1')
```

```response title=Response
1
```

## mapContainsKeyLike {#mapContainsKeyLike}

Добавлено в версии: v23.4

Проверяет, содержит ли `map` ключ, соответствующий заданному шаблону `LIKE`.

**Синтаксис**

```sql
mapContainsKeyLike(map, pattern)
```

**Аргументы**

* `map` — Карта, в которой выполняется поиск. [`Map(K, V)`](/sql-reference/data-types/map)
* `pattern` — Шаблон для сопоставления с ключами. [`const String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `1`, если `map` содержит ключ, соответствующий `pattern`, иначе `0`. [`UInt8`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

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

Впервые представлена в: v25.6

Определяет, содержится ли значение в отображении (map).

**Синтаксис**

```sql
mapContainsValue(map, value)
```

**Аргументы**

* `map` — отображение, в котором выполняется поиск. [`Map(K, V)`](/sql-reference/data-types/map)
* `value` — значение, которое требуется найти. Тип должен совпадать с типом значений отображения. [`Any`](/sql-reference/data-types)

**Возвращаемое значение**

Возвращает `1`, если отображение содержит это значение, и `0` в противном случае. [`UInt8`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT mapContainsValue(map('k1', 'v1', 'k2', 'v2'), 'v1')
```

```response title=Response
1
```

## mapContainsValueLike {#mapContainsValueLike}

Впервые появилась в версии: v25.5

Проверяет, содержит ли отображение (map) значение, соответствующее шаблону `LIKE`.

**Синтаксис**

```sql
mapContainsValueLike(map, pattern)
```

**Аргументы**

* `map` — карта, в которой выполняется поиск. [`Map(K, V)`](/sql-reference/data-types/map)
* `pattern` — шаблон для сопоставления значений. [`const String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает `1`, если `map` содержит значение, соответствующее `pattern`, иначе `0`. [`UInt8`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

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

Введена в версии: v23.4

Проверяет, выполняется ли условие хотя бы для одной пары ключ–значение в типе данных `Map`.
`mapExists` — это функция высшего порядка.
В качестве первого аргумента ей можно передать лямбда-функцию.

**Синтаксис**

```sql
mapExists([func,] map)
```

**Аргументы**

* `func` — необязательный параметр. Лямбда-функция. [`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — отображение для проверки. [`Map(K, V)`](/sql-reference/data-types/map)

**Возвращаемое значение**

Возвращает `1`, если хотя бы одна пара ключ-значение удовлетворяет условию, иначе `0`. [`UInt8`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT mapExists((k, v) -> v = 1, map('k1', 1, 'k2', 2))
```

```response title=Response
1
```

## mapExtractKeyLike {#mapExtractKeyLike}

Добавлена в версии v23.4

Для карты со строковыми ключами и шаблоном `LIKE` эта функция возвращает карту с элементами, ключи которых соответствуют шаблону.

**Синтаксис**

```sql
mapExtractKeyLike(map, pattern)
```

**Аргументы**

* `map` — Карта, из которой выполняется извлечение. [`Map(K, V)`](/sql-reference/data-types/map)
* `pattern` — Шаблон для сопоставления с ключами карты. [`const String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает карту, содержащую элементы, ключ которых соответствует указанному шаблону. Если ни один элемент не соответствует шаблону, возвращается пустая карта. [`Map(K, V)`](/sql-reference/data-types/map)

**Примеры**

**Пример использования**

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

Впервые появилась в: v25.5

Для заданного `map` со строковыми значениями и шаблоном `LIKE` эта функция возвращает `map` с элементами, значения которых соответствуют шаблону.

**Синтаксис**

```sql
mapExtractValueLike(map, pattern)
```

**Аргументы**

* `map` — карта, из которой выполняется извлечение. [`Map(K, V)`](/sql-reference/data-types/map)
* `pattern` — шаблон для сопоставления значений. [`const String`](/sql-reference/data-types/string)

**Возвращаемое значение**

Возвращает карту, содержащую элементы, значение которых соответствует указанному шаблону. Если ни один элемент не соответствует шаблону, возвращается пустая карта. [`Map(K, V)`](/sql-reference/data-types/map)

**Примеры**

**Пример использования**

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

Появилась в версии: v22.3

Фильтрует `map`, применяя функцию к каждому её элементу.

**Синтаксис**

```sql
mapFilter(func, map)
```

**Аргументы**

* `func` — лямбда-функция. [`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — отображение (map), которое нужно отфильтровать. [`Map(K, V)`](/sql-reference/data-types/map)

**Возвращаемое значение**

Возвращает отображение (map), содержащее только те элементы, для которых `func` возвращает значение, отличное от `0`. [`Map(K, V)`](/sql-reference/data-types/map)

**Примеры**

**Пример использования**

```sql title=Query
SELECT mapFilter((k, v) -> v > 1, map('k1', 1, 'k2', 2))
```

```response title=Response
{'k2':2}
```

## mapFromArrays {#mapFromArrays}

Введена в версии: v23.3

Создаёт Map из массива или Map с ключами и массива или Map со значениями.
Функция является удобной альтернативой синтаксису `CAST([...], 'Map(key_type, value_type)')`.

**Синтаксис**

```sql
mapFromArrays(keys, values)
```

**Псевдонимы**: `MAP_FROM_ARRAYS`

**Аргументы**

* `keys` — Массив или `Map` с ключами, из которых создаётся отображение. [`Array`](/sql-reference/data-types/array) или [`Map`](/sql-reference/data-types/map)
* `values` — Массив или `Map` со значениями, из которых создаётся отображение. [`Array`](/sql-reference/data-types/array) или [`Map`](/sql-reference/data-types/map)

**Возвращаемое значение**

Возвращает отображение с ключами и значениями, построенными на основе массива ключей и массива/`Map` значений. [`Map`](/sql-reference/data-types/map)

**Примеры**

**Базовое использование**

```sql title=Query
SELECT mapFromArrays(['a', 'b', 'c'], [1, 2, 3])
```

```response title=Response
{'a':1,'b':2,'c':3}
```

**Для входных данных типа map**

```sql title=Query
SELECT mapFromArrays([1, 2, 3], map('a', 1, 'b', 2, 'c', 3))
```

```response title=Response
{1:('a', 1), 2:('b', 2), 3:('c', 3)}
```

## mapKeys {#mapKeys}

Добавлено в версии: v21.2

Возвращает ключи указанного столбца типа Map.
Эта функция может быть оптимизирована путём включения настройки [`optimize_functions_to_subcolumns`](/operations/settings/settings#optimize_functions_to_subcolumns).
При включённой настройке функция читает только подстолбец `keys` вместо всего столбца Map.
Запрос `SELECT mapKeys(m) FROM table` преобразуется в `SELECT m.keys FROM table`.

**Синтаксис**

```sql
mapKeys(map)
```

**Аргументы**

* `map` — отображение, из которого извлекаются ключи. [`Map(K, V)`](/sql-reference/data-types/map)

**Возвращаемое значение**

Возвращает массив, содержащий все ключи отображения. [`Array(T)`](/sql-reference/data-types/array)

**Примеры**

**Пример использования**

```sql title=Query
SELECT mapKeys(map('k1', 'v1', 'k2', 'v2'))
```

```response title=Response
['k1','k2']
```

## mapPartialReverseSort {#mapPartialReverseSort}

Добавлена в версии: v23.4

Сортирует элементы map по убыванию с дополнительным аргументом `limit`, который позволяет выполнять частичную сортировку.
Если указана функция `func`, порядок сортировки определяется результатом применения функции `func` к ключам и значениям map.

**Синтаксис**

```sql
mapPartialReverseSort([func,] limit, map)
```

**Аргументы**

* `func` — Необязательный параметр. Лямбда-функция. [`Лямбда-функция`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `limit` — Сортируются элементы в диапазоне `[1..limit]`. [`(U)Int*`](/sql-reference/data-types/int-uint)
* `map` — Отображение (map), которое требуется отсортировать. [`Map(K, V)`](/sql-reference/data-types/map)

**Возвращаемое значение**

Возвращает частично отсортированное отображение (map) по убыванию. [`Map(K, V)`](/sql-reference/data-types/map)

**Примеры**

**Пример использования**

```sql title=Query
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k1':3,'k3':2,'k2':1}
```

## mapPartialSort {#mapPartialSort}

Введена в версии v23.4

Сортирует элементы map по возрастанию с дополнительным аргументом limit, который позволяет выполнять частичную сортировку.
Если указана функция func, порядок сортировки определяется результатом применения функции func к ключам и значениям map.

**Синтаксис**

```sql
mapPartialSort([func,] limit, map)
```

**Аргументы**

* `func` — Необязательный аргумент. Лямбда-функция. [`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `limit` — Сортируются элементы в диапазоне `[1..limit]`. [`(U)Int*`](/sql-reference/data-types/int-uint)
* `map` — Отображение (map) для сортировки. [`Map(K, V)`](/sql-reference/data-types/map)

**Возвращаемое значение**

Возвращает частично отсортированное отображение. [`Map(K, V)`](/sql-reference/data-types/map)

**Примеры**

**Пример использования**

```sql title=Query
SELECT mapPartialSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k2':1,'k3':2,'k1':3}
```

## mapPopulateSeries {#mapPopulateSeries}

Введена в: v20.10

Заполняет отсутствующие пары ключ-значение в `map` с целочисленными ключами.
Чтобы можно было продолжить последовательность ключей за пределы наибольшего значения, можно указать максимальный ключ.
Более точно, функция возвращает `map`, в котором ключи образуют последовательность от наименьшего до наибольшего ключа (или до аргумента `max`, если он указан) с шагом 1 и соответствующими значениями.
Если для ключа не задано значение, используется значение по умолчанию.
Если ключи повторяются, с ключом связывается только первое значение (в порядке появления).

**Синтаксис**

```sql
mapPopulateSeries(map[, max]) | mapPopulateSeries(keys, values[, max])
```

**Аргументы**

* `map` — Map с целочисленными ключами. [`Map((U)Int*, V)`](/sql-reference/data-types/map)
* `keys` — Массив ключей. [`Array(T)`](/sql-reference/data-types/array)
* `values` — Массив значений. [`Array(T)`](/sql-reference/data-types/array)
* `max` — Необязательный параметр. Максимальное значение ключа. [`Int8`](/sql-reference/data-types/int-uint) или [`Int16`](/sql-reference/data-types/int-uint) или [`Int32`](/sql-reference/data-types/int-uint) или [`Int64`](/sql-reference/data-types/int-uint) или [`Int128`](/sql-reference/data-types/int-uint) или [`Int256`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Возвращает Map или кортеж из двух массивов, в котором первый содержит ключи в отсортированном порядке, а второй — значения для соответствующих ключей. [`Map(K, V)`](/sql-reference/data-types/map) или [`Tuple(Array(UInt*), Array(Any))`](/sql-reference/data-types/tuple)

**Примеры**

**С типом Map**

```sql title=Query
SELECT mapPopulateSeries(map(1, 10, 5, 20), 6)
```

```response title=Response
{1:10, 2:0, 3:0, 4:0, 5:20, 6:0}
```

**С сопоставленными массивами**

```sql title=Query
SELECT mapPopulateSeries([1, 2, 4], [11, 22, 44], 5)
```

```response title=Response
([1, 2, 3, 4, 5], [11, 22, 0, 44, 0])
```

## mapReverseSort {#mapReverseSort}

Введена в версии: v23.4

Сортирует элементы `map` в порядке убывания.
Если указана функция `func`, порядок сортировки определяется результатом применения функции `func` к ключам и значениям `map`.

**Синтаксис**

```sql
mapReverseSort([func,] map)
```

**Аргументы**

* `func` — необязательная лямбда‑функция. [`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — отображение для сортировки. [`Map(K, V)`](/sql-reference/data-types/map)

**Возвращаемое значение**

Возвращает отображение, отсортированное по убыванию. [`Map(K, V)`](/sql-reference/data-types/map)

**Примеры**

**Пример использования**

```sql title=Query
SELECT mapReverseSort((k, v) -> v, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k1':3,'k3':2,'k2':1}
```

## mapSort {#mapSort}

Впервые добавлена в: v23.4

Сортирует элементы map по возрастанию.
Если указана функция func, порядок сортировки определяется результатом применения функции func к ключам и значениям map.

**Синтаксис**

```sql
mapSort([func,] map)
```

**Аргументы**

* `func` — Необязательная лямбда-функция. [`Lambda function`](/sql-reference/functions/overview#arrow-operator-and-lambda)
* `map` — Map для сортировки. [`Map(K, V)`](/sql-reference/data-types/map)

**Возвращаемое значение**

Возвращает Map, отсортированный по возрастанию. [`Map(K, V)`](/sql-reference/data-types/map)

**Примеры**

**Пример использования**

```sql title=Query
SELECT mapSort((k, v) -> v, map('k1', 3, 'k2', 1, 'k3', 2))
```

```response title=Response
{'k2':1,'k3':2,'k1':3}
```

## mapSubtract {#mapSubtract}

Появилась в версии v20.7

Собирает все ключи и вычитает соответствующие им значения.

**Синтаксис**

```sql
mapSubtract(arg1[, arg2, ...])
```

**Аргументы**

* `arg1[, arg2, ...]` — значения типа `Map` или кортежи из двух массивов, в которых элементы первого массива являются ключами, а второй массив содержит значения, соответствующие каждому ключу. [`Map(K, V)`](/sql-reference/data-types/map) или [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)

**Возвращаемое значение**

Возвращает одно значение типа Map или кортеж, где первый массив содержит отсортированные ключи, а второй массив — соответствующие им значения. [`Map(K, V)`](/sql-reference/data-types/map) или [`Tuple(Array(T), Array(T))`](/sql-reference/data-types/tuple)

**Примеры**

**С типом Map**

```sql title=Query
SELECT mapSubtract(map(1, 1), map(1, 1))
```

```response title=Response
{1:0}
```

**С отображением с кортежами в качестве ключей**

```sql title=Query
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1]))
```

```response title=Response
([1, 2], [-1, 0])
```

## mapUpdate {#mapUpdate}

Впервые появилась в: v22.3

Для двух `map` возвращает первую `map`, в которой значения заменены на значения из второй `map` для соответствующих ключей.

**Синтаксис**

```sql
mapUpdate(map1, map2)
```

**Аргументы**

* `map1` — Отображение, которое нужно обновить. [`Map(K, V)`](/sql-reference/data-types/map)
* `map2` — Отображение, используемое для обновления. [`Map(K, V)`](/sql-reference/data-types/map)

**Возвращаемое значение**

Возвращает `map1`, в котором значения для соответствующих ключей обновлены значениями из `map2`. [`Map(K, V)`](/sql-reference/data-types/map)

**Примеры**

**Базовое использование**

```sql title=Query
SELECT mapUpdate(map('key1', 0, 'key3', 0), map('key1', 10, 'key2', 10))
```

```response title=Response
{'key3':0,'key1':10,'key2':10}
```

## mapValues {#mapValues}

Введена в версии: v21.2

Возвращает значения заданной карты.
Эту функцию можно оптимизировать, включив настройку [`optimize_functions_to_subcolumns`](/operations/settings/settings#optimize_functions_to_subcolumns).
При включённой настройке функция читает только подстолбец `values` вместо всей карты.
Запрос `SELECT mapValues(m) FROM table` преобразуется в `SELECT m.values FROM table`.

**Синтаксис**

```sql
mapValues(map)
```

**Аргументы**

* `map` — отображение, из которого извлекаются значения. [`Map(K, V)`](/sql-reference/data-types/map)

**Возвращаемое значение**

Возвращает массив, содержащий все значения из отображения. [`Array(T)`](/sql-reference/data-types/array)

**Примеры**

**Пример использования**

```sql title=Query
SELECT mapValues(map('k1', 'v1', 'k2', 'v2'))
```

```response title=Response
['v1','v2']
```

{/*AUTOGENERATED_END*/ }
