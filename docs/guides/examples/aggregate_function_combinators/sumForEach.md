---
slug: '/examples/aggregate-function-combinators/sumForEach'
title: 'sumForEach'
description: 'Example of using the sumArray combinator'
keywords: ['sum', 'array', 'combinator', 'examples', 'sumArray']
sidebar_label: 'sumArray'
---

# sumArray {#sumforeach}

## Description {#description}

The [`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) combinator
can be applied to the [`sum`](/sql-reference/aggregate-functions/reference/sum) aggregate function to turn it from an aggregate
function which operates on row values to an aggregate function which operates on
array columns, applying the aggregate to each element in the array across rows.

## Example usage {#example-usage}

For this example we'll make use of the `hits` dataset available in our [SQL playground](https://sql.clickhouse.com/).

The `hits` table contains a column called `isMobile` of type UInt8 which can be
`0` for Desktop or `1` for mobile:

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

We'll use the `sumForEach` aggregate combinator function to analyze how
desktop versus mobile traffic varies by hour of the day. Click the play button
below to run the query interactively:

```sql runnable
SELECT
    toHour(EventTime) AS hour_of_day,
    -- Use sumForEach to count desktop and mobile visits in one pass
    sumForEach([
        IsMobile = 0, -- Desktop visits (IsMobile = 0)
        IsMobile = 1  -- Mobile visits (IsMobile = 1)
    ]) AS device_counts
FROM metrica.hits
GROUP BY hour_of_day
ORDER BY hour_of_day;
```

## See also {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`ForEach combinator`](/sql-reference/aggregate-functions/combinators#-foreach)
