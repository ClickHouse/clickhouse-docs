---
slug: '/examples/aggregate-function-combinators/ForEach/analysisOfVarianceForEach'
description: 'Example of using the analysisOfVarianceForEach combinator'
keywords: ['analysisofvariance', 'foreach', 'combinator', 'examples', 'analysisOfVarianceForEach']
sidebar_label: 'analysisOfVarianceForEach'
---

# analysisOfVarianceForEach example

The [ForEach](/sql-reference/aggregate-functions/combinators#-foreach) combinator can be applied to the [`analysisOfVariance`](/sql-reference/aggregate-functions/reference/analysis_of_variance) function to perform analysis of variance on corresponding elements in multiple arrays using the `analysisOfVarianceForEach` function.

## Example Usage

```sql
SELECT analysisOfVarianceForEach(array1, array2) FROM table;
``` 