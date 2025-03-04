---
slug: '/examples/aggregate-function-combinators/Distinct/aggThrowDistinct'
description: 'Example of using the aggThrowDistinct combinator'
keywords: ['aggthrow', 'distinct', 'combinator', 'examples', 'aggThrowDistinct']
sidebar_label: 'aggThrowDistinct'
---

# aggThrowDistinct example

The [`Distinct`](/sql-reference/aggregate-functions/combinators#-distinct) combinator can be applied to the [`aggThrow`](/sql-reference/aggregate-functions/reference/aggthrow) function to throw an exception with the specified probability only for distinct values using the `aggThrowDistinct` function.

## Example Usage

```sql
SELECT aggThrowDistinct(probability, value) FROM table;
```
