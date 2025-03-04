---
slug: /examples/aggregate-function-combinators/argmax/histogramArgMax
description: "Example of using the histogramArgMax combinator"
keywords: ["histogram", "argmax", "combinator", "examples", "histogramArgMax"]
---

# histogramArgMax Combinator Example

The [ArgMax](/sql-reference/aggregate-functions/combinators#-argmax) combinator can be applied to the `histogram` function to generate histogram data only for rows that have the maximum value for the specified expression using the `histogramArgMax` function.

## Example Usage

```sql
SELECT histogramArgMax(value, expr) FROM table;
``` 