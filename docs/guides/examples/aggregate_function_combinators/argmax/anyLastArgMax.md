---
slug: '/examples/aggregate-function-combinators/ArgMax/anyLastArgMax'
description: 'Example of using the anyLastArgMax combinator'
keywords: ['anylast', 'argmax', 'combinator', 'examples', 'anyLastArgMax']
sidebar_label: 'anyLastArgMax'
---

# anyLastArgMax example

The [`ArgMax`](/sql-reference/aggregate-functions/combinators#-argmax) combinator can be applied to the [`anyLast`](/sql-reference/aggregate-functions/reference/anylast) function to return the last value only for rows that have the maximum value for the specified expression using the `anyLastArgMax` function.

## Example Usage

```sql
SELECT anyLastArgMax(value, expr) FROM table;
``` 