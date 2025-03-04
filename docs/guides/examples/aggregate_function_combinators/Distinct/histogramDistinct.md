---
slug: '/examples/aggregate-function-combinators/Distinct/histogramDistinct'
description: 'Example of using the histogramDistinct combinator'
keywords: ['histogram', 'distinct', 'combinator', 'examples', 'histogramDistinct']
sidebar_label: 'histogramDistinct'
---

# histogramDistinct example

The [`Distinct`](/sql-reference/aggregate-functions/combinators#-distinct) combinator can be applied to the [`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram) function to generate histogram data only for distinct values using the `histogramDistinct` function.

## Example Usage

```sql
SELECT histogramDistinct(value) FROM table;
```
