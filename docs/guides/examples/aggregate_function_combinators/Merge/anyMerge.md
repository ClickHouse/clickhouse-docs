---
slug: '/examples/aggregate-function-combinators/Merge/anyMerge'
description: 'Example of using the anyMerge combinator'
keywords: ['any', 'merge', 'combinator', 'examples', 'anyMerge']
sidebar_label: 'anyMerge'
---

# anyMerge example

The [`Merge`](/sql-reference/aggregate-functions/combinators#-merge) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) function to combine intermediate states to get the final any value using the `anyMerge` function.

## Example Usage

```sql
SELECT anyMerge(state) FROM table;
``` 