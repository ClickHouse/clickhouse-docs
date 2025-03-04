---
slug: '/examples/aggregate-function-combinators/If/anyHeavyIf'
description: 'Example of using the anyHeavyIf combinator'
keywords: ['anyheavy', 'if', 'combinator', 'examples', 'anyHeavyIf']
sidebar_label: 'anyHeavyIf'
---

# anyHeavyIf example

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`anyHeavy`](/sql-reference/aggregate-functions/reference/anyheavy) function to return the most frequent value only for rows that match the given condition using the `anyHeavyIf` function.

## Example Usage

```sql
SELECT anyHeavyIf(value, condition) FROM table;
``` 