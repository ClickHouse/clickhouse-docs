---
'description': '지정된 정밀도로 각 시퀀스 구성원의 가중치에 따라 숫자 데이터 시퀀스의 분위수를 계산합니다.'
'sidebar_position': 181
'slug': '/sql-reference/aggregate-functions/reference/quantiletimingweighted'
'title': 'quantileTimingWeighted'
'doc_type': 'reference'
---


# quantileTimingWeighted

정해진 정밀도로 각 시퀀스 구성원의 가중치에 따라 숫자 데이터 시퀀스의 [분위수](https://en.wikipedia.org/wiki/Quantile)를 계산합니다.

결과는 결정론적입니다(쿼리 처리 순서에 의존하지 않음). 이 함수는 웹 페이지 로딩 시간이나 백엔드 응답 시간과 같은 분포를 설명하는 시퀀스를 처리하는 데 최적화되어 있습니다.

쿼리에서 서로 다른 수준의 여러 `quantile*` 함수를 사용할 때 내부 상태가 결합되지 않으므로(즉, 쿼리가 더 비효율적으로 작동함) 이 경우 [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 함수를 사용하는 것이 좋습니다.

**구문**

```sql
quantileTimingWeighted(level)(expr, weight)
```

별칭: `medianTimingWeighted`.

**인수**

- `level` — 분위수의 수준. 선택적 매개변수. 0에서 1 사이의 상수 부동 소수점 숫자. `[0.01, 0.99]` 범위의 `level` 값을 사용하는 것을 권장합니다. 기본값: 0.5. `level=0.5`에서 이 함수는 [중앙값](https://en.wikipedia.org/wiki/Median)을 계산합니다.

- `expr` — [표현식](/sql-reference/syntax#expressions)으로, [Float\*](../../../sql-reference/data-types/float.md)-타입 숫자를 반환하는 컬럼 값입니다.

        - 함수에 음수 값이 전달되면 동작이 정의되지 않습니다.
        - 값이 30,000(30초 이상의 페이지 로딩 시간)보다 크면 30,000으로 간주됩니다.

- `weight` — 시퀀스 요소의 가중치가 있는 컬럼. 가중치는 값 발생 횟수의 수입니다.

**정확도**

계산이 정확하려면 다음 조건을 충족해야 합니다:

- 값의 총 수가 5670을 초과하지 않아야 합니다.
- 값의 총 수가 5670을 초과하지만 페이지 로딩 시간이 1024ms 미만이어야 합니다.

그렇지 않으면 계산 결과는 16ms의 가장 가까운 배수로 반올림됩니다.

:::note    
페이지 로딩 시간 분위수를 계산하는 데 이 함수는 [quantile](/sql-reference/aggregate-functions/reference/quantile)보다 더 효과적이고 정확합니다.
:::

**반환값**

- 지정된 수준의 분위수.

타입: `Float32`.

:::note    
함수에 값이 전달되지 않으면(`quantileTimingIf`를 사용할 경우) [NaN](/sql-reference/data-types/float#nan-and-inf)이 반환됩니다. 이는 이러한 경우를 0이 되는 경우와 구별하기 위한 목적입니다. `NaN` 값의 정렬에 대한 참고 사항은 [ORDER BY 절](/sql-reference/statements/select/order-by)을 참조하세요.
:::

**예시**

입력 테이블:

```text
┌─response_time─┬─weight─┐
│            68 │      1 │
│           104 │      2 │
│           112 │      3 │
│           126 │      2 │
│           138 │      1 │
│           162 │      1 │
└───────────────┴────────┘
```

쿼리:

```sql
SELECT quantileTimingWeighted(response_time, weight) FROM t
```

결과:

```text
┌─quantileTimingWeighted(response_time, weight)─┐
│                                           112 │
└───────────────────────────────────────────────┘
```


# quantilesTimingWeighted

`quantileTimingWeighted`와 동일하지만 여러 분위수 수준의 매개변수를 수용하고 해당 분위수의 여러 값으로 채워진 배열을 반환합니다.

**예시**

입력 테이블:

```text
┌─response_time─┬─weight─┐
│            68 │      1 │
│           104 │      2 │
│           112 │      3 │
│           126 │      2 │
│           138 │      1 │
│           162 │      1 │
└───────────────┴────────┘
```

쿼리:

```sql
SELECT quantilesTimingWeighted(0,5, 0.99)(response_time, weight) FROM t
```

결과:

```text
┌─quantilesTimingWeighted(0.5, 0.99)(response_time, weight)─┐
│ [112,162]                                                 │
└───────────────────────────────────────────────────────────┘
```

**참고**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
