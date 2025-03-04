---
slug: /examples/aggregate-function-combinators/Resample/histogramResample
description: 'Example of using the histogramResample combinator'
keywords: ['histogram', 'resample', 'combinator', 'examples', 'histogramResample']
sidebar_label: histogramResample
---

# histogramResample example

The [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) combinator can be applied to the [`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram) function to generate histogram data for each group of rows using the `histogramResample` function.

## Example Usage

```sql
SELECT histogramResample(value, group) FROM table;
``` 