---
slug: '/examples/aggregate-function-combinators/MergeState/analysisOfVarianceMergeState'
description: 'Example of using the analysisOfVarianceMergeState combinator'
keywords: ['analysisofvariance', 'mergestate', 'combinator', 'examples', 'analysisOfVarianceMergeState']
sidebar_label: 'analysisOfVarianceMergeState'
---

# analysisOfVarianceMergeState example

The [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate) combinator can be applied to the [`analysisOfVariance`](/sql-reference/aggregate-functions/reference/analysis_of_variance) function to combine intermediate states but returns an intermediate state using the `analysisOfVarianceMergeState` function.

## Example Usage

```sql
SELECT analysisOfVarianceMergeState(state) FROM table;
``` 