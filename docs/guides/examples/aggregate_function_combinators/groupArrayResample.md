---
slug: '/examples/aggregate-function-combinators/groupArrayResample'
title: 'groupArrayResample'
description: 'Example of using the Resample combinator with groupArray'
keywords: ['groupArray', 'Resample', 'combinator', 'examples', 'groupArrayResample']
sidebar_label: 'groupArrayResample'
doc_type: how-to
---

# groupArrayResample {#grouparrayresample}

## Description {#description}

The [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
combinator can be applied to the [`groupArray`](/sql-reference/aggregate-functions/reference/sum) aggregate function to
divide the range of a specified key column into a fixed number of intervals (`N`) 
and construct the resulting array by selecting one representative value 
(corresponding to the minimum key) from the data points falling into each interval.
It creates a downsampled view of the data rather than collecting all values.

## Example usage {#example-usage}

Let's look at an example. We'll create a table which contains the `name`, `age` and
`wage` of employees, and we'll insert some data into it:

```sql
CREATE TABLE employee_data 
(
    name String,
    age UInt8,
    wage Float32
) ENGINE = MergeTree()
ORDER BY tuple()

INSERT INTO employee_data (name, age, wage) VALUES
    ('John', 16, 10.0),
    ('Alice', 30, 15.0),
    ('Mary', 35, 8.0),
    ('Evelyn', 48, 11.5),
    ('David', 62, 9.9),
    ('Brian', 60, 16.0);
```

Let's get the names of the people whose age lies in the intervals of `[30,60)` 
and `[60,75)`. Since we use integer representation for age, we get ages in the
`[30, 59]` and `[60,74]` intervals.

To aggregate names in an array, we use the `groupArray` aggregate function. 
It takes one argument. In our case, it's the name column. The `groupArrayResample`
function should use the age column to aggregate names by age. To define the 
required intervals, we pass `30`, `75`, `30` as arguments into the `groupArrayResample`
function:

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM employee_data
```

```response
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

## See also {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
