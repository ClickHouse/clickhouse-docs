---
slug: '/examples/aggregate-function-combinators/avgResample'
description: 'Example of using the Resample combinator with avg'
keywords: ['avg', 'Resample', 'combinator', 'examples', 'avgResample']
sidebar_label: 'avgResample'
---

# countResample {#countResample}

## Description {#description}

The [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
combinator can be applied to the [`count`](/sql-reference/aggregate-functions/reference/count)
aggregate function to count values of a specified key column in a fixed number
of intervals (`N`).

## Example Usage {#example-usage}

### Basic example {#basic-example}

Let's look at an example. We'll create a table which contains the `name`, `age` and
`wage` of employees, and we'll insert some data into it:

```sql
CREATE TABLE employee_data 
(
    name String,
    age UInt8,
    wage Float32
) 
ENGINE = MergeTree()
ORDER BY tuple()

INSERT INTO employee_data (name, age, wage) VALUES
    ('John', 16, 10.0),
    ('Alice', 30, 15.0),
    ('Mary', 35, 8.0),
    ('Evelyn', 48, 11.5),
    ('David', 62, 9.9),
    ('Brian', 60, 16.0);
```

Let's get the average wage of the people whose age lies in the intervals of `[30,60)` 
and `[60,75)`. Since we use integer representation for age, we get ages in the
`[30, 59]` and `[60,74]` intervals. To do so we apply the `Resample` combinator 
to the `avg` aggregate function.

```sql
WITH avg_wage AS
(
    SELECT avgResample(30, 75, 30)(wage, age) AS original_avg_wage
    FROM employee_data
)
SELECT
    arrayMap(x -> round(x, 3), original_avg_wage) AS avg_wage_rounded
FROM avg_wage;
```

```response
┌─avg_wage_rounded─┐
│ [11.5,12.95]     │
└──────────────────┘
```

## See also {#see-also}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#resample)
