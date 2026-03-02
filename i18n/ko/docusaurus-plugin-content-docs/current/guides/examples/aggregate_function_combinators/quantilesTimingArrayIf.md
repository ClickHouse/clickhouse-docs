---
slug: '/examples/aggregate-function-combinators/quantilesTimingArrayIf'
title: 'quantilesTimingArrayIf'
description: 'quantilesTimingArrayIf 결합자(combinator) 사용 예제'
keywords: ['quantilesTiming', 'array', 'if', 'combinator', 'examples', 'quantilesTimingArrayIf']
sidebar_label: 'quantilesTimingArrayIf'
doc_type: 'reference'
---



# quantilesTimingArrayIf \{#quantilestimingarrayif\}



## 설명 \{#description\}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 및 [`If`](/sql-reference/aggregate-functions/combinators#-if) 
combinator는 [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
함수에 적용할 수 있으며, `quantilesTimingArrayIf` 집계 combinator 함수를 사용하면 조건이 참인 행에서 배열에 포함된 타이밍 값의 분위수를 계산할 수 있습니다.



## 사용 예시 \{#example-usage\}

이 예시에서는 다양한 엔드포인트별 API 응답 시간을 저장하는 테이블을 생성하고,
성공한 요청의 응답 시간 분위수를 계산하기 위해 `quantilesTimingArrayIf` 함수를 사용합니다.

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

`quantilesTimingArrayIf` 함수는 성공률이 95%를 초과하는 엔드포인트에 대해서만 분위수를 계산합니다.
반환되는 배열에는 다음 분위수가 아래 순서대로 포함됩니다:

* 0 (최소값)
* 0.25 (제1사분위수)
* 0.5 (중앙값)
* 0.75 (제3사분위수)
* 0.95 (95번째 백분위수)
* 0.99 (99번째 백분위수)
* 1.0 (최대값)

```response title="Response"
   ┌─endpoint─┬─response_time_quantiles─────────────────────────────────────────────┐
1. │ orders   │ [82, 87, 92, 98, 103, 104, 105]                                     │
2. │ products │ [45, 47, 49, 51, 52, 52, 53]                                        │
3. │ users    │ [nan, nan, nan, nan, nan, nan, nan]                                 │
   └──────────┴─────────────────────────────────────────────────────────────────────┘
```


## 함께 보기 \{#see-also\}
- [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
