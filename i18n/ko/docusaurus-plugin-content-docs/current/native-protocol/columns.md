---
slug: /native-protocol/columns
sidebar_position: 4
title: '네이티브 프로토콜 컬럼 타입'
description: '네이티브 프로토콜의 컬럼 타입'
keywords: ['네이티브 프로토콜 컬럼', '컬럼 타입', '데이터 타입', '프로토콜 데이터 타입', '바이너리 인코딩']
doc_type: 'reference'
---

# 네이티브 프로토콜 컬럼 타입 \{#native-protocol-column-types\}

자세한 내용은 [Data Types](/sql-reference/data-types/)를 참고하십시오.

:::tip
숫자 타입 인코딩은 AMD64나 ARM64와 같은 리틀 엔디언 CPU의 메모리 레이아웃과 일치하여, 매우 효율적인 인코딩과 디코딩이 가능합니다.
:::

| Type                                                            | Encoding                                                                                                                 |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Integers** ([Int/UInt](/sql-reference/data-types/int-uint))   | 리틀 엔디언 방식의 8, 16, 32, 64, 128 또는 256비트                                                                                   |
| **Floats** ([Float32/Float64](/sql-reference/data-types/float)) | IEEE 754 이진 표현                                                                                                           |
| [String](/sql-reference/data-types/string)                      | (len, value) 형태의 문자열 배열                                                                                                  |
| [FixedString(N)](/sql-reference/data-types/fixedstring)         | N바이트 시퀀스 배열                                                                                                              |
| [IPv4](/sql-reference/data-types/ipv4)                          | `UInt32`의 별칭이며, UInt32로 표현됩니다                                                                                            |
| [IPv6](/sql-reference/data-types/ipv6)                          | `FixedString(16)`의 별칭이며, 바이너리로 표현됩니다                                                                                     |
| [Tuple](/sql-reference/data-types/tuple)                        | 연속으로 인코딩된 컬럼 배열입니다. 예: `Tuple(String, UInt8)` = 연속된 두 개의 컬럼                                                              |
| [Map](/sql-reference/data-types/map)                            | `Map(K, V)` = 세 개의 컬럼: `Offsets ColUInt64, Keys K, Values V`. Keys/Values의 행 수 = 마지막 Offsets 값                           |
| [Array](/sql-reference/data-types/array)                        | `Array(T)` = 두 개의 컬럼: `Offsets ColUInt64, Data T`. Data의 행 수 = 마지막 Offsets 값                                             |
| [Nullable](/sql-reference/data-types/nullable)                  | `Nullable(T)` = 동일한 행 수를 가진 두 개의 컬럼: `Nulls ColUInt8, Values T`. Nulls는 마스크입니다: 1이면 null, 0이면 값입니다                       |
| [UUID](/sql-reference/data-types/uuid)                          | `FixedString(16)`의 별칭이며, 바이너리로 표현됩니다                                                                                     |
| [Enum](/sql-reference/data-types/enum)                          | `Int8` 또는 `Int16`의 별칭이며, 각 정수는 String 값에 매핑됩니다                                                                           |
| [LowCardinality](/sql-reference/data-types/lowcardinality)      | `LowCardinality(T)` = 두 개의 컬럼: `Index T, Keys K` (K는 UInt8/16/32/64). Index에는 고유한 값이 저장되고, Keys에는 Index를 가리키는 인덱스가 저장됩니다 |
| [Bool](/sql-reference/data-types/boolean)                       | `UInt8`의 별칭입니다: 0=false, 1=true                                                                                          |

**예시: Nullable 인코딩**

```text
To encode [null, "", "hello", null, "world"]:
  Values: ["", "", "hello", "", "world"] (len: 5)
  Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

**예제: LowCardinality 인코딩**

```text
To encode ["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"]:
  Index: ["Eko", "Amadela"] (String)
  Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
```
