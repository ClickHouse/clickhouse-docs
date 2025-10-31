---
slug: '/sql-reference/functions/tuple-functions'
sidebar_label: Кортежи
description: 'Документация для Tuple Functions'
title: 'Функции кортежей'
doc_type: reference
---
## tuple {#tuple}

Функция, которая позволяет группировать несколько колонок. Для колонок `C1, C2, ...` с типами `T1, T2, ...,` она возвращает `Tuple(T1, T2, ...)`. Если настройка [`enable_named_columns_in_function_tuple`](/operations/settings/settings#enable_named_columns_in_function_tuple) включена, то она возвращает `Tuple(C1 T1, C2 T2, ...)`, содержащую эти колонки, если их имена уникальны и могут рассматриваться как неквотированные идентификаторы. Выполнение функции не несет никаких затрат. Кортежи обычно используются как промежуточные значения для аргумента операторов IN или для создания списка формальных параметров лямбда-функций. Кортежи нельзя записывать в таблицу.

Функция реализует оператор `(x, y, ...)`.

**Синтаксис**

```sql
tuple(x, y, ...)
```

## tupleElement {#tupleelement}

Функция, которая позволяет получить колонку из кортежа.

Если второй аргумент — это число `index`, то это индекс колонки, начиная с 1. Если второй аргумент — строка `name`, то это имя элемента. Кроме того, мы можем предоставить третий необязательный аргумент, чтобы в случае выхода индекса за пределы или отсутствия элемента с заданным именем возвращалось значение по умолчанию вместо выбрасывания исключения. Второй и третий аргументы, если они указаны, должны быть константами. Выполнение функции не несет никаких затрат.

Функция реализует операторы `x.index` и `x.name`.

**Синтаксис**

```sql
tupleElement(tuple, index, [, default_value])
tupleElement(tuple, name, [, default_value])
```

## untuple {#untuple}

Выполняет синтаксическую замену элементов [tuple](/sql-reference/data-types/tuple) в месте вызова.

Имена результирующих колонок зависят от конкретной реализации и могут изменяться. Не следует предполагать конкретные имена колонок после `untuple`.

**Синтаксис**

```sql
untuple(x)
```

Вы можете использовать выражение `EXCEPT`, чтобы пропустить колонки в результате запроса.

**Аргументы**

- `x` — Функция `tuple`, колонка или кортеж элементов. [Tuple](../data-types/tuple.md).

**Возвращаемое значение**

- Ничего.

**Примеры**

Входная таблица:

```text
┌─key─┬─v1─┬─v2─┬─v3─┬─v4─┬─v5─┬─v6────────┐
│   1 │ 10 │ 20 │ 40 │ 30 │ 15 │ (33,'ab') │
│   2 │ 25 │ 65 │ 70 │ 40 │  6 │ (44,'cd') │
│   3 │ 57 │ 30 │ 20 │ 10 │  5 │ (55,'ef') │
│   4 │ 55 │ 12 │  7 │ 80 │ 90 │ (66,'gh') │
│   5 │ 30 │ 50 │ 70 │ 25 │ 55 │ (77,'kl') │
└─────┴────┴────┴────┴────┴────┴───────────┘
```

Пример использования колонки типа `Tuple` в качестве параметра функции `untuple`:

Запрос:

```sql
SELECT untuple(v6) FROM kv;
```

Результат:

```text
┌─_ut_1─┬─_ut_2─┐
│    33 │ ab    │
│    44 │ cd    │
│    55 │ ef    │
│    66 │ gh    │
│    77 │ kl    │
└───────┴───────┘
```

Пример использования выражения `EXCEPT`:

Запрос:

```sql
SELECT untuple((* EXCEPT (v2, v3),)) FROM kv;
```

Результат:

```text
┌─key─┬─v1─┬─v4─┬─v5─┬─v6────────┐
│   1 │ 10 │ 30 │ 15 │ (33,'ab') │
│   2 │ 25 │ 40 │  6 │ (44,'cd') │
│   3 │ 57 │ 10 │  5 │ (55,'ef') │
│   4 │ 55 │ 80 │ 90 │ (66,'gh') │
│   5 │ 30 │ 25 │ 55 │ (77,'kl') │
└─────┴────┴────┴────┴───────────┘
```

**См. Также**

- [Tuple](../data-types/tuple.md)

## tupleHammingDistance {#tuplehammingdistance}

Возвращает [расстояние Хэмминга](https://en.wikipedia.org/wiki/Hamming_distance) между двумя кортежами одинакового размера.

**Синтаксис**

```sql
tupleHammingDistance(tuple1, tuple2)
```

**Аргументы**

- `tuple1` — Первый кортеж. [Tuple](../data-types/tuple.md).
- `tuple2` — Второй кортеж. [Tuple](../data-types/tuple.md).

Кортежи должны иметь одинаковый тип элементов.

**Возвращаемое значение**

- Расстояние Хэмминга.

:::note
Тип результата рассчитывается так же, как для [Арифметических функций](../../sql-reference/functions/arithmetic-functions.md), на основе количества элементов во входных кортежах.
:::

```sql
SELECT
    toTypeName(tupleHammingDistance(tuple(0), tuple(0))) AS t1,
    toTypeName(tupleHammingDistance((0, 0), (0, 0))) AS t2,
    toTypeName(tupleHammingDistance((0, 0, 0), (0, 0, 0))) AS t3,
    toTypeName(tupleHammingDistance((0, 0, 0, 0), (0, 0, 0, 0))) AS t4,
    toTypeName(tupleHammingDistance((0, 0, 0, 0, 0), (0, 0, 0, 0, 0))) AS t5
```

```text
┌─t1────┬─t2─────┬─t3─────┬─t4─────┬─t5─────┐
│ UInt8 │ UInt16 │ UInt32 │ UInt64 │ UInt64 │
└───────┴────────┴────────┴────────┴────────┘
```

**Примеры**

Запрос:

```sql
SELECT tupleHammingDistance((1, 2, 3), (3, 2, 1)) AS HammingDistance;
```

Результат:

```text
┌─HammingDistance─┐
│               2 │
└─────────────────┘
```

Может быть использовано с функциями [MinHash](../../sql-reference/functions/hash-functions.md#ngramMinHash) для обнаружения полуповторяющихся строк:

```sql
SELECT tupleHammingDistance(wordShingleMinHash(string), wordShingleMinHashCaseInsensitive(string)) AS HammingDistance
FROM (SELECT 'ClickHouse is a column-oriented database management system for online analytical processing of queries.' AS string);
```

Результат:

```text
┌─HammingDistance─┐
│               2 │
└─────────────────┘
```

## tupleToNameValuePairs {#tupletonamevaluepairs}

Преобразует именованный кортеж в массив пар (имя, значение). Для `Tuple(a T, b T, ..., c T)` возвращается `Array(Tuple(String, T), ...)`, в котором `Strings` представляют именованные поля кортежа, а `T` — значения, связанные с этими именами. Все значения в кортеже должны быть одного типа.

**Синтаксис**

```sql
tupleToNameValuePairs(tuple)
```

**Аргументы**

- `tuple` — Именованный кортеж. [Tuple](../data-types/tuple.md) с любыми типами значений.

**Возвращаемое значение**

- Массив с парами (имя, значение). [Array](../data-types/array.md)([Tuple](../data-types/tuple.md)([String](../data-types/string.md), ...)).

**Пример**

Запрос:

```sql
CREATE TABLE tupletest (col Tuple(user_ID UInt64, session_ID UInt64)) ENGINE = Memory;

INSERT INTO tupletest VALUES (tuple( 100, 2502)), (tuple(1,100));

SELECT tupleToNameValuePairs(col) FROM tupletest;
```

Результат:

```text
┌─tupleToNameValuePairs(col)────────────┐
│ [('user_ID',100),('session_ID',2502)] │
│ [('user_ID',1),('session_ID',100)]    │
└───────────────────────────────────────┘
```

С помощью этой функции можно преобразовать колонки в строки:

```sql
CREATE TABLE tupletest (col Tuple(CPU Float64, Memory Float64, Disk Float64)) ENGINE = Memory;

INSERT INTO tupletest VALUES(tuple(3.3, 5.5, 6.6));

SELECT arrayJoin(tupleToNameValuePairs(col)) FROM tupletest;
```

Результат:

```text
┌─arrayJoin(tupleToNameValuePairs(col))─┐
│ ('CPU',3.3)                           │
│ ('Memory',5.5)                        │
│ ('Disk',6.6)                          │
└───────────────────────────────────────┘
```

Если вы передадите простой кортеж в функцию, ClickHouse использует индексы значений в качестве их имен:

```sql
SELECT tupleToNameValuePairs(tuple(3, 2, 1));
```

Результат:

```text
┌─tupleToNameValuePairs(tuple(3, 2, 1))─┐
│ [('1',3),('2',2),('3',1)]             │
└───────────────────────────────────────┘
```

## tupleNames {#tuplenames}

Преобразует кортеж в массив имен колонок. Для кортежа в форме `Tuple(a T, b T, ...)` возвращается массив строк, представляющих именованные колонки кортежа. Если элементы кортежа не имеют явных имен, то вместо этого будут использоваться их индексы как имена колонок.

**Синтаксис**

```sql
tupleNames(tuple)
```

**Аргументы**

- `tuple` — Именованный кортеж. [Tuple](../../sql-reference/data-types/tuple.md) с любыми типами значений.

**Возвращаемое значение**

- Массив со строками.

Тип: [Array](../../sql-reference/data-types/array.md)([Tuple](../../sql-reference/data-types/tuple.md)([String](../../sql-reference/data-types/string.md), ...)).

**Пример**

Запрос:

```sql
CREATE TABLE tupletest (col Tuple(user_ID UInt64, session_ID UInt64)) ENGINE = Memory;

INSERT INTO tupletest VALUES (tuple(1, 2));

SELECT tupleNames(col) FROM tupletest;
```

Результат:

```text
┌─tupleNames(col)──────────┐
│ ['user_ID','session_ID'] │
└──────────────────────────┘
```

Если вы передадите простой кортеж в функцию, ClickHouse использует индексы колонок в качестве их имен:

```sql
SELECT tupleNames(tuple(3, 2, 1));
```

Результат:

```text
┌─tupleNames((3, 2, 1))─┐
│ ['1','2','3']         │
└───────────────────────┘
```

## tuplePlus {#tupleplus}

Вызывает сумму соответствующих значений двух кортежей одинакового размера.

**Синтаксис**

```sql
tuplePlus(tuple1, tuple2)
```

Псевдоним: `vectorSum`.

**Аргументы**

- `tuple1` — Первый кортеж. [Tuple](../data-types/tuple.md).
- `tuple2` — Второй кортеж. [Tuple](../data-types/tuple.md).

**Возвращаемое значение**

- Кортеж с суммой. [Tuple](../data-types/tuple.md).

**Пример**

Запрос:

```sql
SELECT tuplePlus((1, 2), (2, 3));
```

Результат:

```text
┌─tuplePlus((1, 2), (2, 3))─┐
│ (3,5)                     │
└───────────────────────────┘
```

## tupleMinus {#tupleminus}

Вычисляет вычитание соответствующих значений двух кортежей одинакового размера.

**Синтаксис**

```sql
tupleMinus(tuple1, tuple2)
```

Псевдоним: `vectorDifference`.

**Аргументы**

- `tuple1` — Первый кортеж. [Tuple](../data-types/tuple.md).
- `tuple2` — Второй кортеж. [Tuple](../data-types/tuple.md).

**Возвращаемое значение**

- Кортеж с результатом вычитания. [Tuple](../data-types/tuple.md).

**Пример**

Запрос:

```sql
SELECT tupleMinus((1, 2), (2, 3));
```

Результат:

```text
┌─tupleMinus((1, 2), (2, 3))─┐
│ (-1,-1)                    │
└────────────────────────────┘
```

## tupleMultiply {#tuplemultiply}

Вычисляет умножение соответствующих значений двух кортежей одинакового размера.

**Синтаксис**

```sql
tupleMultiply(tuple1, tuple2)
```

**Аргументы**

- `tuple1` — Первый кортеж. [Tuple](../data-types/tuple.md).
- `tuple2` — Второй кортеж. [Tuple](../data-types/tuple.md).

**Возвращаемое значение**

- Кортеж с произведением. [Tuple](../data-types/tuple.md).

**Пример**

Запрос:

```sql
SELECT tupleMultiply((1, 2), (2, 3));
```

Результат:

```text
┌─tupleMultiply((1, 2), (2, 3))─┐
│ (2,6)                         │
└───────────────────────────────┘
```

## tupleDivide {#tupledivide}

Вычисляет деление соответствующих значений двух кортежей одинакового размера. Обратите внимание, что деление на ноль вернет `inf`.

**Синтаксис**

```sql
tupleDivide(tuple1, tuple2)
```

**Аргументы**

- `tuple1` — Первый кортеж. [Tuple](../data-types/tuple.md).
- `tuple2` — Второй кортеж. [Tuple](../data-types/tuple.md).

**Возвращаемое значение**

- Кортеж с результатом деления. [Tuple](../data-types/tuple.md).

**Пример**

Запрос:

```sql
SELECT tupleDivide((1, 2), (2, 3));
```

Результат:

```text
┌─tupleDivide((1, 2), (2, 3))─┐
│ (0.5,0.6666666666666666)    │
└─────────────────────────────┘
```

## tupleNegate {#tuplenegate}

Вычисляет отрицание значений кортежа.

**Синтаксис**

```sql
tupleNegate(tuple)
```

**Аргументы**

- `tuple` — [Tuple](../data-types/tuple.md).

**Возвращаемое значение**

- Кортеж с результатом отрицания. [Tuple](../data-types/tuple.md).

**Пример**

Запрос:

```sql
SELECT tupleNegate((1,  2));
```

Результат:

```text
┌─tupleNegate((1, 2))─┐
│ (-1,-2)             │
└─────────────────────┘
```

## tupleMultiplyByNumber {#tuplemultiplybynumber}

Возвращает кортеж со всеми значениями, умноженными на число.

**Синтаксис**

```sql
tupleMultiplyByNumber(tuple, number)
```

**Аргументы**

- `tuple` — [Tuple](../data-types/tuple.md).
- `number` — Множитель. [Int/UInt](../data-types/int-uint.md), [Float](../data-types/float.md) или [Decimal](../data-types/decimal.md).

**Возвращаемое значение**

- Кортеж с умноженными значениями. [Tuple](../data-types/tuple.md).

**Пример**

Запрос:

```sql
SELECT tupleMultiplyByNumber((1, 2), -2.1);
```

Результат:

```text
┌─tupleMultiplyByNumber((1, 2), -2.1)─┐
│ (-2.1,-4.2)                         │
└─────────────────────────────────────┘
```

## tupleDivideByNumber {#tupledividebynumber}

Возвращает кортеж со всеми значениями, деленными на число. Обратите внимание, что деление на ноль вернет `inf`.

**Синтаксис**

```sql
tupleDivideByNumber(tuple, number)
```

**Аргументы**

- `tuple` — [Tuple](../data-types/tuple.md).
- `number` — Делитель. [Int/UInt](../data-types/int-uint.md), [Float](../data-types/float.md) или [Decimal](../data-types/decimal.md).

**Возвращаемое значение**

- Кортеж с деленными значениями. [Tuple](../data-types/tuple.md).

**Пример**

Запрос:

```sql
SELECT tupleDivideByNumber((1, 2), 0.5);
```

Результат:

```text
┌─tupleDivideByNumber((1, 2), 0.5)─┐
│ (2,4)                            │
└──────────────────────────────────┘
```

## tupleConcat {#tupleconcat}

Объединяет кортежи, переданные в качестве аргументов.

```sql
tupleConcat(tuples)
```

**Аргументы**

- `tuples` – Произвольное количество аргументов типа [Tuple](../data-types/tuple.md).

**Пример**

```sql
SELECT tupleConcat((1, 2), (3, 4), (true, false)) AS res
```

```text
┌─res──────────────────┐
│ (1,2,3,4,true,false) │
└──────────────────────┘
```

## tupleIntDiv {#tupleintdiv}

Выполняет целочисленное деление кортежа числителей и кортежа делителей и возвращает кортеж частных.

**Синтаксис**

```sql
tupleIntDiv(tuple_num, tuple_div)
```

**Параметры**

- `tuple_num`: Кортеж значений числителей. [Tuple](../data-types/tuple) числового типа.
- `tuple_div`: Кортеж значений делителей. [Tuple](../data-types/tuple) числового типа.

**Возвращаемое значение**

- Кортеж частных от `tuple_num` и `tuple_div`. [Tuple](../data-types/tuple) целочисленных значений.

**Детали реализации**

- Если хотя бы один из `tuple_num` или `tuple_div` содержит нецелочисленные значения, результат рассчитывается, округляя каждое нецелочисленное значение числителя или делителя до ближайшего целого.
- Будет вызвано исключение за деление на 0.

**Примеры**

Запрос:

```sql
SELECT tupleIntDiv((15, 10, 5), (5, 5, 5));
```

Результат:

```text
┌─tupleIntDiv((15, 10, 5), (5, 5, 5))─┐
│ (3,2,1)                             │
└─────────────────────────────────────┘
```

Запрос:

```sql
SELECT tupleIntDiv((15, 10, 5), (5.5, 5.5, 5.5));
```

Результат:

```text
┌─tupleIntDiv((15, 10, 5), (5.5, 5.5, 5.5))─┐
│ (2,1,0)                                   │
└───────────────────────────────────────────┘
```

## tupleIntDivOrZero {#tupleintdivorzero}

Как [tupleIntDiv](#tupleintdiv), он выполняет целочисленное деление кортежа числителей и кортежа делителей и возвращает кортеж частных. Он не вызывает ошибку за 0 в качестве делителя, а возвращает частное равным 0.

**Синтаксис**

```sql
tupleIntDivOrZero(tuple_num, tuple_div)
```

- `tuple_num`: Кортеж значений числителей. [Tuple](../data-types/tuple) числового типа.
- `tuple_div`: Кортеж значений делителей. [Tuple](../data-types/tuple) числового типа.

**Возвращаемое значение**

- Кортеж частных от `tuple_num` и `tuple_div`. [Tuple](../data-types/tuple) целочисленных значений.
- Возвращает 0 для частных, где делитель равен 0.

**Детали реализации**

- Если хотя бы один из `tuple_num` или `tuple_div` содержит нецелочисленные значения, результат рассчитывается, округляя каждое нецелочисленное значение числителя или делителя до ближайшего целого, как в [tupleIntDiv](#tupleintdiv).

**Примеры**

Запрос:

```sql
SELECT tupleIntDivOrZero((5, 10, 15), (0, 0, 0));
```

Результат:

```text
┌─tupleIntDivOrZero((5, 10, 15), (0, 0, 0))─┐
│ (0,0,0)                                   │
└───────────────────────────────────────────┘
```

## tupleIntDivByNumber {#tupleintdivbynumber}

Выполняет целочисленное деление кортежа числителей на данный делитель и возвращает кортеж частных.

**Синтаксис**

```sql
tupleIntDivByNumber(tuple_num, div)
```

**Параметры**

- `tuple_num`: Кортеж значений числителей. [Tuple](../data-types/tuple) числового типа.
- `div`: Значение делителя. [Numeric](../data-types/int-uint.md) тип.

**Возвращаемое значение**

- Кортеж частных от `tuple_num` и `div`. [Tuple](../data-types/tuple) целочисленных значений.

**Детали реализации**

- Если хотя бы один из `tuple_num` или `div` содержит нецелочисленные значения, результат рассчитывается, округляя каждое нецелочисленное значение числителя или делителя до ближайшего целого.
- Будет вызвано исключение за деление на 0.

**Примеры**

Запрос:

```sql
SELECT tupleIntDivByNumber((15, 10, 5), 5);
```

Результат:

```text
┌─tupleIntDivByNumber((15, 10, 5), 5)─┐
│ (3,2,1)                             │
└─────────────────────────────────────┘
```

Запрос:

```sql
SELECT tupleIntDivByNumber((15.2, 10.7, 5.5), 5.8);
```

Результат:

```text
┌─tupleIntDivByNumber((15.2, 10.7, 5.5), 5.8)─┐
│ (2,1,0)                                     │
└─────────────────────────────────────────────┘
```

## tupleIntDivOrZeroByNumber {#tupleintdivorzerobynumber}

Как [tupleIntDivByNumber](#tupleintdivbynumber), он выполняет целочисленное деление кортежа числителей на данный делитель и возвращает кортеж частных. Он не вызывает ошибку за 0 в качестве делителя, а возвращает частное равным 0.

**Синтаксис**

```sql
tupleIntDivOrZeroByNumber(tuple_num, div)
```

**Параметры**

- `tuple_num`: Кортеж значений числителей. [Tuple](../data-types/tuple) числового типа.
- `div`: Значение делителя. [Numeric](../data-types/int-uint.md) тип.

**Возвращаемое значение**

- Кортеж частных от `tuple_num` и `div`. [Tuple](../data-types/tuple) целочисленных значений.
- Возвращает 0 для частных, где делитель равен 0.

**Детали реализации**

- Если хотя бы один из `tuple_num` или `div` содержит нецелочисленные значения, результат рассчитывается, округляя каждое нецелочисленное значение числителя или делителя до ближайшего целого, как в [tupleIntDivByNumber](#tupleintdivbynumber).

**Примеры**

Запрос:

```sql
SELECT tupleIntDivOrZeroByNumber((15, 10, 5), 5);
```

Результат:

```text
┌─tupleIntDivOrZeroByNumber((15, 10, 5), 5)─┐
│ (3,2,1)                                   │
└───────────────────────────────────────────┘
```

Запрос:

```sql
SELECT tupleIntDivOrZeroByNumber((15, 10, 5), 0)
```

Результат:

```text
┌─tupleIntDivOrZeroByNumber((15, 10, 5), 0)─┐
│ (0,0,0)                                   │
└───────────────────────────────────────────┘
```

## tupleModulo {#tuplemodulo}

Возвращает кортеж остатков (остатков) от операции деления двух кортежей.

**Синтаксис**

```sql
tupleModulo(tuple_num, tuple_mod)
```

**Параметры**

- `tuple_num`: Кортеж значений числителей. [Tuple](../data-types/tuple) числового типа.
- `tuple_div`: Кортеж значений делителей. [Tuple](../data-types/tuple) числового типа.

**Возвращаемое значение**

- Кортеж остатков от деления `tuple_num` и `tuple_div`. [Tuple](../data-types/tuple) ненулевых целочисленных значений.
- Будет вызвано исключение за деление на 0.

**Примеры**

Запрос:

```sql
SELECT tupleModulo((15, 10, 5), (5, 3, 2));
```

Результат:

```text
┌─tupleModulo((15, 10, 5), (5, 3, 2))─┐
│ (0,1,1)                             │
└─────────────────────────────────────┘
```

## tupleModuloByNumber {#tuplemodulobynumber}

Возвращает кортеж остатков (остатков) от операции деления кортежа и данного делителя.

**Синтаксис**

```sql
tupleModuloByNumber(tuple_num, div)
```

**Параметры**

- `tuple_num`: Кортеж значений числителей. [Tuple](../data-types/tuple) числового типа.
- `div`: Значение делителя. [Numeric](../data-types/int-uint.md) тип.

**Возвращаемое значение**

- Кортеж остатков от деления `tuple_num` и `div`. [Tuple](../data-types/tuple) ненулевых целочисленных значений.
- Будет вызвано исключение за деление на 0.

**Примеры**

Запрос:

```sql
SELECT tupleModuloByNumber((15, 10, 5), 2);
```

Результат:

```text
┌─tupleModuloByNumber((15, 10, 5), 2)─┐
│ (1,0,1)                             │
└─────────────────────────────────────┘
```

## flattenTuple {#flattentuple}

Возвращает сглаженный кортеж `output` из вложенного именованного кортежа `input`. Элементы кортежа `output` — это пути из оригинального кортежа `input`. Например: `Tuple(a Int, Tuple(b Int, c Int)) -> Tuple(a Int, b Int, c Int)`. `flattenTuple` можно использовать для выбора всех путей из типа `Object` в качестве отдельных колонок.

**Синтаксис**

```sql
flattenTuple(input)
```

**Параметры**

- `input`: Вложенный именованный кортеж для сглаживания. [Tuple](../data-types/tuple).

**Возвращаемое значение**

- Кортеж `output`, элементы которого — это пути из оригинального `input`. [Tuple](../data-types/tuple).

**Пример**

Запрос:

```sql
CREATE TABLE t_flatten_tuple(t Tuple(t1 Nested(a UInt32, s String), b UInt32, t2 Tuple(k String, v UInt32))) ENGINE = Memory;
INSERT INTO t_flatten_tuple VALUES (([(1, 'a'), (2, 'b')], 3, ('c', 4)));
SELECT flattenTuple(t) FROM t_flatten_tuple;
```

Результат:

```text
┌─flattenTuple(t)───────────┐
│ ([1,2],['a','b'],3,'c',4) │
└───────────────────────────┘
```

## Distance functions {#distance-functions}

Все поддерживаемые функции описаны в [документации функций расстояния](../../sql-reference/functions/distance-functions.md).

<!-- 
The inner content of the tags below are replaced at doc framework build time with 
docs generated from system.functions. Please do not modify or remove the tags.
See: https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->