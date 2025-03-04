---
slug: '/examples/aggregate-function-combinators/ArgMin/anyLastArgMin'
description: 'Example of using the anyLastArgMin combinator'
keywords: ['anylast', 'argmin', 'combinator', 'examples', 'anyLastArgMin']
sidebar_label: 'anyLastArgMin'
---

# anyLastArgMin example

The [`ArgMin`](/sql-reference/aggregate-functions/combinators#-argmin) combinator can be applied to the [`anyLast`](/sql-reference/aggregate-functions/reference/anylast) function to return the last value only for rows that have the minimum value for the specified expression using the `anyLastArgMin` function.

## Example Usage

```sql
SELECT anyLastArgMin(value, expr) FROM table;
``` 