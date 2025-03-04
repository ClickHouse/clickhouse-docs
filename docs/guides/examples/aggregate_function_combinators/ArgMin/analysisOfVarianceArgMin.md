---
slug: '/examples/aggregate-function-combinators/ArgMin/analysisOfVarianceArgMin'
description: 'Example of using the analysisOfVarianceArgMin combinator'
keywords: ['analysisofvariance', 'argmin', 'combinator', 'examples', 'analysisOfVarianceArgMin']
sidebar_label: 'analysisOfVarianceArgMin'
---

# analysisOfVarianceArgMin example

The [`ArgMin`](/sql-reference/aggregate-functions/combinators#-argmin) combinator can be applied to the [`analysisOfVariance`](/sql-reference/aggregate-functions/reference/analysis_of_variance) function to perform analysis of variance only for rows that have the minimum value for the specified expression using the `analysisOfVarianceArgMin` function.

## Example Usage

```sql
SELECT analysisOfVarianceArgMin(value, expr) FROM table;
``` 