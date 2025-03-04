---
slug: '/examples/aggregate-function-combinators/Array/approx_top_kArray'
description: 'Example of using the approx_top_kArray combinator'
keywords: ['approxtopk', 'array', 'combinator', 'examples', 'approx_top_kArray']
sidebar_label: 'approx_top_kArray'
---

# approx_top_kArray example

The [`Array`](/sql-reference/aggregate-functions/combinators#-array) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to return approximate top K values for elements in the array using the `approx_top_kArray` function.

## Example Usage

```sql
SELECT approx_top_kArray(array_column, k) FROM table;
``` 