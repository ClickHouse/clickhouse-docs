---
slug: '/examples/aggregate-function-combinators/Array/anyHeavyArray'
description: 'Example of using the anyHeavyArray combinator'
keywords: ['anyheavy', 'array', 'combinator', 'examples', 'anyHeavyArray']
sidebar_label: 'anyHeavyArray'
---

# anyHeavyArray example

The [`Array`](/sql-reference/aggregate-functions/combinators#-array) combinator can be applied to the [`anyHeavy`](/sql-reference/aggregate-functions/reference/anyheavy) function to return the most frequent value for elements in the array using the `anyHeavyArray` function.

## Example Usage

```sql
SELECT anyHeavyArray(array_column) FROM table;
``` 