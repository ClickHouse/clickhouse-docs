---
slug: '/examples/aggregate-function-combinators/Resample/anyLastResample'
description: 'Example of using the anyLastResample combinator'
keywords: ['anylast', 'resample', 'combinator', 'examples', 'anyLastResample']
sidebar_label: 'anyLastResample'
---

# anyLastResample example

The [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) combinator can be applied to the [`anyLast`](/sql-reference/aggregate-functions/reference/anylast) function to return the last value for resampled data using the `anyLastResample` function.

## Example Usage

```sql
SELECT anyLastResample(value, sample_size) FROM table;
``` 