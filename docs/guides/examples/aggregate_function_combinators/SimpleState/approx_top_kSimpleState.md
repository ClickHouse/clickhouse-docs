---
slug: '/examples/aggregate-function-combinators/SimpleState/approx_top_kSimpleState'
description: 'Example of using the approx_top_kSimpleState combinator'
keywords: ['approxtopk', 'simplestate', 'combinator', 'examples', 'approx_top_kSimpleState']
sidebar_label: 'approx_top_kSimpleState'
---

# approx_top_kSimpleState example

The [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to return the approx_top_k state with SimpleAggregateFunction type using the `approx_top_kSimpleState` function.

## Example Usage

```sql
SELECT approx_top_kSimpleState(value, k) FROM table;
``` 