---
slug: /examples/aggregate-function-combinators/mergestate/aggThrowMergeState
description: "Example of using the aggThrowMergeState combinator"
keywords: ["aggThrow", "mergestate", "combinator", "examples", "aggThrowMergeState"]
---

# aggThrowMergeState Combinator Example

The [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate) combinator can be applied to the `aggThrow` function to combine intermediate states but returns an intermediate state using the `aggThrowMergeState` function.

## Example Usage

```sql
SELECT aggThrowMergeState(state) FROM table;
```
