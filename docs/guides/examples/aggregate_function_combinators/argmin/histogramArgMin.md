---
slug: /examples/aggregate-function-combinators/argmin/histogramArgMin
description: "Example of using the histogramArgMin combinator"
keywords: ["histogram", "argmin", "combinator", "examples", "histogramArgMin"]
---

# histogramArgMin Combinator Example

The [ArgMin](/sql-reference/aggregate-functions/combinators#-argmin) combinator can be applied to the `histogram` function to generate histogram data only for rows that have the minimum value for the specified expression using the `histogramArgMin` function.

## Example Usage

```sql
SELECT histogramArgMin(value, expr) FROM table;
``` 