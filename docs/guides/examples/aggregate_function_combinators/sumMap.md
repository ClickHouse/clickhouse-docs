---
slug: '/examples/aggregate-function-combinators/sumMap'
title: 'sumMap'
description: 'Example of using the sumMap combinator'
keywords: ['sum', 'map', 'combinator', 'examples', 'sumMap']
sidebar_label: 'sumMap'
doc_type: 'reference'
---

# sumMap {#summap}

## Description {#description}

The [`Map`](/sql-reference/aggregate-functions/combinators#-map) combinator can be applied to the [`sum`](/sql-reference/aggregate-functions/reference/sum)
function to calculate the sum of values in a Map according to each key, using the `sumMap` 
aggregate combinator function.

## Example usage {#example-usage}

In this example, we'll create a table that stores status codes and their counts for different timeslots,
where each row contains a Map of status codes to their corresponding counts. We'll use 
`sumMap` to calculate the total count for each status code within each timeslot.

```sql title="Query"
CREATE TABLE metrics(
    date Date,
    timeslot DateTime,
    status Map(String, UInt64)
) ENGINE = Log;

INSERT INTO metrics VALUES
    ('2000-01-01', '2000-01-01 00:00:00', (['a', 'b', 'c'], [15, 25, 35])),
    ('2000-01-01', '2000-01-01 00:00:00', (['c', 'd', 'e'], [45, 55, 65])),
    ('2000-01-01', '2000-01-01 00:01:00', (['d', 'e', 'f'], [75, 85, 95])),
    ('2000-01-01', '2000-01-01 00:01:00', (['f', 'g', 'g'], [105, 115, 125]));

SELECT
    timeslot,
    sumMap(status),
FROM metrics
GROUP BY timeslot;
```

The `sumMap` function will calculate the total count for each status code within each timeslot. For example:
- In timeslot '2000-01-01 00:00:00':
  - Status 'a': 15
  - Status 'b': 25
  - Status 'c': 35 + 45 = 80
  - Status 'd': 55
  - Status 'e': 65
- In timeslot '2000-01-01 00:01:00':
  - Status 'd': 75
  - Status 'e': 85
  - Status 'f': 95 + 105 = 200
  - Status 'g': 115 + 125 = 240

```response title="Response"
   ┌────────────timeslot─┬─sumMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':200,'g':240}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':80,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## See also {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
