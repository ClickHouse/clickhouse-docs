---
slug: '/examples/aggregate-function-combinators/Resample/anyResample'
description: 'Example of using the anyResample combinator'
keywords: ['any', 'resample', 'combinator', 'examples', 'anyResample']
sidebar_label: 'anyResample'
---

# anyResample example

The [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) function to return any value for resampled data using the `anyResample` function.

## Example Usage

```sql
SELECT anyResample(value, sample_size) FROM table;
``` 