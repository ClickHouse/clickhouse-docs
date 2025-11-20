---
'description': '수치 데이터 시퀀스의 분위수를 계산하며, 각 요소의 가중치를 고려하여 선형 보간을 사용합니다.'
'sidebar_position': 176
'slug': '/sql-reference/aggregate-functions/reference/quantileExactWeightedInterpolated'
'title': 'quantileExactWeightedInterpolated'
'doc_type': 'reference'
---



# quantileExactWeightedInterpolated

수치 데이터 시퀀스의 [분위수](https://en.wikipedia.org/wiki/Quantile)를 선형 보간을 사용하여 계산하며, 각 요소의 가중치를 고려합니다.

보간된 값을 얻기 위해, 전달된 모든 값은 배열로 결합되어 해당 가중치에 따라 정렬됩니다. 그 후, 가중치를 기반으로 누적 분포를 구축하여 [가중 분위수 방법](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)을 사용하여 분위수 보간이 수행됩니다. 그 다음, 가중치와 값을 사용하여 분위수를 계산하기 위한 선형 보간이 수행됩니다.

쿼리에서 서로 다른 레벨을 가진 여러 `quantile*` 함수를 사용할 때, 내부 상태는 결합되지 않으므로 (이는 쿼리가 가능할 수 있는 것보다 덜 효율적으로 작동함을 의미합니다) 이 경우, [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 함수를 사용하십시오.

`quantileExactWeightedInterpolated`는 `quantileInterpolatedWeighted`보다 더 정확하기 때문에 `quantileExactWeightedInterpolated`의 사용을 강력히 권장합니다. 예시는 다음과 같습니다:

```sql
SELECT
    quantileExactWeightedInterpolated(0.99)(number, 1),
    quantile(0.99)(number),
    quantileInterpolatedWeighted(0.99)(number, 1)
FROM numbers(9)
┌─quantileExactWeightedInterpolated(0.99)(number, 1)─┬─quantile(0.99)(number)─┬─quantileInterpolatedWeighted(0.99)(number, 1)─┐
│                                               7.92 │                   7.92 │                                             8 │
└────────────────────────────────────────────────────┴────────────────────────┴───────────────────────────────────────────────┘
```

**Syntax**

```sql
quantileExactWeightedInterpolated(level)(expr, weight)
```

별칭: `medianExactWeightedInterpolated`.

**Arguments**

- `level` — 분위수의 레벨. 선택적 매개변수. 0에서 1 사이의 상수 부동 소수점 숫자. `[0.01, 0.99]` 범위의 `level` 값을 사용하는 것을 권장합니다. 기본값: 0.5. `level=0.5`에서 함수는 [중앙값](https://en.wikipedia.org/wiki/Median)을 계산합니다.
- `expr` — 수치 [데이터 타입](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) 또는 [DateTime](../../../sql-reference/data-types/datetime.md)을 생성하는 컬럼 값에 대한 표현식.
- `weight` — 시퀀스 구성원의 가중치가 있는 컬럼. 가중치는 [부호 없는 정수 타입](../../../sql-reference/data-types/int-uint.md)으로 값의 발생 수입니다.

**Returned value**

- 지정된 레벨의 분위수.

유형:

- 수치 데이터 타입 입력에 대해 [Float64](../../../sql-reference/data-types/float.md).
- 입력 값이 `Date` 타입인 경우 [Date](../../../sql-reference/data-types/date.md).
- 입력 값이 `DateTime` 타입인 경우 [DateTime](../../../sql-reference/data-types/datetime.md).

**Example**

입력 테이블:

```text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

결과:

```text
┌─quantileExactWeightedInterpolated(n, val)─┐
│                                       1.5 │
└───────────────────────────────────────────┘
```

**See Also**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
