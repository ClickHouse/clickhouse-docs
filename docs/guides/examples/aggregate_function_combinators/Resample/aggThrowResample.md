---
slug: /examples/aggregate-function-combinators/Resample/aggThrowResample
description: 'Example of using the aggThrowResample combinator'
keywords: ['aggThrow', 'resample', 'combinator', 'examples', 'aggThrowResample']
sidebar_label: aggThrowResample
---

# aggThrowResample example

The [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) combinator can be applied to the [`aggThrow`](/sql-reference/aggregate-functions/reference/aggthrow) function to throw an exception with the specified probability for each group of rows using the `aggThrowResample` function.

## Example Usage

```sql
SELECT aggThrowResample(probability, value, group) FROM table;
``` 