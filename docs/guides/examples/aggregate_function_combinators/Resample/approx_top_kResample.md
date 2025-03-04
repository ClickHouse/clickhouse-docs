---
slug: '/examples/aggregate-function-combinators/Resample/approx_top_kResample'
description: 'Example of using the approx_top_kResample combinator'
keywords: ['approxtopk', 'resample', 'combinator', 'examples', 'approx_top_kResample']
sidebar_label: 'approx_top_kResample'
---

# approx_top_kResample example

The [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to return approximate top K values for resampled data using the `approx_top_kResample` function.

## Example Usage

```sql
SELECT approx_top_kResample(value, k, sample_size) FROM table;
``` 