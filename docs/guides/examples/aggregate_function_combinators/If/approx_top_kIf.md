---
slug: '/examples/aggregate-function-combinators/If/approx_top_kIf'
description: 'Example of using the approx_top_kIf combinator'
keywords: ['approxtopk', 'if', 'combinator', 'examples', 'approx_top_kIf']
sidebar_label: 'approx_top_kIf'
---

# approx_top_kIf example

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to return approximate top K values only for rows that match the given condition using the `approx_top_kIf` function.

## Example Usage

```sql
SELECT approx_top_kIf(value, condition, k) FROM table;
``` 