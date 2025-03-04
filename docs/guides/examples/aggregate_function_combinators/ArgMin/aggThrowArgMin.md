---
slug: '/examples/aggregate-function-combinators/ArgMin/aggThrowArgMin'
description: 'Example of using the aggThrowArgMin combinator'
keywords: ['aggthrow', 'argmin', 'combinator', 'examples', 'aggThrowArgMin']
sidebar_label: 'aggThrowArgMin'
---

# aggThrowArgMin example

The [`ArgMin`](/sql-reference/aggregate-functions/combinators#-argmin) combinator can be applied to the [`aggThrow`](/sql-reference/aggregate-functions/reference/aggthrow) function to throw an exception with the specified probability only for rows that have the minimum value for the specified expression using the `aggThrowArgMin` function.

## Example Usage

```sql
SELECT aggThrowArgMin(probability, value, expr) FROM table;
```
