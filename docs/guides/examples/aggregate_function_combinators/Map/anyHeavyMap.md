---
slug: '/examples/aggregate-function-combinators/Map/anyHeavyMap'
description: 'Example of using the anyHeavyMap combinator'
keywords: ['anyheavy', 'map', 'combinator', 'examples', 'anyHeavyMap']
sidebar_label: 'anyHeavyMap'
---

# anyHeavyMap example

The [`Map`](/sql-reference/aggregate-functions/combinators#-map) combinator can be applied to the [`anyHeavy`](/sql-reference/aggregate-functions/reference/anyheavy) function to return the most frequent value for each key in the map separately using the `anyHeavyMap` function.

## Example Usage

```sql
SELECT anyHeavyMap(map_column) FROM table;
``` 