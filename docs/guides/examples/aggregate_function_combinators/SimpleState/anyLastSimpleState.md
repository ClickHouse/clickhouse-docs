---
slug: '/examples/aggregate-function-combinators/SimpleState/anyLastSimpleState'
description: 'Example of using the anyLastSimpleState combinator'
keywords: ['anylast', 'simplestate', 'combinator', 'examples', 'anyLastSimpleState']
sidebar_label: 'anyLastSimpleState'
---

# anyLastSimpleState example

The [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) combinator can be applied to the [`anyLast`](/sql-reference/aggregate-functions/reference/anylast) function to return the anyLast state with SimpleAggregateFunction type using the `anyLastSimpleState` function.

## Example Usage

```sql
SELECT anyLastSimpleState(value) FROM table;
``` 