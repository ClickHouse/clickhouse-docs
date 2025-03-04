---
slug: /examples/aggregate-function-combinators/ForEach/histogramForEach
description: 'Example of using the histogramForEach combinator'
keywords: ['histogram', 'foreach', 'combinator', 'examples', 'histogramForEach']
sidebar_label: 'histogramForEach'
---

# histogramForEach example

The [ForEach](/sql-reference/aggregate-functions/combinators#-foreach) combinator can be applied to the `histogram` function to generate histogram data for corresponding elements in multiple arrays using the `histogramForEach` function.

## Example Usage

```sql
SELECT histogramForEach(array1, array2) FROM table;
``` 