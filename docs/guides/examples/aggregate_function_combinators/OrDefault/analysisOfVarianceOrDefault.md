---
slug: '/examples/aggregate-function-combinators/OrDefault/analysisOfVarianceOrDefault'
description: 'Example of using the analysisOfVarianceOrDefault combinator'
keywords: ['analysisofvariance', 'ordefault', 'combinator', 'examples', 'analysisOfVarianceOrDefault']
sidebar_label: 'analysisOfVarianceOrDefault'
---

# analysisOfVarianceOrDefault example

The [OrDefault](/sql-reference/aggregate-functions/combinators#-ordefault) combinator can be applied to the [`analysisOfVariance`](/sql-reference/aggregate-functions/reference/analysis_of_variance) function to return default ANOVA results if there are not enough rows using the `analysisOfVarianceOrDefault` function.

## Example Usage

```sql
SELECT analysisOfVarianceOrDefault(value) FROM table;
``` 