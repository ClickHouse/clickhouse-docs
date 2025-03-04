---
slug: '/examples/aggregate-function-combinators/If/anyIf'
description: 'Example of using the anyIf combinator'
keywords: ['any', 'if', 'combinator', 'examples', 'anyIf']
sidebar_label: 'anyIf'
---

# anyIf example

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) function to return any value only for rows that match the given condition using the `anyIf` function.

## Example Usage

```sql
SELECT anyIf(value, condition) FROM table;
``` 