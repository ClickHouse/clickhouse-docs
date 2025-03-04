---
slug: /examples/aggregate-function-combinators/map/aggThrowMap
description: "Example of using the aggThrowMap combinator"
keywords: ["aggThrow", "map", "combinator", "examples", "aggThrowMap"]
---

# aggThrowMap Combinator Example

The [Map](/sql-reference/aggregate-functions/combinators#-map) combinator can be applied to the `aggThrow` function to throw an exception with the specified probability for each key in the map separately using the `aggThrowMap` function.

## Example Usage

```sql
SELECT aggThrowMap(probability, map_column) FROM table;
```
