---
slug: /examples/aggregate-function-combinators/merge/histogramMerge
description: "Example of using the histogramMerge combinator"
keywords: ["histogram", "merge", "combinator", "examples", "histogramMerge"]
---

# histogramMerge Combinator Example

The [Merge](/sql-reference/aggregate-functions/combinators#-merge) combinator can be applied to the `histogram` function to combine intermediate states to get the final histogram data using the `histogramMerge` function.

## Example Usage

```sql
SELECT histogramMerge(state) FROM table;
```
