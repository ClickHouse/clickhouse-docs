---
slug: '/examples/aggregate-function-combinators/Map/anyMap'
description: 'Example of using the anyMap combinator'
keywords: ['any', 'map', 'combinator', 'examples', 'anyMap']
sidebar_label: 'anyMap'
---

# anyMap example

The [`Map`](/sql-reference/aggregate-functions/combinators#-map) combinator can be applied to the [`any`](/sql-reference/aggregate-functions/reference/any) function to return any value for each key in the map separately using the `anyMap` function.

## Example Usage

```sql
SELECT anyMap(map_column) FROM table;
``` 