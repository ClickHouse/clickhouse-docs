---
slug: '/examples/aggregate-function-combinators/ForEach/anyHeavyForEach'
description: 'Example of using the anyHeavyForEach combinator'
keywords: ['anyheavy', 'foreach', 'combinator', 'examples', 'anyHeavyForEach']
sidebar_label: 'anyHeavyForEach'
---

# anyHeavyForEach example

The [`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) combinator can be applied to the [`anyHeavy`](/sql-reference/aggregate-functions/reference/anyheavy) function to return the most frequent value for corresponding elements in multiple arrays using the `anyHeavyForEach` function.

## Example Usage

```sql
SELECT anyHeavyForEach(array1, array2) FROM table;
``` 