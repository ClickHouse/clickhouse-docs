---
'description': 't-digest 알고리즘을 사용하여 숫자 데이터 시퀀스의 근사 사분위수를 계산합니다.'
'sidebar_position': 179
'slug': '/sql-reference/aggregate-functions/reference/quantiletdigestweighted'
'title': 'quantileTDigestWeighted'
'doc_type': 'reference'
---


# quantileTDigestWeighted

숫자 데이터 시퀀스의 근사 [분위수](https://en.wikipedia.org/wiki/Quantile)를 [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf) 알고리즘을 사용하여 계산합니다. 이 함수는 각 시퀀스 구성원의 가중치를 고려합니다. 최대 오차는 1%입니다. 메모리 소비는 `log(n)`이며, 여기서 `n`은 값의 수입니다.

함수의 성능은 [quantile](/sql-reference/aggregate-functions/reference/quantile) 또는 [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming)의 성능보다 낮습니다. 상태 크기와 정확도의 비율 측면에서 이 함수는 `quantile`보다 훨씬 우수합니다.

결과는 쿼리를 실행하는 순서에 따라 달라지며, 비결정적입니다.

여러 `quantile*` 함수를 쿼리에서 다른 수준으로 사용할 경우, 내부 상태가 결합되지 않습니다(즉, 쿼리의 효율성이 감소합니다). 이 경우, [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 함수를 사용하는 것이 좋습니다.

:::note    
`quantileTDigestWeighted`를 [작은 데이터 세트에 사용하지 않는 것이 좋습니다](https://github.com/tdunning/t-digest/issues/167#issuecomment-828650275) . 이 경우, [`quantileTDigest`](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md) 사용 가능성을 고려하세요.
:::

**구문**

```sql
quantileTDigestWeighted(level)(expr, weight)
```

별칭: `medianTDigestWeighted`.

**인수**

- `level` — 분위수의 수준. 선택적 매개변수. 0에서 1 사이의 상수 부동 소수점 숫자입니다. `[0.01, 0.99]` 범위의 `level` 값 사용을 권장합니다. 기본값: 0.5. `level=0.5`에서 함수는 [중앙값](https://en.wikipedia.org/wiki/Median)을 계산합니다.
- `expr` — 숫자 [데이터 유형](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) 또는 [DateTime](../../../sql-reference/data-types/datetime.md) 값으로 구성된 컬럼 값에 대한 표현식입니다.
- `weight` — 시퀀스 요소의 가중치를 가진 컬럼. 가중치는 값의 발생 횟수입니다.

**반환 값**

- 지정된 수준의 근사 분위수.

유형:

- 숫자 데이터 유형 입력에 대해 [Float64](../../../sql-reference/data-types/float.md).
- 입력 값이 `Date` 유형인 경우 [Date](../../../sql-reference/data-types/date.md).
- 입력 값이 `DateTime` 유형인 경우 [DateTime](../../../sql-reference/data-types/datetime.md).

**예제**

쿼리:

```sql
SELECT quantileTDigestWeighted(number, 1) FROM numbers(10)
```

결과:

```text
┌─quantileTDigestWeighted(number, 1)─┐
│                                4.5 │
└────────────────────────────────────┘
```

**참고**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
