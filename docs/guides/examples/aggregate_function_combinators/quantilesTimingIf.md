---
slug: '/examples/aggregate-function-combinators/quantilesTimingIf'
title: 'quantilesTimingIf'
description: 'Example of using the quantilesTimingIf combinator'
keywords: ['quantilesTiming', 'if', 'combinator', 'examples', 'quantilesTimingIf']
sidebar_label: 'quantilesTimingIf'
doc_type: 'reference'
---

# quantilesTimingIf {#quantilestimingif}

## Description {#description}

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
function to calculate quantiles of timing values for rows where the condition is true,
using the `quantilesTimingIf` aggregate combinator function.

## Example usage {#example-usage}

In this example, we'll create a table that stores API response times for different endpoints,
and we'll use `quantilesTimingIf` to calculate response time quantiles for successful requests.

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

The `quantilesTimingIf` function will calculate quantiles only for successful requests (is_successful = 1).
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
