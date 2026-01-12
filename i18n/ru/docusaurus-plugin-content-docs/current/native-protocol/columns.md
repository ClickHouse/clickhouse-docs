---
slug: /native-protocol/columns
sidebar_position: 4
title: 'Типы столбцов'
description: 'Типы столбцов в нативном протоколе'
keywords: ['столбцы нативного протокола', 'типы столбцов', 'типы данных', 'типы данных протокола', 'бинарное кодирование']
doc_type: 'reference'
---

# Типы столбцов {#column-types}

См. раздел [Типы данных](/sql-reference/data-types/) для общей информации.

## Числовые типы {#numeric-types}

:::tip

Кодирование числовых типов соответствует расположению в памяти на процессорах с порядком байт little-endian, таких как AMD64 или ARM64.

Это позволяет реализовать очень эффективное кодирование и декодирование.

:::

### [Целые числа](/sql-reference/data-types/int-uint) {#integers}

Последовательность значений Int и UInt размером 8, 16, 32, 64, 128 или 256 бит в формате little-endian.

### [Числа с плавающей запятой](/sql-reference/data-types/float) {#floats}

Float32 и Float64 в двоичном представлении IEEE 754.

## [String](/sql-reference/data-types/string) {#string}

Просто массив строк (String), т. е. (len, value).

## [FixedString(N)](/sql-reference/data-types/fixedstring) {#fixedstringn}

Массив последовательностей длиной N байт.

## IP {#ip}

### [IPv4](/sql-reference/data-types/ipv4) {#ipv4}

IPv4 — это псевдоним числового типа `UInt32` и хранится как значение UInt32.

### [IPv6](/sql-reference/data-types/ipv6) {#ipv6}

Псевдоним типа `FixedString(16)` и хранится непосредственно в двоичном виде.

## [Tuple](/sql-reference/data-types/tuple) {#tuple}

Tuple — это просто массив столбцов. Например, Tuple(String, UInt8) — это просто два столбца,
закодированные последовательно.

## [Map](/sql-reference/data-types/map) {#map}

`Map(K, V)` состоит из трёх столбцов: `Offsets ColUInt64, Keys K, Values V`.

Количество строк в столбцах `Keys` и `Values` соответствует последнему значению в `Offsets`.

## [Массив](/sql-reference/data-types/array) {#array}

`Array(T)` состоит из двух столбцов: `Offsets ColUInt64, Data T`.

Число строк в `Data` — это последнее значение в `Offsets`.

## [Nullable](/sql-reference/data-types/nullable) {#nullable}

`Nullable(T)` состоит из `Nulls ColUInt8` и `Values T` с одинаковым количеством строк.

```go
// Nulls is nullable "mask" on Values column.
// For example, to encode [null, "", "hello", null, "world"]
//      Values: ["", "", "hello", "", "world"] (len: 5)
//      Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```


## [UUID](/sql-reference/data-types/uuid) {#uuid}

Псевдоним типа `FixedString(16)`, значение UUID, хранящееся в бинарном виде.

## [Enum](/sql-reference/data-types/enum) {#enum}

Псевдоним типа `Int8` или `Int16`, но каждому целому числу соответствует некоторое значение типа `String`.

## [Тип `LowCardinality`](/sql-reference/data-types/lowcardinality) {#low-cardinality}

`LowCardinality(T)` состоит из `Index T, Keys K`,
где `K` — один из (`UInt8`, `UInt16`, `UInt32`, `UInt64`) в зависимости от размера индекса `Index`.

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


## [Bool](/sql-reference/data-types/boolean) {#bool}

Псевдоним для типа `UInt8`, где `0` — ложь, а `1` — истина.