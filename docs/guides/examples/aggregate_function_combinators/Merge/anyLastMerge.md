---
slug: '/examples/aggregate-function-combinators/Merge/anyLastMerge'
description: 'Example of using the anyLastMerge combinator'
keywords: ['anylast', 'merge', 'combinator', 'examples', 'anyLastMerge']
sidebar_label: 'anyLastMerge'
---

# anyLastMerge example

The [`Merge`](/sql-reference/aggregate-functions/combinators#-merge) combinator can be applied to the [`anyLast`](/sql-reference/aggregate-functions/reference/anylast) function to combine intermediate states to get the final last value using the `anyLastMerge` function.

## Example Usage

```sql
SELECT anyLastMerge(state) FROM table;
``` 