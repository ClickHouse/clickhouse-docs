---
slug: '/examples/aggregate-function-combinators/Distinct/anyHeavyDistinct'
description: 'Example of using the anyHeavyDistinct combinator'
keywords: ['anyheavy', 'distinct', 'combinator', 'examples', 'anyHeavyDistinct']
sidebar_label: 'anyHeavyDistinct'
---

# anyHeavyDistinct example

The [`Distinct`](/sql-reference/aggregate-functions/combinators#-distinct) combinator can be applied to the [`anyHeavy`](/sql-reference/aggregate-functions/reference/anyheavy) function to return the most frequent value only for distinct values using the `anyHeavyDistinct` function.

## Example Usage

```sql
SELECT anyHeavyDistinct(value) FROM table;
``` 