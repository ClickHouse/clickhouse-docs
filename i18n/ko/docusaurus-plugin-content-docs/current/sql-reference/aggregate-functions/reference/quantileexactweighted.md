---
'description': '정확하게 수치 데이터 시퀀스의 분위수를 계산하며, 각 요소의 가중치를 고려합니다.'
'sidebar_position': 174
'slug': '/sql-reference/aggregate-functions/reference/quantileexactweighted'
'title': 'quantileExactWeighted'
'doc_type': 'reference'
---


# quantileExactWeighted

숫자 데이터 시퀀스의 [분위수](https://en.wikipedia.org/wiki/Quantile)를 정확하게 계산하며, 각 요소의 가중치를 고려합니다.

정확한 값을 얻기 위해 전달된 모든 값을 배열로 결합한 후 부분 정렬을 수행합니다. 각 값은 마치 `weight` 만큼 존재하는 것처럼 가중치와 함께 계산됩니다. 알고리즘에서 해시 테이블이 사용됩니다. 이로 인해 전달된 값이 자주 반복되는 경우, 이 함수는 [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact)보다 RAM을 덜 소모합니다. `quantileExact` 대신 이 함수를 사용하고 가중치를 1로 지정할 수 있습니다.

여러 개의 서로 다른 수준의 `quantile*` 함수를 쿼리에서 사용할 때, 내부 상태가 결합되지 않으므로(즉, 쿼리가 잠재적으로 더 효율적으로 작동하지 않음) 이 경우 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 함수를 사용하세요.

**구문**

```sql
quantileExactWeighted(level)(expr, weight)
```

별칭: `medianExactWeighted`.

**인수**

- `level` — 분위수의 수준. 선택적 매개변수입니다. 0에서 1까지의 상수 부동 소수점 숫자입니다. `[0.01, 0.99]` 범위의 `level` 값을 사용하는 것을 권장합니다. 기본값: 0.5. `level=0.5`에서 이 함수는 [중간 값](https://en.wikipedia.org/wiki/Median)을 계산합니다.
- `expr` — 숫자 [데이터 유형](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) 또는 [DateTime](../../../sql-reference/data-types/datetime.md) 결과를 생성하는 컬럼 값에 대한 표현식입니다.
- `weight` — 시퀀스 구성원의 가중치가 있는 컬럼입니다. 가중치는 [부호가 없는 정수 유형](../../../sql-reference/data-types/int-uint.md)으로 값이 발생하는 횟수입니다.

**반환 값**

- 지정된 수준의 분위수입니다.

유형:

- 숫자 데이터 유형 입력에 대해 [Float64](../../../sql-reference/data-types/float.md).
- 입력 값이 `Date` 유형인 경우 [Date](../../../sql-reference/data-types/date.md).
- 입력 값이 `DateTime` 유형인 경우 [DateTime](../../../sql-reference/data-types/datetime.md).

**예제**

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
SELECT quantileExactWeighted(n, val) FROM t
```

결과:

```text
┌─quantileExactWeighted(n, val)─┐
│                             1 │
└───────────────────────────────┘
```

**참고**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
