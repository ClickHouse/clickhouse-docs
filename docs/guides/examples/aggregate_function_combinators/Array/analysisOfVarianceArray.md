---
slug: '/examples/aggregate-function-combinators/Array/analysisOfVarianceArray'
description: 'Example of using the analysisOfVarianceArray combinator'
keywords: ['analysisofvariance', 'array', 'combinator', 'examples', 'analysisOfVarianceArray']
sidebar_label: 'analysisOfVarianceArray'
---

# analysisOfVarianceArray example

The [Array](/sql-reference/aggregate-functions/combinators#-array) combinator can be applied to the [`analysisOfVariance`](/sql-reference/aggregate-functions/reference/analysis_of_variance) function to perform analysis of variance on elements in the array using the `analysisOfVarianceArray` function.

## Example Usage

```sql
SELECT analysisOfVarianceArray(array_column) FROM table;
``` 