---
slug: '/examples/aggregate-function-combinators/Merge/analysisOfVarianceMerge'
description: 'Example of using the analysisOfVarianceMerge combinator'
keywords: ['analysisofvariance', 'merge', 'combinator', 'examples', 'analysisOfVarianceMerge']
sidebar_label: 'analysisOfVarianceMerge'
---

# analysisOfVarianceMerge example

The [`Merge`](/sql-reference/aggregate-functions/combinators#-merge) combinator can be applied to the [`analysisOfVariance`](/sql-reference/aggregate-functions/reference/analysis_of_variance) function to combine intermediate states to get the final ANOVA results using the `analysisOfVarianceMerge` function.

## Example Usage

```sql
SELECT analysisOfVarianceMerge(state) FROM table;
``` 