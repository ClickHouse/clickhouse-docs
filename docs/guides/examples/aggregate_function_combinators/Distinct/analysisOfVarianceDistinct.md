---
slug: '/examples/aggregate-function-combinators/Distinct/analysisOfVarianceDistinct'
description: 'Example of using the analysisOfVarianceDistinct combinator'
keywords: ['analysisofvariance', 'distinct', 'combinator', 'examples', 'analysisOfVarianceDistinct']
sidebar_label: 'analysisOfVarianceDistinct'
---

# analysisOfVarianceDistinct example

The [Distinct](/sql-reference/aggregate-functions/combinators#-distinct) combinator can be applied to the [`analysisOfVariance`](/sql-reference/aggregate-functions/reference/analysis_of_variance) function to perform analysis of variance using distinct values only using the `analysisOfVarianceDistinct` function.

## Example Usage

```sql
SELECT analysisOfVarianceDistinct(value) FROM table;
``` 