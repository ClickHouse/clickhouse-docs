---
slug: /native-protocol/columns
sidebar_position: 4
title: '네이티브 프로토콜 컬럼 타입'
description: '네이티브 프로토콜용 컬럼 타입'
keywords: ['네이티브 프로토콜 컬럼', '컬럼 타입', '데이터 타입', '프로토콜 데이터 타입', '바이너리 인코딩']
doc_type: '참고'
---

일반적인 내용은 [Data Types](/sql-reference/data-types/)를 참조하십시오.

:::tip
숫자 타입 인코딩은 AMD64 또는 ARM64와 같은 리틀 엔디언 CPU의 메모리 레이아웃과 일치하므로 매우 효율적으로 인코딩하고 디코딩할 수 있습니다.
:::

| 유형                                                             | 인코딩                                                                                                                          |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **정수** ([Int/UInt](/sql-reference/data-types/int-uint))        | 리틀 엔디언 방식의 8, 16, 32, 64, 128 또는 256비트                                                                                       |
| **부동소수점** ([Float32/Float64](/sql-reference/data-types/float)) | IEEE 754 바이너리 표현                                                                                                             |
| [String](/sql-reference/data-types/string)                     | 문자열 배열, 각 항목은 `(len, value)` 형식                                                                                              |
| [FixedString(N)](/sql-reference/data-types/fixedstring)        | N바이트 시퀀스의 배열                                                                                                                 |
| [IPv4](/sql-reference/data-types/ipv4)                         | `UInt32`의 별칭이며, UInt32로 표현됩니다                                                                                                |
| [IPv6](/sql-reference/data-types/ipv6)                         | `FixedString(16)`의 별칭이며, 바이너리로 표현됩니다                                                                                         |
| [Tuple](/sql-reference/data-types/tuple)                       | 컬럼 배열이 연속해서 인코딩됩니다. 예시: `Tuple(String, UInt8)` = 연속된 두 개의 컬럼                                                                 |
| [Map](/sql-reference/data-types/map)                           | `Map(K, V)` = 3개의 컬럼: `Offsets ColUInt64, Keys K, Values V`. Keys/Values의 행 수 = 마지막 Offsets 값                                |
| [Array](/sql-reference/data-types/array)                       | `Array(T)` = 2개의 컬럼: `Offsets ColUInt64, Data T`. Data의 행 수 = 마지막 Offsets 값                                                  |
| [Nullable](/sql-reference/data-types/nullable)                 | `Nullable(T)` = 2개의 컬럼: `Nulls ColUInt8, Values T`, 두 컬럼의 행 수는 동일합니다. Nulls는 마스크입니다: 1=null, 0=value                         |
| [UUID](/sql-reference/data-types/uuid)                         | `FixedString(16)`의 별칭이며, 바이너리로 표현됩니다                                                                                         |
| [Enum](/sql-reference/data-types/enum)                         | `Int8` 또는 `Int16`의 별칭이며, 각 정수는 String 값에 매핑됩니다                                                                               |
| [LowCardinality](/sql-reference/data-types/lowcardinality)     | `LowCardinality(T)` = 2개의 컬럼: `Index T, Keys K`, 여기서 K는 UInt8/16/32/64입니다. Index에는 고유 값이 포함되고, Keys에는 Index를 가리키는 인덱스가 포함됩니다 |
| [Bool](/sql-reference/data-types/boolean)                      | `UInt8`의 별칭: 0=false, 1=true                                                                                                 |

**예시: Nullable 인코딩**

```text
To encode [null, "", "hello", null, "world"]:
  Values: ["", "", "hello", "", "world"] (len: 5)
  Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

**예시: LowCardinality 인코딩**

```text
To encode ["Eko", "Eko", "Amadela", "Amadela", "Amadela", "Amadela"]:
  Index: ["Eko", "Amadela"] (String)
  Keys:  [0, 0, 1, 1, 1, 1] (UInt8)
```