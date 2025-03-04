---
slug: /examples/aggregate-function-combinators/array/histogramArray
description: "Example of using the histogramArray combinator"
keywords: ["histogram", "array", "combinator", "examples", "histogramArray"]
---

# histogramArray Combinator Example

The [Array](/sql-reference/aggregate-functions/combinators#-array) combinator can be applied to the `histogram` function to generate histogram data from elements in the array using the `histogramArray` function.

## Example Usage

```sql
SELECT histogramArray(array_column) FROM table;
```
