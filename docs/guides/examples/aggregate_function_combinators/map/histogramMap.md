---
slug: '/examples/aggregate-function-combinators/Map/histogramMap'
description: 'Example of using the histogramMap combinator'
keywords: ['histogram', 'map', 'combinator', 'examples', 'histogramMap']
sidebar_label: 'histogramMap'
---

# histogramMap example

The [`Map`](/sql-reference/aggregate-functions/combinators#-map) combinator can be applied to the `histogram` function to generate histogram data for each key in the map separately using the `histogramMap` function.

## Example Usage

```sql
SELECT histogramMap(map_column) FROM table;
``` 