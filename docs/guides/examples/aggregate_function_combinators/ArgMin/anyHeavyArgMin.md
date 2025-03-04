---
slug: '/examples/aggregate-function-combinators/ArgMin/anyHeavyArgMin'
description: 'Example of using the anyHeavyArgMin combinator'
keywords: ['anyheavy', 'argmin', 'combinator', 'examples', 'anyHeavyArgMin']
sidebar_label: 'anyHeavyArgMin'
---

# anyHeavyArgMin example

The [`ArgMin`](/sql-reference/aggregate-functions/combinators#-argmin) combinator can be applied to the [`anyHeavy`](/sql-reference/aggregate-functions/reference/anyheavy) function to return the most frequent value only for rows that have the minimum value for the specified expression using the `anyHeavyArgMin` function.

## Example Usage

```sql
SELECT anyHeavyArgMin(value, expr) FROM table;
``` 