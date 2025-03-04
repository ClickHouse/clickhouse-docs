---
slug: '/examples/aggregate-function-combinators/Array/aggThrowArray'
description: 'Example of using the aggThrowArray combinator'
keywords: ['aggthrow', 'array', 'combinator', 'examples', 'aggThrowArray']
sidebar_label: 'aggThrowArray'
---

# aggThrowArray example

The [Array](/sql-reference/aggregate-functions/combinators#-array) combinator can be applied to the `aggThrow` function to throw an exception with the specified probability for elements in the array using the `aggThrowArray` function.

## Example Usage

```sql
SELECT aggThrowArray(probability, array_column) FROM table;
```
