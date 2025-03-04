---
slug: '/examples/aggregate-function-combinators/State/analysisOfVarianceState'
description: 'Example of using the analysisOfVarianceState combinator'
keywords: ['analysisofvariance', 'state', 'combinator', 'examples', 'analysisOfVarianceState']
sidebar_label: 'analysisOfVarianceState'
---

# analysisOfVarianceState example

The [`State`](/sql-reference/aggregate-functions/combinators#-state) combinator can be applied to the [`analysisOfVariance`](/sql-reference/aggregate-functions/reference/analysis_of_variance) function to return the intermediate state of ANOVA calculation using the `analysisOfVarianceState` function.

## Example Usage

```sql
SELECT analysisOfVarianceState(value) FROM table;
``` 