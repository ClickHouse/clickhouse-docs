---
'description': '숫자 데이터 시퀀스의 근사값 분포를 계산합니다.'
'sidebar_position': 172
'slug': '/sql-reference/aggregate-functions/reference/quantiledeterministic'
'title': 'quantileDeterministic'
'doc_type': 'reference'
---


# quantileDeterministic

숫자 데이터 시퀀스의 대략적인 [사분위수](https://en.wikipedia.org/wiki/Quantile)를 계산합니다.

이 함수는 최대 8192의 저수지 크기를 가진 [저수지 샘플링](https://en.wikipedia.org/wiki/Reservoir_sampling)과 결정론적 샘플링 알고리즘을 적용합니다. 결과는 결정론적입니다. 정확한 사분위수를 얻으려면 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact) 함수를 사용하세요.

쿼리에서 서로 다른 수준의 여러 `quantile*` 함수를 사용할 때 내부 상태가 결합되지 않으므로(즉, 쿼리가 덜 효율적으로 작동합니다) 이 경우 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 함수를 사용하세요.

**구문**

```sql
quantileDeterministic(level)(expr, determinator)
```

별칭: `medianDeterministic`.

**인수**

- `level` — 사분위수의 수준. 선택적 매개변수. 0에서 1 사이의 상수 부동 소수점 숫자입니다. `[0.01, 0.99]` 범위의 `level` 값을 사용하는 것을 권장합니다. 기본값: 0.5. `level=0.5`에서 함수는 [중앙값](https://en.wikipedia.org/wiki/Median)을 계산합니다.
- `expr` — 숫자 [데이터 유형](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) 또는 [DateTime](../../../sql-reference/data-types/datetime.md) 결과를 생성하는 컬럼 값에 대한 표현식입니다.
- `determinator` — 샘플링 결과를 결정론적으로 만들기 위해 저수지 샘플링 알고리즘에서 임의의 숫자 생성기 대신 해시가 사용되는 숫자입니다. 결정론자로 사용자 ID 또는 이벤트 ID와 같은 결정론적인 양의 숫자를 사용할 수 있습니다. 같은 결정론자 값이 너무 자주 발생하면 함수가 올바르게 작동하지 않습니다.

**반환 값**

- 지정된 수준의 대략적인 사분위수.

유형:

- [Float64](../../../sql-reference/data-types/float.md) 숫자 데이터 유형 입력에 대해.
- 입력 값이 `Date` 유형인 경우 [Date](../../../sql-reference/data-types/date.md).
- 입력 값이 `DateTime` 유형인 경우 [DateTime](../../../sql-reference/data-types/datetime.md).

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
SELECT quantileDeterministic(val, 1) FROM t
```

결과:

```text
┌─quantileDeterministic(val, 1)─┐
│                           1.5 │
└───────────────────────────────┘
```

**참고자료**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
