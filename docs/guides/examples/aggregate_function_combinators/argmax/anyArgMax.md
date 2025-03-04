---
slug: '/examples/aggregate-function-combinators/ArgMax/anyArgMax'
description: 'Example of using the anyArgMax combinator'
keywords: ['any', 'argmax', 'combinator', 'examples', 'anyArgMax']
sidebar_label: 'anyArgMax'
---

# anyArgMax example

The [`ArgMax`](/sql-reference/aggregate-functions/combinators#-argmax) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) function to return any value only for rows that have the maximum value for the specified expression using the `anyArgMax` function.

## Example Usage

```sql
SELECT anyArgMax(value, expr) FROM table;
``` 