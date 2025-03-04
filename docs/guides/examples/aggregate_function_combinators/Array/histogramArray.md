---
slug: '/examples/aggregate-function-combinators/Array/histogramArray'
description: 'Example of using the histogramArray combinator'
keywords: ['histogram', 'array', 'combinator', 'examples', 'histogramArray']
sidebar_label: 'histogramArray'
---

# histogramArray example

The [`Array`](/sql-reference/aggregate-functions/combinators#-array) combinator can be applied to the `histogram` function to generate histogram data for elements in the array using the `histogramArray` function.

## Example Usage

```sql
SELECT histogramArray(array_column) FROM table;
```
