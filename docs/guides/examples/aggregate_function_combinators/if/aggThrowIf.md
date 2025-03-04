---
slug: /examples/aggregate-function-combinators/if/aggThrowIf
description: "Example of using the aggThrowIf combinator"
keywords: ["aggThrow", "if", "combinator", "examples", "aggThrowIf"]
---

# aggThrowIf Combinator Example

The [If](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the `aggThrow` function to throw an exception with the specified probability only for rows that match the given condition using the `aggThrowIf` function.

## Example Usage

```sql
SELECT aggThrowIf(probability, condition) FROM table;
```
