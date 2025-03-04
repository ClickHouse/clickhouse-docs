---
slug: /examples/aggregate-function-combinators/ordefault/aggThrowOrDefault
description: "Example of using the aggThrowOrDefault combinator"
keywords: ["aggThrow", "ordefault", "combinator", "examples", "aggThrowOrDefault"]
---

# aggThrowOrDefault Combinator Example

The [OrDefault](/sql-reference/aggregate-functions/combinators#-ordefault) combinator can be applied to the `aggThrow` function to return a default value instead of throwing an exception when no rows are processed using the `aggThrowOrDefault` function.

## Example Usage

```sql
SELECT aggThrowOrDefault(probability, value) FROM table;
``` 