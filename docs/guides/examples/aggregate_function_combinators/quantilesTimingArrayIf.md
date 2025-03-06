---
slug: '/examples/aggregate-function-combinators/quantilesTimingArrayIf'
description: 'Example of using the quantilesTimingArrayIf combinator'
keywords: ['quantilesTiming', 'array', 'if', 'combinator', 'examples', 'quantilesTimingArrayIf']
sidebar_label: 'quantilesTimingArrayIf'
---

# quantilesTimingArrayIf

## Description

The [`Array`](/sql-reference/aggregate-functions/combinators#-array) and [`If`](/sql-reference/aggregate-functions/combinators#-if) combinators can be applied to the [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
function to calculate quantiles of numeric data sequences in arrays, but only for
elements that match a given condition, using the `quantilesTimingArrayIf` 
aggregate combinator function.

:::note
-`If` and -`Array` can be combined. However, `Array` must come first, then `If`.
:::

The `quantilesTimingArrayIf` function is optimized for analyzing timing-related 
metrics in arrays conditionally, such as when you need to calculate response time
quantiles only for successful requests.

## Example Usage

In this example, we'll create a table that stores API response times for different endpoints,
where each row contains an array of response times from multiple regions. We'll use 
`quantilesTimingArrayIf` to calculate various percentiles of response times, 
but only for users that visited the endpoint using a mobile device.

```sql title="Query"
CREATE TABLE api_responses
(
    endpoint String,
    response_times_ms Array(UInt32),
    isMobile UInt8
) ENGINE = Memory;

INSERT INTO api_responses VALUES
    ('users', [127, 156, 234, 187, 142, 198, 167, 189], 0),
    ('orders', [312, 245, 278, 324, 291, 267, 289, 301], 1),
    ('products', [82, 94, 98, 87, 103, 92, 89, 105], 1)

SELECT
    endpoint,
    response_times_ms,
    isMobile,
    quantilesTimingArrayIf(0, 0.25, 0.5, 0.75, 0.95, 0.99, 1.0)(
        response_times_ms,
        isMobile = 1
    ) as response_quantiles_ms
FROM api_responses
GROUP BY endpoint, response_times_ms, isMobile
```

The `quantilesTimingArrayIf` function will calculate quantiles only for mobile users 
(isMobile = 1). In this case, it will process the 'orders' and 'products' endpoints since 
they have mobile traffic. The returned array contains the following quantiles in order:
- 0 (minimum)
- 0.25 (first quartile)
- 0.5 (median)
- 0.75 (third quartile)
- 0.95 (95th percentile)
- 0.99 (99th percentile)
- 1.0 (maximum)

```response title="Response"
   ┌─endpoint─┬─response_times_ms─────────────────┬─isMobile─┬─response_quantiles_ms─────────┐
1. │ users    │ [127,156,234,187,142,198,167,189] │        0 │ [nan,nan,nan,nan,nan,nan,nan] │
2. │ orders   │ [312,245,278,324,291,267,289,301] │        1 │ [245,278,291,312,324,324,324] │
3. │ products │ [82,94,98,87,103,92,89,105]       │        1 │ [82,89,94,103,105,105,105]    │
   └──────────┴───────────────────────────────────┴──────────┴───────────────────────────────┘
```

## See also
- [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
- [`quantilesTimingIf`](/examples/aggregate-function-combinators/quantilesTimingIf)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if) 