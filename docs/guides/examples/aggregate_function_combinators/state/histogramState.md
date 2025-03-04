---
slug: '/examples/aggregate-function-combinators/State/histogramState'
description: 'Example of using the histogramState combinator'
keywords: ['histogram', 'state', 'combinator', 'examples', 'histogramState']
sidebar_label: histogramState
---

# histogramState example

The [State](/sql-reference/aggregate-functions/combinators#-state) combinator can be applied to the [`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram) function to return the intermediate state of histogram calculation using the `histogramState` function.

## Example Usage

```sql
SELECT histogramState(value) FROM table;
``` 