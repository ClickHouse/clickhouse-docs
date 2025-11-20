---
slug: /native-protocol/columns
sidebar_position: 4
title: 'Типы столбцов'
description: 'Типы столбцов в нативном протоколе'
keywords: ['native protocol columns', 'column types', 'data types', 'protocol data types', 'binary encoding']
doc_type: 'reference'
---



# Типы столбцов

Общую справочную информацию см. в разделе [Типы данных](/sql-reference/data-types/).



## Числовые типы {#numeric-types}

:::tip

Кодирование числовых типов соответствует расположению данных в памяти процессоров с прямым порядком байтов (little endian), таких как AMD64 или ARM64.

Это обеспечивает очень эффективное кодирование и декодирование.

:::

### Целые числа {#integers}

Последовательность типов Int и UInt разрядностью 8, 16, 32, 64, 128 или 256 бит в прямом порядке байтов (little endian).

### Числа с плавающей точкой {#floats}

Типы Float32 и Float64 в двоичном представлении IEEE 754.


## String {#string}

Представляет собой массив String, т.е. (длина, значение).


## FixedString(N) {#fixedstringn}

Массив N-байтовых последовательностей.


## IP {#ip}

IPv4 является псевдонимом числового типа `UInt32` и представлен как UInt32.

IPv6 является псевдонимом типа `FixedString(16)` и представлен непосредственно в двоичном виде.


## Tuple {#tuple}

Tuple — это массив столбцов. Например, Tuple(String, UInt8) представляет собой два столбца,
закодированных последовательно.


## Map {#map}

`Map(K, V)` состоит из трёх столбцов: `Offsets ColUInt64, Keys K, Values V`.

Количество строк в столбцах `Keys` и `Values` соответствует последнему значению из `Offsets`.


## Array {#array}

`Array(T)` состоит из двух столбцов: `Offsets ColUInt64, Data T`.

Количество строк в `Data` равно последнему значению в `Offsets`.


## Nullable {#nullable}

`Nullable(T)` состоит из `Nulls ColUInt8, Values T` с одинаковым количеством строк.

```go
// Nulls — это "маска" nullable для столбца Values.
// Например, для кодирования [null, "", "hello", null, "world"]
//      Values: ["", "", "hello", "", "world"] (len: 5)
//      Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```


## UUID {#uuid}

Псевдоним для `FixedString(16)`, значение UUID представлено в двоичном виде.


## Enum {#enum}

Псевдоним для `Int8` или `Int16`, но каждое целое число сопоставляется со строковым значением (`String`).


## Тип `LowCardinality` {#low-cardinality}

`LowCardinality(T)` состоит из `Index T, Keys K`,
где `K` — это один из типов (UInt8, UInt16, UInt32, UInt64) в зависимости от размера `Index`.

```go
// Столбец Index (т.е. словарь) содержит уникальные значения, столбец Keys содержит
// последовательность индексов в столбце Index, представляющих фактические значения.
//
// Например, ["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"] может
// быть закодирован как:
//      Index: ["Eko", "Amadela"] (String)
//      Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
//
// CardinalityKey выбирается в зависимости от размера Index, т.е. максимальное значение
// выбранного типа должно позволять представить любой индекс элемента Index.
```


## Bool {#bool}

Псевдоним для `UInt8`, где `0` означает ложь, а `1` — истину.
