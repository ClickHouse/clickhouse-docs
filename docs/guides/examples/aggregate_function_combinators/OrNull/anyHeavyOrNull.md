---
slug: '/examples/aggregate-function-combinators/OrNull/anyHeavyOrNull'
description: 'Example of using the anyHeavyOrNull combinator'
keywords: ['anyheavy', 'ornull', 'combinator', 'examples', 'anyHeavyOrNull']
sidebar_label: 'anyHeavyOrNull'
---

# anyHeavyOrNull example

The [`OrNull`](/sql-reference/aggregate-functions/combinators#-ornull) combinator can be applied to the [`anyHeavy`](/sql-reference/aggregate-functions/reference/anyheavy) function to return NULL if no rows are processed using the `anyHeavyOrNull` function.

## Example Usage

```sql
SELECT anyHeavyOrNull(value) FROM table;
``` 