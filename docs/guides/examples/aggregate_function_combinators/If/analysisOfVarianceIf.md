---
slug: '/examples/aggregate-function-combinators/If/analysisOfVarianceIf'
description: 'Example of using the analysisOfVarianceIf combinator'
keywords: ['analysisofvariance', 'if', 'combinator', 'examples', 'analysisOfVarianceIf']
sidebar_label: 'analysisOfVarianceIf'
---

# analysisOfVarianceIf example

The [If](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`analysisOfVariance`](/sql-reference/aggregate-functions/reference/analysis_of_variance) function to perform analysis of variance only for rows that match the given condition using the `analysisOfVarianceIf` function.

## Example Usage

```sql
SELECT analysisOfVarianceIf(value, condition) FROM table;
``` 