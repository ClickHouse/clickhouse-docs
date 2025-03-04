---
slug: '/examples/aggregate-function-combinators/OrNull/approx_top_kOrNull'
description: 'Example of using the approx_top_kOrNull combinator'
keywords: ['approxtopk', 'ornull', 'combinator', 'examples', 'approx_top_kOrNull']
sidebar_label: 'approx_top_kOrNull'
---

# approx_top_kOrNull example

The [`OrNull`](/sql-reference/aggregate-functions/combinators#-ornull) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to return NULL if no rows are processed using the `approx_top_kOrNull` function.

## Example Usage

```sql
SELECT approx_top_kOrNull(value, k) FROM table;
``` 