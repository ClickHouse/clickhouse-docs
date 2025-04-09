description: 'Документация для функций Map для кортежей'
sidebar_label: 'Maps'
sidebar_position: 120
slug: /sql-reference/functions/tuple-map-functions
title: 'Функции Map'
```

## map {#map}

Создает значение типа [Map(key, value)](../data-types/map.md) из пар ключ-значение.

**Синтаксис**

```sql
map(key1, value1[, key2, value2, ...])
```

**Аргументы**

- `key_n` — Ключи записей map. Любой тип, поддерживаемый в качестве типа ключа [Map](../data-types/map.md).
- `value_n` — Значения записей map. Любой тип, поддерживаемый в качестве типа значения [Map](../data-types/map.md).

**Возвращаемое значение**

- Map, содержащий пары `key:value`. [Map(key, value)](../data-types/map.md).

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

Создает map из массива или map ключей и массива или map значений.

Эта функция является удобной альтернативой синтаксису `CAST([...], 'Map(key_type, value_type)')`.
Например, вместо того чтобы писать
- `CAST((['aa', 'bb'], [4, 5]), 'Map(String, UInt32)')`, или
- `CAST([('aa',4), ('bb',5)], 'Map(String, UInt32)')`

вы можете написать `mapFromArrays(['aa', 'bb'], [4, 5])`.

**Синтаксис**

```sql
mapFromArrays(keys, values)
```

Псевдоним: `MAP_FROM_ARRAYS(keys, values)`

**Аргументы**

- `keys` — Массив или map ключей для создания map из [Array](../data-types/array.md) или [Map](../data-types/map.md). Если `keys` — это массив, мы принимаем `Array(Nullable(T))` или `Array(LowCardinality(Nullable(T)))` в качестве его типа, если он не содержит значение NULL.
- `values` — Массив или map значений для создания map из [Array](../data-types/array.md) или [Map](../data-types/map.md).

**Возвращаемое значение**

- Map с ключами и значениями, построенный из массива ключей и массива/значений.

**Пример**

Запрос:

```sql
select mapFromArrays(['a', 'b', 'c'], [1, 2, 3])
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

Преобразует строку пар ключ-значение в [Map(String, String)](../data-types/map.md).
Парсинг толерантен к шуму (например, файлы логов).
Ключи и значения в входной строке состоят из ключа, за которым следует разделитель ключ-значение и значение.
Пары ключ-значение разделяются разделителем пар.
Ключи и значения могут быть заключены в кавычки.

**Синтаксис**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character]]])
```

Псевдонимы:
- `str_to_map`
- `mapFromString`

**Аргументы**

- `data` - Строка, из которой нужно извлечь пары ключ-значение. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `key_value_delimiter` - Один символ, разделяющий ключи и значения. По умолчанию `:`. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `pair_delimiters` - Набор символов, разделяющих пары. По умолчанию ` `, `,` и `;`. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `quoting_character` - Один символ, используемый в качестве символа кавычек. По умолчанию `"`. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).

**Возвращаемое значение**

- Map пар ключ-значение. Тип: [Map(String, String)](../data-types/map.md)

**Примеры**

Запрос

```sql
SELECT extractKeyValuePairs('name:neymar, age:31 team:psg,nationality:brazil') as kv
```

Результат:

```Result:
┌─kv──────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil'}        │
└─────────────────────────────────────────────────────────────────────────┘
```

С одним символом кавычек `'` в качестве символа кавычек:

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') as kv
```

Результат:

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Эскейп- последовательности без поддержки эскейп-последовательностей:

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

Результат:

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

Чтобы восстановить строку map пар ключ-значение, сериализованную с помощью `toString`:

```sql
SELECT
    map('John', '33', 'Paula', '31') AS m,
    toString(m) as map_serialized,
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

## extractKeyValuePairsWithEscaping {#extractkeyvaluepairswithescaping}

То же самое, что и `extractKeyValuePairs`, но с поддержкой экранирования.

Поддерживаемые экранирующие последовательности: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v` и `\0`.
Несоответствующие экранировки возвращаются так, как есть (включая обратную косую черту), если они не являются одной из следующих:
`\\`, `'`, `"`, `backtick`, `/`, `=` или управляющие символы ASCII (c &lt;= 31).

Эта функция будет удовлетворять сценарии использования, где предварительное и последующее экранирование не подходят. Например, рассмотрим следующую
входную строку: `a: "aaaa\"bbb"`. Ожидаемый вывод: `a: aaaa\"bbbb`.
- Предварительное экранирование: Предварительное экранирование даст: `a: "aaaa"bbb"` и `extractKeyValuePairs` затем выдает: `a: aaaa`
- Последующее экранирование: `extractKeyValuePairs` выдаст `a: aaaa\` и последующее экранирование сохранит его как есть.

Ведущие экранирующие последовательности будут пропущены в ключах и будут считаться недействительными для значений.

**Примеры**

Экранирующие последовательности с поддержкой экранирующих последовательностей:

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

Аргументы — это [maps](../data-types/map.md) или [tuples](/sql-reference/data-types/tuple) из двух [arrays](/sql-reference/data-types/array), где элементы в первом массиве представляют ключи, а второй массив содержит значения для каждого ключа. Все массивы ключей должны иметь один и тот же тип, а все массивы значений должны содержать элементы, которые преобразуются в один тип ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) или [Float64](/sql-reference/data-types/float)). Общий прод promoted type используется в качестве типа для результирующего массива.

**Возвращаемое значение**

- В зависимости от аргументов возвращает один [map](../data-types/map.md) или [tuple](/sql-reference/data-types/tuple), где первый массив содержит отсортированные ключи, а второй массив содержит значения.

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
SELECT mapAdd(([toUInt8(1), 2], [1, 1]), ([toUInt8(1), 2], [1, 1])) as res, toTypeName(res) as type;
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

Аргументы — это [maps](../data-types/map.md) или [tuples](/sql-reference/data-types/tuple) из двух [arrays](/sql-reference/data-types/array), где элементы в первом массиве представляют ключи, а второй массив содержит значения для каждого ключа. Все массивы ключей должны иметь один и тот же тип, а все массивы значений должны содержать элементы, которые преобразуются в один тип ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) или [Float64](/sql-reference/data-types/float)). Общий промоутированный тип используется в качестве типа для результирующего массива.

**Возвращаемое значение**

- В зависимости от аргументов возвращает один [map](../data-types/map.md) или [tuple](/sql-reference/data-types/tuple), где первый массив содержит отсортированные ключи, а второй массив содержит значения.

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

Запрос с кортежем:

```sql
SELECT mapSubtract(([toUInt8(1), 2], [toInt32(1), 1]), ([toUInt8(1), 2], [toInt32(2), 1])) as res, toTypeName(res) as type;
```

Результат:

```text
┌─res────────────┬─type──────────────────────────────┐
│ ([1,2],[-1,0]) │ Tuple(Array(UInt8), Array(Int64)) │
└────────────────┴───────────────────────────────────┘
```

## mapPopulateSeries {#mappopulateseries}

Заполняет отсутствующие пары ключ-значение в map с целыми ключами.
Чтобы поддержать расширение ключей за пределами наибольшего значения, можно указать максимальный ключ.
Более конкретно, функция возвращает map, в котором ключи образуют серию от наименьшего до наибольшего ключа (или аргументу `max`, если он указан) с размером шага 1 и соответствующими значениями.
Если для ключа не указано значение, используется значение по умолчанию.
В случае, если ключи повторяются, только первое значение (в порядке появления) ассоциируется с ключом.

**Синтаксис**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

Для массивных аргументов количество элементов в `keys` и `values` должно быть одинаковым для каждой строки.

**Аргументы**

Аргументы — это [Maps](../data-types/map.md) или два [Arrays](/sql-reference/data-types/array), где первый и второй массив содержат ключи и значения для каждого ключа.

Сопоставленные массивы:

- `map` — Map с целыми ключами. [Map](../data-types/map.md).

или

- `keys` — Массив ключей. [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges)).
- `values` — Массив значений. [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges)).
- `max` — Максимальное значение ключа. Необязательно. [Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges).

**Возвращаемое значение**

- В зависимости от аргументов [Map](../data-types/map.md) или [Tuple](/sql-reference/data-types/tuple) из двух [Arrays](/sql-reference/data-types/array): ключи в отсортированном порядке и значения, соответствующие ключам.

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

## mapContains {#mapcontains}

Возвращает, содержится ли данный ключ в данном map.

**Синтаксис**

```sql
mapContains(map, key)
```

**Аргументы**

- `map` — Map. [Map](../data-types/map.md).
- `key` — Ключ. Тип должен соответствовать типу ключа `map`.

**Возвращаемое значение**

- `1`, если `map` содержит `key`, `0`, если нет. [UInt8](../data-types/int-uint.md).

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

## mapKeys {#mapkeys}

Возвращает ключи данного map.

Эта функция может быть оптимизирована путем включения настройки [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns).
С включенной настройкой функция считывает только подколонку [keys](/sql-reference/data-types/map#reading-subcolumns-of-map), вместо всего map.
Запрос `SELECT mapKeys(m) FROM table` преобразуется в `SELECT m.keys FROM table`.

**Синтаксис**

```sql
mapKeys(map)
```

**Аргументы**

- `map` — Map. [Map](../data-types/map.md).

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

## mapValues {#mapvalues}

Возвращает значения данного map.

Эта функция может быть оптимизирована путем включения настройки [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns).
С включенной настройкой функция считывает только подколонку [values](/sql-reference/data-types/map#reading-subcolumns-of-map), вместо всего map.
Запрос `SELECT mapValues(m) FROM table` преобразуется в `SELECT m.values FROM table`.

**Синтаксис**

```sql
mapValues(map)
```

**Аргументы**

- `map` — Map. [Map](../data-types/map.md).

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

## mapContainsKeyLike {#mapcontainskeylike}

**Синтаксис**

```sql
mapContainsKeyLike(map, pattern)
```

**Аргументы**
- `map` — Map. [Map](../data-types/map.md).
- `pattern`  - Шаблон строки для сопоставления.

**Возвращаемое значение**

- `1`, если `map` содержит `key`, похожий на указанный шаблон, `0`, если нет.

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

Данная функция возвращает map с элементами, ключи которых соответствуют шаблону, если она работает с map со строковыми ключами и шаблоном LIKE.

**Синтаксис**

```sql
mapExtractKeyLike(map, pattern)
```

**Аргументы**

- `map` — Map. [Map](../data-types/map.md).
- `pattern`  - Шаблон строки для сопоставления.

**Возвращаемое значение**

- Map, содержащий элементы, ключи которых соответствуют указанному шаблону. Если элементы не соответствуют шаблону, возвращается пустой map.

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

## mapApply {#mapapply}

Применяет функцию к каждому элементу map.

**Синтаксис**

```sql
mapApply(func, map)
```

**Аргументы**

- `func` — [Лямбда-функция](/sql-reference/functions/overview#higher-order-functions).
- `map` — [Map](../data-types/map.md).

**Возвращаемое значение**

- Возвращает map, полученный из оригинального map путем применения `func(map1[i], ..., mapN[i])` для каждого элемента.

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

Фильтрует map, применяя функцию к каждому элементу map.

**Синтаксис**

```sql
mapFilter(func, map)
```

**Аргументы**

- `func`  - [Лямбда-функция](/sql-reference/functions/overview#higher-order-functions).
- `map` — [Map](../data-types/map.md).

**Возвращаемое значение**

- Возвращает map, содержащий только элементы в `map`, для которых `func(map1[i], ..., mapN[i])` возвращает что-то отличное от 0.

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

- `map1` [Map](../data-types/map.md).
- `map2` [Map](../data-types/map.md).

**Возвращаемое значение**

- Возвращает map1 с обновленными значениями для соответствующих ключей в map2.

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

Конкатенирует несколько maps на основе равенства их ключей.
Если элементы с одинаковым ключом присутствуют в более чем одном входном map, все элементы добавляются в результирующий map, но только первый доступен через оператор `[]`.

**Синтаксис**

```sql
mapConcat(maps)
```

**Аргументы**

-   `maps` – Произвольное количество [Maps](../data-types/map.md).

**Возвращаемое значение**

- Возвращает map с конкатенированными map, переданными в качестве аргументов.

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

Возвращает 1, если хотя бы одна пара ключ-значение в `map` существует, для которой `func(key, value)` возвращает что-то отличное от 0. В противном случае возвращает 0.

:::note
`mapExists` является [функцией высшего порядка](/sql-reference/functions/overview#higher-order-functions).
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

## mapAll(\[func,\] map) {#mapallfunc-map}

Возвращает 1, если `func(key, value)` возвращает что-то отличное от 0 для всех пар ключ-значение в `map`. В противном случае возвращает 0.

:::note
Обратите внимание, что `mapAll` является [функцией высшего порядка](/sql-reference/functions/overview#higher-order-functions).
Вы можете передать ей лямбда-функцию в качестве первого аргумента.
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

Сортирует элементы map в порядке возрастания.
Если функция `func` задана, порядок сортировки определяется результатом применения функции `func` к ключам и значениям map.

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

Для получения дополнительной информации см. [справочник](/sql-reference/functions/array-functions#sort) функции `arraySort`. 

## mapPartialSort {#mappartialsort}

Сортирует элементы map в порядке возрастания с дополнительным аргументом `limit`, позволяющим частичную сортировку. 
Если функция `func` задана, порядок сортировки определяется результатом применения функции `func` к ключам и значениям map.

**Синтаксис**

```sql
mapPartialSort([func,] limit, map)
```
**Аргументы**

- `func` – Необязательная функция, применяемая к ключам и значениям map. [Лямбда-функция](/sql-reference/functions/overview#higher-order-functions).
- `limit` – Элементы в диапазоне [1..limit] сортируются. [(U)Int](../data-types/int-uint.md).
- `map` – Map для сортировки. [Map](../data-types/map.md).

**Возвращаемое значение**

- Частично отсортированный map. [Map](../data-types/map.md).

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

Сортирует элементы map в порядке убывания.
Если функция `func` задана, порядок сортировки определяется результатом применения функции `func` к ключам и значениям map.

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

Для получения дополнительной информации см. функцию [arrayReverseSort](/sql-reference/functions/array-functions#arrayreversesort).

## mapPartialReverseSort {#mappartialreversesort}

Сортирует элементы map в порядке убывания с помощью дополнительного аргумента `limit`, позволяющего частичную сортировку.
Если функция `func` задана, порядок сортировки определяется результатом применения функции `func` к ключам и значениям map.

**Синтаксис**

```sql
mapPartialReverseSort([func,] limit, map)
```
**Аргументы**

- `func` – Необязательная функция, применяемая к ключам и значениям map. [Лямбда-функция](/sql-reference/functions/overview#higher-order-functions).
- `limit` – Элементы в диапазоне [1..limit] сортируются. [(U)Int](../data-types/int-uint.md).
- `map` – Map для сортировки. [Map](../data-types/map.md).

**Возвращаемое значение**

- Частично отсортированный map. [Map](../data-types/map.md).

**Пример**

```sql
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialReverseSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k1':3,'k3':2,'k2':1}                                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
