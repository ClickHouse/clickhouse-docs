---
slug: '/examples/aggregate-function-combinators/Map/approx_top_kMap'
description: 'Example of using the approx_top_kMap combinator'
keywords: ['approxtopk', 'map', 'combinator', 'examples', 'approx_top_kMap']
sidebar_label: 'approx_top_kMap'
---

# approx_top_kMap example

The [`Map`](/sql-reference/aggregate-functions/combinators#-map) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to return approximate top K values for each key in the map separately using the `approx_top_kMap` function.

## Example Usage

```sql
SELECT approx_top_kMap(map_column, k) FROM table;
``` 