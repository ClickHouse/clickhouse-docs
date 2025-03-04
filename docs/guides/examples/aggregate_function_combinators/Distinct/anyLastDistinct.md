---
slug: '/examples/aggregate-function-combinators/Distinct/anyLastDistinct'
description: 'Example of using the anyLastDistinct combinator'
keywords: ['anylast', 'distinct', 'combinator', 'examples', 'anyLastDistinct']
sidebar_label: 'anyLastDistinct'
---

# anyLastDistinct example

The [`Distinct`](/sql-reference/aggregate-functions/combinators#-distinct) combinator can be applied to the [`anyLast`](/sql-reference/aggregate-functions/reference/anylast) function to return the last value only for distinct values using the `anyLastDistinct` function.

## Example Usage

```sql
SELECT anyLastDistinct(value) FROM table;
``` 