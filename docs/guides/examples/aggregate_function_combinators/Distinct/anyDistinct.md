---
slug: '/examples/aggregate-function-combinators/Distinct/anyDistinct'
description: 'Example of using the anyDistinct combinator'
keywords: ['any', 'distinct', 'combinator', 'examples', 'anyDistinct']
sidebar_label: 'anyDistinct'
---

# anyDistinct example

The [`Distinct`](/sql-reference/aggregate-functions/combinators#-distinct) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) function to return any value only for distinct values using the `anyDistinct` function.

## Example Usage

```sql
SELECT anyDistinct(value) FROM table;
``` 