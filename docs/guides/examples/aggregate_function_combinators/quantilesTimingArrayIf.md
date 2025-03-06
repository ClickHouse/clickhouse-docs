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

In this example, we'll use a sample dataset of API response times (in milliseconds)
across different endpoints to demonstrate how `quantilesTimingArrayIf` works. 
We'll calculate the 95th and 99th percentiles of response times, but only for 
successful requests (status_code = 200).

```sql title="Query"
CREATE TABLE api_responses
(
    endpoint String,
    response_times_ms Array(UInt16),
    status_codes Array(UInt16)
) ENGINE = Memory;

INSERT INTO api_responses VALUES
    ('users', [127, 156, 234, 187, 142, 198, 167, 189], [200, 200, 404, 200, 200, 200, 200, 200]),
    ('orders', [312, 245, 278, 324, 291, 267, 289, 301], [200, 200, 200, 200, 200, 200, 200, 200]),
    ('products', [82, 94, 98, 87, 103, 92, 89, 105], [200, 404, 200, 200, 500, 200, 200, 200]);

SELECT 
    endpoint,
    response_times_ms,
    status_codes,
    quantilesTimingArrayIf(0.95, 0.99)(response_times_ms, status_codes = 200) as response_quantiles_ms
FROM api_responses
```

The `quantilesTimingArrayIf` function will calculate quantiles only for response
times where the corresponding status code is 200. For example, in the 'users' 
endpoint, it will only consider [127, 156, 187, 142, 198, 167, 189] (skipping 234
because its status code is 404).

```response title="Response"

```

## See also
- [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
- [`quantilesTimingIf`](/examples/aggregate-function-combinators/quantilesTimingIf)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if) 