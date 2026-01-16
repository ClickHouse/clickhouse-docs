---
slug: /native-protocol/columns
sidebar_position: 4
title: 'Типы столбцов нативного протокола'
description: 'Типы столбцов в нативном протоколе'
keywords: ['столбцы нативного протокола', 'типы столбцов', 'типы данных', 'типы данных протокола', 'бинарное кодирование']
doc_type: 'reference'
---

# Типы столбцов нативного протокола \{#native-protocol-column-types\}

Общий обзор см. в разделе [Data Types](/sql-reference/data-types/).

:::tip
Кодирование числовых типов соответствует формату размещения в памяти в процессорах с порядком байт little endian, таких как AMD64 или ARM64, что обеспечивает очень эффективное кодирование и декодирование.
:::

| Type                                                            | Encoding                                                                                                                                        |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Integers** ([Int/UInt](/sql-reference/data-types/int-uint))   | 8, 16, 32, 64, 128 или 256 бит в формате little endian                                                                                          |
| **Floats** ([Float32/Float64](/sql-reference/data-types/float)) | Двоичное представление IEEE 754                                                                                                                 |
| [String](/sql-reference/data-types/string)                      | Массив строк в формате (len, value)                                                                                                             |
| [FixedString(N)](/sql-reference/data-types/fixedstring)         | Массив N-байтовых последовательностей                                                                                                           |
| [IPv4](/sql-reference/data-types/ipv4)                          | Псевдоним `UInt32`, представляется как UInt32                                                                                                   |
| [IPv6](/sql-reference/data-types/ipv6)                          | Псевдоним `FixedString(16)`, представляется в бинарном виде                                                                                     |
| [Tuple](/sql-reference/data-types/tuple)                        | Массив столбцов, последовательно закодированных. Пример: `Tuple(String, UInt8)` = два последовательных столбца                                  |
| [Map](/sql-reference/data-types/map)                            | `Map(K, V)` = три столбца: `Offsets ColUInt64, Keys K, Values V`. Количество строк в Keys/Values = последнее значение в Offsets                 |
| [Array](/sql-reference/data-types/array)                        | `Array(T)` = два столбца: `Offsets ColUInt64, Data T`. Количество строк в Data = последнее значение в Offsets                                   |
| [Nullable](/sql-reference/data-types/nullable)                  | `Nullable(T)` = два столбца: `Nulls ColUInt8, Values T` с одинаковым количеством строк. Nulls — это маска: 1 = NULL, 0 = значение               |
| [UUID](/sql-reference/data-types/uuid)                          | Псевдоним `FixedString(16)`, представляется в бинарном виде                                                                                     |
| [Enum](/sql-reference/data-types/enum)                          | Псевдоним `Int8` или `Int16`, каждому целому числу сопоставлено строковое значение                                                              |
| [LowCardinality](/sql-reference/data-types/lowcardinality)      | `LowCardinality(T)` = два столбца: `Index T, Keys K`, где K — UInt8/16/32/64. Index содержит уникальные значения, Keys содержит индексы в Index |
| [Bool](/sql-reference/data-types/boolean)                       | Псевдоним `UInt8`: 0=false, 1=true                                                                                                              |

**Пример: кодирование Nullable**

```text
To encode [null, "", "hello", null, "world"]:
  Values: ["", "", "hello", "", "world"] (len: 5)
  Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

**Пример кодирования LowCardinality**

```text
To encode ["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"]:
  Index: ["Eko", "Amadela"] (String)
  Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
```
