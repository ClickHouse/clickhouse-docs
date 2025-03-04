---
slug: '/examples/aggregate-function-combinators/If/anyLastIf'
description: 'Example of using the anyLastIf combinator'
keywords: ['anylast', 'if', 'combinator', 'examples', 'anyLastIf']
sidebar_label: 'anyLastIf'
---

# anyLastIf example

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`anyLast`](/sql-reference/aggregate-functions/reference/anylast) function to return the last value only for rows that match the given condition using the `anyLastIf` function.

## Example Usage

```sql
SELECT anyLastIf(value, condition) FROM table;
``` 