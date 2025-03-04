---
slug: /examples/aggregate-function-combinators/mergestate/histogramMergeState
description: "Example of using the histogramMergeState combinator"
keywords: ["histogram", "mergestate", "combinator", "examples", "histogramMergeState"]
---

# histogramMergeState Combinator Example

The [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate) combinator can be applied to the `histogram` function to combine intermediate states but returns an intermediate state using the `histogramMergeState` function.

## Example Usage

```sql
SELECT histogramMergeState(state) FROM table;
```
