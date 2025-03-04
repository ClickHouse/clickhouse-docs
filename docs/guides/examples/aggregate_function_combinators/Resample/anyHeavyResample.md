---
slug: '/examples/aggregate-function-combinators/Resample/anyHeavyResample'
description: 'Example of using the anyHeavyResample combinator'
keywords: ['anyheavy', 'resample', 'combinator', 'examples', 'anyHeavyResample']
sidebar_label: 'anyHeavyResample'
---

# anyHeavyResample example

The [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) combinator can be applied to the [`anyHeavy`](/sql-reference/aggregate-functions/reference/anyheavy) function to return the most frequent value for resampled data using the `anyHeavyResample` function.

## Example Usage

```sql
SELECT anyHeavyResample(value, sample_size) FROM table;
``` 