---
'description': 'quantiles, quantilesExactExclusive, quantilesExactInclusive, quantilesGK'
'sidebar_position': 177
'slug': '/sql-reference/aggregate-functions/reference/quantiles'
'title': 'quantiles 함수'
'doc_type': 'reference'
---


# quantiles functions

## quantiles {#quantiles}

구문: `quantiles(level1, level2, ...)(x)`

모든 quantile 함수는 다음과 같은 해당 quantiles 함수를 가지고 있습니다: `quantiles`, `quantilesDeterministic`, `quantilesTiming`, `quantilesTimingWeighted`, `quantilesExact`, `quantilesExactWeighted`, `quantileExactWeightedInterpolated`, `quantileInterpolatedWeighted`, `quantilesTDigest`, `quantilesBFloat16`, `quantilesDD`. 이러한 함수는 나열된 레벨의 모든 quantile을 한 번의 패스로 계산하고 결과 값을 배열로 반환합니다.

## quantilesExactExclusive {#quantilesexactexclusive}

숫자 데이터 시퀀스의 [quantiles](https://en.wikipedia.org/wiki/Quantile)를 정확하게 계산합니다.

정확한 값을 얻기 위해 모든 전달된 값은 배열로 결합되며, 이는 부분적으로 정렬됩니다. 따라서 이 함수는 전달된 값의 수에 대해 `O(n)` 메모리를 소비합니다. 그러나 소수의 값에 대해서는 이 함수가 매우 효과적입니다.

이 함수는 [PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba) Excel 함수와 동등합니다, ([type R6](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)).

레벨 집합에 대해 [quantileExactExclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactexclusive)보다 더 효율적으로 작동합니다.

**구문**

```sql
quantilesExactExclusive(level1, level2, ...)(expr)
```

**인수**

- `expr` — 숫자 [데이터 유형](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) 또는 [DateTime](../../../sql-reference/data-types/datetime.md) 결과값을 생성하는 컬럼 값에 대한 표현식입니다.

**매개변수**

- `level` — quantile 레벨. 가능한 값: (0, 1) — 경계 포함되지 않음. [Float](../../../sql-reference/data-types/float.md).

**반환 값**

- 지정된 레벨의 quantiles [배열](../../../sql-reference/data-types/array.md).

배열 값의 유형:

- 입력된 숫자 데이터 타입에 대해 [Float64](../../../sql-reference/data-types/float.md).
- 입력된 값이 `Date` 유형일 경우 [Date](../../../sql-reference/data-types/date.md).
- 입력된 값이 `DateTime` 유형일 경우 [DateTime](../../../sql-reference/data-types/datetime.md).

**예제**

쿼리:

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantilesExactExclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x) FROM (SELECT number AS x FROM num);
```

결과:

```text
┌─quantilesExactExclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x)─┐
│ [249.25,499.5,749.75,899.9,949.9499999999999,989.99,998.999]        │
└─────────────────────────────────────────────────────────────────────┘
```

## quantilesExactInclusive {#quantilesexactinclusive}

숫자 데이터 시퀀스의 [quantiles](https://en.wikipedia.org/wiki/Quantile)를 정확하게 계산합니다.

정확한 값을 얻기 위해 모든 전달된 값은 배열로 결합되며, 이는 부분적으로 정렬됩니다. 따라서 이 함수는 전달된 값의 수에 대해 `O(n)` 메모리를 소비합니다. 그러나 소수의 값에 대해서는 이 함수가 매우 효과적입니다.

이 함수는 [PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed) Excel 함수와 동등합니다, ([type R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)).

레벨 집합에 대해 [quantileExactInclusive](../../../sql-reference/aggregate-functions/reference/quantileexact.md#quantileexactinclusive)보다 더 효율적으로 작동합니다.

**구문**

```sql
quantilesExactInclusive(level1, level2, ...)(expr)
```

**인수**

- `expr` — 숫자 [데이터 유형](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) 또는 [DateTime](../../../sql-reference/data-types/datetime.md) 결과값을 생성하는 컬럼 값에 대한 표현식입니다.

**매개변수**

- `level` — quantile 레벨. 가능한 값: [0, 1] — 경계 포함. [Float](../../../sql-reference/data-types/float.md).

**반환 값**

- 지정된 레벨의 quantiles [배열](../../../sql-reference/data-types/array.md).

배열 값의 유형:

- 입력된 숫자 데이터 타입에 대해 [Float64](../../../sql-reference/data-types/float.md).
- 입력된 값이 `Date` 유형일 경우 [Date](../../../sql-reference/data-types/date.md).
- 입력된 값이 `DateTime` 유형일 경우 [DateTime](../../../sql-reference/data-types/datetime.md).

**예제**

쿼리:

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantilesExactInclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x) FROM (SELECT number AS x FROM num);
```

결과:

```text
┌─quantilesExactInclusive(0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999)(x)─┐
│ [249.75,499.5,749.25,899.1,949.05,989.01,998.001]                   │
└─────────────────────────────────────────────────────────────────────┘
```

## quantilesGK {#quantilesgk}

`quantilesGK`는 `quantileGK`와 유사하게 작동하지만 서로 다른 레벨에서 동시에 양을 계산할 수 있게 해주며 배열을 반환합니다.

**구문**

```sql
quantilesGK(accuracy, level1, level2, ...)(expr)
```

**반환 값**

- 지정된 레벨의 quantiles [배열](../../../sql-reference/data-types/array.md).

배열 값의 유형:

- 입력된 숫자 데이터 타입에 대해 [Float64](../../../sql-reference/data-types/float.md).
- 입력된 값이 `Date` 유형일 경우 [Date](../../../sql-reference/data-types/date.md).
- 입력된 값이 `DateTime` 유형일 경우 [DateTime](../../../sql-reference/data-types/datetime.md).

**예제**

쿼리:

```sql
SELECT quantilesGK(1, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(1, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [1,1,1]                                          │
└──────────────────────────────────────────────────┘

SELECT quantilesGK(10, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(10, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [156,413,659]                                     │
└───────────────────────────────────────────────────┘
SELECT quantilesGK(100, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(100, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [251,498,741]                                      │
└────────────────────────────────────────────────────┘

SELECT quantilesGK(1000, 0.25, 0.5, 0.75)(number + 1)
FROM numbers(1000)

┌─quantilesGK(1000, 0.25, 0.5, 0.75)(plus(number, 1))─┐
│ [249,499,749]                                       │
└─────────────────────────────────────────────────────┘
```
