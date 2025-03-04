---
slug: '/examples/aggregate-function-combinators/Merge/histogramMerge'
description: 'Example of using the histogramMerge combinator'
keywords: ['histogram', 'merge', 'combinator', 'examples', 'histogramMerge']
sidebar_label: 'histogramMerge'
---

# histogramMerge example

The [Merge](/sql-reference/aggregate-functions/combinators#-merge) combinator can be applied to the `histogram` function to combine intermediate states to get the final histogram using the `histogramMerge` function.

## Example Usage

```sql
SELECT histogramMerge(state) FROM table;
``` 