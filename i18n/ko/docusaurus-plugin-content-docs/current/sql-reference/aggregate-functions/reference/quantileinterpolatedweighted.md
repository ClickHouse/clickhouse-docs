---
'description': '숫자 데이터 시퀀스의 분위수를 계산하며, 선형 보간을 사용하여 각 요소의 가중치를 고려합니다.'
'sidebar_position': 176
'slug': '/sql-reference/aggregate-functions/reference/quantileInterpolatedWeighted'
'title': 'quantileInterpolatedWeighted'
'doc_type': 'reference'
---


# quantileInterpolatedWeighted

숫자 데이터 시퀀스의 [사분위수](https://en.wikipedia.org/wiki/Quantile)를 선형 보간을 사용하여 계산하며, 각 요소의 가중치를 고려합니다.

보간된 값을 얻기 위해 모든 전달된 값들이 배열로 결합되며, 그 후 각기 해당하는 가중치에 따라 정렬됩니다. 그 다음 가중치에 기반하여 누적 분포를 구축함으로써 [가중치 백분위 방법](https://en.wikipedia.org/wiki/Percentile#The_weighted_percentile_method)을 사용하여 사분위 간섭이 수행됩니다. 이 과정에서 가중치와 값을 사용하여 사분위를 계산합니다.

여러 개의 `quantile*` 함수를 쿼리에서 다른 수준으로 사용할 경우 내부 상태가 결합되지 않으므로 (즉, 쿼리가 효율적으로 작동하지 않음) 이 경우 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 함수를 사용해야 합니다.

**구문**

```sql
quantileInterpolatedWeighted(level)(expr, weight)
```

별칭: `medianInterpolatedWeighted`.

**인수**

- `level` — 사분위수의 수준. 선택적 매개변수. 0에서 1까지의 상수 실수 값. `[0.01, 0.99]` 범위의 `level` 값을 사용하는 것이 좋습니다. 기본값: 0.5. `level=0.5`에서 이 함수는 [중앙값](https://en.wikipedia.org/wiki/Median)을 계산합니다.
- `expr` — 숫자 [데이터 유형](/sql-reference/data-types), [날짜](../../../sql-reference/data-types/date.md) 또는 [날짜 시간](../../../sql-reference/data-types/datetime.md)으로 결과를 생성하는 컬럼 값에 대한 표현식.
- `weight` — 시퀀스 구성원의 가중치 컬럼. 가중치는 값의 발생 횟수입니다.

**반환 값**

- 지정된 수준의 사분위수.

유형:

- 숫자 데이터 유형 입력에 대해 [Float64](../../../sql-reference/data-types/float.md).
- 입력 값이 `날짜` 유형이면 [날짜](../../../sql-reference/data-types/date.md).
- 입력 값이 `날짜 시간` 유형이면 [날짜 시간](../../../sql-reference/data-types/datetime.md).

**예시**

입력 테이블:

```text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

쿼리:

```sql
SELECT quantileInterpolatedWeighted(n, val) FROM t
```

결과:

```text
┌─quantileInterpolatedWeighted(n, val)─┐
│                                    1 │
└──────────────────────────────────────┘
```

**참고 사항**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
