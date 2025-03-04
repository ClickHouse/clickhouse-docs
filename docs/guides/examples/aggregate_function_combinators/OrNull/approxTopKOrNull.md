---
slug: '/examples/aggregate-function-combinators/OrNull/approxTopKOrNull'
description: 'Example of using the approxTopKOrNull combinator'
keywords: ['approxtopk', 'ornull', 'combinator', 'examples', 'approxTopKOrNull']
sidebar_label: 'approxTopKOrNull'
---

# approxTopKOrNull example

The [`OrNull`](/sql-reference/aggregate-functions/combinators#-ornull) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to return NULL if no rows are processed using the `approxTopKOrNull` function.

## Example Usage

```sql
SELECT approxTopKOrNull(value, k) FROM table;
``` 