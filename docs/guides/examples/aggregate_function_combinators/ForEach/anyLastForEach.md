---
slug: '/examples/aggregate-function-combinators/ForEach/anyLastForEach'
description: 'Example of using the anyLastForEach combinator'
keywords: ['anylast', 'foreach', 'combinator', 'examples', 'anyLastForEach']
sidebar_label: 'anyLastForEach'
---

# anyLastForEach example

The [`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) combinator can be applied to the [`anyLast`](/sql-reference/aggregate-functions/reference/anylast) function to return the last value for corresponding elements in multiple arrays using the `anyLastForEach` function.

## Example Usage

```sql
SELECT anyLastForEach(array1, array2) FROM table;
``` 