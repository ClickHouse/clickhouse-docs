---
'description': 'Документация для Tuple Map Functions'
'sidebar_label': 'Карты'
'slug': '/sql-reference/functions/tuple-map-functions'
'title': 'Функции Map'
'doc_type': 'reference'
---
## map {#map}

Создает значение типа [Map(key, value)](../data-types/map.md) из пар ключ-значение.

**Синтаксис**

```sql
map(key1, value1[, key2, value2, ...])
```

**Аргументы**

- `key_n` — Ключи элементов карты. Любой тип, поддерживаемый в качестве типа ключа [Map](../data-types/map.md).
- `value_n` — Значения элементов карты. Любой тип, поддерживаемый в качестве типа значения [Map](../data-types/map.md).

**Возвращаемое значение**

- Карта, содержащая пары `key:value`. [Map(key, value)](../data-types/map.md).

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

Создает карту из массива или карты ключей и массива или карты значений.

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

- `keys` — Массив или карта ключей для создания карты из [Array](../data-types/array.md) или [Map](../data-types/map.md). Если `keys` — это массив, принимаются `Array(Nullable(T))` или `Array(LowCardinality(Nullable(T)))` в качестве его типа, при условии, что он не содержит значения NULL.
- `values`  - Массив или карта значений для создания карты из [Array](../data-types/array.md) или [Map](../data-types/map.md).

**Возвращаемое значение**

- Карта с ключами и значениями, построенными из массива ключей и массива/карты значений.

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

`mapFromArrays` также принимает аргументы типа [Map](../data-types/map.md). Эти аргументы преобразуются в массив кортежей во время выполнения.

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
Парсинг терпимо относится к шуму (например, лог-файлам).
Пары ключ-значение в входной строке состоят из ключа, за которым следует разделитель ключ-значение и значение.
Пары ключей и значений разделяются парным разделителем.
Ключи и значения могут быть заключены в кавычки.

**Синтаксис**

```sql
extractKeyValuePairs(data[, key_value_delimiter[, pair_delimiter[, quoting_character[, unexpected_quoting_character_strategy]]])
```

Псевдонимы:
- `str_to_map`
- `mapFromString`

**Аргументы**

- `data` - Строка для извлечения пар ключ-значение. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `key_value_delimiter` - Один символ, разделяющий ключи и значения. По умолчанию `:`. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `pair_delimiters` - Набор символов, разделяющих пары. По умолчанию ` `, `,` и `;`. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `quoting_character` - Один символ, используемый в качестве символа кавычек. По умолчанию `"`. [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `unexpected_quoting_character_strategy` - Стратегия обработки символов кавычек в неожиданных местах во время фаз `read_key` и `read_value`. Возможные значения: "invalid", "accept" и "promote". Invalid отбросит ключ/значение и вернется в состояние `WAITING_KEY`. Accept будет рассматривать это как обычный символ. Promote перейдет в состояние `READ_QUOTED_{KEY/VALUE}` и начнет с следующего символа.

**Возвращаемые значения**

- Массив пар ключ-значение. Тип: [Map(String, String)](../data-types/map.md)

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

С одинарной кавычкой `'` в качестве символа кавычек:

```sql
SELECT extractKeyValuePairs('name:\'neymar\';\'age\':31;team:psg;nationality:brazil,last_key:last_value', ':', ';,', '\'') AS kv
```

Результат:

```text
┌─kv───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ {'name':'neymar','age':'31','team':'psg','nationality':'brazil','last_key':'last_value'}                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

примеры значений unexpected_quoting_character_strategy:

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

Эскейп-последовательности без поддержки эскейп-последовательностей:

```sql
SELECT extractKeyValuePairs('age:a\\x0A\\n\\0') AS kv
```

Результат:

```text
┌─kv─────────────────────┐
│ {'age':'a\\x0A\\n\\0'} │
└────────────────────────┘
```

Чтобы восстановить строку карты пар ключ-значение, сериализованную с помощью `toString`:

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

## extractKeyValuePairsWithEscaping {#extractkeyvaluepairswithescaping}

То же самое, что и `extractKeyValuePairs`, но поддерживает экранирование.

Поддерживаемые эскейп-последовательности: `\x`, `\N`, `\a`, `\b`, `\e`, `\f`, `\n`, `\r`, `\t`, `\v` и `\0`.
Нестандартные эскейп-последовательности возвращаются как есть (включая обратный слэш), если только они не являются одним из следующих:
`\\`, `'`, `"`, `backtick`, `/`, `=` или управляющие ASCII-символы (c &lt;= 31).

Эта функция удовлетворит случай использования, когда предварительное экранирование и последующее экранирование неуместны. Например, рассмотрим следующую входную строку: `a: "aaaa\"bbb"`. Ожидаемый вывод: `a: aaaa\"bbbb`.
- Предварительное экранирование: При предварительном экранировании выход будет: `a: "aaaa"bbb"` и `extractKeyValuePairs` затем выдаст: `a: aaaa`
- Последующее экранирование: `extractKeyValuePairs` выдаст `a: aaaa\` и последующее экранирование оставит его без изменений.

Ведущие эскейп-последовательности будут пропущены в ключах и будут считаться недопустимыми для значений.

**Примеры**

Эскейп-последовательности с поддержкой эскейп-последовательностей:

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

Аргументы - [карты](../data-types/map.md) или [кортежи](/sql-reference/data-types/tuple) из двух [массивов](/sql-reference/data-types/array), где элементы в первом массиве представляют ключи, а второй массив содержит значения для каждого ключа. Все массивы ключей должны иметь один и тот же тип, а все массивы значений должны содержать элементы, которые приводятся к одному типу ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) или [Float64](/sql-reference/data-types/float)). Общий приведенный тип используется в качестве типа для результирующего массива.

**Возвращаемое значение**

- В зависимости от аргументов возвращает одну [карта](../data-types/map.md) или [кортеж](/sql-reference/data-types/tuple), в котором первый массив содержит отсортированные ключи, а второй массив содержит значения.

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

Аргументы - [карты](../data-types/map.md) или [кортежи](/sql-reference/data-types/tuple) из двух [массивов](/sql-reference/data-types/array), где элементы в первом массиве представляют ключи, а второй массив содержит значения для каждого ключа. Все массивы ключей должны иметь один и тот же тип, а все массивы значений должны содержать элементы, которые приводятся к одному типу ([Int64](/sql-reference/data-types/int-uint#integer-ranges), [UInt64](/sql-reference/data-types/int-uint#integer-ranges) или [Float64](/sql-reference/data-types/float)). Общий приведенный тип используется в качестве типа для результирующего массива.

**Возвращаемое значение**

- В зависимости от аргументов возвращает одну [карта](../data-types/map.md) или [кортеж](/sql-reference/data-types/tuple), в котором первый массив содержит отсортированные ключи, а второй массив содержит значения.

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

Запрос с кортежем map:

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

Заполняет отсутствующие пары ключ-значение в карте с целочисленными ключами.
Чтобы поддерживать расширение ключей за пределы наибольшего значения, можно указать максимальный ключ.
Более конкретно, функция возвращает карту, в которой ключи образуют ряд от наименьшего до наибольшего ключа (или параметра `max`, если он указан) с шагом 1 и соответствующими значениями.
Если значение не указано для ключа, используется значение по умолчанию.
В случае повторяющихся ключей только первое значение (в порядке появления) ассоциируется с ключом.

**Синтаксис**

```sql
mapPopulateSeries(map[, max])
mapPopulateSeries(keys, values[, max])
```

Для массива аргументов количество элементов в `keys` и `values` должно быть одинаковым для каждой строки.

**Аргументы**

Аргументы - [Map](../data-types/map.md) или два [Array](/sql-reference/data-types/array), где первый и второй массивы содержат ключи и значения для каждого ключа.

Сопоставленные массивы:

- `map` — Карта с целочисленными ключами. [Map](../data-types/map.md).

или

- `keys` — Массив ключей. [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges)).
- `values` — Массив значений. [Array](/sql-reference/data-types/array)([Int](/sql-reference/data-types/int-uint#integer-ranges)).
- `max` — Максимальное значение ключа. Необязательный. [Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint#integer-ranges).

**Возвращаемое значение**

- В зависимости от аргументов [Map](../data-types/map.md) или [Tuple](/sql-reference/data-types/tuple) из двух [Array](/sql-reference/data-types/array): ключи в отсортированном порядке и значения соответствующих ключей.

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

Возвращает ключи заданной карты.

Эта функция может быть оптимизирована, включив настройку [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns).
При включенной настройке функция читает только подколонку [keys](/sql-reference/data-types/map#reading-subcolumns-of-map) вместо всей карты.
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

## mapContains {#mapcontains}

Возвращает, содержится ли данный ключ в данной карте.

**Синтаксис**

```sql
mapContains(map, key)
```

Псевдоним: `mapContainsKey(map, key)`

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

## mapContainsKeyLike {#mapcontainskeylike}

**Синтаксис**

```sql
mapContainsKeyLike(map, pattern)
```

**Аргументы**
- `map` — Map. [Map](../data-types/map.md).
- `pattern`  - Шаблон строки для сопоставления.

**Возвращаемое значение**

- `1`, если `map` содержит `key`, соответствующий указанному шаблону, `0`, если нет.

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

Данная функция возвращает карту с элементами, где ключ соответствует шаблону, для карты со строковыми ключами и шаблоном LIKE.

**Синтаксис**

```sql
mapExtractKeyLike(map, pattern)
```

**Аргументы**

- `map` — Map. [Map](../data-types/map.md).
- `pattern`  - Шаблон строки для сопоставления.

**Возвращаемое значение**

- Карта, содержащая элементы, ключи которых соответствуют указанному шаблону. Если элементы не соответствуют шаблону, возвращается пустая карта.

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

Возвращает значения данной карты.

Эта функция может быть оптимизирована, включив настройку [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns).
При включенной настройке функция читает только подколонку [values](/sql-reference/data-types/map#reading-subcolumns-of-map) вместо всей карты.
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

## mapContainsValue {#mapcontainsvalue}

Возвращает, содержится ли данное значение в данной карте.

**Синтаксис**

```sql
mapContainsValue(map, value)
```

Псевдоним: `mapContainsValue(map, value)`

**Аргументы**

- `map` — Map. [Map](../data-types/map.md).
- `value` — Значение. Тип должен соответствовать типу значения `map`.

**Возвращаемое значение**

- `1`, если `map` содержит `value`, `0`, если нет. [UInt8](../data-types/int-uint.md).

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
- `map` — Map. [Map](../data-types/map.md).
- `pattern`  - Шаблон строки для сопоставления.

**Возвращаемое значение**

- `1`, если `map` содержит `value`, соответствующий указанному шаблону, `0`, если нет.

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

Данная функция возвращает карту с элементами, где значение соответствует шаблону, для карты со строковыми значениями и шаблоном LIKE.

**Синтаксис**

```sql
mapExtractValueLike(map, pattern)
```

**Аргументы**

- `map` — Map. [Map](../data-types/map.md).
- `pattern`  - Шаблон строки для сопоставления.

**Возвращаемое значение**

- Карта, содержащая элементы, значения которых соответствуют указанному шаблону. Если элементы не соответствуют шаблону, возвращается пустая карта.

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

- `func` — [Лямбда-функция](/sql-reference/functions/overview#higher-order-functions).
- `map` — [Map](../data-types/map.md).

**Возвращаемое значение**

- Возвращает карту, полученную из исходной карты путем применения `func(map1[i], ..., mapN[i])` для каждого элемента.

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

Фильтрует карту путем применения функции к каждому элементу карты.

**Синтаксис**

```sql
mapFilter(func, map)
```

**Аргументы**

- `func`  - [Лямбда-функция](/sql-reference/functions/overview#higher-order-functions).
- `map` — [Map](../data-types/map.md).

**Возвращаемое значение**

- Возвращает карту, содержащую только элементы из `map`, для которых `func(map1[i], ..., mapN[i])` возвращает что-то, отличное от 0.

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

- Возвращает `map1` с обновленными значениями по соответствующим ключам в `map2`.

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

Конкатенирует несколько карт на основе равенства их ключей.
Если элементы с одинаковым ключом существуют в более чем одной входной карте, все элементы добавляются в результирующую карту, но только первый из них доступен через оператор `[]`.

**Синтаксис**

```sql
mapConcat(maps)
```

**Аргументы**

-   `maps` – Произвольное количество [Maps](../data-types/map.md).

**Возвращаемое значение**

- Возвращает карту с конкатенированными картами, переданными в качестве аргументов.

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

Возвращает 1, если существует хотя бы одна пара ключ-значение в `map`, для которой `func(key, value)` возвращает что-то, отличное от 0. В противном случае возвращает 0.

:::note
`mapExists` является [высшего порядка функцией](/sql-reference/functions/overview#higher-order-functions).
Вы можете передать лямбда-функцию в качестве первого аргумента.
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

Возвращает 1, если `func(key, value)` возвращает что-то, отличное от 0 для всех пар ключ-значение в `map`. В противном случае возвращает 0.

:::note
Обратите внимание, что `mapAll` является [высшего порядка функцией](/sql-reference/functions/overview#higher-order-functions).
Вы можете передать лямбда-функцию в качестве первого аргумента.
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

Сортирует элементы карты в порядке возрастания.
Если функция `func` указана, порядок сортировки определяется результатом применения функции `func` к ключам и значениям карты.

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

Для получения дополнительной информации см. [справку](/sql-reference/functions/array-functions#arraySort) для функции `arraySort`.

## mapPartialSort {#mappartialsort}

Сортирует элементы карты в порядке возрастания с дополнительным аргументом `limit`, позволяющим частичную сортировку. 
Если функция `func` указана, порядок сортировки определяется результатом применения функции `func` к ключам и значениям карты.

**Синтаксис**

```sql
mapPartialSort([func,] limit, map)
```
**Аргументы**

- `func` – Необязательная функция для применения к ключам и значениям карты. [Лямбда-функция](/sql-reference/functions/overview#higher-order-functions).
- `limit` – Элементы в диапазоне [1..limit] сортируются. [(U)Int](../data-types/int-uint.md).
- `map` – Карта для сортировки. [Map](../data-types/map.md).

**Возвращаемое значение**

- Частично отсортированная карта. [Map](../data-types/map.md).

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

Сортирует элементы карты в порядке убывания.
Если функция `func` указана, порядок сортировки определяется результатом применения функции `func` к ключам и значениям карты.

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

Для получения дополнительной информации см. функцию [arrayReverseSort](/sql-reference/functions/array-functions#arrayReverseSort).

## mapPartialReverseSort {#mappartialreversesort}

Сортирует элементы карты в порядке убывания с дополнительным аргументом `limit`, позволяющим частичную сортировку.
Если функция `func` указана, порядок сортировки определяется результатом применения функции `func` к ключам и значениям карты.

**Синтаксис**

```sql
mapPartialReverseSort([func,] limit, map)
```
**Аргументы**

- `func` – Необязательная функция для применения к ключам и значениям карты. [Лямбда-функция](/sql-reference/functions/overview#higher-order-functions).
- `limit` – Элементы в диапазоне [1..limit] сортируются. [(U)Int](../data-types/int-uint.md).
- `map` – Карта для сортировки. [Map](../data-types/map.md).

**Возвращаемое значение**

- Частично отсортированная карта. [Map](../data-types/map.md).

**Пример**

```sql
SELECT mapPartialReverseSort((k, v) -> v, 2, map('k1', 3, 'k2', 1, 'k3', 2));
```

```text
┌─mapPartialReverseSort(lambda(tuple(k, v), v), 2, map('k1', 3, 'k2', 1, 'k3', 2))─┐
│ {'k1':3,'k3':2,'k2':1}                                                           │
└──────────────────────────────────────────────────────────────────────────────────┘
```