---
slug: '/examples/aggregate-function-combinators/MergeState/anyLastMergeState'
description: 'Example of using the anyLastMergeState combinator'
keywords: ['anylast', 'mergestate', 'combinator', 'examples', 'anyLastMergeState']
sidebar_label: 'anyLastMergeState'
---

# anyLastMergeState example

The [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate) combinator can be applied to the [`anyLast`](/sql-reference/aggregate-functions/reference/anylast) function to combine intermediate states but returns an intermediate state using the `anyLastMergeState` function.

## Example Usage

```sql
SELECT anyLastMergeState(state) FROM table;
``` 