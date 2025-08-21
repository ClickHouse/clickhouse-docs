---
slug: '/examples/aggregate-function-combinators/avgMap'
title: 'avgMap'
description: 'Example of using the avgMap combinator'
keywords: ['avg', 'map', 'combinator', 'examples', 'avgMap']
sidebar_label: 'avgMap'
doc_type: how-to
---

# avgMap {#avgmap}

## Description {#description}

The [`Map`](/sql-reference/aggregate-functions/combinators#-map) combinator can be applied to the [`avg`](/sql-reference/aggregate-functions/reference/avg)
function to calculate the arithmetic mean of values in a Map according to each key, using the `avgMap` 
aggregate combinator function.

## Example usage {#example-usage}

In this example, we'll create a table that stores status codes and their counts for different timeslots,
where each row contains a Map of status codes to their corresponding counts. We'll use 
`avgMap` to calculate the average count for each status code within each timeslot.

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
    avgMap(status),
FROM metrics
GROUP BY timeslot;
```

The `avgMap` function will calculate the average count for each status code within each timeslot. For example:
- In timeslot '2000-01-01 00:00:00':
  - Status 'a': 15
  - Status 'b': 25
  - Status 'c': (35 + 45) / 2 = 40
  - Status 'd': 55
  - Status 'e': 65
- In timeslot '2000-01-01 00:01:00':
  - Status 'd': 75
  - Status 'e': 85
  - Status 'f': (95 + 105) / 2 = 100
  - Status 'g': (115 + 125) / 2 = 120

```response title="Response"
   ┌────────────timeslot─┬─avgMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':100,'g':120}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':40,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## See also {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
