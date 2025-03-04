---
slug: '/examples/aggregate-function-combinators/ArgMax/analysisOfVarianceArgMax'
description: 'Example of using the analysisOfVarianceArgMax combinator'
keywords: ['analysisofvariance', 'argmax', 'combinator', 'examples', 'analysisOfVarianceArgMax']
sidebar_label: 'analysisOfVarianceArgMax'
---

# analysisOfVarianceArgMax example

The [ArgMax](/sql-reference/aggregate-functions/combinators#-argmax) combinator can be applied to the [`analysisOfVariance`](/sql-reference/aggregate-functions/reference/analysis_of_variance) function to perform analysis of variance only for rows that have the maximum value for the specified expression using the `analysisOfVarianceArgMax` function.

## Example Usage

```sql
SELECT analysisOfVarianceArgMax(value, expr) FROM table;
``` 