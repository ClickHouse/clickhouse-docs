---
slug: '/examples/aggregate-function-combinators/ArgMin/anyArgMin'
description: 'Example of using the anyArgMin combinator'
keywords: ['any', 'argmin', 'combinator', 'examples', 'anyArgMin']
sidebar_label: 'anyArgMin'
---

# anyArgMin example

The [`ArgMin`](/sql-reference/aggregate-functions/combinators#-argmin) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) function to return any value only for rows that have the minimum value for the specified expression using the `anyArgMin` function.

## Example Usage

```sql
SELECT anyArgMin(value, expr) FROM table;
``` 