---
slug: '/examples/aggregate-function-combinators/ArgMax/anyHeavyArgMax'
description: 'Example of using the anyHeavyArgMax combinator'
keywords: ['anyheavy', 'argmax', 'combinator', 'examples', 'anyHeavyArgMax']
sidebar_label: 'anyHeavyArgMax'
---

# anyHeavyArgMax example

The [`ArgMax`](/sql-reference/aggregate-functions/combinators#-argmax) combinator can be applied to the [`anyHeavy`](/sql-reference/aggregate-functions/reference/anyheavy) function to return the most frequent value only for rows that have the maximum value for the specified expression using the `anyHeavyArgMax` function.

## Example Usage

```sql
SELECT anyHeavyArgMax(value, expr) FROM table;
``` 