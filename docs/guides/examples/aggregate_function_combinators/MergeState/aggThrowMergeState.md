---
slug: '/examples/aggregate-function-combinators/MergeState/aggThrowMergeState'
description: 'Example of using the aggThrowMergeState combinator'
keywords: ['aggthrow', 'mergestate', 'combinator', 'examples', 'aggThrowMergeState']
sidebar_label: aggThrowMergeState
---

# aggThrowMergeState example

The [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate) combinator can be applied to the [`aggThrow`](/sql-reference/aggregate-functions/reference/aggthrow) function to combine intermediate states but returns an intermediate state using the `aggThrowMergeState` function.

## Example Usage

```sql
SELECT aggThrowMergeState(state) FROM table;
```
