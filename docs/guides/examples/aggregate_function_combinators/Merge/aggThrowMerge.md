---
slug: '/examples/aggregate-function-combinators/Merge/aggThrowMerge'
description: 'Example of using the aggThrowMerge combinator'
keywords: ['aggthrow', 'merge', 'combinator', 'examples', 'aggThrowMerge']
sidebar_label: 'aggThrowMerge'
---

# aggThrowMerge example

The [Merge](/sql-reference/aggregate-functions/combinators#-merge) combinator can be applied to the `aggThrow` function to combine intermediate states to determine if an exception should be thrown using the `aggThrowMerge` function.

## Example Usage

```sql
SELECT aggThrowMerge(state) FROM table;
```
