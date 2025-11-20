---
'description': 'quantileExact, quantileExactLow, quantileExactHigh, quantileExactExclusive,
  quantileExactInclusive 함수'
'sidebar_position': 173
'slug': '/sql-reference/aggregate-functions/reference/quantileexact'
'title': 'quantileExact 함수'
'doc_type': 'reference'
---


# quantileExact functions

## quantileExact {#quantileexact}

정확하게 숫자 데이터 시퀀스의 [분위수](https://en.wikipedia.org/wiki/Quantile)를 계산합니다.

정확한 값을 얻기 위해, 모든 전달된 값이 배열로 결합된 후 부분적으로 정렬됩니다. 따라서 이 함수는 `O(n)` 메모리를 소비하며, 여기서 `n`은 전달된 값의 수입니다. 그러나 소수의 값에 대해서는 이 함수가 매우 효과적입니다.

쿼리에서 서로 다른 수준의 여러 `quantile*` 함수를 사용할 때, 내부 상태는 결합되지 않습니다 (즉, 쿼리가 최적보다 덜 효율적으로 작동합니다). 이 경우 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 함수를 사용하십시오.

**문법**

```sql
quantileExact(level)(expr)
```

별칭: `medianExact`.

**인수**

- `level` — 분위수의 수준. 선택적 매개변수. 0에서 1 사이의 상수 부동 소수점 숫자. 우리는 `[0.01, 0.99]` 범위의 `level` 값을 사용하는 것을 권장합니다. 기본값: 0.5. `level=0.5`일 때 이 함수는 [중앙값](https://en.wikipedia.org/wiki/Median)을 계산합니다.
- `expr` — 숫자 [데이터 타입](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) 또는 [DateTime](../../../sql-reference/data-types/datetime.md) 결과를 제공하는 컬럼 값에 대한 표현식입니다.

**반환된 값**

- 지정된 수준의 분위수.

유형:

- 숫자 데이터 타입에 대해 출력 형식은 입력 형식과 동일합니다. 예를 들어:

```sql

SELECT
    toTypeName(quantileExact(number)) AS `quantile`,
    toTypeName(quantileExact(number::Int32)) AS `quantile_int32`,
    toTypeName(quantileExact(number::Float32)) AS `quantile_float32`,
    toTypeName(quantileExact(number::Float64)) AS `quantile_float64`,
    toTypeName(quantileExact(number::Int64)) AS `quantile_int64`
FROM numbers(1)
   ┌─quantile─┬─quantile_int32─┬─quantile_float32─┬─quantile_float64─┬─quantile_int64─┐
1. │ UInt64   │ Int32          │ Float32          │ Float64          │ Int64          │
   └──────────┴────────────────┴──────────────────┴──────────────────┴────────────────┘

1 row in set. Elapsed: 0.002 sec.
```

- 입력 값이 `Date` 타입일 경우 [Date](../../../sql-reference/data-types/date.md).
- 입력 값이 `DateTime` 타입일 경우 [DateTime](../../../sql-reference/data-types/datetime.md).

**예시**

쿼리:

```sql
SELECT quantileExact(number) FROM numbers(10)
```

결과:

```text
┌─quantileExact(number)─┐
│                     5 │
└───────────────────────┘
```

## quantileExactLow {#quantileexactlow}

`quantileExact`와 유사하게, 숫자 데이터 시퀀스의 정확한 [분위수](https://en.wikipedia.org/wiki/Quantile)를 계산합니다.

정확한 값을 얻기 위해, 모든 전달된 값은 배열로 결합된 후 완전히 정렬됩니다. 정렬 [알고리즘의](https://en.cppreference.com/w/cpp/algorithm/sort) 복잡도는 `O(N·log(N))`이며, 여기서 `N = std::distance(first, last)` 비교수입니다.

반환 값은 분위수 수준과 선택된 요소의 수에 따라 다릅니다. 즉, 수준이 0.5인 경우, 이 함수는 짝수 요소의 경우 더 낮은 중앙값을, 홀수 요소의 경우 중간 중앙값을 반환합니다. 중앙값은 python에서 사용되는 [median_low](https://docs.python.org/3/library/statistics.html#statistics.median_low) 구현과 유사하게 계산됩니다.

모든 다른 수준의 경우, `level * size_of_array` 값에 해당하는 인덱스의 요소가 반환됩니다. 예를 들어:

```sql
SELECT quantileExactLow(0.1)(number) FROM numbers(10)

┌─quantileExactLow(0.1)(number)─┐
│                             1 │
└───────────────────────────────┘
```

쿼리에서 서로 다른 수준의 여러 `quantile*` 함수를 사용할 때, 내부 상태는 결합되지 않습니다 (즉, 쿼리가 최적보다 덜 효율적으로 작동합니다). 이 경우 [quantiles](/sql-reference/aggregate-functions/reference/quantiles) 함수를 사용하십시오.

**문법**

```sql
quantileExactLow(level)(expr)
```

별칭: `medianExactLow`.

**인수**

- `level` — 분위수의 수준. 선택적 매개변수. 0에서 1 사이의 상수 부동 소수점 숫자. 우리는 `[0.01, 0.99]` 범위의 `level` 값을 사용하는 것을 권장합니다. 기본값: 0.5. `level=0.5`일 때 이 함수는 [중앙값](https://en.wikipedia.org/wiki/Median)을 계산합니다.
- `expr` — 숫자 [데이터 타입](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) 또는 [DateTime](../../../sql-reference/data-types/datetime.md) 결과를 제공하는 컬럼 값에 대한 표현식입니다.

**반환된 값**

- 지정된 수준의 분위수.

유형:

- [Float64](../../../sql-reference/data-types/float.md) 숫자 데이터 타입 입력에 대한.
- 입력 값이 `Date` 타입일 경우 [Date](../../../sql-reference/data-types/date.md).
- 입력 값이 `DateTime` 타입일 경우 [DateTime](../../../sql-reference/data-types/datetime.md).

**예시**

쿼리:

```sql
SELECT quantileExactLow(number) FROM numbers(10)
```

결과:

```text
┌─quantileExactLow(number)─┐
│                        4 │
└──────────────────────────┘
```

## quantileExactHigh {#quantileexacthigh}

`quantileExact`와 유사하게, 숫자 데이터 시퀀스의 정확한 [분위수](https://en.wikipedia.org/wiki/Quantile)를 계산합니다.

모든 전달된 값이 배열로 결합된 후 완전히 정렬되어 정확한 값을 얻습니다. 정렬 [알고리즘의](https://en.cppreference.com/w/cpp/algorithm/sort) 복잡도는 `O(N·log(N))`이며, 여기서 `N = std::distance(first, last)` 비교수입니다.

반환 값은 분위수 수준과 선택된 요소의 수에 따라 다릅니다. 즉, 수준이 0.5인 경우, 이 함수는 짝수 요소의 경우 더 높은 중앙값을, 홀수 요소의 경우 중간 중앙값을 반환합니다. 중앙값은 python에서 사용되는 [median_high](https://docs.python.org/3/library/statistics.html#statistics.median_high) 구현과 유사하게 계산됩니다. 모든 다른 수준의 경우, `level * size_of_array` 값에 해당하는 인덱스의 요소가 반환됩니다.

이 구현은 현재 `quantileExact` 구현과 정확히 유사하게 작동합니다.

쿼리에서 서로 다른 수준의 여러 `quantile*` 함수를 사용할 때, 내부 상태는 결합되지 않습니다 (즉, 쿼리가 최적보다 덜 효율적으로 작동합니다). 이 경우 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 함수를 사용하십시오.

**문법**

```sql
quantileExactHigh(level)(expr)
```

별칭: `medianExactHigh`.

**인수**

- `level` — 분위수의 수준. 선택적 매개변수. 0에서 1 사이의 상수 부동 소수점 숫자. 우리는 `[0.01, 0.99]` 범위의 `level` 값을 사용하는 것을 권장합니다. 기본값: 0.5. `level=0.5`일 때 이 함수는 [중앙값](https://en.wikipedia.org/wiki/Median)을 계산합니다.
- `expr` — 숫자 [데이터 타입](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) 또는 [DateTime](../../../sql-reference/data-types/datetime.md) 결과를 제공하는 컬럼 값에 대한 표현식입니다.

**반환된 값**

- 지정된 수준의 분위수.

유형:

- [Float64](../../../sql-reference/data-types/float.md) 숫자 데이터 타입 입력에 대한.
- 입력 값이 `Date` 타입일 경우 [Date](../../../sql-reference/data-types/date.md).
- 입력 값이 `DateTime` 타입일 경우 [DateTime](../../../sql-reference/data-types/datetime.md).

**예시**

쿼리:

```sql
SELECT quantileExactHigh(number) FROM numbers(10)
```

결과:

```text
┌─quantileExactHigh(number)─┐
│                         5 │
└───────────────────────────┘
```

## quantileExactExclusive {#quantileexactexclusive}

정확하게 숫자 데이터 시퀀스의 [분위수](https://en.wikipedia.org/wiki/Quantile)를 계산합니다.

정확한 값을 얻기 위해, 모든 전달된 값이 배열로 결합된 후 부분적으로 정렬됩니다. 따라서 이 함수는 `O(n)` 메모리를 소비하며, 여기서 `n`은 전달된 값의 수입니다. 그러나 소수의 값에 대해 이 함수는 매우 효과적입니다.

이 함수는 Excel 함수 [PERCENTILE.EXC](https://support.microsoft.com/en-us/office/percentile-exc-function-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba)와 동일하며, ([type R6](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)).

쿼리에서 서로 다른 수준의 여러 `quantileExactExclusive` 함수를 사용할 때, 내부 상태는 결합되지 않습니다 (즉, 쿼리가 최적보다 덜 효율적으로 작동합니다). 이 경우 [quantilesExactExclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactexclusive) 함수를 사용하십시오.

**문법**

```sql
quantileExactExclusive(level)(expr)
```

**인수**

- `expr` — 숫자 [데이터 타입](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) 또는 [DateTime](../../../sql-reference/data-types/datetime.md) 결과를 제공하는 컬럼 값에 대한 표현식입니다.

**매개변수**

- `level` — 분위수의 수준. 선택적. 가능한 값: (0, 1) — 경계 미포함. 기본값: 0.5. `level=0.5`일 때 이 함수는 [중앙값](https://en.wikipedia.org/wiki/Median)을 계산합니다. [Float](../../../sql-reference/data-types/float.md).

**반환된 값**

- 지정된 수준의 분위수.

유형:

- [Float64](../../../sql-reference/data-types/float.md) 숫자 데이터 타입 입력에 대한.
- 입력 값이 `Date` 타입일 경우 [Date](../../../sql-reference/data-types/date.md).
- 입력 값이 `DateTime` 타입일 경우 [DateTime](../../../sql-reference/data-types/datetime.md).

**예시**

쿼리:

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantileExactExclusive(0.6)(x) FROM (SELECT number AS x FROM num);
```

결과:

```text
┌─quantileExactExclusive(0.6)(x)─┐
│                          599.6 │
└────────────────────────────────┘
```

## quantileExactInclusive {#quantileexactinclusive}

정확하게 숫자 데이터 시퀀스의 [분위수](https://en.wikipedia.org/wiki/Quantile)를 계산합니다.

정확한 값을 얻기 위해, 모든 전달된 값이 배열로 결합된 후 부분적으로 정렬됩니다. 따라서 이 함수는 `O(n)` 메모리를 소비하며, 여기서 `n`은 전달된 값의 수입니다. 그러나 소수의 값에 대해 이 함수는 매우 효과적입니다.

이 함수는 Excel 함수 [PERCENTILE.INC](https://support.microsoft.com/en-us/office/percentile-inc-function-680f9539-45eb-410b-9a5e-c1355e5fe2ed)과 동일하며, ([type R7](https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample)).

쿼리에서 서로 다른 수준의 여러 `quantileExactInclusive` 함수를 사용할 때, 내부 상태는 결합되지 않습니다 (즉, 쿼리가 최적보다 덜 효율적으로 작동합니다). 이 경우 [quantilesExactInclusive](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantilesexactinclusive) 함수를 사용하십시오.

**문법**

```sql
quantileExactInclusive(level)(expr)
```

**인수**

- `expr` — 숫자 [데이터 타입](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) 또는 [DateTime](../../../sql-reference/data-types/datetime.md) 결과를 제공하는 컬럼 값에 대한 표현식입니다.

**매개변수**

- `level` — 분위수의 수준. 선택적. 가능한 값: [0, 1] — 경계 포함. 기본값: 0.5. `level=0.5`일 때 이 함수는 [중앙값](https://en.wikipedia.org/wiki/Median)을 계산합니다. [Float](../../../sql-reference/data-types/float.md).

**반환된 값**

- 지정된 수준의 분위수.

유형:

- [Float64](../../../sql-reference/data-types/float.md) 숫자 데이터 타입 입력에 대한.
- 입력 값이 `Date` 타입일 경우 [Date](../../../sql-reference/data-types/date.md).
- 입력 값이 `DateTime` 타입일 경우 [DateTime](../../../sql-reference/data-types/datetime.md).

**예시**

쿼리:

```sql
CREATE TABLE num AS numbers(1000);

SELECT quantileExactInclusive(0.6)(x) FROM (SELECT number AS x FROM num);
```

결과:

```text
┌─quantileExactInclusive(0.6)(x)─┐
│                          599.4 │
└────────────────────────────────┘
```

**참고**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
