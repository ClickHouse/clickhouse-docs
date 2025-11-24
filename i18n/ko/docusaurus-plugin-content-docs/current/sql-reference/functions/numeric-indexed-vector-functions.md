---
'description': 'NumericIndexedVector 및 그 함수에 대한 문서'
'sidebar_label': 'NumericIndexedVector'
'slug': '/sql-reference/functions/numeric-indexed-vector-functions'
'title': '숫자 인덱스 벡터 함수'
'doc_type': 'reference'
---


# NumericIndexedVector

NumericIndexedVector는 벡터를 캡슐화하고 벡터 집계 및 포인트별 연산을 구현하는 추상 데이터 구조입니다. Bit-Sliced Index가 그 저장 방법입니다. 이론적 기초와 사용 시나리오는 논문 [Large-Scale Metric Computation in Online Controlled Experiment Platform](https://arxiv.org/pdf/2405.08411)을 참조하십시오.

## BSI {#bit-sliced-index}

BSI (Bit-Sliced Index) 저장 방법에서는 데이터를 [Bit-Sliced Index](https://dl.acm.org/doi/abs/10.1145/253260.253268)에 저장한 다음 [Roaring Bitmap](https://github.com/RoaringBitmap/RoaringBitmap)으로 압축합니다. 집계 연산 및 포인트별 연산은 압축된 데이터에서 직접 수행되며, 이는 저장 및 쿼리의 효율성을 크게 향상시킬 수 있습니다.

벡터에는 인덱스와 해당 값이 포함됩니다. 다음은 BSI 저장 모드에서 이 데이터 구조의 일부 특성과 제약 조건입니다:

- 인덱스 유형은 `UInt8`, `UInt16` 또는 `UInt32` 중 하나일 수 있습니다. **참고:** Roaring Bitmap의 64비트 구현 성능을 고려할 때, BSI 형식은 `UInt64`/`Int64`를 지원하지 않습니다.
- 값 유형은 `Int8`, `Int16`, `Int32`, `Int64`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Float32` 또는 `Float64` 중 하나일 수 있습니다. **참고:** 값 유형은 자동으로 확장되지 않습니다. 예를 들어, `UInt8`을 값 유형으로 사용할 경우, `UInt8`의 용량을 초과하는 합계는 overflow가 발생하며 더 높은 유형으로 승격되지 않습니다; 마찬가지로 정수 연산의 경우 정수 수치를 산출합니다 (예: 나누기를 수행할 때 자동으로 부동 소수점 결과로 변환되지 않습니다). 따라서 값 유형을 미리 계획하고 설계하는 것이 중요합니다. 실제 시나리오에서는 부동 소수점 유형(`Float32`/`Float64`)이 일반적으로 사용됩니다.
- 동일한 인덱스 유형과 값 유형을 가진 두 벡터만 연산을 수행할 수 있습니다.
- 기본 저장 장치는 Bit-Sliced Index를 사용하며, bitmap이 인덱스를 저장합니다. Roaring Bitmap이 bitmap의 특정 구현으로 사용됩니다. 인덱스를 가능한 한 여러 Roaring Bitmap 컨테이너에 집중시키는 것이 최상의 관행으로, 압축과 쿼리 성능을 극대화할 수 있습니다.
- Bit-Sliced Index 메커니즘은 값을 이진수로 변환합니다. 부동 소수점 유형의 경우 변환 시 고정 소수점 표현을 사용하며, 이는 정밀도 손실을 초래할 수 있습니다. 정밀도는 소수 부분에 사용되는 비트 수를 사용자 정의하여 조정할 수 있으며, 기본값은 24비트로 대부분의 시나리오에 적합합니다. NumericIndexedVector를 작성할 때 `-State`와 함께 집계 함수 groupNumericIndexedVector를 사용하여 정수 비트 수와 소수 비트를 사용자 정의할 수 있습니다.
- 인덱스에는 세 가지 경우가 있습니다: 비어 있지 않은 값, 0 값 및 존재하지 않는 값. NumericIndexedVector에서는 비어 있지 않은 값과 0 값만 저장됩니다. 또한, 두 NumericIndexedVectors 간의 포인트별 연산에서 존재하지 않는 인덱스의 값은 0으로 처리됩니다. 나누기 시나리오에서는 피제수가 0일 경우 결과는 0이 됩니다.

## Create a numericIndexedVector object {#create-numeric-indexed-vector-object}

이 구조는 두 가지 방법으로 생성할 수 있습니다: 하나는 `-State`와 함께 집계 함수 `groupNumericIndexedVector`를 사용하는 방법입니다. 추가 조건을 수용하기 위해 접미사 `-if`를 추가할 수 있습니다. 집계 함수는 조건을 발생시키는 행만 처리합니다. 다른 방법은 `numericIndexedVectorBuild`를 사용하여 맵에서 구축하는 것입니다. `groupNumericIndexedVectorState` 함수는 매개변수를 통해 정수 비트 및 소수 비트 수를 사용자 정의할 수 있으며, `numericIndexedVectorBuild`는 그렇지 않습니다.

## groupNumericIndexedVector {#group-numeric-indexed-vector}

두 데이터 컬럼에서 NumericIndexedVector를 구성하고 모든 값의 합을 `Float64` 유형으로 반환합니다. 접미사 `State`가 추가되면 NumericIndexedVector 객체를 반환합니다.

**Syntax**

```sql
groupNumericIndexedVectorState(col1, col2)
groupNumericIndexedVectorState(type, integer_bit_num, fraction_bit_num)(col1, col2)
```

**Parameters**

- `type`: 문자열, 선택사항. 저장 형식을 지정합니다. 현재는 `'BSI'`만 지원됩니다.
- `integer_bit_num`: `UInt32`, 선택사항. `'BSI'` 저장 형식에서 유효하며, 이 매개변수는 정수 부분에 사용되는 비트 수를 나타냅니다. 인덱스 유형이 정수 유형일 때 기본값은 인덱스를 저장하는 데 사용되는 비트 수에 해당합니다. 예를 들어, 인덱스 유형이 UInt16인 경우 기본 `integer_bit_num`은 16입니다. Float32 및 Float64 인덱스 유형의 경우, `integer_bit_num`의 기본값은 40이며, 데이터의 정수 부분이 표현될 수 있는 범위는 `[-2^39, 2^39 - 1]`입니다. 유효 범위는 `[0, 64]`입니다.
- `fraction_bit_num`: `UInt32`, 선택사항. `'BSI'` 저장 형식에서 유효하며, 이 매개변수는 소수 부분에 사용되는 비트 수를 나타냅니다. 값 유형이 정수일 때 기본값은 0이며; 값 유형이 Float32 또는 Float64일 경우 기본값은 24입니다. 유효 범위는 `[0, 24]`입니다.
- 또한 integer_bit_num + fraction_bit_num의 유효 범위는 [0, 64]입니다.
- `col1`: 인덱스 컬럼. 지원되는 유형: `UInt8`/`UInt16`/`UInt32`/`Int8`/`Int16`/`Int32`.
- `col2`: 값 컬럼. 지원되는 유형: `Int8`/`Int16`/`Int32`/`Int64`/`UInt8`/`UInt16`/`UInt32`/`UInt64`/`Float32`/`Float64`.

**Return value**

모든 값의 합을 나타내는 `Float64` 값입니다.

**Example**

테스트 데이터:

```text
UserID  PlayTime
1       10
2       20
3       30
```

쿼리 및 결과:

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
아래 문서는 `system.functions` 시스템 테이블에서 생성된 것입니다.
:::

<!-- 
아래 태그는 시스템 테이블에서 문서를 생성하는 데 사용되며 삭제해서는 안 됩니다.
자세한 내용은 https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md를 참조하십시오.
-->

<!--AUTOGENERATED_START-->
## numericIndexedVectorAllValueSum {#numericIndexedVectorAllValueSum}

Introduced in: v25.7


numericIndexedVector의 모든 값의 합을 반환합니다. 
        

**Syntax**

```sql
numericIndexedVectorAllValueSum(v)
```

**Arguments**

- `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

합계를 반환합니다. [`Float64`](/sql-reference/data-types/float)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorAllValueSum(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Response
┌─res─┐
│  60 │
└─────┘
```



## numericIndexedVectorBuild {#numericIndexedVectorBuild}

Introduced in: v25.7


맵에서 NumericIndexedVector를 생성합니다. 맵의 키는 벡터의 인덱스를 나타내고, 맵의 값은 벡터의 값을 나타냅니다.
        

**Syntax**

```sql
numericIndexedVectorBuild(map)
```

**Arguments**

- `map` — 인덱스에서 값으로의 매핑. [`Map`](/sql-reference/data-types/map)


**Returned value**

NumericIndexedVector 객체를 반환합니다. [`AggregateFunction`](/sql-reference/data-types/aggregatefunction)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])) AS res, toTypeName(res);
```

```response title=Response
┌─res─┬─toTypeName(res)────────────────────────────────────────────┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8) │
└─────┴────────────────────────────────────────────────────────────┘
```



## numericIndexedVectorCardinality {#numericIndexedVectorCardinality}

Introduced in: v25.7


numericIndexedVector의 카디널리티(고유 인덱스 수)를 반환합니다.
        

**Syntax**

```sql
numericIndexedVectorCardinality(v)
```

**Arguments**

- `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

고유 인덱스 수를 반환합니다. [`UInt64`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorCardinality(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Response
┌─res─┐
│  3  │
└─────┘
```



## numericIndexedVectorGetValue {#numericIndexedVectorGetValue}

Introduced in: v25.7


지정된 인덱스에 해당하는 값을 numericIndexedVector에서 검색합니다.
        

**Syntax**

```sql
numericIndexedVectorGetValue(v, i)
```

**Arguments**

- `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `i` — 값을 검색할 인덱스. [`(U)Int*`](/sql-reference/data-types/int-uint)


**Returned value**

NumericIndexedVector의 값 유형과 동일한 유형의 숫자 값. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorGetValue(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])), 3) AS res;
```

```response title=Response
┌─res─┐
│  30 │
└─────┘
```



## numericIndexedVectorPointwiseAdd {#numericIndexedVectorPointwiseAdd}

Introduced in: v25.7


numericIndexedVector와 다른 numericIndexedVector 또는 숫자 상수 간의 포인트별 덧셈을 수행합니다. 
        

**Syntax**

```sql
numericIndexedVectorPointwiseAdd(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 숫자 상수 또는 numericIndexedVector 객체. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

새로운 numericIndexedVector 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorPointwiseDivide {#numericIndexedVectorPointwiseDivide}

Introduced in: v25.7


numericIndexedVector와 다른 numericIndexedVector 또는 숫자 상수 간의 포인트별 나누기를 수행합니다. 
        

**Syntax**

```sql
numericIndexedVectorPointwiseDivide(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 숫자 상수 또는 numericIndexedVector 객체. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

새로운 numericIndexedVector 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorPointwiseEqual {#numericIndexedVectorPointwiseEqual}

Introduced in: v25.7


numericIndexedVector와 다른 numericIndexedVector 또는 숫자 상수 간의 포인트별 비교를 수행합니다.
결과는 값이 같은 인덱스를 포함하는 numericIndexedVector로, 모든 해당 값은 1로 설정됩니다. 
        

**Syntax**

```sql
numericIndexedVectorPointwiseEqual(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 숫자 상수 또는 numericIndexedVector 객체. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

새로운 numericIndexedVector 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

****

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



## numericIndexedVectorPointwiseGreater {#numericIndexedVectorPointwiseGreater}

Introduced in: v25.7


numericIndexedVector와 다른 numericIndexedVector 또는 숫자 상수 간의 포인트별 비교를 수행합니다.
결과는 첫 번째 벡터의 값이 두 번째 벡터의 값보다 큰 인덱스를 포함하는 numericIndexedVector로, 모든 해당 값은 1로 설정됩니다.
        

**Syntax**

```sql
numericIndexedVectorPointwiseGreater(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 숫자 상수 또는 numericIndexedVector 객체. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

새로운 numericIndexedVector 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorPointwiseGreaterEqual {#numericIndexedVectorPointwiseGreaterEqual}

Introduced in: v25.7


numericIndexedVector와 다른 numericIndexedVector 또는 숫자 상수 간의 포인트별 비교를 수행합니다.
결과는 첫 번째 벡터의 값이 두 번째 벡터의 값보다 크거나 같은 인덱스를 포함하는 numericIndexedVector로, 모든 해당 값은 1로 설정됩니다.
        

**Syntax**

```sql
numericIndexedVectorPointwiseGreaterEqual(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 숫자 상수 또는 numericIndexedVector 객체. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

새로운 numericIndexedVector 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorPointwiseLess {#numericIndexedVectorPointwiseLess}

Introduced in: v25.7


numericIndexedVector와 다른 numericIndexedVector 또는 숫자 상수 간의 포인트별 비교를 수행합니다.
결과는 첫 번째 벡터의 값이 두 번째 벡터의 값보다 작은 인덱스를 포함하는 numericIndexedVector로, 모든 해당 값은 1로 설정됩니다.
        

**Syntax**

```sql
numericIndexedVectorPointwiseLess(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 숫자 상수 또는 numericIndexedVector 객체. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

새로운 numericIndexedVector 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorPointwiseLessEqual {#numericIndexedVectorPointwiseLessEqual}

Introduced in: v25.7


numericIndexedVector와 다른 numericIndexedVector 또는 숫자 상수 간의 포인트별 비교를 수행합니다.
결과는 첫 번째 벡터의 값이 두 번째 벡터의 값보다 작거나 같은 인덱스를 포함하는 numericIndexedVector로, 모든 해당 값은 1로 설정됩니다.
        

**Syntax**

```sql
numericIndexedVectorPointwiseLessEqual(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 숫자 상수 또는 numericIndexedVector 객체. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

새로운 numericIndexedVector 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorPointwiseMultiply {#numericIndexedVectorPointwiseMultiply}

Introduced in: v25.7


numericIndexedVector와 다른 numericIndexedVector 또는 숫자 상수 간의 포인트별 곱셈을 수행합니다. 
        

**Syntax**

```sql
numericIndexedVectorPointwiseMultiply(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 숫자 상수 또는 numericIndexedVector 객체. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

새로운 numericIndexedVector 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

****

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



## numericIndexedVectorPointwiseNotEqual {#numericIndexedVectorPointwiseNotEqual}

Introduced in: v25.7


numericIndexedVector와 다른 numericIndexedVector 또는 숫자 상수 간의 포인트별 비교를 수행합니다.
결과는 값이 같지 않은 인덱스를 포함하는 numericIndexedVector로, 모든 해당 값은 1로 설정됩니다. 
        

**Syntax**

```sql
numericIndexedVectorPointwiseNotEqual(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 숫자 상수 또는 numericIndexedVector 객체. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

새로운 numericIndexedVector 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorPointwiseSubtract {#numericIndexedVectorPointwiseSubtract}

Introduced in: v25.7


numericIndexedVector와 다른 numericIndexedVector 또는 숫자 상수 간의 포인트별 뺄셈을 수행합니다. 
        

**Syntax**

```sql
numericIndexedVectorPointwiseSubtract(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — 숫자 상수 또는 numericIndexedVector 객체. [`(U)Int*`](/sql-reference/data-types/int-uint) 또는 [`Float*`](/sql-reference/data-types/float) 또는 [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

새로운 numericIndexedVector 객체를 반환합니다. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorShortDebugString {#numericIndexedVectorShortDebugString}

Introduced in: v25.7


numericIndexedVector의 내부 정보를 JSON 형식으로 반환합니다.
이 함수는 주로 디버깅 용도로 사용됩니다.
        

**Syntax**

```sql
numericIndexedVectorShortDebugString(v)
```

**Arguments**

- `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

디버그 정보를 포함하는 JSON 문자열을 반환합니다. [`String`](/sql-reference/data-types/string)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorShortDebugString(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res\G;
```

```response title=Response
Row 1:
──────
res: {"vector_type":"BSI","index_type":"char8_t","value_type":"char8_t","integer_bit_num":8,"fraction_bit_num":0,"zero_indexes_info":{"cardinality":"0"},"non_zero_indexes_info":{"total_cardinality":"3","all_value_sum":60,"number_of_bitmaps":"8","bitmap_info":{"cardinality":{"0":"0","1":"2","2":"2","3":"2","4":"2","5":"0","6":"0","7":"0"}}}}
```



## numericIndexedVectorToMap {#numericIndexedVectorToMap}

Introduced in: v25.7


numericIndexedVector를 맵으로 변환합니다. 
        

**Syntax**

```sql
numericIndexedVectorToMap(v)
```

**Arguments**

- `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

인덱스-값 쌍을 포함하는 맵을 반환합니다. [`Map`](/sql-reference/data-types/map)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorToMap(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Response
┌─res──────────────┐
│ {1:10,2:20,3:30} │
└──────────────────┘
```



<!--AUTOGENERATED_END-->
