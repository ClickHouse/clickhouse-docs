---
slug: '/examples/aggregate-function-combinators/quantilesTimingIf'
description: 'Example of using the quantilesTimingIf combinator'
keywords: ['quantilesTiming', 'if', 'combinator', 'examples', 'quantilesTimingIf']
sidebar_label: 'quantilesTimingIf'
---

# quantilesTimingIf

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
data. We'll use the `quantilesTimingIf` aggregate combinator function to calculate
the 99th, 95th, 90th, 75th and 50th percentiles of page duration times (the time
that a user spent on a specific page) by browser. We'll do so only for browsers
with more than 10 000 hits.

```sql
SELECT
    BrowserName,
    count() AS hits,
    quantilesTimingIf(0.5, 0.75, 0.9, 0.95, 0.99)(Duration, Duration > 0) AS timing_quantiles
FROM hits_v1
WHERE 
    EventDate BETWEEN '2014-03-01' AND '2014-03-31'
    AND Duration < 3600  -- Filter out sessions longer than an hour
GROUP BY BrowserName
HAVING count() > 10000
ORDER BY hits DESC
LIMIT 10;
```



