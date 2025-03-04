---
slug: /examples/aggregate-function-combinators/distinct/histogramDistinct
description: "Example of using the histogramDistinct combinator"
keywords: ["histogram", "distinct", "combinator", "examples", "histogramDistinct"]
---

# histogramDistinct Combinator Example

The [Distinct](/sql-reference/aggregate-functions/combinators#-distinct) combinator can be applied to the `histogram` function to generate histogram data using distinct values only using the `histogramDistinct` function.

## Example Usage

```sql
SELECT histogramDistinct(value) FROM table;
```
