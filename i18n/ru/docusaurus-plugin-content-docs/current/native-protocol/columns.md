---
slug: '/native-protocol/columns'
sidebar_position: 4
description: 'Типы колонок для нативного протокола'
title: 'Типы колонок'
doc_type: reference
---
# Типы колонок

Смотрите [Типы данных](/sql-reference/data-types/) для общего справочника.

## Числовые типы {#numeric-types}

:::tip

Кодирование числовых типов соответствует размещению в памяти процессоров little endian, таких как AMD64 или ARM64.

Это позволяет реализовать очень эффективное кодирование и декодирование.

:::

### Целые числа {#integers}

Строка Int и UInt размером 8, 16, 32, 64, 128 или 256 бит, в little endian.

### Числа с плавающей точкой {#floats}

Float32 и Float64 в двоичном представлении IEEE 754.

## Строка {#string}

Просто массив строк, т.е. (len, value).

## FixedString(N) {#fixedstringn}

Массив последовательностей длиной N байт.

## IP {#ip}

IPv4 является псевдонимом числового типа `UInt32` и представлен как UInt32.

IPv6 является псевдонимом `FixedString(16)` и представлен как двоичное значение напрямую.

## Кортеж {#tuple}

Кортеж — это просто массив колонок. Например, Tuple(String, UInt8) — это всего лишь две колонки, закодированные последовательно.

## Map {#map}

`Map(K, V)` состоит из трех колонок: `Offsets ColUInt64, Keys K, Values V`.

Количество строк в колонках `Keys` и `Values` равно последнему значению из `Offsets`.

## Массив {#array}

`Array(T)` состоит из двух колонок: `Offsets ColUInt64, Data T`.

Количество строк в `Data` равно последнему значению из `Offsets`.

## Nullable {#nullable}

`Nullable(T)` состоит из `Nulls ColUInt8, Values T` с одинаковым количеством строк.

```go
// Nulls is nullable "mask" on Values column.
// For example, to encode [null, "", "hello", null, "world"]
//      Values: ["", "", "hello", "", "world"] (len: 5)
//      Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

## UUID {#uuid}

Псевдоним `FixedString(16)`, значение UUID представлено в двоичном формате.

## Enum {#enum}

Псевдоним `Int8` или `Int16`, при этом каждое целое число соответствует какому-то строковому значению.

## Тип `LowCardinality` {#low-cardinality}

`LowCardinality(T)` состоит из `Index T, Keys K`, где `K` — это один из (UInt8, UInt16, UInt32, UInt64) в зависимости от размера `Index`.

```go
// Index (i.e. dictionary) column contains unique values, Keys column contains
// sequence of indexes in Index column that represent actual values.
//
// For example, ["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"] can
// be encoded as:
//      Index: ["Eko", "Amadela"] (String)
//      Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
//
// The CardinalityKey is chosen depending on Index size, i.e. maximum value
// of chosen type should be able to represent any index of Index element.
```

## Bool {#bool}

Псевдоним `UInt8`, где `0` — это false, а `1` — это true.