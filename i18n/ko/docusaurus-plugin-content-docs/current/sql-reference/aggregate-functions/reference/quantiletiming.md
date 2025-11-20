---
'description': '정해진 정밀도로 숫자 데이터 시퀀스의 분위수를 계산합니다.'
'sidebar_position': 180
'slug': '/sql-reference/aggregate-functions/reference/quantiletiming'
'title': 'quantileTiming'
'doc_type': 'reference'
---


# quantileTiming

정해진 정밀도로 숫자 데이터 시퀀스의 [분위수](https://en.wikipedia.org/wiki/Quantile)를 계산합니다.

결과는 결정적이며(쿼리 처리 순서에 의존하지 않음) 웹 페이지 로딩 시간이나 백엔드 응답 시간과 같은 분포를 설명하는 시퀀스와 함께 작업하도록 최적화되어 있습니다.

쿼리에서 서로 다른 수준의 여러 `quantile*` 함수를 사용할 경우 내부 상태가 결합되지 않아(즉, 쿼리가 최적화된 것보다 비효율적으로 작동함) 이 경우에는 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 함수를 사용하십시오.

**구문**

```sql
quantileTiming(level)(expr)
```

별칭: `medianTiming`.

**인수**

- `level` — 분위수의 수준. 선택적 매개변수. 0에서 1 사이의 고정 소수점 숫자입니다. `[0.01, 0.99]` 범위의 `level` 값을 사용하는 것이 좋습니다. 기본값: 0.5. `level=0.5`에서 이 함수는 [중간값](https://en.wikipedia.org/wiki/Median)을 계산합니다.

- `expr` — [expression](/sql-reference/syntax#expressions)으로 컬럼 값에 대해 [Float\*](../../../sql-reference/data-types/float.md) 타입의 숫자를 반환합니다.

  - 함수에 음수 값이 전달되면 동작이 정의되지 않습니다.
  - 값이 30,000보다 크면(페이지 로딩 시간이 30초를 초과하는 경우) 30,000으로 간주됩니다.

**정확도**

계산이 정확한 경우:

- 총 값의 수가 5670을 초과하지 않음.
- 총 값의 수가 5670을 초과하지만 페이지 로딩 시간이 1024ms 미만임.

그렇지 않으면, 계산 결과는 16ms의 가장 가까운 배수로 반올림됩니다.

:::note    
페이지 로딩 시간 분위수를 계산할 때 이 함수는 [quantile](/sql-reference/aggregate-functions/reference/quantile)보다 더 효과적이고 정확합니다.
:::

**반환 값**

- 지정된 수준의 분위수.

타입: `Float32`.

:::note    
함수에 값이 전달되지 않으면(예: `quantileTimingIf` 사용 시) [NaN](/sql-reference/data-types/float#nan-and-inf)이 반환됩니다. 이는 이러한 경우가 0으로 결과가 나오는 경우와 구별되기 위한 목적입니다. `NaN` 값 정렬에 대한 주의 사항은 [ORDER BY 절](/sql-reference/statements/select/order-by)을 참조하십시오.
:::

**예제**

입력 테이블:

```text
┌─response_time─┐
│            72 │
│           112 │
│           126 │
│           145 │
│           104 │
│           242 │
│           313 │
│           168 │
│           108 │
└───────────────┘
```

쿼리:

```sql
SELECT quantileTiming(response_time) FROM t
```

결과:

```text
┌─quantileTiming(response_time)─┐
│                           126 │
└───────────────────────────────┘
```

**참고**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
