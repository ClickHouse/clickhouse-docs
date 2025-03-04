---
slug: '/examples/aggregate-function-combinators/SimpleState/histogramSimpleState'
description: 'Example of using the histogramSimpleState combinator'
keywords: ['histogram', 'simplestate', 'combinator', 'examples', 'histogramSimpleState']
sidebar_label: histogramSimpleState
---

# histogramSimpleState example

The [SimpleState](/sql-reference/aggregate-functions/combinators#-simplestate) combinator can be applied to the [`histogram`](/sql-reference/aggregate-functions/parametric-functions#histogram) function to return the histogram state with SimpleAggregateFunction type using the `histogramSimpleState` function.

## Example Usage

```sql
SELECT histogramSimpleState(value) FROM table;
``` 