---
slug: '/examples/aggregate-function-combinators/OrNull/anyOrNull'
description: 'Example of using the anyOrNull combinator'
keywords: ['any', 'ornull', 'combinator', 'examples', 'anyOrNull']
sidebar_label: 'anyOrNull'
---

# anyOrNull example

The [`OrNull`](/sql-reference/aggregate-functions/combinators#-ornull) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) function to return NULL if no rows are processed using the `anyOrNull` function.

## Example Usage

```sql
SELECT anyOrNull(value) FROM table;
``` 