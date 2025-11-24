---
'description': '숫자 데이터 시퀀스의 근사 quantile을 계산합니다.'
'sidebar_position': 170
'slug': '/sql-reference/aggregate-functions/reference/quantile'
'title': 'quantile'
'doc_type': 'reference'
---


# quantile

숫자 데이터 시퀀스의 근사 [분위수](https://en.wikipedia.org/wiki/Quantile)를 계산합니다.

이 함수는 최대 8192의 저장소 크기를 가진 [저수지 샘플링](https://en.wikipedia.org/wiki/Reservoir_sampling)과 샘플링을 위한 난수 생성기를 적용합니다. 결과는 비결정적입니다. 정확한 분위수를 얻으려면 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 함수를 사용하십시오.

쿼리에서 서로 다른 수준의 여러 `quantile*` 함수를 사용할 때 내부 상태는 결합되지 않습니다(즉, 쿼리가 가능성이 더 낮아집니다). 이 경우 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 함수를 사용하십시오.

빈 숫자 시퀀스의 경우 `quantile`은 NaN을 반환하지만, 그 `quantile*` 변형은 NaN 또는 시퀀스 유형에 대한 기본값을 반환합니다.

**구문**

```sql
quantile(level)(expr)
```

별칭: `median`.

**인수**

- `level` — 분위수 수준. 선택적 파라미터. 0에서 1 사이의 상수 부동 소수점 숫자입니다. `[0.01, 0.99]` 범위의 `level` 값을 사용하는 것을 권장합니다. 기본값: 0.5. `level=0.5`에서 이 함수는 [중앙값](https://en.wikipedia.org/wiki/Median)을 계산합니다.
- `expr` — 숫자 [데이터 유형](/sql-reference/data-types), [Date](/sql-reference/data-types/date) 또는 [DateTime](/sql-reference/data-types/datetime)에 대해 컬럼 값에 대한 표현식입니다.

**반환 값**

- 지정된 수준의 근사 분위수입니다.

유형:

- 숫자 데이터 유형 입력에 대한 [Float64](/sql-reference/data-types/float).
- 입력값이 `Date` 유형인 경우 [Date](/sql-reference/data-types/date).
- 입력값이 `DateTime` 유형인 경우 [DateTime](/sql-reference/data-types/datetime).

**예제**

입력 테이블:

```text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

쿼리:

```sql
SELECT quantile(val) FROM t
```

결과:

```text
┌─quantile(val)─┐
│           1.5 │
└───────────────┘
```

**참고**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles#quantiles)
