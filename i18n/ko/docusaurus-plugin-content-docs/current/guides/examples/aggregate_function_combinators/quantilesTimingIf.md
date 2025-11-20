---
'slug': '/examples/aggregate-function-combinators/quantilesTimingIf'
'title': 'quantilesTimingIf'
'description': 'quantilesTimingIf 조합기를 사용하는 예제'
'keywords':
- 'quantilesTiming'
- 'if'
- 'combinator'
- 'examples'
- 'quantilesTimingIf'
'sidebar_label': 'quantilesTimingIf'
'doc_type': 'reference'
---


# quantilesTimingIf {#quantilestimingif}

## 설명 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 결합자는 [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming) 함수에 적용되어 조건이 참인 행에 대한 타이밍 값의 분포를 계산하는 데 사용되며, `quantilesTimingIf` 집계 결합자 함수를 사용합니다.

## 사용 예시 {#example-usage}

이 예제에서는 서로 다른 엔드포인트에 대한 API 응답 시간을 저장하는 테이블을 생성하고,
성공한 요청의 응답 시간 분포를 계산하기 위해 `quantilesTimingIf`를 사용할 것입니다.

```sql title="Query"
CREATE TABLE api_responses(
    endpoint String,
    response_time_ms UInt32,
    is_successful UInt8
) ENGINE = Log;

INSERT INTO api_responses VALUES
    ('orders', 82, 1),
    ('orders', 94, 1),
    ('orders', 98, 1),
    ('orders', 87, 1),
    ('orders', 103, 1),
    ('orders', 92, 1),
    ('orders', 89, 1),
    ('orders', 105, 1),
    ('products', 45, 1),
    ('products', 52, 1),
    ('products', 48, 1),
    ('products', 51, 1),
    ('products', 49, 1),
    ('products', 53, 1),
    ('products', 47, 1),
    ('products', 50, 1),
    ('users', 120, 0),
    ('users', 125, 0),
    ('users', 118, 0),
    ('users', 122, 0),
    ('users', 121, 0),
    ('users', 119, 0),
    ('users', 123, 0),
    ('users', 124, 0);

SELECT
    endpoint,
    quantilesTimingIf(0, 0.25, 0.5, 0.75, 0.95, 0.99, 1.0)(response_time_ms, is_successful = 1) as response_time_quantiles
FROM api_responses
GROUP BY endpoint;
```

`quantilesTimingIf` 함수는 성공한 요청 (is_successful = 1)에 대해서만 분포를 계산합니다.
반환된 배열은 다음과 같은 순서로 분포를 포함합니다:
- 0 (최소)
- 0.25 (제 1사분위)
- 0.5 (중앙값)
- 0.75 (제 3사분위)
- 0.95 (95번째 백분위)
- 0.99 (99번째 백분위)
- 1.0 (최대)

```response title="Response"
   ┌─endpoint─┬─response_time_quantiles─────────────────────────────────────────────┐
1. │ orders   │ [82, 87, 92, 98, 103, 104, 105]                                     │
2. │ products │ [45, 47, 49, 51, 52, 52, 53]                                        │
3. │ users    │ [nan, nan, nan, nan, nan, nan, nan]                                 │
   └──────────┴─────────────────────────────────────────────────────────────────────┘
```

## 참조 {#see-also}
- [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
