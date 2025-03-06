---
slug: '/examples/aggregate-function-combinators/quantilesTimingIf'
description: 'Example of using the quantilesTimingIf combinator'
keywords: ['quantilesTiming', 'if', 'combinator', 'examples', 'quantilesTimingIf']
sidebar_label: 'quantilesTimingIf'
---

# quantilesTimingIf

## Description

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
function to calculate the quantile of a numeric data sequence only for rows that
match the given condition, using the `quantilesTimingIf` aggregate combinator 
function.

The `quantilesTimingIf` function is optimized for analyzing timing-related metrics
conditionally.

## Example Usage

In this example, we'll use the Metrica dataset available on 
[ClickHouse Playground](https://sql.clickhouse.com/?query_id=GEFQJZTCMQPSB8ZMDCHJWK).
More specifically, we'll be using the `hits` table which contains web analytics
data. We'll use the `quantilesTiming` aggregate function to calculate
the 99th, 95th, 90th, 75th and 50th percentiles of end response times which are
in milliseconds. As there are many rows with a `ResponseEndTiming` of `0`, we 
will use the `if` combinator together with `quantilesTiming` to calculate the
quantiles only for non-zero `ResponseEndTiming` values. We'll group by `isMobile`
so we can compare the performance across mobile and desktop.

```sql title="Query"
SELECT
    IsMobile,
    quantilesTimingIf(0.5, 0.75, 0.9, 0.95, 0.99)(ResponseEndTiming, ResponseEndTiming > 0) AS response_quantiles
FROM hits
WHERE (EventDate >= '2013-07-02') AND (EventDate <= '2013-07-31')
GROUP BY IsMobile
```

The `quantilesTimingIf` function gives us back an array `response_quantiles`
with the computed values for each quantile beginning with the 50th quantile in
the first position of the array. We can see that across all quantiles, mobile
devices have substantially higher response times.

```response title="Response"
   ┌─IsMobile─┬─response_quantiles─────────┐
1. │        0 │ [62,215,542,995,4657]      │
2. │        1 │ [729,1883,4846,8089,29110] │
   └──────────┴────────────────────────────┘
```

## See also
- [`quantilesTiming`](/sql-reference/aggregate-functions/reference/quantiletiming)
- [`quantilesTimingWeighted`](/sql-reference/aggregate-functions/reference/quantiletimingweighted)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)



