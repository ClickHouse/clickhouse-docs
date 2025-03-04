---
slug: '/examples/aggregate-function-combinators/State/approx_top_kState'
description: 'Example of using the approx_top_kState combinator'
keywords: ['approxtopk', 'state', 'combinator', 'examples', 'approx_top_kState']
sidebar_label: 'approx_top_kState'
---

# approx_top_kState example

The [`State`](/sql-reference/aggregate-functions/combinators#-state) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to return the intermediate state of approximate top K values calculation using the `approx_top_kState` function.

## Example Usage

```sql
SELECT approx_top_kState(value, k) FROM table;
``` 