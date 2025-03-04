---
slug: '/examples/aggregate-function-combinators/Resample/approxTopKResample'
description: 'Example of using the approxTopKResample combinator'
keywords: ['approxtopk', 'resample', 'combinator', 'examples', 'approxTopKResample']
sidebar_label: 'approxTopKResample'
---

# approxTopKResample example

The [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to return approximate top K values for resampled data using the `approxTopKResample` function.

## Example Usage

```sql
SELECT approxTopKResample(value, k, sample_size) FROM table;
``` 