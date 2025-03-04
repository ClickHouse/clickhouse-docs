---
slug: '/examples/aggregate-function-combinators/SimpleState/anySimpleState'
description: 'Example of using the anySimpleState combinator'
keywords: ['any', 'simplestate', 'combinator', 'examples', 'anySimpleState']
sidebar_label: 'anySimpleState'
---

# anySimpleState example

The [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) function to return the any state with SimpleAggregateFunction type using the `anySimpleState` function.

## Example Usage

```sql
SELECT anySimpleState(value) FROM table;
``` 