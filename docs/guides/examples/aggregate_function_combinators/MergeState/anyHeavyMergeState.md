---
slug: '/examples/aggregate-function-combinators/MergeState/anyHeavyMergeState'
description: 'Example of using the anyHeavyMergeState combinator'
keywords: ['anyheavy', 'mergestate', 'combinator', 'examples', 'anyHeavyMergeState']
sidebar_label: 'anyHeavyMergeState'
---

# anyHeavyMergeState example

The [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate) combinator can be applied to the [`anyHeavy`](/sql-reference/aggregate-functions/reference/anyheavy) function to combine intermediate states but returns an intermediate state using the `anyHeavyMergeState` function.

## Example Usage

```sql
SELECT anyHeavyMergeState(state) FROM table;
``` 