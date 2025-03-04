---
slug: '/examples/aggregate-function-combinators/Map/anyLastMap'
description: 'Example of using the anyLastMap combinator'
keywords: ['anylast', 'map', 'combinator', 'examples', 'anyLastMap']
sidebar_label: 'anyLastMap'
---

# anyLastMap example

The [`Map`](/sql-reference/aggregate-functions/combinators#-map) combinator can be applied to the [`anyLast`](/sql-reference/aggregate-functions/reference/anylast) function to return the last value for each key in the map separately using the `anyLastMap` function.

## Example Usage

```sql
SELECT anyLastMap(map_column) FROM table;
``` 