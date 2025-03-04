---
slug: '/examples/aggregate-function-combinators/Array/anyLastArray'
description: 'Example of using the anyLastArray combinator'
keywords: ['anylast', 'array', 'combinator', 'examples', 'anyLastArray']
sidebar_label: 'anyLastArray'
---

# anyLastArray example

The [`Array`](/sql-reference/aggregate-functions/combinators#-array) combinator can be applied to the [`anyLast`](/sql-reference/aggregate-functions/reference/anylast) function to return the last value for elements in the array using the `anyLastArray` function.

## Example Usage

```sql
SELECT anyLastArray(array_column) FROM table;
``` 