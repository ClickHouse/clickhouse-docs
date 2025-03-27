---
description: 'Документация по битовым функциям'
sidebar_label: 'Бит'
sidebar_position: 20
slug: /sql-reference/functions/bit-functions
title: 'Битовые функции'
---


# Битовые функции

Битовые функции работают с любыми парами типов из `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Int8`, `Int16`, `Int32`, `Int64`, `Float32` или `Float64`. Некоторые функции поддерживают типы `String` и `FixedString`.

Тип результата — это целое число с битами, равными максимальному количеству битов его аргументов. Если хотя бы один из аргументов имеет знак, результат будет знаковым числом. Если аргумент является числом с плавающей запятой, оно приводится к Int64.

## bitAnd(a, b) {#bitanda-b}

## bitOr(a, b) {#bitora-b}

## bitXor(a, b) {#bitxora-b}

## bitNot(a) {#bitnota}

## bitShiftLeft(a, b) {#bitshiftlefta-b}

Сдвигает бинарное представление значения влево на заданное количество битов.

`FixedString` или `String` рассматриваются как одно многобайтовое значение.

Биты значения `FixedString` теряются по мере сдвига. Напротив, значение `String` дополняется дополнительными байтами, поэтому никакие биты не теряются.

**Синтаксис**

```sql
bitShiftLeft(a, b)
```

**Аргументы**

- `a` — Значение для сдвига. [Целочисленные типы](../data-types/int-uint.md), [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `b` — Количество позиций сдвига. Разрешены [Беззнаковые целочисленные типы](../data-types/int-uint.md), типы размером 64 бита или меньше.

**Возвращаемое значение**

- Сдвинутое значение.

Тип возвращаемого значения такой же, как тип входного значения.

**Пример**

В следующих запросах используются функции [bin](encoding-functions.md#bin) и [hex](encoding-functions.md#hex) для отображения битов сдвинутых значений.

```sql
SELECT 99 AS a, bin(a), bitShiftLeft(a, 2) AS a_shifted, bin(a_shifted);
SELECT 'abc' AS a, hex(a), bitShiftLeft(a, 4) AS a_shifted, hex(a_shifted);
SELECT toFixedString('abc', 3) AS a, hex(a), bitShiftLeft(a, 4) AS a_shifted, hex(a_shifted);
```

Результат:

```text
┌──a─┬─bin(99)──┬─a_shifted─┬─bin(bitShiftLeft(99, 2))─┐
│ 99 │ 01100011 │       140 │ 10001100                 │
└────┴──────────┴───────────┴──────────────────────────┘
┌─a───┬─hex('abc')─┬─a_shifted─┬─hex(bitShiftLeft('abc', 4))─┐
│ abc │ 616263     │ &0        │ 06162630                    │
└─────┴────────────┴───────────┴─────────────────────────────┘
┌─a───┬─hex(toFixedString('abc', 3))─┬─a_shifted─┬─hex(bitShiftLeft(toFixedString('abc', 3), 4))─┐
│ abc │ 616263                       │ &0        │ 162630                                        │
└─────┴──────────────────────────────┴───────────┴───────────────────────────────────────────────┘
```

## bitShiftRight(a, b) {#bitshiftrighta-b}

Сдвигает бинарное представление значения вправо на заданное количество битов.

`FixedString` или `String` рассматриваются как одно многобайтовое значение. Обратите внимание, что длина значения `String` уменьшается по мере сдвига битов.

**Синтаксис**

```sql
bitShiftRight(a, b)
```

**Аргументы**

- `a` — Значение для сдвига. [Целочисленные типы](../data-types/int-uint.md), [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `b` — Количество позиций сдвига. Разрешены [Беззнаковые целочисленные типы](../data-types/int-uint.md), типы размером 64 бита или меньше.

**Возвращаемое значение**

- Сдвинутое значение.

Тип возвращаемого значения такой же, как тип входного значения.

**Пример**

Запрос:

```sql
SELECT 101 AS a, bin(a), bitShiftRight(a, 2) AS a_shifted, bin(a_shifted);
SELECT 'abc' AS a, hex(a), bitShiftRight(a, 12) AS a_shifted, hex(a_shifted);
SELECT toFixedString('abc', 3) AS a, hex(a), bitShiftRight(a, 12) AS a_shifted, hex(a_shifted);
```

Результат:

```text
┌───a─┬─bin(101)─┬─a_shifted─┬─bin(bitShiftRight(101, 2))─┐
│ 101 │ 01100101 │        25 │ 00011001                   │
└─────┴──────────┴───────────┴────────────────────────────┘
┌─a───┬─hex('abc')─┬─a_shifted─┬─hex(bitShiftRight('abc', 12))─┐
│ abc │ 616263     │           │ 0616                          │
└─────┴────────────┴───────────┴───────────────────────────────┘
┌─a───┬─hex(toFixedString('abc', 3))─┬─a_shifted─┬─hex(bitShiftRight(toFixedString('abc', 3), 12))─┐
│ abc │ 616263                       │           │ 000616                                          │
└─────┴──────────────────────────────┴───────────┴─────────────────────────────────────────────────┘
```

## bitRotateLeft(a, b) {#bitrotatelefta-b}

## bitRotateRight(a, b) {#bitrotaterighta-b}

## bitSlice(s, offset, length) {#bitslices-offset-length}

Возвращает подстроку, начиная с бита с индекса 'offset', длиной 'length' бит. Индексация битов начинается с 1.

**Синтаксис**

```sql
bitSlice(s, offset[, length])
```

**Аргументы**

- `s` — `s` это [String](../data-types/string.md) или [FixedString](../data-types/fixedstring.md).
- `offset` — Начальный индекс бита. Позитивное значение указывает на смещение влево, а негативное значение — на смещение вправо. Нумерация битов начинается с 1.
- `length` — Длина подстроки с битами. Если вы укажете отрицательное значение, функция вернет открытую подстроку \[offset, array_length - length\]. Если вы опустите значение, функция вернет подстроку \[offset, the_end_string\]. Если length превышает s, она будет обрезана. Если длина не является кратной 8, на правой стороне будут добавлены 0.

**Возвращаемое значение**

- Подстрока. [String](../data-types/string.md)

**Пример**

Запрос:

```sql
select bin('Hello'), bin(bitSlice('Hello', 1, 8))
select bin('Hello'), bin(bitSlice('Hello', 1, 2))
select bin('Hello'), bin(bitSlice('Hello', 1, 9))
select bin('Hello'), bin(bitSlice('Hello', -4, 8))
```

Результат:

```text
┌─bin('Hello')─────────────────────────────┬─bin(bitSlice('Hello', 1, 8))─┐
│ 0100100001100101011011000110110001101111 │ 01001000                     │
└──────────────────────────────────────────┴──────────────────────────────┘
┌─bin('Hello')─────────────────────────────┬─bin(bitSlice('Hello', 1, 2))─┐
│ 0100100001100101011011000110110001101111 │ 01000000                     │
└──────────────────────────────────────────┴──────────────────────────────┘
┌─bin('Hello')─────────────────────────────┬─bin(bitSlice('Hello', 1, 9))─┐
│ 0100100001100101011011000110110001101111 │ 0100100000000000             │
└──────────────────────────────────────────┴──────────────────────────────┘
┌─bin('Hello')─────────────────────────────┬─bin(bitSlice('Hello', -4, 8))─┐
│ 0100100001100101011011000110110001101111 │ 11110000                      │
└──────────────────────────────────────────┴───────────────────────────────┘
```

## byteSlice(s, offset, length) {#byteslices-offset-length}

Смотрите функцию [substring](string-functions.md#substring).

## bitTest {#bittest}

Принимает любое целое число и преобразует его в [двойничный формат](https://en.wikipedia.org/wiki/Binary_number), возвращает значение бита на указанной позиции. Нумерация справа налево, начиная с 0.

**Синтаксис**

```sql
SELECT bitTest(number, index)
```

**Аргументы**

- `number` – Целое число.
- `index` – Позиция бита.

**Возвращаемое значение**

- Значение бита на указанной позиции. [UInt8](../data-types/int-uint.md).

**Пример**

Например, число 43 в двоичной системе счисления равно 101011.

Запрос:

```sql
SELECT bitTest(43, 1);
```

Результат:

```text
┌─bitTest(43, 1)─┐
│              1 │
└────────────────┘
```

Другой пример:

Запрос:

```sql
SELECT bitTest(43, 2);
```

Результат:

```text
┌─bitTest(43, 2)─┐
│              0 │
└────────────────┘
```

## bitTestAll {#bittestall}

Возвращает результат [логического соединения](https://en.wikipedia.org/wiki/Logical_conjunction) (оператор AND) всех битов на заданных позициях. Нумерация справа налево, начиная с 0.

Сравнение логического оператора:

0 AND 0 = 0

0 AND 1 = 0

1 AND 0 = 0

1 AND 1 = 1

**Синтаксис**

```sql
SELECT bitTestAll(number, index1, index2, index3, index4, ...)
```

**Аргументы**

- `number` – Целое число.
- `index1`, `index2`, `index3`, `index4` – Позиции бита. Например, для набора позиций (`index1`, `index2`, `index3`, `index4`) истина, если и только если все из его позиций истинны (`index1` ⋀ `index2`, ⋀ `index3` ⋀ `index4`).

**Возвращаемое значение**

- Результат логического соединения. [UInt8](../data-types/int-uint.md).

**Пример**

Например, число 43 в двоичной системе счисления равно 101011.

Запрос:

```sql
SELECT bitTestAll(43, 0, 1, 3, 5);
```

Результат:

```text
┌─bitTestAll(43, 0, 1, 3, 5)─┐
│                          1 │
└────────────────────────────┘
```

Другой пример:

Запрос:

```sql
SELECT bitTestAll(43, 0, 1, 3, 5, 2);
```

Результат:

```text
┌─bitTestAll(43, 0, 1, 3, 5, 2)─┐
│                             0 │
└───────────────────────────────┘
```

## bitTestAny {#bittestany}

Возвращает результат [логического дизъюнкции](https://en.wikipedia.org/wiki/Logical_disjunction) (оператор OR) всех битов на заданных позициях. Нумерация справа налево, начиная с 0.

Сравнение логического оператора:

0 OR 0 = 0

0 OR 1 = 1

1 OR 0 = 1

1 OR 1 = 1

**Синтаксис**

```sql
SELECT bitTestAny(number, index1, index2, index3, index4, ...)
```

**Аргументы**

- `number` – Целое число.
- `index1`, `index2`, `index3`, `index4` – Позиции бита.

**Возвращаемое значение**

- Результат логического дизъюнкции. [UInt8](../data-types/int-uint.md).

**Пример**

Например, число 43 в двоичной системе счисления равно 101011.

Запрос:

```sql
SELECT bitTestAny(43, 0, 2);
```

Результат:

```text
┌─bitTestAny(43, 0, 2)─┐
│                    1 │
└──────────────────────┘
```

Другой пример:

Запрос:

```sql
SELECT bitTestAny(43, 4, 2);
```

Результат:

```text
┌─bitTestAny(43, 4, 2)─┐
│                    0 │
└──────────────────────┘
```

## bitCount {#bitcount}

Подсчитывает количество битов, установленных в единицу в двоичном представлении числа.

**Синтаксис**

```sql
bitCount(x)
```

**Аргументы**

- `x` — [Целое](../data-types/int-uint.md) или [число с плавающей запятой](../data-types/float.md). Функция использует представление значения в памяти. Это позволяет поддерживать числа с плавающей запятой.

**Возвращаемое значение**

- Количество битов, установленных в единицу в входном числе. [UInt8](../data-types/int-uint.md).

:::note
Функция не преобразует входное значение в больший тип ([расширение знака](https://en.wikipedia.org/wiki/Sign_extension)). Поэтому, например, `bitCount(toUInt8(-1)) = 8`.
:::

**Пример**

Возьмем, например, число 333. Его двоичное представление: 0000000101001101.

Запрос:

```sql
SELECT bitCount(333);
```

Результат:

```text
┌─bitCount(333)─┐
│             5 │
└───────────────┘
```

## bitHammingDistance {#bithammingdistance}

Возвращает [расстояние Хэмминга](https://en.wikipedia.org/wiki/Hamming_distance) между двоичными представлениями двух целых значений. Может быть использовано с функциями [SimHash](../../sql-reference/functions/hash-functions.md#ngramsimhash) для обнаружения полудублированных строк. Чем меньше расстояние, тем более вероятно, что эти строки одинаковы.

**Синтаксис**

```sql
bitHammingDistance(int1, int2)
```

**Аргументы**

- `int1` — Первое целое значение. [Int64](../data-types/int-uint.md).
- `int2` — Второе целое значение. [Int64](../data-types/int-uint.md).

**Возвращаемое значение**

- Расстояние Хэмминга. [UInt8](../data-types/int-uint.md).

**Примеры**

Запрос:

```sql
SELECT bitHammingDistance(111, 121);
```

Результат:

```text
┌─bitHammingDistance(111, 121)─┐
│                            3 │
└──────────────────────────────┘
```

С [SimHash](../../sql-reference/functions/hash-functions.md#ngramsimhash):

```sql
SELECT bitHammingDistance(ngramSimHash('cat ate rat'), ngramSimHash('rat ate cat'));
```

Результат:

```text
┌─bitHammingDistance(ngramSimHash('cat ate rat'), ngramSimHash('rat ate cat'))─┐
│                                                                            5 │
└──────────────────────────────────────────────────────────────────────────────┘
```
