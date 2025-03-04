---
slug: '/examples/aggregate-function-combinators/OrNull/anyLastOrNull'
description: 'Example of using the anyLastOrNull combinator'
keywords: ['anylast', 'ornull', 'combinator', 'examples', 'anyLastOrNull']
sidebar_label: 'anyLastOrNull'
---

# anyLastOrNull example

The [`OrNull`](/sql-reference/aggregate-functions/combinators#-ornull) combinator can be applied to the [`anyLast`](/sql-reference/aggregate-functions/reference/anylast) function to return NULL if no rows are processed using the `anyLastOrNull` function.

## Example Usage

```sql
SELECT anyLastOrNull(value) FROM table;
``` 