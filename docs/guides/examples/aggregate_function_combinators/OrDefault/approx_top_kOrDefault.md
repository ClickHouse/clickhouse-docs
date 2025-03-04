---
slug: '/examples/aggregate-function-combinators/OrDefault/approx_top_kOrDefault'
description: 'Example of using the approx_top_kOrDefault combinator'
keywords: ['approxtopk', 'ordefault', 'combinator', 'examples', 'approx_top_kOrDefault']
sidebar_label: 'approx_top_kOrDefault'
---

# approx_top_kOrDefault example

The [`OrDefault`](/sql-reference/aggregate-functions/combinators#-ordefault) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to return a default value if no rows are processed using the `approx_top_kOrDefault` function.

## Example Usage

```sql
SELECT approx_top_kOrDefault(value, k) FROM table;
``` 