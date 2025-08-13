---
slug: '/examples/aggregate-function-combinators/minMap'
title: 'minMap'
description: 'Example of using the minMap combinator'
keywords: ['min', 'map', 'combinator', 'examples', 'minMap']
sidebar_label: 'minMap'
doc_type: 'reference'
---

# minMap {#minmap}

## Description {#description}

The [`Map`](/sql-reference/aggregate-functions/combinators#-map) combinator can be applied to the [`min`](/sql-reference/aggregate-functions/reference/min)
function to calculate the minimum value in a Map according to each key, using the `minMap` 
aggregate combinator function.

## Example usage {#example-usage}

In this example, we'll create a table that stores status codes and their counts for different timeslots,
where each row contains a Map of status codes to their corresponding counts. We'll use 
`minMap` to find the minimum count for each status code within each timeslot.

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
    minMap(status),
FROM metrics
GROUP BY timeslot;
```

The `minMap` function will find the minimum count for each status code within each timeslot. For example:
- In timeslot '2000-01-01 00:00:00':
  - Status 'a': 15
  - Status 'b': 25
  - Status 'c': min(35, 45) = 35
  - Status 'd': 55
  - Status 'e': 65
- In timeslot '2000-01-01 00:01:00':
  - Status 'd': 75
  - Status 'e': 85
  - Status 'f': min(95, 105) = 95
  - Status 'g': min(115, 125) = 115

```response title="Response"
   ┌────────────timeslot─┬─minMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':95,'g':115}       │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':35,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## See also {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
