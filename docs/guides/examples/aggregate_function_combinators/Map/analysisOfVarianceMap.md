---
slug: '/examples/aggregate-function-combinators/Map/analysisOfVarianceMap'
description: 'Example of using the analysisOfVarianceMap combinator'
keywords: ['analysisofvariance', 'map', 'combinator', 'examples', 'analysisOfVarianceMap']
sidebar_label: 'analysisOfVarianceMap'
---

# analysisOfVarianceMap example

The [Map](/sql-reference/aggregate-functions/combinators#-map) combinator can be applied to the [`analysisOfVariance`](/sql-reference/aggregate-functions/reference/analysis_of_variance) function to perform analysis of variance for each key in the map separately using the `analysisOfVarianceMap` function.

## Example Usage

```sql
SELECT analysisOfVarianceMap(map_column) FROM table;
``` 