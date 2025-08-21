---
slug: '/examples/aggregate-function-combinators/maxMap'
title: 'maxMap'
description: 'Example of using the maxMap combinator'
keywords: ['max', 'map', 'combinator', 'examples', 'maxMap']
sidebar_label: 'maxMap'
doc_type: how-to
---

# maxMap {#maxmap}

## Description {#description}

The [`Map`](/sql-reference/aggregate-functions/combinators#-map) combinator can be applied to the [`max`](/sql-reference/aggregate-functions/reference/max)
function to calculate the maximum value in a Map according to each key, using the `maxMap` 
aggregate combinator function.

## Example usage {#example-usage}

In this example, we'll create a table that stores status codes and their counts for different timeslots,
where each row contains a Map of status codes to their corresponding counts. We'll use 
`maxMap` to find the maximum count for each status code within each timeslot.

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
    maxMap(status),
FROM metrics
GROUP BY timeslot;
```

The `maxMap` function will find the maximum count for each status code within each timeslot. For example:
- In timeslot '2000-01-01 00:00:00':
  - Status 'a': 15
  - Status 'b': 25
  - Status 'c': max(35, 45) = 45
  - Status 'd': 55
  - Status 'e': 65
- In timeslot '2000-01-01 00:01:00':
  - Status 'd': 75
  - Status 'e': 85
  - Status 'f': max(95, 105) = 105
  - Status 'g': max(115, 125) = 125

```response title="Response"
   ┌────────────timeslot─┬─maxMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':105,'g':125}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':45,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## See also {#see-also}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
