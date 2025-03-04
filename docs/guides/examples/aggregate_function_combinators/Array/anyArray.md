---
slug: '/examples/aggregate-function-combinators/Array/anyArray'
description: 'Example of using the anyArray combinator'
keywords: ['any', 'array', 'combinator', 'examples', 'anyArray']
sidebar_label: 'anyArray'
---

# anyArray example

The [`Array`](/sql-reference/aggregate-functions/combinators#-array) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) function to return any value for elements in the array using the `anyArray` function.

## Example Usage

```sql
SELECT anyArray(array_column) FROM table;
``` 