---
slug: '/examples/aggregate-function-combinators/Resample/analysisOfVarianceResample'
description: 'Example of using the analysisOfVarianceResample combinator'
keywords: ['analysisofvariance', 'resample', 'combinator', 'examples', 'analysisOfVarianceResample']
sidebar_label: 'analysisOfVarianceResample'
---

# analysisOfVarianceResample example

The [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) combinator can be applied to the [`analysisOfVariance`](/sql-reference/aggregate-functions/reference/analysis_of_variance) function to perform analysis of variance on resampled data using the `analysisOfVarianceResample` function.

## Example Usage

```sql
SELECT analysisOfVarianceResample(value, sample_size) FROM table;
``` 