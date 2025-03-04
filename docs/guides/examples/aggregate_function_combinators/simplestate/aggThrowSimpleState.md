---
slug: /examples/aggregate-function-combinators/simplestate/aggThrowSimpleState
description: "Example of using the aggThrowSimpleState combinator"
keywords: ["aggThrow", "simplestate", "combinator", "examples", "aggThrowSimpleState"]
---

# aggThrowSimpleState Combinator Example

The [SimpleState](/sql-reference/aggregate-functions/combinators#-simplestate) combinator can be applied to the `aggThrow` function to return the throw state with SimpleAggregateFunction type using the `aggThrowSimpleState` function.

## Example Usage

```sql
SELECT aggThrowSimpleState(probability) FROM table;
```
