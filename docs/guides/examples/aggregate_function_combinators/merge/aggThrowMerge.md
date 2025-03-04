---
slug: /examples/aggregate-function-combinators/merge/aggThrowMerge
description: "Example of using the aggThrowMerge combinator"
keywords: ["aggThrow", "merge", "combinator", "examples", "aggThrowMerge"]
---

# aggThrowMerge Combinator Example

The [Merge](/sql-reference/aggregate-functions/combinators#-merge) combinator can be applied to the `aggThrow` function to combine intermediate states to determine if an exception should be thrown using the `aggThrowMerge` function.

## Example Usage

```sql
SELECT aggThrowMerge(state) FROM table;
```
