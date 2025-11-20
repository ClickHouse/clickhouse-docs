---
'slug': '/native-protocol/columns'
'sidebar_position': 4
'title': '컬럼 유형'
'description': '네이티브 프로토콜의 컬럼 유형'
'keywords':
- 'native protocol columns'
- 'column types'
- 'data types'
- 'protocol data types'
- 'binary encoding'
'doc_type': 'reference'
---


# 컬럼 유형

일반적인 참조는 [데이터 유형](/sql-reference/data-types/)를 참조하세요.

## 숫자 유형 {#numeric-types}

:::tip

숫자 유형 인코딩은 AMD64 또는 ARM64와 같은 리틀 엔디안 CPU의 메모리 레이아웃과 일치합니다.

이로 인해 매우 효율적인 인코딩 및 디코딩을 구현할 수 있습니다.

:::

### 정수 {#integers}

Int 및 UInt의 8, 16, 32, 64, 128 또는 256 비트의 문자열, 리틀 엔디안 형식입니다.

### 부동 소수점 {#floats}

Float32 및 Float64는 IEEE 754 이진 표현으로 나타냅니다.

## 문자열 {#string}

단순히 문자열 배열이며, 즉 (길이, 값)입니다.

## FixedString(N) {#fixedstringn}

N 바이트 시퀀스의 배열입니다.

## IP {#ip}

IPv4는 `UInt32` 숫자 유형의 별칭이며 UInt32로 표현됩니다.

IPv6는 `FixedString(16)`의 별칭이며 이진 형식으로 직접 표현됩니다.

## 튜플 {#tuple}

튜플은 단순히 컬럼의 배열입니다. 예를 들어, Tuple(String, UInt8)은 두 개의 컬럼이 연속적으로 인코딩된 것입니다.

## 맵 {#map}

`Map(K, V)`는 세 개의 컬럼으로 구성됩니다: `Offsets ColUInt64, Keys K, Values V`.

`Keys`와 `Values` 컬럼의 행 수는 `Offsets`의 마지막 값입니다.

## 배열 {#array}

`Array(T)`는 두 개의 컬럼으로 구성됩니다: `Offsets ColUInt64, Data T`.

`Data`에서의 행 수는 `Offsets`의 마지막 값입니다.

## Nullable {#nullable}

`Nullable(T)`는 같은 행 수를 가지는 `Nulls ColUInt8, Values T`로 구성됩니다.

```go
// Nulls is nullable "mask" on Values column.
// For example, to encode [null, "", "hello", null, "world"]
//      Values: ["", "", "hello", "", "world"] (len: 5)
//      Nulls:  [ 1,  0,       0,  1,       0] (len: 5)
```

## UUID {#uuid}

`FixedString(16)`의 별칭이며, UUID 값은 이진 형식으로 표현됩니다.

## Enum {#enum}

`Int8` 또는 `Int16`의 별칭이며, 각 정수는 일부 `String` 값에 매핑됩니다.

## `LowCardinality` 유형 {#low-cardinality}

`LowCardinality(T)`는 `Index T, Keys K`로 구성되며, 여기서 `K`는 `Index`의 크기에 따라 (UInt8, UInt16, UInt32, UInt64) 중 하나입니다.

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

`UInt8`의 별칭이며, `0`은 false이고 `1`은 true입니다.
