---
slug: /examples/aggregate-function-combinators/ornull/aggThrowOrNull
description: "Example of using the aggThrowOrNull combinator"
keywords: ["aggThrow", "ornull", "combinator", "examples", "aggThrowOrNull"]
---

# aggThrowOrNull Combinator Example

The [OrNull](/sql-reference/aggregate-functions/combinators#-ornull) combinator can be applied to the `aggThrow` function to return NULL instead of throwing an exception when no rows are processed using the `aggThrowOrNull` function.

## Example Usage

```sql
SELECT aggThrowOrNull(probability, value) FROM table;
``` 