---
slug: '/examples/aggregate-function-combinators/MergeState/approx_top_kMergeState'
description: 'Example of using the approx_top_kMergeState combinator'
keywords: ['approxtopk', 'mergestate', 'combinator', 'examples', 'approx_top_kMergeState']
sidebar_label: 'approx_top_kMergeState'
---

# approx_top_kMergeState example

The [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to combine intermediate states but returns an intermediate state using the `approx_top_kMergeState` function.

## Example Usage

```sql
SELECT approx_top_kMergeState(state) FROM table;
``` 