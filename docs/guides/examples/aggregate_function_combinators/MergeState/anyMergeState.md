---
slug: '/examples/aggregate-function-combinators/MergeState/anyMergeState'
description: 'Example of using the anyMergeState combinator'
keywords: ['any', 'mergestate', 'combinator', 'examples', 'anyMergeState']
sidebar_label: 'anyMergeState'
---

# anyMergeState example

The [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) function to combine intermediate states but returns an intermediate state using the `anyMergeState` function.

## Example Usage

```sql
SELECT anyMergeState(state) FROM table;
``` 