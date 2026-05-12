---
slug: /native-protocol/columns
sidebar_position: 4
title: 'Типы столбцов в собственном протоколе'
description: 'Типы столбцов для собственного протокола'
keywords: ['столбцы собственного протокола', 'типы столбцов', 'типы данных', 'типы данных протокола', 'двоичное кодирование']
doc_type: 'справочник'
---

См. [Типы данных](/sql-reference/data-types/) для общего ознакомления.

:::tip
Кодирование числовых типов соответствует представлению данных в памяти процессоров с порядком байтов little-endian, таких как AMD64 или ARM64, что обеспечивает очень эффективное кодирование и декодирование.
:::

| Тип                                                                               | Кодирование                                                                                                                                     |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Целые числа** ([Int/UInt](/sql-reference/data-types/int-uint))                  | 8, 16, 32, 64, 128 или 256 бит в формате little-endian                                                                                          |
| **Числа с плавающей точкой** ([Float32/Float64](/sql-reference/data-types/float)) | Двоичное представление IEEE 754                                                                                                                 |
| [String](/sql-reference/data-types/string)                                        | Массив строк в виде (len, value)                                                                                                                |
| [FixedString(N)](/sql-reference/data-types/fixedstring)                           | Массив N-байтовых последовательностей                                                                                                           |
| [IPv4](/sql-reference/data-types/ipv4)                                            | Псевдоним для `UInt32`, представляется как UInt32                                                                                               |
| [IPv6](/sql-reference/data-types/ipv6)                                            | Псевдоним для `FixedString(16)`, представляется в двоичном виде                                                                                 |
| [Tuple](/sql-reference/data-types/tuple)                                          | Массив столбцов, закодированных подряд. Пример: `Tuple(String, UInt8)` = два последовательных столбца                                           |
| [Map](/sql-reference/data-types/map)                                              | `Map(K, V)` = три столбца: `Offsets ColUInt64, Keys K, Values V`. Число строк в Keys/Values = последнее значение Offsets                        |
| [Array](/sql-reference/data-types/array)                                          | `Array(T)` = два столбца: `Offsets ColUInt64, Data T`. Число строк в Data = последнее значение Offsets                                          |
| [Nullable](/sql-reference/data-types/nullable)                                    | `Nullable(T)` = два столбца: `Nulls ColUInt8, Values T` с одинаковым числом строк. Nulls — это маска: 1=null, 0=value                           |
| [UUID](/sql-reference/data-types/uuid)                                            | Псевдоним для `FixedString(16)`, представляется в двоичном виде                                                                                 |
| [Enum](/sql-reference/data-types/enum)                                            | Псевдоним для `Int8` или `Int16`, каждому целому числу сопоставляется значение String                                                           |
| [LowCardinality](/sql-reference/data-types/lowcardinality)                        | `LowCardinality(T)` = два столбца: `Index T, Keys K`, где K — UInt8/16/32/64. Index содержит уникальные значения, Keys содержит индексы в Index |
| [Bool](/sql-reference/data-types/boolean)                                         | Псевдоним для `UInt8`: 0=false, 1=true                                                                                                          |

**Пример: кодирование Nullable**

```text
To encode [null, "", "hello", null, "world"]:
  Values: ["", "", "hello", "", "world"] (len: 5)
  Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

**Пример: кодировка LowCardinality**

```text
To encode ["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"]:
  Index: ["Eko", "Amadela"] (String)
  Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
```