---
slug: '/examples/aggregate-function-combinators/SimpleState/aggThrowSimpleState'
description: 'Example of using the aggThrowSimpleState combinator'
keywords: ['aggthrow', 'simplestate', 'combinator', 'examples', 'aggThrowSimpleState']
sidebar_label: aggThrowSimpleState
---

# aggThrowSimpleState example

The [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) combinator can be applied to the [`aggThrow`](/sql-reference/aggregate-functions/reference/aggthrow) function to return the throw state with SimpleAggregateFunction type using the `aggThrowSimpleState` function.

## Example Usage

```sql
SELECT aggThrowSimpleState(probability) FROM table;
```
