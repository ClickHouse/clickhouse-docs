---
slug: '/examples/aggregate-function-combinators/SimpleState/anyHeavySimpleState'
description: 'Example of using the anyHeavySimpleState combinator'
keywords: ['anyheavy', 'simplestate', 'combinator', 'examples', 'anyHeavySimpleState']
sidebar_label: 'anyHeavySimpleState'
---

# anyHeavySimpleState example

The [`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) combinator can be applied to the [`anyHeavy`](/sql-reference/aggregate-functions/reference/anyheavy) function to return the anyHeavy state with SimpleAggregateFunction type using the `anyHeavySimpleState` function.

## Example Usage

```sql
SELECT anyHeavySimpleState(value) FROM table;
``` 