---
slug: '/examples/aggregate-function-combinators/If/aggThrowIf'
description: 'Example of using the aggThrowIf combinator'
keywords: ['aggthrow', 'if', 'combinator', 'examples', 'aggThrowIf']
sidebar_label: aggThrowIf
---

# aggThrowIf example

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`aggThrow`](/sql-reference/aggregate-functions/reference/aggthrow) function to throw an exception with the specified probability only for rows that match the given condition using the `aggThrowIf` function.

## Example Usage

```sql
SELECT aggThrowIf(probability, condition) FROM table;
```
