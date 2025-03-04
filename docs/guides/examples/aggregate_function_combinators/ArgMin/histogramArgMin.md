---
slug: '/examples/aggregate-function-combinators/ArgMin/histogramArgMin'
description: 'Example of using the histogramArgMin combinator'
keywords: ['histogram', 'argmin', 'combinator', 'examples', 'histogramArgMin']
sidebar_label: 'histogramArgMin'
---

# histogramArgMin example

The [`ArgMin`](/sql-reference/aggregate-functions/combinators#-argmin) combinator can be applied to the [`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram) function to generate histogram data only for rows that have the minimum value for the specified expression using the `histogramArgMin` function.

## Example Usage

```sql
SELECT histogramArgMin(value, expr) FROM table;
``` 