---
description: 'Документация по функциям кортежей и Map'
sidebar_label: 'Map'
slug: /sql-reference/functions/tuple-map-functions
title: 'Функции Map'
doc_type: 'reference'
---



## map

Создаёт значение типа [Map(key, value)](../data-types/map.md) из пар «ключ–значение».

**Синтаксис**

```sql
map(key1, value1[, key2, value2, ...])
```

**Аргументы**

* `key_n` — Ключи элементов Map. Любой тип, поддерживаемый как тип ключа для [Map](../data-types/map.md).
* `value_n` — Значения элементов Map. Любой тип, поддерживаемый как тип значения для [Map](../data-types/map.md).

**Возвращаемое значение**

* Map, содержащий пары `key:value`. [Map(key, value)](../data-types/map.md).

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


## mapFromArrays

Создает значение типа `Map` из массива (или `Map`) ключей и массива (или `Map`) значений.

Функция является удобной альтернативой синтаксису `CAST([...], 'Map(key_type, value_type)')`.
Например, вместо того чтобы писать

* `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')`, или
* `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

можно написать `mapFromArrays(['aa', 'bb'], [4, 5])`.

**Синтаксис**

```sql
mapFromArrays(keys, values)
```

Псевдоним: `MAP_FROM_ARRAYS(keys, values)`

**Аргументы**

* `keys` — Массив или отображение ключей типа [Array](../data-types/array.md) или [Map](../data-types/map.md), из которых создаётся значение типа Map. Если `keys` — массив, допускаются типы `Array(Nullable(T))` или `Array(LowCardinality(Nullable(T)))` при условии, что он не содержит значения NULL.
* `values` — Массив или отображение значений типа [Array](../data-types/array.md) или [Map](../data-types/map.md), из которых создаётся значение типа Map.

**Возвращаемое значение**

* Отображение (Map) с ключами и значениями, сформированными из массива ключей и массива/отображения значений.

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

`mapFromArrays` также принимает аргументы типа [Map](../data-types/map.md). Во время выполнения они преобразуются в массив кортежей.

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


## extractKeyValuePairs

Преобразует строку с парами ключ-значение в [Map(String, String)](../data-types/map.md).
Разбор строки устойчив к «шуму» (например, в журналах/логах).
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

* `data` — Строка, из которой извлекаются пары ключ–значение. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
* `key_value_delimiter` — Одиночный символ, разделяющий ключи и значения. По умолчанию `:`. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
* `pair_delimiters` — Набор символов, разделяющих пары. По умолчанию ` `, `,` и `;`. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
* `quoting_character` — Одиночный символ, используемый в качестве символа-кавычки. По умолчанию `"`. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
* `unexpected_quoting_character_strategy` — Стратегия обработки символов-кавычек в неожиданных местах во время фаз `read_key` и `read_value`. Возможные значения: &quot;invalid&quot;, &quot;accept&quot; и &quot;promote&quot;. `invalid` отбросит ключ/значение и вернёт состояние `WAITING_KEY`. `accept` будет трактовать символ как обычный. `promote` переведёт состояние в `READ_QUOTED_{KEY/VALUE}` и продолжит обработку со следующего символа.

**Возвращаемые значения**

* Набор пар ключ–значение. Тип: [Map(String, String)](../data-types/map.md)

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

С одинарной кавычкой `'` в качестве символа кавычания:

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') AS kv
```

Результат:

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Примеры параметра unexpected&#95;quoting&#95;character&#95;strategy:

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

Последовательности экранирования при отключённой поддержке экранирования:

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

Результат:

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

Чтобы восстановить строковые пары ключ–значение Map, сериализованные с помощью `toString`:

```sql
SELECT
    map('John', '33', 'Paula', '31') AS m,
    toString(m) AS map_serialized,
    extractKeyValuePairs(map_serialized, ':', ',', '\'') AS map_restored
FORMAT Vertical;
```

Результат:

```response
Row 1:
──────
m:              {'John':'33','Paula':'31'}
map_serialized: {'John':'33','Paula':'31'}
map_restored:   {'John':'33','Paula':'31'}
```


## extractKeyValuePairsWithEscaping

То же, что и `extractKeyValuePairs`, но с поддержкой экранирования.

Поддерживаемые последовательности экранирования: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v` и `\0`.
Нестандартные последовательности экранирования возвращаются без изменений (включая обратную косую черту), за исключением следующих:
`\\`, `'`, `"`, «backtick» (обратная кавычка), `/`, `=` или управляющие символы ASCII (c &lt;= 31).

Эта функция подходит для случаев, когда предварительное и последующее экранирование не подходят. Например, рассмотрим следующую
входную строку: `a: "aaaa\"bbb"`. Ожидаемый результат: `a: aaaa\"bbbb`.

* Предварительное экранирование: при предварительном экранировании получится: `a: "aaaa"bbb"`, а затем `extractKeyValuePairs` вернёт: `a: aaaa`
* Последующее экранирование: `extractKeyValuePairs` вернёт `a: aaaa\`, и последующее экранирование сохранит это без изменений.

Начальные последовательности экранирования будут пропускаться в ключах и будут считаться некорректными для значений.

**Примеры**

Последовательности экранирования при включённой поддержке экранирования:

```sql
SELECT extractKeyValuePairsWithEscaping('age:a\\x0A\\n\\0') AS kv
```

Результат:

```response
┌─kv────────────────┐
│ {'age':'a\n\n\0'} │
└───────────────────┘
```


## mapAdd

Собирает все ключи и суммирует соответствующие им значения.

**Синтаксис**

```sql
mapAdd(arg1, arg2 [, ...])
```

**Аргументы**

Аргументы — это [map](../data-types/map.md) или [tuple](/sql-reference/data-types/tuple) из двух [arrays](/sql-reference/data-types/array), где элементы в первом массиве представляют ключи, а второй массив содержит значения для каждого ключа. Все массивы ключей должны иметь один и тот же тип, а все массивы значений должны содержать элементы, которые приводятся к одному типу ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) или [Float64](/sql-reference/data-types/float)). Общий приведённый тип используется как тип результирующего массива.

**Возвращаемое значение**

* В зависимости от аргументов функция возвращает один [map](../data-types/map.md) или [tuple](/sql-reference/data-types/tuple), где первый массив содержит отсортированные ключи, а второй массив содержит значения.

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

Запрос с использованием кортежа:

```sql
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1])) AS res, toTypeName(res) AS type;
```

Результат:

```text
┌─res───────────┬─type───────────────────────────────┐
│ ([1,2],[2,2]) │ Tuple(Array(UInt8), Array(UInt64)) │
└───────────────┴────────────────────────────────────┘
```


## mapSubtract

Собирает все ключи и вычитает соответствующие им значения.

**Синтаксис**

```sql
mapSubtract(Кортеж(Массив, Массив), Кортеж(Массив, Массив) [, ...])
```

**Аргументы**

Аргументы — это [map](../data-types/map.md) или [tuple](/sql-reference/data-types/tuple) из двух [array](/sql-reference/data-types/array), где элементы первого массива являются ключами, а второй массив содержит значения для каждого ключа. Все массивы ключей должны иметь одинаковый тип, а все массивы значений должны содержать элементы, которые могут быть приведены к одному типу ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) или [Float64](/sql-reference/data-types/float)). Общий приведённый тип используется как тип результирующего массива.

**Возвращаемое значение**

* В зависимости от аргументов функция возвращает один [map](../data-types/map.md) или [tuple](/sql-reference/data-types/tuple), где первый массив содержит отсортированные ключи, а второй массив содержит значения.

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

Запрос с картой кортежей:

```sql
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1])) AS res, toTypeName(res) AS type;
```

Результат:

```text
┌─res────────────┬─type──────────────────────────────┐
│ ([1,2],[-1,0]) │ Tuple(Array(UInt8), Array(Int64)) │
└────────────────┴───────────────────────────────────┘
```


## mapPopulateSeries

Заполняет отсутствующие пары ключ-значение в `map` с целочисленными ключами.
Чтобы можно было расширять диапазон ключей за пределы наибольшего значения, можно задать максимальный ключ.
Более точно, функция возвращает `map`, в которой ключи образуют последовательность от наименьшего до наибольшего ключа (или до аргумента `max`, если он указан) с шагом 1 и соответствующими значениями.
Если значение для ключа не задано, в качестве результата используется значение по умолчанию.
Если ключи повторяются, с ключом связывается только первое значение (в порядке появления).

**Синтаксис**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

Для аргументов-массивов количество элементов в `keys` и `values` должно быть одинаковым для каждой строки.

**Аргументы**

В качестве аргументов используется либо [Map](../data-types/map.md), либо две [Array](/sql-reference/data-types/array), где первый массив содержит ключи, а второй — значения для каждого ключа.

Массивы для отображения:

* `map` — Map с целочисленными ключами. [Map](../data-types/map.md).

или

* `keys` — Массив ключей. [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges)).
* `values` — Массив значений. [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges)).
* `max` — Максимальное значение ключа. Необязательный аргумент. [Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges).

**Возвращаемое значение**

* В зависимости от аргументов возвращается [Map](../data-types/map.md) или [Tuple](/sql-reference/data-types/tuple) из двух [Array](/sql-reference/data-types/array): ключи в отсортированном порядке и значения, соответствующие этим ключам.

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

Запрос с сопоставлением массивов:

```sql
SELECT mapPopulateSeries([1,2,4], [11,22,44], 5) AS res, toTypeName(res) AS type;
```

Результат:

```text
┌─res──────────────────────────┬─type──────────────────────────────┐
│ ([1,2,3,4,5],[11,22,0,44,0]) │ Tuple(Array(UInt8), Array(UInt8)) │
└──────────────────────────────┴───────────────────────────────────┘
```


## mapKeys

Возвращает ключи заданного `Map`.

Эта функция может быть оптимизирована с помощью настройки [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns).
При включённой настройке функция читает только подколонку [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) вместо всей `Map`.
Запрос `SELECT mapKeys(m) FROM table` преобразуется в `SELECT m.keys FROM table`.

**Синтаксис**

```sql
mapKeys(map)
```

**Аргументы**

* `map` — значение типа [Map](../data-types/map.md).

**Возвращаемое значение**

* Массив, содержащий все ключи из `map`. [Array](../data-types/array.md).

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


## mapContains

Возвращает, содержится ли заданный ключ в заданном отображении.

**Синтаксис**

```sql
mapContains(map, key)
```

Псевдоним: `mapContainsKey(map, key)`

**Аргументы**

* `map` — отображение. [Map](../data-types/map.md).
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


## mapContainsKeyLike

**Синтаксис**

```sql
mapContainsKeyLike(map, pattern)
```

**Аргументы**

* `map` — карта. [Map](../data-types/map.md).
* `pattern` — строковый шаблон для сопоставления.

**Возвращаемое значение**

* `1`, если `map` содержит ключ, соответствующий заданному шаблону, `0` — в противном случае.

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


## mapExtractKeyLike

Для `map` со строковыми ключами и шаблоном `LIKE` функция возвращает `map`, содержащую элементы, ключи которых соответствуют этому шаблону.

**Синтаксис**

```sql
mapExtractKeyLike(map, pattern)
```

**Аргументы**

* `map` — значение типа [Map](../data-types/map.md).
* `pattern`  - строковый шаблон для сопоставления.

**Возвращаемое значение**

* Map, содержащий элементы, ключ которых соответствует указанному шаблону. Если ни один элемент не соответствует шаблону, возвращается пустой Map.

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


## mapValues

Возвращает значения заданной карты.

Эта функция может быть оптимизирована с помощью настройки [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns).
При включённой настройке функция считывает только подстолбец [values](/sql-reference/data-types/map#reading-subcolumns-of-map) вместо всей карты.
Запрос `SELECT mapValues(m) FROM table` преобразуется в `SELECT m.values FROM table`.

**Синтаксис**

```sql
mapValues(map)
```

**Аргументы**

* `map` — отображение. [Map](../data-types/map.md).

**Возвращаемое значение**

* Массив, содержащий все значения отображения `map`. [Array](../data-types/array.md).

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


## mapContainsValue

Возвращает, содержится ли заданное значение в указанном отображении (map).

**Синтаксис**

```sql
mapContainsValue(map, value)
```

Псевдоним: `mapContainsValue(map, value)`

**Аргументы**

* `map` — Значение типа Map. [Map](../data-types/map.md).
* `value` — Значение. Тип должен совпадать с типом значений в `map`.

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


## mapContainsValueLike

**Синтаксис**

```sql
mapСодержитЗначениеПоШаблону(map, pattern)
```

**Аргументы**

* `map` — карта. См. [Map](../data-types/map.md).
* `pattern`  - строковый шаблон для сопоставления.

**Возвращаемое значение**

* `1`, если `map` содержит `value`, удовлетворяющее указанному шаблону, иначе `0`.

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


## mapExtractValueLike

Для карты со строковыми значениями и шаблоном LIKE эта функция возвращает карту с элементами, значения которых соответствуют шаблону.

**Синтаксис**

```sql
mapExtractValueLike(map, pattern)
```

**Аргументы**

* `map` — значение типа Map. См. [Map](../data-types/map.md).
* `pattern`  - строковый шаблон для сопоставления.

**Возвращаемое значение**

* Map, содержащий элементы, значения которых соответствуют указанному шаблону. Если ни один элемент не соответствует шаблону, возвращается пустой Map.

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


## mapApply

Применяет функцию к каждому элементу карты (Map).

**Синтаксис**

```sql
mapApply(func, map)
```

**Аргументы**

* `func` — [лямбда-функция](/sql-reference/functions/overview#higher-order-functions).
* `map` — [Map](../data-types/map.md).

**Возвращаемое значение**

* Возвращает отображение, полученное из исходного отображения путём применения `func(map1[i], ..., mapN[i])` к каждому элементу.

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


## mapFilter

Фильтрует отображение (map), применяя функцию к каждому его элементу.

**Синтаксис**

```sql
mapFilter(func, map)
```

**Аргументы**

* `func` — [лямбда-функция](/sql-reference/functions/overview#higher-order-functions).
* `map` — [Map](../data-types/map.md).

**Возвращаемое значение**

* Возвращает объект типа Map, который содержит только те элементы `map`, для которых `func(map1[i], ..., mapN[i])` возвращает значение, отличное от 0.

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


## mapUpdate

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


## mapConcat

Объединяет несколько отображений (map) на основе равенства их ключей.
Если элементы с одинаковым ключом присутствуют более чем в одном входном отображении, все элементы добавляются в результирующее отображение, но только первый из них доступен через оператор `[]`.

**Синтаксис**

```sql
mapConcat(maps)
```

**Аргументы**

* `maps` – Произвольное количество значений типа [Map](../data-types/map.md).

**Возвращаемое значение**

* Возвращает значение типа Map, полученное конкатенацией значений Map, переданных в качестве аргументов.

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


## mapExists([func,], map)

Возвращает 1, если в `map` есть хотя бы одна пара ключ–значение, для которой `func(key, value)` возвращает значение, отличное от 0. В противном случае возвращает 0.

:::note
`mapExists` — это [функция высшего порядка](/sql-reference/functions/overview#higher-order-functions).
Ей можно передать лямбда-функцию в качестве первого аргумента.
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


## mapAll([func,] map)

Возвращает 1, если `func(key, value)` возвращает значение, отличное от 0, для всех пар ключ–значение в `map`. В противном случае возвращает 0.

:::note
Учтите, что `mapAll` — это [функция высшего порядка](/sql-reference/functions/overview#higher-order-functions).
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


## mapSort([func,], map)

Сортирует элементы `map` по возрастанию.
Если указана функция `func`, порядок сортировки определяется результатом применения этой функции к ключам и значениям `map`.

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

Для получения дополнительных сведений см. [справочник](/sql-reference/functions/array-functions#arraySort) по функции `arraySort`.


## mapPartialSort

Сортирует элементы `map` по возрастанию с дополнительным аргументом `limit`, позволяющим выполнить частичную сортировку.
Если указана функция `func`, порядок сортировки определяется результатом применения `func` к ключам и значениям `map`.

**Синтаксис**

```sql
mapPartialSort([func,] limit, map)
```

**Аргументы**

* `func` – необязательная функция, применяемая к ключам и значениям `map`. [Lambda function](/sql-reference/functions/overview#higher-order-functions).
* `limit` – элементы в диапазоне [1..limit] сортируются. [(U)Int](../data-types/int-uint.md).
* `map` – отображение (map) для сортировки. [Map](../data-types/map.md).

**Возвращаемое значение**

* Частично отсортированное отображение (map). [Map](../data-types/map.md).

**Пример**

```sql
SELECT mapPartialSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k2':1,'k3':2,'k1':3}                                                    │
└───────────────────────────────────────────────────────────────────────────┘
```


## mapReverseSort([func,], map)

Сортирует элементы map в порядке убывания.
Если указана функция `func`, порядок сортировки определяется результатом функции `func`, применяемой к ключам и значениям map.

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

Подробнее см. описание функции [arrayReverseSort](/sql-reference/functions/array-functions#arrayReverseSort).


## mapPartialReverseSort

Сортирует элементы map в порядке убывания, при этом дополнительный аргумент `limit` позволяет выполнить частичную сортировку.
Если указана функция `func`, порядок сортировки определяется результатом применения функции `func` к ключам и значениям map.

**Синтаксис**

```sql
mapPartialReverseSort([func,] limit, map)
```

**Аргументы**

* `func` – Необязательная функция, применяемая к ключам и значениям карты. [Lambda function](/sql-reference/functions/overview#higher-order-functions).
* `limit` – Сортируются элементы с индексами в диапазоне [1..limit]. [(U)Int](../data-types/int-uint.md).
* `map` – Карта для сортировки. [Map](../data-types/map.md).

**Возвращаемое значение**

* Частично отсортированная карта. [Map](../data-types/map.md).

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
  Внутреннее содержимое тегов ниже заменяется на этапе сборки фреймворка документации
  материалами, сгенерированными из system.functions. Пожалуйста, не изменяйте и не удаляйте эти теги.
  См.: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
