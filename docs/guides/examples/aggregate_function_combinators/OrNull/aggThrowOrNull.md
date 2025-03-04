---
slug: '/examples/aggregate-function-combinators/OrNull/aggThrowOrNull'
description: 'Example of using the aggThrowOrNull combinator'
keywords: ['aggthrow', 'ornull', 'combinator', 'examples', 'aggThrowOrNull']
sidebar_label: aggThrowOrNull
---

# aggThrowOrNull example

The [`OrNull`](/sql-reference/aggregate-functions/combinators#-ornull) combinator can be applied to the [`aggThrow`](/sql-reference/aggregate-functions/reference/aggthrow) function to return NULL instead of throwing an exception when no rows are processed using the `aggThrowOrNull` function.

## Example Usage

```sql
SELECT aggThrowOrNull(probability, value) FROM table;
``` 