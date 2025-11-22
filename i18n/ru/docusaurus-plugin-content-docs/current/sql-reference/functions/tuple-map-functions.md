---
description: 'Документация по функциям Map'
sidebar_label: 'Map'
slug: /sql-reference/functions/tuple-map-functions
title: 'Функции Map'
doc_type: 'reference'
---



## map {#map}

Создаёт значение типа [Map(key, value)](../data-types/map.md) из пар ключ-значение.

**Синтаксис**

```sql
map(key1, value1[, key2, value2, ...])
```

**Аргументы**

- `key_n` — Ключи элементов отображения. Любой тип, поддерживаемый в качестве типа ключа [Map](../data-types/map.md).
- `value_n` — Значения элементов отображения. Любой тип, поддерживаемый в качестве типа значения [Map](../data-types/map.md).

**Возвращаемое значение**

- Отображение, содержащее пары `key:value`. [Map(key, value)](../data-types/map.md).

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

Создает словарь (map) из массива или словаря ключей и массива или словаря значений.

Функция является удобной альтернативой синтаксису `CAST([...], 'Map(key_type, value_type)')`.
Например, вместо записи

- `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')`, или
- `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

можно написать `mapFromArrays(['aa', 'bb'], [4, 5])`.

**Синтаксис**

```sql
mapFromArrays(keys, values)
```

Псевдоним: `MAP_FROM_ARRAYS(keys, values)`

**Аргументы**

- `keys` — массив или словарь ключей для создания словаря [Array](../data-types/array.md) или [Map](../data-types/map.md). Если `keys` является массивом, допускаются типы `Array(Nullable(T))` или `Array(LowCardinality(Nullable(T)))` при условии отсутствия значений NULL.
- `values` — массив или словарь значений для создания словаря [Array](../data-types/array.md) или [Map](../data-types/map.md).

**Возвращаемое значение**

- Словарь с ключами и значениями, построенными из массива ключей и массива/словаря значений.

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

`mapFromArrays` также принимает аргументы типа [Map](../data-types/map.md). Они преобразуются в массив кортежей во время выполнения.

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
Парсинг устойчив к шуму (например, в лог-файлах).
Пары ключ-значение во входной строке состоят из ключа, за которым следует разделитель ключа и значения, а затем значение.
Пары ключ-значение разделяются разделителем пар.
Ключи и значения могут быть заключены в кавычки.

**Синтаксис**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character[, unexpected_quoting_character_strategy]]])
```

Псевдонимы:

- `str_to_map`
- `mapFromString`

**Аргументы**

- `data` — строка, из которой извлекаются пары ключ-значение. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `key_value_delimiter` — одиночный символ, разделяющий ключи и значения. По умолчанию `:`. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `pair_delimiters` — набор символов, разделяющих пары. По умолчанию ` `, `,` и `;`. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `quoting_character` — одиночный символ, используемый для заключения в кавычки. По умолчанию `"`. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `unexpected_quoting_character_strategy` — стратегия обработки символов кавычек в неожиданных местах на этапах `read_key` и `read_value`. Возможные значения: "invalid", "accept" и "promote". Invalid отбрасывает ключ/значение и возвращается в состояние `WAITING_KEY`. Accept обрабатывает его как обычный символ. Promote переходит в состояние `READ_QUOTED_{KEY/VALUE}` и начинает со следующего символа.

**Возвращаемое значение**

- Карта пар ключ-значение. Тип: [Map(String, String)](../data-types/map.md)

**Примеры**

Запрос

```sql
SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') AS kv
```

Результат:

```Результат:
┌─kv──────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
└─────────────────────────────────────────────────────────────────────────┘
```

С одинарной кавычкой `'` в качестве символа для заключения в кавычки:

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') AS kv
```

Результат:

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Примеры unexpected_quoting_character_strategy:

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

Экранирующие последовательности при отсутствии поддержки экранирования:

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

Результат:

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

Чтобы восстановить пары ключ–значение карты из строки, полученной с помощью `toString`:

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
─────────
m:              {'John':'33','Paula':'31'}
map_serialized: {'John':'33','Paula':'31'}
map_restored:   {'John':'33','Paula':'31'}
```


## extractKeyValuePairsWithEscaping {#extractkeyvaluepairswithescaping}

Аналогична `extractKeyValuePairs`, но поддерживает экранирование.

Поддерживаемые escape-последовательности: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v` и `\0`.
Нестандартные escape-последовательности возвращаются как есть (включая обратную косую черту), за исключением следующих:
`\\`, `'`, `"`, `backtick`, `/`, `=` или управляющих символов ASCII (c &lt;= 31).

Эта функция предназначена для случаев, когда предварительное или последующее экранирование не подходит. Например, рассмотрим следующую
входную строку: `a: "aaaa\"bbb"`. Ожидаемый результат: `a: aaaa\"bbbb`.

- Предварительное экранирование: при предварительном экранировании получится: `a: "aaaa"bbb"`, а `extractKeyValuePairs` затем вернёт: `a: aaaa`
- Последующее экранирование: `extractKeyValuePairs` вернёт `a: aaaa\`, а последующее экранирование оставит результат без изменений.

Начальные escape-последовательности будут пропущены в ключах и будут считаться недопустимыми для значений.

**Примеры**

Escape-последовательности с включённой поддержкой экранирования:

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

Аргументами являются [словари](../data-types/map.md) или [кортежи](/sql-reference/data-types/tuple) из двух [массивов](/sql-reference/data-types/array), где элементы первого массива представляют собой ключи, а второй массив содержит значения для каждого ключа. Все массивы ключей должны иметь одинаковый тип, а все массивы значений должны содержать элементы, приводимые к одному типу ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) или [Float64](/sql-reference/data-types/float)). Общий приведённый тип используется в качестве типа для результирующего массива.

**Возвращаемое значение**

- В зависимости от аргументов возвращает [словарь](../data-types/map.md) или [кортеж](/sql-reference/data-types/tuple), где первый массив содержит отсортированные ключи, а второй массив содержит значения.

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

Собирает все ключи и вычитает соответствующие значения.

**Синтаксис**

```sql
mapSubtract(Tuple(Array, Array), Tuple(Array, Array) [, ...])
```

**Аргументы**

Аргументами являются [словари](../data-types/map.md) или [кортежи](/sql-reference/data-types/tuple) из двух [массивов](/sql-reference/data-types/array), где элементы первого массива представляют ключи, а второй массив содержит значения для каждого ключа. Все массивы ключей должны иметь одинаковый тип, а все массивы значений должны содержать элементы, приводимые к одному типу ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) или [Float64](/sql-reference/data-types/float)). Общий приведённый тип используется в качестве типа результирующего массива.

**Возвращаемое значение**

- В зависимости от аргументов возвращает [словарь](../data-types/map.md) или [кортеж](/sql-reference/data-types/tuple), где первый массив содержит отсортированные ключи, а второй массив содержит значения.

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

Запрос с кортежным словарём:

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

Заполняет отсутствующие пары ключ-значение в map с целочисленными ключами.
Для расширения ключей за пределы наибольшего значения можно указать максимальный ключ.
Более конкретно, функция возвращает map, в котором ключи образуют последовательность от наименьшего до наибольшего ключа (или аргумента `max`, если он указан) с шагом 1 и соответствующими значениями.
Если для ключа не указано значение, используется значение по умолчанию.
В случае повторения ключей с ключом связывается только первое значение (в порядке появления).

**Синтаксис**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

Для аргументов-массивов количество элементов в `keys` и `values` должно быть одинаковым для каждой строки.

**Аргументы**

Аргументами являются [Map](../data-types/map.md) или два [массива](/sql-reference/data-types/array), где первый и второй массив содержат ключи и значения для каждого ключа.

Массивы с сопоставлением:

- `map` — Map с целочисленными ключами. [Map](../data-types/map.md).

или

- `keys` — массив ключей. [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges)).
- `values` — массив значений. [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges)).
- `max` — максимальное значение ключа. Необязательный параметр. [Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges).

**Возвращаемое значение**

- В зависимости от аргументов [Map](../data-types/map.md) или [кортеж](/sql-reference/data-types/tuple) из двух [массивов](/sql-reference/data-types/array): ключи в отсортированном порядке и значения для соответствующих ключей.

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

Запрос с массивами с сопоставлением:

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

Возвращает ключи заданной структуры Map.

Эта функция может быть оптимизирована путём включения настройки [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns).
При включённой настройке функция читает только подстолбец [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) вместо всей структуры Map.
Запрос `SELECT mapKeys(m) FROM table` преобразуется в `SELECT m.keys FROM table`.

**Синтаксис**

```sql
mapKeys(map)
```

**Аргументы**

- `map` — структура Map. [Map](../data-types/map.md).

**Возвращаемое значение**

- Массив, содержащий все ключи из `map`. [Array](../data-types/array.md).

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

Проверяет, содержится ли указанный ключ в заданной карте (map).

**Синтаксис**

```sql
mapContains(map, key)
```

Псевдоним: `mapContainsKey(map, key)`

**Аргументы**

- `map` — Карта. [Map](../data-types/map.md).
- `key` — Ключ. Тип должен совпадать с типом ключа `map`.

**Возвращаемое значение**

- `1`, если `map` содержит `key`, `0` в противном случае. [UInt8](../data-types/int-uint.md).

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

- `map` — словарь. [Map](../data-types/map.md).
- `pattern` — строковый шаблон для сопоставления.

**Возвращаемое значение**

- `1`, если `map` содержит ключ, соответствующий указанному шаблону, `0` в противном случае.

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

Для карты со строковыми ключами и шаблоном LIKE функция возвращает карту с элементами, ключи которых соответствуют шаблону.

**Синтаксис**

```sql
mapExtractKeyLike(map, pattern)
```

**Аргументы**

- `map` — карта. [Map](../data-types/map.md).
- `pattern` — строковый шаблон для сопоставления.

**Возвращаемое значение**

- Карта, содержащая элементы, ключи которых соответствуют указанному шаблону. Если ни один элемент не соответствует шаблону, возвращается пустая карта.

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

Возвращает значения заданной структуры Map.

Эта функция может быть оптимизирована путём включения настройки [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns).
При включённой настройке функция читает только подстолбец [values](/sql-reference/data-types/map#reading-subcolumns-of-map) вместо всей структуры Map.
Запрос `SELECT mapValues(m) FROM table` преобразуется в `SELECT m.values FROM table`.

**Синтаксис**

```sql
mapValues(map)
```

**Аргументы**

- `map` — структура Map. [Map](../data-types/map.md).

**Возвращаемое значение**

- Массив, содержащий все значения из `map`. [Array](../data-types/array.md).

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

Проверяет, содержится ли заданное значение в заданном отображении.

**Синтаксис**

```sql
mapContainsValue(map, value)
```

Псевдоним: `mapContainsValue(map, value)`

**Аргументы**

- `map` — Отображение. [Map](../data-types/map.md).
- `value` — Значение. Тип должен соответствовать типу значения `map`.

**Возвращаемое значение**

- `1`, если `map` содержит `value`, `0` в противном случае. [UInt8](../data-types/int-uint.md).

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

- `map` — словарь. [Map](../data-types/map.md).
- `pattern` — строковый шаблон для сопоставления.

**Возвращаемое значение**

- `1`, если `map` содержит значение, соответствующее указанному шаблону, `0` в противном случае.

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

Для карты со строковыми значениями и шаблоном LIKE функция возвращает карту с элементами, значения которых соответствуют шаблону.

**Синтаксис**

```sql
mapExtractValueLike(map, pattern)
```

**Аргументы**

- `map` — карта. [Map](../data-types/map.md).
- `pattern` — строковый шаблон для сопоставления.

**Возвращаемое значение**

- Карта, содержащая элементы, значения которых соответствуют указанному шаблону. Если ни один элемент не соответствует шаблону, возвращается пустая карта.

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

Применяет функцию к каждому элементу словаря.

**Синтаксис**

```sql
mapApply(func, map)
```

**Аргументы**

- `func` — [лямбда-функция](/sql-reference/functions/overview#higher-order-functions).
- `map` — [Map](../data-types/map.md).

**Возвращаемое значение**

- Возвращает словарь, полученный из исходного словаря путём применения `func(map1[i], ..., mapN[i])` для каждого элемента.

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

Фильтрует map, применяя функцию к каждому его элементу.

**Синтаксис**

```sql
mapFilter(func, map)
```

**Аргументы**

- `func` — [лямбда-функция](/sql-reference/functions/overview#higher-order-functions).
- `map` — [Map](../data-types/map.md).

**Возвращаемое значение**

- Возвращает map, содержащий только те элементы из `map`, для которых `func(map1[i], ..., mapN[i])` возвращает значение, отличное от 0.

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

- `map1` — [Map](../data-types/map.md).
- `map2` — [Map](../data-types/map.md).

**Возвращаемое значение**

- Возвращает map1 со значениями, обновлёнными из map2 для соответствующих ключей.

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

Объединяет несколько словарей на основе равенства их ключей.
Если элементы с одинаковым ключом присутствуют более чем в одном входном словаре, все элементы добавляются в результирующий словарь, но только первый из них доступен через оператор `[]`

**Синтаксис**

```sql
mapConcat(maps)
```

**Аргументы**

- `maps` – произвольное количество [словарей](../data-types/map.md).

**Возвращаемое значение**

- Возвращает словарь, содержащий объединённые словари, переданные в качестве аргументов.

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


## mapExists(\[func,\], map) {#mapexistsfunc-map}

Возвращает 1, если в `map` существует хотя бы одна пара ключ-значение, для которой `func(key, value)` возвращает значение, отличное от 0. В противном случае возвращает 0.

:::note
`mapExists` — это [функция высшего порядка](/sql-reference/functions/overview#higher-order-functions).
В качестве первого аргумента ей можно передать лямбда-функцию.
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


## mapAll(\[func,\] map) {#mapallfunc-map}

Возвращает 1, если `func(key, value)` возвращает ненулевое значение для всех пар ключ-значение в `map`. В противном случае возвращает 0.

:::note
Обратите внимание, что `mapAll` является [функцией высшего порядка](/sql-reference/functions/overview#higher-order-functions).
Ей можно передать лямбда-функцию в качестве первого аргумента.
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


## mapSort(\[func,\], map) {#mapsortfunc-map}

Сортирует элементы словаря в порядке возрастания.
Если указана функция `func`, порядок сортировки определяется результатом применения функции `func` к ключам и значениям словаря.

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

Подробнее см. [описание](/sql-reference/functions/array-functions#arraySort) функции `arraySort`.


## mapPartialSort {#mappartialsort}

Сортирует элементы словаря в порядке возрастания с дополнительным аргументом `limit`, позволяющим выполнить частичную сортировку.
Если указана функция `func`, порядок сортировки определяется результатом применения функции `func` к ключам и значениям словаря.

**Синтаксис**

```sql
mapPartialSort([func,] limit, map)
```

**Аргументы**

- `func` — необязательная функция, применяемая к ключам и значениям словаря. [Лямбда-функция](/sql-reference/functions/overview#higher-order-functions).
- `limit` — сортируются элементы в диапазоне [1..limit]. [(U)Int](../data-types/int-uint.md).
- `map` — словарь для сортировки. [Map](../data-types/map.md).

**Возвращаемое значение**

- Частично отсортированный словарь. [Map](../data-types/map.md).

**Пример**

```sql
SELECT mapPartialSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k2':1,'k3':2,'k1':3}                                                    │
└───────────────────────────────────────────────────────────────────────────┘
```


## mapReverseSort(\[func,\], map) {#mapreversesortfunc-map}

Сортирует элементы словаря в порядке убывания.
Если указана функция `func`, порядок сортировки определяется результатом применения функции `func` к ключам и значениям словаря.

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

Сортирует элементы словаря в порядке убывания с дополнительным аргументом `limit`, позволяющим выполнить частичную сортировку.
Если указана функция `func`, порядок сортировки определяется результатом применения функции `func` к ключам и значениям словаря.

**Синтаксис**

```sql
mapPartialReverseSort([func,] limit, map)
```

**Аргументы**

- `func` — необязательная функция, применяемая к ключам и значениям словаря. [Лямбда-функция](/sql-reference/functions/overview#higher-order-functions).
- `limit` — сортируются элементы в диапазоне [1..limit]. [(U)Int](../data-types/int-uint.md).
- `map` — словарь для сортировки. [Map](../data-types/map.md).

**Возвращаемое значение**

- Частично отсортированный словарь. [Map](../data-types/map.md).

**Пример**

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
<!--AUTOGENERATED_END-->
