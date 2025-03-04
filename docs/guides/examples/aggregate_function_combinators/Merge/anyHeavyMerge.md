---
slug: '/examples/aggregate-function-combinators/Merge/anyHeavyMerge'
description: 'Example of using the anyHeavyMerge combinator'
keywords: ['anyheavy', 'merge', 'combinator', 'examples', 'anyHeavyMerge']
sidebar_label: 'anyHeavyMerge'
---

# anyHeavyMerge example

The [`Merge`](/sql-reference/aggregate-functions/combinators#-merge) combinator can be applied to the [`anyHeavy`](/sql-reference/aggregate-functions/reference/anyheavy) function to combine intermediate states to get the final most frequent value using the `anyHeavyMerge` function.

## Example Usage

```sql
SELECT anyHeavyMerge(state) FROM table;
``` 