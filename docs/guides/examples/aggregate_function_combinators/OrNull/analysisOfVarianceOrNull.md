---
slug: '/examples/aggregate-function-combinators/OrNull/analysisOfVarianceOrNull'
description: 'Example of using the analysisOfVarianceOrNull combinator'
keywords: ['analysisofvariance', 'ornull', 'combinator', 'examples', 'analysisOfVarianceOrNull']
sidebar_label: 'analysisOfVarianceOrNull'
---

# analysisOfVarianceOrNull example

The [OrNull](/sql-reference/aggregate-functions/combinators#-ornull) combinator can be applied to the [`analysisOfVariance`](/sql-reference/aggregate-functions/reference/analysis_of_variance) function to return NULL if there are not enough rows using the `analysisOfVarianceOrNull` function.

## Example Usage

```sql
SELECT analysisOfVarianceOrNull(value) FROM table;
``` 