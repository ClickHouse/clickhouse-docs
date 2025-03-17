---
slug: '/examples/aggregate-function-combinators/minSimpleState'
description: 'Example of using the minSimpleState combinator'
keywords: ['min', 'state', 'simple', 'combinator', 'examples', 'minSimpleState']
sidebar_label: 'minSimpleState'
---

# minSimpleState {#minsimplestate}

## Description {#description}

The [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) combinator can be applied to the [`min`](/sql-reference/aggregate-functions/reference/min)
function to return the minimum value across all input values. It returns the result with type `SimpleAggregateState`.

## Example Usage {#example-usage}

Let's look at a practical example using a table that tracks daily temperature readings. For each location, we want to maintain the lowest temperature recorded. Using the `SimpleAggregateFunction` type with `min` automatically updates the stored value when a lower temperature is encountered.

```sql title="Query"
-- Create a table using SimpleAggregateFunction type for temperature tracking
CREATE TABLE temperature_readings
(
    location_id UInt32,
    location_name LowCardinality(String),
    min_temp SimpleAggregateFunction(min, Int32)  -- Stores the lowest temperature seen
)
ENGINE = AggregatingMergeTree()
ORDER BY location_id;

-- Insert initial temperature readings
INSERT INTO temperature_readings VALUES
    (1, 'North', minSimpleState(5)),    -- 5°C at North
    (2, 'South', minSimpleState(15)),   -- 15°C at South
    (3, 'West', minSimpleState(10));    -- 10°C at West

-- Insert new readings (some lower, some higher)
INSERT INTO temperature_readings VALUES
    (1, 'North', 3),    -- Lower temperature for North (will update min)
    (2, 'South', 18),   -- Higher temperature for South (won't affect min)
    (3, 'West', 10),    -- Same temperature for West
    (1, 'North', 4);    -- Temperature for North between min and max (won't affect min)

-- Show how minSimpleState maintains the minimum values
SELECT
    location_id,
    location_name,
    minSimpleState(min_temp) AS lowest_temp,
    toTypeName(lowest_temp),
    count() as num_readings
FROM temperature_readings
GROUP BY location_id, location_name
ORDER BY location_id;
```

```response title="Response"
┌─location_id─┬─location_name─┬─lowest_temp─┬─num_readings─┐
│           1 │ North        │           3 │            3 │
│           2 │ South        │          15 │            2 │
│           3 │ West         │          10 │            2 │
└─────────────┴──────────────┴────────────┴──────────────┘
```

The example shows how:
- When new data is inserted, SimpleAggregateFunction(min) automatically:
  - Updates the stored value if the new value is lower
  - Keeps the existing value if the new value is higher
- minSimpleState returns the current minimum value for each group
- The storage is efficient because only the minimum value is kept, not the full history

For location_id 1 (North), we can see that:
- Initial temperature was 5°C
- When 3°C was recorded, it became the new minimum
- When 4°C was recorded, the minimum stayed at 3°C
This demonstrates how SimpleAggregateFunction(min) maintains the minimum value through multiple insertions.

## See also {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction) 