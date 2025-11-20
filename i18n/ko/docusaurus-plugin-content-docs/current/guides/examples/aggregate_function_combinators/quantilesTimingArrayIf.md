---
'slug': '/examples/aggregate-function-combinators/quantilesTimingArrayIf'
'title': 'quantilesTimingArrayIf'
'description': 'quantilesTimingArrayIf 조합기를 사용하는 예제'
'keywords':
- 'quantilesTiming'
- 'array'
- 'if'
- 'combinator'
- 'examples'
- 'quantilesTimingArrayIf'
'sidebar_label': 'quantilesTimingArrayIf'
'doc_type': 'reference'
---


# quantilesTimingArrayIf {#quantilestimingarrayif}

## 설명 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 및 [`If`](/sql-reference/aggregate-functions/combinators#-if) 
조합자는 [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming) 함수를 적용하여 조건이 true인 행의 배열에서 타이밍 값의 분위수를 계산하는 데 사용됩니다. `quantilesTimingArrayIf` 집계 조합자 함수를 사용합니다.

## 예시 사용법 {#example-usage}

이번 예제에서는 다양한 엔드포인트에 대한 API 응답 시간을 저장하는 테이블을 생성하고, 성공적인 요청에 대해 응답 시간 분위수를 계산하기 위해 `quantilesTimingArrayIf`를 사용할 것입니다.

```sql title="Query"
CREATE TABLE api_responses(
    endpoint String,
    response_times_ms Array(UInt32),
    success_rate Float32
) ENGINE = Log;

INSERT INTO api_responses VALUES
    ('orders', [82, 94, 98, 87, 103, 92, 89, 105], 0.98),
    ('products', [45, 52, 48, 51, 49, 53, 47, 50], 0.95),
    ('users', [120, 125, 118, 122, 121, 119, 123, 124], 0.92);

SELECT
    endpoint,
    quantilesTimingArrayIf(0, 0.25, 0.5, 0.75, 0.95, 0.99, 1.0)(response_times_ms, success_rate >= 0.95) as response_time_quantiles
FROM api_responses
GROUP BY endpoint;
```

`quantilesTimingArrayIf` 함수는 성공률이 95%를 초과하는 엔드포인트에 대해서만 분위수를 계산합니다. 반환된 배열은 다음과 같은 분위수를 순서대로 포함합니다:
- 0 (최소값)
- 0.25 (1사분위)
- 0.5 (중앙값)
- 0.75 (3사분위)
- 0.95 (95번째 백분위수)
- 0.99 (99번째 백분위수)
- 1.0 (최댓값)

```response title="Response"
   ┌─endpoint─┬─response_time_quantiles─────────────────────────────────────────────┐
1. │ orders   │ [82, 87, 92, 98, 103, 104, 105]                                     │
2. │ products │ [45, 47, 49, 51, 52, 52, 53]                                        │
3. │ users    │ [nan, nan, nan, nan, nan, nan, nan]                                 │
   └──────────┴─────────────────────────────────────────────────────────────────────┘
```

## 관련 항목 {#see-also}
- [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
- [`If 조합자`](/sql-reference/aggregate-functions/combinators#-if)
