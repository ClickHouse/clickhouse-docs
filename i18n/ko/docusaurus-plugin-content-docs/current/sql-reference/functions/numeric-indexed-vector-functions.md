---
description: 'NumericIndexedVector와 관련 함수에 대한 문서'
sidebar_label: 'NumericIndexedVector'
slug: /sql-reference/functions/numeric-indexed-vector-functions
title: 'NumericIndexedVector 함수'
doc_type: 'reference'
---



# NumericIndexedVector \{#numericindexedvector\}

NumericIndexedVector는 벡터를 캡슐화하고, 벡터에 대한 집계 및 요소별(pointwise) 연산을 구현하는 추상 데이터 구조입니다. Bit-Sliced Index는 이 자료 구조의 저장 방식입니다. 이론적 근거와 사용 시나리오는 논문 [Large-Scale Metric Computation in Online Controlled Experiment Platform](https://arxiv.org/pdf/2405.08411)을 참조하십시오.



## BSI \{#bit-sliced-index\}

BSI(Bit-Sliced Index) 저장 방식에서는 데이터를 [Bit-Sliced Index](https://dl.acm.org/doi/abs/10.1145/253260.253268)에 저장한 뒤 [Roaring Bitmap](https://github.com/RoaringBitmap/RoaringBitmap)을 사용해 압축합니다. 집계 연산과 원소별(pointwise) 연산은 압축된 데이터에 직접 수행되므로, 저장 및 쿼리 효율을 크게 향상시킬 수 있습니다.

벡터는 인덱스와 그에 대응하는 값을 포함합니다. BSI 저장 모드에서 이 데이터 구조가 가지는 특징과 제약 사항은 다음과 같습니다.

- 인덱스 타입은 `UInt8`, `UInt16`, `UInt32` 중 하나가 될 수 있습니다. **참고:** Roaring Bitmap의 64비트 구현 성능을 고려하여 BSI 포맷은 `UInt64`/`Int64`를 지원하지 않습니다.
- 값의 타입은 `Int8`, `Int16`, `Int32`, `Int64`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Float32`, `Float64` 중 하나가 될 수 있습니다. **참고:** 값 타입은 자동으로 확장되지 않습니다. 예를 들어 값 타입으로 `UInt8`을 사용하는 경우, `UInt8`의 범위를 초과하는 합계는 더 높은 타입으로 승격되지 않고 오버플로가 발생합니다. 마찬가지로 정수에 대한 연산 결과는 정수가 되며(예: 나눗셈 연산이 자동으로 부동소수점 결과로 변환되지 않습니다). 따라서 값 타입을 미리 계획하고 설계하는 것이 중요합니다. 실제 환경에서는 부동소수점 타입(`Float32`/`Float64`)이 일반적으로 사용됩니다.
- 동일한 인덱스 타입과 값 타입을 가진 두 벡터만 연산을 수행할 수 있습니다.
- 내부 저장은 Bit-Sliced Index를 사용하며, 비트맵에 인덱스를 저장합니다. Roaring Bitmap은 비트맵의 구체적인 구현으로 사용됩니다. 최선의 방식은 가능한 한 인덱스를 소수의 Roaring Bitmap 컨테이너에 집중시켜 압축률과 쿼리 성능을 극대화하는 것입니다.
- Bit-Sliced Index 메커니즘은 값을 이진수로 변환합니다. 부동소수점 타입의 경우 고정소수점 표현을 사용하여 변환하므로 정밀도 손실이 발생할 수 있습니다. 정밀도는 소수 부분에 사용할 비트 수를 사용자 정의하여 조정할 수 있으며, 기본값은 24비트로 대부분의 상황에서 충분합니다. aggregate function `groupNumericIndexedVector`에 `-State`를 사용해 NumericIndexedVector를 구성할 때, 정수 비트 수와 소수 비트 수를 사용자 정의할 수 있습니다.
- 인덱스에는 세 가지 경우가 있습니다: 0이 아닌 값, 0 값, 존재하지 않음. NumericIndexedVector에서는 0이 아닌 값과 0 값만 저장합니다. 또한 두 NumericIndexedVector 간의 원소별(pointwise) 연산에서 존재하지 않는 인덱스의 값은 0으로 취급합니다. 나눗셈 시나리오에서는 나누는 수(제수)가 0이면 결과는 0이 됩니다.



## numericIndexedVector 객체 생성 \{#create-numeric-indexed-vector-object\}

이 구조를 생성하는 방법은 두 가지입니다. 하나는 집계 함수 `groupNumericIndexedVector`에 `-State`를 붙여 사용하는 것입니다.
추가 조건을 받기 위해 접미사 `-if`를 붙일 수 있습니다.
해당 집계 함수는 조건을 만족하는 행만 처리합니다.
다른 하나는 `numericIndexedVectorBuild`를 사용하여 맵에서 이 구조를 만드는 것입니다.
`groupNumericIndexedVectorState` 함수는 파라미터를 통해 정수 비트 수와 소수 비트 수를 설정할 수 있지만, `numericIndexedVectorBuild`는 그렇지 않습니다.



## groupNumericIndexedVector \{#group-numeric-indexed-vector\}

두 개의 데이터 컬럼으로부터 NumericIndexedVector를 구성하고, 모든 값의 합을 `Float64` 타입으로 반환합니다. 함수 이름에 접미사 `State`를 추가하면 NumericIndexedVector 객체를 반환합니다.

**구문**

```sql
groupNumericIndexedVectorState(col1, col2)
groupNumericIndexedVectorState(type, integer_bit_num, fraction_bit_num)(col1, col2)
```

**매개변수**

* `type`: String, 선택 매개변수입니다. 저장 형식을 지정합니다. 현재는 `'BSI'`만 지원합니다.
* `integer_bit_num`: `UInt32`, 선택 매개변수입니다. `'BSI'` 저장 형식에서만 유효하며, 정수 부분에 사용되는 비트 수를 나타냅니다. 인덱스 타입이 정수 타입인 경우 기본값은 인덱스를 저장하는 데 사용되는 비트 수와 같습니다. 예를 들어 인덱스 타입이 UInt16이면 기본 `integer_bit_num`은 16입니다. Float32 및 Float64 인덱스 타입의 경우 integer&#95;bit&#95;num의 기본값은 40이므로, 표현 가능한 데이터의 정수 부분 범위는 `[-2^39, 2^39 - 1]`입니다. 허용 범위는 `[0, 64]`입니다.
* `fraction_bit_num`: `UInt32`, 선택 매개변수입니다. `'BSI'` 저장 형식에서만 유효하며, 소수 부분에 사용되는 비트 수를 나타냅니다. 값 타입이 정수일 때 기본값은 0이고, 값 타입이 Float32 또는 Float64일 때 기본값은 24입니다. 유효 범위는 `[0, 24]`입니다.
* 또한 integer&#95;bit&#95;num + fraction&#95;bit&#95;num의 유효 범위가 [0, 64]라는 제약이 있습니다.
* `col1`: 인덱스 컬럼입니다. 지원되는 타입: `UInt8`/`UInt16`/`UInt32`/`Int8`/`Int16`/`Int32`.
* `col2`: 값 컬럼입니다. 지원되는 타입: `Int8`/`Int16`/`Int32`/`Int64`/`UInt8`/`UInt16`/`UInt32`/`UInt64`/`Float32`/`Float64`.

**반환 값**

모든 값의 합을 나타내는 `Float64` 값입니다.

**예시**

테스트 데이터:

```text
UserID  PlayTime
1       10
2       20
3       30
```

쿼리 &amp; 결과:

```sql
SELECT groupNumericIndexedVector(UserID, PlayTime) AS num FROM t;
┌─num─┐
│  60 │
└─────┘

SELECT groupNumericIndexedVectorState(UserID, PlayTime) as res, toTypeName(res), numericIndexedVectorAllValueSum(res) FROM t;
┌─res─┬─toTypeName(res)─────────────────────────────────────────────┬─numericIndexedVectorAllValueSum(res)──┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8)  │ 60                                    │
└─────┴─────────────────────────────────────────────────────────────┴───────────────────────────────────────┘

SELECT groupNumericIndexedVectorStateIf(UserID, PlayTime, day = '2025-04-22') as res, toTypeName(res), numericIndexedVectorAllValueSum(res) FROM t;
┌─res─┬─toTypeName(res)────────────────────────────────────────────┬─numericIndexedVectorAllValueSum(res)──┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8) │ 30                                    │
└─────┴────────────────────────────────────────────────────────────┴───────────────────────────────────────┘

SELECT groupNumericIndexedVectorStateIf('BSI', 32, 0)(UserID, PlayTime, day = '2025-04-22') as res, toTypeName(res), numericIndexedVectorAllValueSum(res) FROM t;
┌─res─┬─toTypeName(res)──────────────────────────────────────────────────────────┬─numericIndexedVectorAllValueSum(res)──┐
│     │ AggregateFunction('BSI', 32, 0)(groupNumericIndexedVector, UInt8, UInt8) │ 30                                    │
└─────┴──────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────┘
```

:::note
아래 문서는 `system.functions` 시스템 테이블을 기반으로 생성되었습니다.
:::

{/* 
  아래 태그는 system 테이블에서 문서를 자동 생성하는 데 사용되므로 제거하면 안 됩니다.
  자세한 내용은 https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md 를 참조하십시오.
  */ }


{/*AUTOGENERATED_START*/ }

## numericIndexedVectorAllValueSum \{#numericIndexedVectorAllValueSum\}

도입 버전: v25.7

numericIndexedVector 내 모든 값의 합을 반환합니다.

**구문**

```sql
numericIndexedVectorAllValueSum(v)
```

**인수**

* `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**반환값**

합계를 반환합니다. [`Float64`](/sql-reference/data-types/float)

**예시**

**사용 예**

```sql title=Query
SELECT numericIndexedVectorAllValueSum(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Response
┌─res─┐
│  60 │
└─────┘
```


## numericIndexedVectorBuild \{#numericIndexedVectorBuild\}

도입 버전: v25.7

맵에서 NumericIndexedVector를 생성합니다. 맵의 키는 벡터의 인덱스를 나타내고, 맵의 값은 벡터의 값을 나타냅니다.

**구문**

```sql
numericIndexedVectorBuild(map)
```

**인수**

* `map` — 인덱스를 값에 매핑하는 맵입니다. [`Map`](/sql-reference/data-types/map)

**반환 값**

NumericIndexedVector 객체를 반환합니다. [`AggregateFunction`](/sql-reference/data-types/aggregatefunction)

**예시**

**사용 예시**

```sql title=Query
SELECT numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])) AS res, toTypeName(res);
```

```response title=Response
┌─res─┬─toTypeName(res)────────────────────────────────────────────┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8) │
└─────┴────────────────────────────────────────────────────────────┘
```


## numericIndexedVectorCardinality \{#numericIndexedVectorCardinality\}

도입 버전: v25.7

numericIndexedVector의 카디널리티(고유 인덱스의 개수)를 반환합니다.

**구문**

```sql
numericIndexedVectorCardinality(v)
```

**인수**

* `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**반환 값**

고유 인덱스의 개수를 반환합니다. [`UInt64`](/sql-reference/data-types/int-uint)

**예시**

**사용 예시**

```sql title=Query
SELECT numericIndexedVectorCardinality(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Response
┌─res─┐
│  3  │
└─────┘
```


## numericIndexedVectorGetValue \{#numericIndexedVectorGetValue\}

도입된 버전: v25.7

numericIndexedVector에서 지정한 인덱스에 해당하는 값을 조회합니다.

**구문**

```sql
numericIndexedVectorGetValue(v, i)
```

**인수**

* `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `i` — 값을 가져올 인덱스. [`(U)Int*`](/sql-reference/data-types/int-uint)

**반환 값**

NumericIndexedVector의 값 타입과 동일한 타입의 숫자형 값. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float)

**예시**

**사용 예시**

```sql title=Query
SELECT numericIndexedVectorGetValue(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])), 3) AS res;
```

```response title=Response
┌─res─┐
│  30 │
└─────┘
```


## numericIndexedVectorPointwiseAdd \{#numericIndexedVectorPointwiseAdd\}

도입 버전: v25.7

`numericIndexedVector`와 다른 `numericIndexedVector` 또는 숫자 상수 간에 원소별 덧셈(pointwise addition)을 수행합니다.

**구문**

```sql
numericIndexedVectorPointwiseAdd(v1, v2)
```

**인수**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — 숫자 상수 또는 `numericIndexedVector` 객체입니다. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**반환 값**

새로운 `numericIndexedVector` 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**예시**

**사용 예시**

```sql title=Query
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, 2)) AS res2;
```

```response title=Response
┌─res1──────────────────┬─res2─────────────┐
│ {1:10,2:30,3:50,4:30} │ {1:12,2:22,3:32} │
└───────────────────────┴──────────────────┘
```


## numericIndexedVectorPointwiseDivide \{#numericIndexedVectorPointwiseDivide\}

도입 버전: v25.7

`numericIndexedVector`와 다른 `numericIndexedVector` 또는 숫자 상수 간에 요소별(pointwise) 나눗셈을 수행합니다.

**구문**

```sql
numericIndexedVectorPointwiseDivide(v1, v2)
```

**인수**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — 숫자 상수 또는 `numericIndexedVector` 객체입니다. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**반환 값**

새로운 `numericIndexedVector` 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**예시**

**사용 예시**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, 2)) AS res2;
```

```response title=Response
┌─res1────────┬─res2────────────┐
│ {2:2,3:1.5} │ {1:5,2:10,3:15} │
└─────────────┴─────────────────┘
```


## numericIndexedVectorPointwiseEqual \{#numericIndexedVectorPointwiseEqual\}

도입 버전: v25.7

`numericIndexedVector`와 다른 `numericIndexedVector` 또는 숫자 상수 간에 요소별(pointwise) 비교를 수행합니다.
결과는 값이 동일한 위치의 인덱스를 포함하는 `numericIndexedVector`이며, 해당 위치의 모든 값은 1로 설정됩니다.

**Syntax**

```sql
numericIndexedVectorPointwiseEqual(v1, v2)
```

**인수**

* `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — 수치 상수 또는 numericIndexedVector 객체. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**반환값**

새로운 numericIndexedVector 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**예제**

***

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseEqual(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──┬─res2──┐
│ {2:1} │ {2:1} │
└───────┴───────┘
```


## numericIndexedVectorPointwiseGreater \{#numericIndexedVectorPointwiseGreater\}

도입 버전: v25.7

`numericIndexedVector`와 다른 `numericIndexedVector` 또는 단일 숫자 상수 사이에서 원소별(pointwise) 비교를 수행합니다.
결과는 첫 번째 벡터의 값이 두 번째 벡터의 값보다 큰 위치의 인덱스를 포함하는 `numericIndexedVector`이며, 해당 인덱스의 값은 모두 1로 설정됩니다.

**구문**

```sql
numericIndexedVectorPointwiseGreater(v1, v2)
```

**인수**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — 숫자 상수 또는 `numericIndexedVector` 객체. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**반환 값**

새로운 `numericIndexedVector` 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**예제**

**사용 예제**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──────┬─res2──┐
│ {1:1,3:1} │ {3:1} │
└───────────┴───────┘
```


## numericIndexedVectorPointwiseGreaterEqual \{#numericIndexedVectorPointwiseGreaterEqual\}

도입 버전: v25.7

`numericIndexedVector`와 다른 `numericIndexedVector` 또는 숫자 상수 간에 성분별(pointwise) 비교를 수행합니다.
결과는 첫 번째 벡터의 값이 두 번째 벡터의 값보다 크거나 같은 인덱스만 포함하는 `numericIndexedVector`이며, 해당 위치의 값은 모두 1로 설정됩니다.

**구문**

```sql
numericIndexedVectorPointwiseGreaterEqual(v1, v2)
```

**인수**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — 수치 상수 또는 numericIndexedVector 객체. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**반환 값**

새로운 numericIndexedVector 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**예시**

**사용 예시**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──────────┬─res2──────┐
│ {1:1,2:1,3:1} │ {2:1,3:1} │
└───────────────┴───────────┘
```


## numericIndexedVectorPointwiseLess \{#numericIndexedVectorPointwiseLess\}

도입된 버전: v25.7

`numericIndexedVector`와 다른 `numericIndexedVector` 또는 숫자 상수 사이에서 원소별 비교(pointwise comparison)를 수행합니다.
결과로 첫 번째 벡터의 값이 두 번째 벡터의 값보다 작은 인덱스를 포함하는 `numericIndexedVector`가 생성되며, 해당 위치의 값은 모두 1로 설정됩니다.

**구문**

```sql
numericIndexedVectorPointwiseLess(v1, v2)
```

**인수**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — 숫자 상수 또는 numericIndexedVector 객체. [`(U)Int*`](/sql-reference/data-types/int-uint), [`Float*`](/sql-reference/data-types/float), [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object) 중 하나입니다.

**반환 값**

새로운 numericIndexedVector 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**예시**

**사용 예시**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──────┬─res2──┐
│ {3:1,4:1} │ {1:1} │
└───────────┴───────┘
```


## numericIndexedVectorPointwiseLessEqual \{#numericIndexedVectorPointwiseLessEqual\}

도입된 버전: v25.7

`numericIndexedVector`와 다른 `numericIndexedVector` 또는 하나의 숫자 상수 간에 원소별(pointwise) 비교를 수행합니다.
결과는 첫 번째 벡터의 값이 두 번째 벡터의 값보다 작거나 같은 위치의 인덱스를 포함하는 `numericIndexedVector`이며, 해당 위치의 값은 모두 1로 설정됩니다.

**구문**

```sql
numericIndexedVectorPointwiseLessEqual(v1, v2)
```

**인수**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — 숫자 상수([`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float)) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object) 객체

**반환 값**

새로운 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object) 객체를 반환합니다.

**예시**

**사용 예시**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──────────┬─res2──────┐
│ {2:1,3:1,4:1} │ {1:1,2:1} │
└───────────────┴───────────┘
```


## numericIndexedVectorPointwiseMultiply \{#numericIndexedVectorPointwiseMultiply\}

도입 버전: v25.7

`numericIndexedVector`와 다른 `numericIndexedVector` 또는 수치 상수 사이의 원소별 곱셈을 수행합니다.

**구문**

```sql
numericIndexedVectorPointwiseMultiply(v1, v2)
```

**인수**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — 숫자형 상수 또는 `numericIndexedVector` 객체. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**반환값**

새로운 `numericIndexedVector` 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**예제**

***

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseMultiply(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseMultiply(vec1, 2)) AS res2;
```

```response title=Response
┌─res1──────────┬─res2─────────────┐
│ {2:200,3:600} │ {1:20,2:40,3:60} │
└───────────────┴──────────────────┘
```


## numericIndexedVectorPointwiseNotEqual \{#numericIndexedVectorPointwiseNotEqual\}

도입 버전: v25.7

`numericIndexedVector`와 다른 `numericIndexedVector` 또는 숫자 상수 간에 원소별(pointwise) 비교를 수행합니다.
결과는 값이 서로 같지 않은 위치의 인덱스를 포함하는 `numericIndexedVector`이며, 해당 위치의 값은 모두 1로 설정됩니다.

**구문**

```sql
numericIndexedVectorPointwiseNotEqual(v1, v2)
```

**인수**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — 숫자형 상수 또는 numericIndexedVector 객체입니다. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**반환 값**

새로운 numericIndexedVector 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**예시**

**사용 예시**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseNotEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseNotEqual(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──────────┬─res2──────┐
│ {1:1,3:1,4:1} │ {1:1,3:1} │
└───────────────┴───────────┘
```


## numericIndexedVectorPointwiseSubtract \{#numericIndexedVectorPointwiseSubtract\}

도입 버전: v25.7

`numericIndexedVector`와 다른 `numericIndexedVector` 또는 수치 상수 간에 원소별(pointwise) 뺄셈을 수행합니다.

**구문**

```sql
numericIndexedVectorPointwiseSubtract(v1, v2)
```

**인수**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — 숫자 상수 또는 numericIndexedVector 객체입니다. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**반환 값**

새 numericIndexedVector 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**예시**

**사용 예시**

```sql title=Query
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, 2)) AS res2;
```

```response title=Response
┌─res1───────────────────┬─res2────────────┐
│ {1:10,2:10,3:10,4:-30} │ {1:8,2:18,3:28} │
└────────────────────────┴─────────────────┘
```


## numericIndexedVectorShortDebugString \{#numericIndexedVectorShortDebugString\}

도입된 버전: v25.7

numericIndexedVector의 내부 정보를 JSON 형식으로 반환합니다.
이 함수는 주로 디버깅을 위해 사용됩니다.

**구문**

```sql
numericIndexedVectorShortDebugString(v)
```

**인수**

* `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**반환 값**

디버그 정보를 포함하는 JSON 문자열을 반환합니다. [`String`](/sql-reference/data-types/string)

**예시**

**사용 예시**

```sql title=Query
SELECT numericIndexedVectorShortDebugString(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res\G;
```

```response title=Response
Row 1:
──────
res: {"vector_type":"BSI","index_type":"char8_t","value_type":"char8_t","integer_bit_num":8,"fraction_bit_num":0,"zero_indexes_info":{"cardinality":"0"},"non_zero_indexes_info":{"total_cardinality":"3","all_value_sum":60,"number_of_bitmaps":"8","bitmap_info":{"cardinality":{"0":"0","1":"2","2":"2","3":"2","4":"2","5":"0","6":"0","7":"0"}}}}
```


## numericIndexedVectorToMap \{#numericIndexedVectorToMap\}

도입 버전: v25.7

`numericIndexedVector`를 맵으로 변환합니다.

**구문**

```sql
numericIndexedVectorToMap(v)
```

**인수**

* `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**반환 값**

인덱스와 값의 쌍으로 구성된 맵을 반환합니다. [`Map`](/sql-reference/data-types/map)

**예시**

**사용 예시**

```sql title=Query
SELECT numericIndexedVectorToMap(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Response
┌─res──────────────┐
│ {1:10,2:20,3:30} │
└──────────────────┘
```

{/*AUTOGENERATED_END*/ }
