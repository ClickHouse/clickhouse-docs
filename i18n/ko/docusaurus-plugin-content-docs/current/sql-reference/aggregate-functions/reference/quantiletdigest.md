---
'description': 't-digest 알고리즘을 사용하여 숫자 데이터 시퀀스의 근사 분위수를 계산합니다.'
'sidebar_position': 178
'slug': '/sql-reference/aggregate-functions/reference/quantiletdigest'
'title': 'quantileTDigest'
'doc_type': 'reference'
---


# quantileTDigest

숫자 데이터 시퀀스의 근사 [분위수](https://en.wikipedia.org/wiki/Quantile)를 [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf) 알고리즘을 사용하여 계산합니다.

메모리 소모는 `log(n)`이며, 여기서 `n`은 값의 수입니다. 결과는 쿼리 실행 순서에 따라 달라지며, 비결정적입니다.

이 함수의 성능은 [quantile](/sql-reference/aggregate-functions/reference/quantile) 또는 [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming)보다 낮습니다. 상태 크기와 정밀도의 비율 측면에서 이 함수는 `quantile`보다 훨씬 우수합니다.

쿼리에서 서로 다른 수준의 여러 `quantile*` 함수를 사용하는 경우 내부 상태가 결합되지 않습니다 (즉, 쿼리가 장기적으로 더 비효율적으로 작동합니다). 이 경우 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 함수를 사용하세요.

**구문**

```sql
quantileTDigest(level)(expr)
```

별칭: `medianTDigest`.

**인수**

- `level` — 분위수 수준. 선택적 매개변수. 0에서 1 사이의 상수 부동소수점 숫자입니다. `[0.01, 0.99]` 범위의 `level` 값을 사용하는 것이 좋습니다. 기본값: 0.5. `level=0.5`에서 이 함수는 [중앙값](https://en.wikipedia.org/wiki/Median)을 계산합니다.
- `expr` — 숫자 [데이터 유형](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) 또는 [DateTime](../../../sql-reference/data-types/datetime.md)에 해당하는 컬럼 값에 대한 표현식입니다.

**반환 값**

- 지정된 수준의 근사 분위수.

유형:

- 입력이 숫자 데이터 유형일 경우 [Float64](../../../sql-reference/data-types/float.md).
- 입력 값이 `Date` 유형일 경우 [Date](../../../sql-reference/data-types/date.md).
- 입력 값이 `DateTime` 유형일 경우 [DateTime](../../../sql-reference/data-types/datetime.md).

**예제**

쿼리:

```sql
SELECT quantileTDigest(number) FROM numbers(10)
```

결과:

```text
┌─quantileTDigest(number)─┐
│                     4.5 │
└─────────────────────────┘
```

**참고**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
