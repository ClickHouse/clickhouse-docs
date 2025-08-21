---
slug: '/examples/aggregate-function-combinators/quantilesTimingArrayIf'
title: 'quantilesTimingArrayIf'
description: 'Example of using the quantilesTimingArrayIf combinator'
keywords: ['quantilesTiming', 'array', 'if', 'combinator', 'examples', 'quantilesTimingArrayIf']
sidebar_label: 'quantilesTimingArrayIf'
doc_type: 'how-to'
---

# quantilesTimingArrayIf {#quantilestimingarrayif}

## Description {#description}

The [`Array`](/sql-reference/aggregate-functions/combinators#-array) and [`If`](/sql-reference/aggregate-functions/combinators#-if) 
combinator can be applied to the [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
function to calculate quantiles of timing values in arrays for rows where the condition is true,
using the `quantilesTimingArrayIf` aggregate combinator function.

## Example usage {#example-usage}

In this example, we'll create a table that stores API response times for different endpoints,
and we'll use `quantilesTimingArrayIf` to calculate response time quantiles for successful requests.

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

The `quantilesTimingArrayIf` function will calculate quantiles only for endpoints with a success rate above 95%.
The returned array contains the following quantiles in order:
- 0 (minimum)
- 0.25 (first quartile)
- 0.5 (median)
- 0.75 (third quartile)
- 0.95 (95th percentile)
- 0.99 (99th percentile)
- 1.0 (maximum)

```response title="Response"
   ┌─endpoint─┬─response_time_quantiles─────────────────────────────────────────────┐
1. │ orders   │ [82, 87, 92, 98, 103, 104, 105]                                     │
2. │ products │ [45, 47, 49, 51, 52, 52, 53]                                        │
3. │ users    │ [nan, nan, nan, nan, nan, nan, nan]                                 │
   └──────────┴─────────────────────────────────────────────────────────────────────┘
```

## See also {#see-also}
- [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
